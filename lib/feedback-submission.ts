import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseUserAgent } from "@/lib/user-agent";
import { feedbackSubmissionSchema, looksLikeSpam } from "@/lib/validation/feedback";

export const MAX_BODY_BYTES = 16 * 1024;

// Per-instance burst protection; the database enforces the real limits.
export const ipLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

type Result = { status: number; body: Record<string, unknown>; headers?: Record<string, string> };

const fail = (status: number, error: string, headers?: Record<string, string>): Result => ({
  status,
  body: { ok: false, error },
  headers,
});

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/** Opaque, salted hash so raw IPs never reach the database. */
export function clientKey(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "feedbackbox";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** Validates and stores a widget submission. Nothing from the client is trusted. */
export async function handleFeedbackSubmission(request: Request): Promise<Result> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return fail(415, "Expected a JSON body.");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return fail(413, "Your message is too long.");

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return fail(413, "Your message is too long.");

  const ip = clientIp(request.headers);
  const limit = ipLimiter.check(ip);
  if (!limit.allowed) {
    return fail(429, "You're sending feedback very quickly. Please wait a moment and try again.", {
      "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, "We couldn't read that request.");
  }

  const parsed = feedbackSubmissionSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, parsed.error.issues[0]?.message ?? "Invalid feedback.");
  }
  const input = parsed.data;

  // Pretend everything went fine so bots don't learn to adapt.
  if (looksLikeSpam(input)) return { status: 201, body: { ok: true } };

  const { browser, os } = parseUserAgent(request.headers.get("user-agent"));

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("submit_feedback", {
    p_project_id: input.projectId,
    p_message: input.message,
    p_type: input.type,
    p_email: input.email,
    p_page_url: input.pageUrl,
    p_browser: browser,
    p_os: os,
    p_screen_width: input.screenWidth ?? null,
    p_screen_height: input.screenHeight ?? null,
    p_client_key: clientKey(ip),
  });

  if (error) {
    console.error("submit_feedback failed", error.code, error.message);
    return fail(500, "We couldn't save your feedback. Please try again.");
  }

  const result = data as { ok: boolean; id?: string; error?: string };
  if (!result.ok) {
    if (result.error === "project_not_found") return fail(404, "This feedback widget isn't set up correctly.");
    if (result.error === "rate_limited") {
      return fail(429, "You're sending feedback very quickly. Please wait a moment and try again.", {
        "Retry-After": "60",
      });
    }
    return fail(500, "We couldn't save your feedback. Please try again.");
  }

  return { status: 201, body: { ok: true } };
}
