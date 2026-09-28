import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));

const { POST, OPTIONS } = await import("@/app/api/feedback/route");
const { ipLimiter } = await import("@/lib/feedback-submission");

const PROJECT = "3f1c9a52-7c1e-4d7a-9a3e-2b6f0d1e8c11";
const CHROME_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", "user-agent": CHROME_MAC, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = {
  projectId: PROJECT,
  message: "The search is difficult to use",
  type: "feature",
  email: "user@example.com",
  pageUrl: "https://amazu.app/search?q=beach&token=abc",
  screenWidth: 390,
  screenHeight: 844,
  website: "",
  elapsedMs: 9000,
};

beforeEach(() => {
  rpc.mockReset();
  rpc.mockResolvedValue({ data: { ok: true, id: "f1" }, error: null });
  ipLimiter.reset();
});

describe("POST /api/feedback", () => {
  it("stores valid feedback through submit_feedback with server-derived context", async () => {
    const res = await POST(request(valid));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("access-control-allow-origin")).toBe("*");

    expect(rpc).toHaveBeenCalledTimes(1);
    const [fn, args] = rpc.mock.calls[0];
    expect(fn).toBe("submit_feedback");
    expect(args).toMatchObject({
      p_project_id: PROJECT,
      p_message: "The search is difficult to use",
      p_type: "feature",
      p_email: "user@example.com",
      p_page_url: "https://amazu.app/search",
      p_browser: "Chrome",
      p_os: "macOS",
      p_screen_width: 390,
    });
    // The raw IP never reaches the database.
    expect(args.p_client_key).toMatch(/^[0-9a-f]{32}$/);
    expect(JSON.stringify(args)).not.toContain("203.0.113.7");
  });

  it("accepts anonymous feedback without an email", async () => {
    const res = await POST(request({ ...valid, email: "" }));
    expect(res.status).toBe(201);
    expect(rpc.mock.calls[0][1].p_email).toBeNull();
  });

  it.each([
    ["an empty message", { message: "" }, /write/i],
    ["an oversized message", { message: "x".repeat(5001) }, /5000/],
    ["an invalid email", { email: "nope" }, /email/i],
    ["an invalid project id", { projectId: "abc123" }, /project/i],
  ])("rejects %s with a helpful error", async (_label, override, message) => {
    const res = await POST(request({ ...valid, ...override }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(message);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and non-JSON bodies", async () => {
    expect((await POST(request("{not json"))).status).toBe(400);
    expect((await POST(request(valid, { "content-type": "text/plain" }))).status).toBe(415);
  });

  it("rejects oversized bodies before parsing", async () => {
    const res = await POST(request({ ...valid, padding: "x".repeat(20_000) }));
    expect(res.status).toBe(413);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("silently drops honeypot and too-fast submissions", async () => {
    for (const spam of [{ website: "http://buy-now.example" }, { elapsedMs: 100 }]) {
      const res = await POST(request({ ...valid, ...spam }));
      expect(res.status).toBe(201);
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns 404 for projects that don't exist", async () => {
    rpc.mockResolvedValue({ data: { ok: false, error: "project_not_found" }, error: null });
    const res = await POST(request(valid));
    expect(res.status).toBe(404);
  });

  it("returns 429 when the database rate limit is hit", async () => {
    rpc.mockResolvedValue({ data: { ok: false, error: "rate_limited" }, error: null });
    const res = await POST(request(valid));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("60");
  });

  it("rate limits bursts from one IP before touching the database", async () => {
    const statuses = [];
    for (let i = 0; i < 12; i++) statuses.push((await POST(request(valid))).status);
    expect(statuses.slice(0, 10).every((s) => s === 201)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
    expect(rpc).toHaveBeenCalledTimes(10);

    // A different visitor is unaffected.
    expect((await POST(request(valid, { "x-forwarded-for": "198.51.100.1" }))).status).toBe(201);
  });

  it("hides database errors from the client", async () => {
    rpc.mockResolvedValue({ data: null, error: { code: "23514", message: "violates check constraint feedback_email_check" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(request(valid));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toMatch(/constraint/);
  });

  it("answers CORS preflight requests", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
  });
});
