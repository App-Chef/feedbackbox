import { z } from "zod";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
} from "@/lib/constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

/** Payload accepted by POST /api/feedback. Everything from the client is untrusted. */
export const feedbackSubmissionSchema = z.object({
  projectId: z.uuid({ error: "Invalid project." }),
  message: z
    .string({ error: "Please write a message." })
    .trim()
    .min(MESSAGE_MIN_LENGTH, { error: "Please write a little more." })
    .max(MESSAGE_MAX_LENGTH, { error: `Please keep it under ${MESSAGE_MAX_LENGTH} characters.` }),
  type: z.enum(FEEDBACK_TYPES, { error: "Please choose a feedback type." }).default("other"),
  email: z
    .union([z.literal(""), z.email({ error: "That email address doesn't look right." }).max(254)])
    .optional()
    .nullable()
    .transform((v) => (v ? v.toLowerCase() : null)),
  pageUrl: optionalText(2048).transform((v) => sanitizePageUrl(v)),
  screenWidth: z.number().int().min(0).max(20000).optional().nullable(),
  screenHeight: z.number().int().min(0).max(20000).optional().nullable(),
  // Anti-spam signals. Not stored.
  website: z.string().max(500).optional().nullable(), // honeypot, must stay empty
  elapsedMs: z.number().min(0).optional().nullable(), // time the form was open
});

export type FeedbackSubmission = z.infer<typeof feedbackSubmissionSchema>;

/**
 * Keeps only origin + path. Query strings and fragments often carry tokens or
 * personal data, and we don't need them to understand feedback.
 */
export function sanitizePageUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.origin}${url.pathname}`.slice(0, 2048);
  } catch {
    return null;
  }
}

/** Heuristics that identify obvious bots. Bots get a fake success response. */
export function looksLikeSpam(input: Pick<FeedbackSubmission, "website" | "elapsedMs">): boolean {
  if (input.website && input.website.trim() !== "") return true;
  if (typeof input.elapsedMs === "number" && input.elapsedMs < 1500) return true;
  return false;
}

export const statusSchema = z.enum(FEEDBACK_STATUSES);
