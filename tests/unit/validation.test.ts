import { describe, expect, it } from "vitest";
import { feedbackSubmissionSchema, looksLikeSpam, sanitizePageUrl } from "@/lib/validation/feedback";
import { widgetConfigSchema } from "@/lib/validation/project";

const PROJECT = "3f1c9a52-7c1e-4d7a-9a3e-2b6f0d1e8c11";
const valid = { projectId: PROJECT, message: "Search is slow", type: "feature" };

describe("feedbackSubmissionSchema", () => {
  it("accepts a minimal anonymous submission", () => {
    const result = feedbackSubmissionSchema.parse(valid);
    expect(result).toMatchObject({ projectId: PROJECT, message: "Search is slow", type: "feature", email: null });
  });

  it("trims the message and lowercases the email", () => {
    const result = feedbackSubmissionSchema.parse({ ...valid, message: "  hi there  ", email: "Me@Example.COM" });
    expect(result.message).toBe("hi there");
    expect(result.email).toBe("me@example.com");
  });

  it("treats an empty email as anonymous", () => {
    expect(feedbackSubmissionSchema.parse({ ...valid, email: "" }).email).toBeNull();
  });

  it.each([
    ["empty message", { message: "" }],
    ["whitespace-only message", { message: "     " }],
    ["too-short message", { message: "ok" }],
    ["too-long message", { message: "a".repeat(5001) }],
    ["invalid email", { email: "not-an-email" }],
    ["invalid project id", { projectId: "abc123" }],
    ["unknown type", { type: "complaint" }],
    ["non-string message", { message: { $gt: "" } }],
  ])("rejects %s", (_label, override) => {
    expect(feedbackSubmissionSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });

  it("defaults the type to other", () => {
    expect(feedbackSubmissionSchema.parse({ projectId: PROJECT, message: "hello" }).type).toBe("other");
  });
});

describe("sanitizePageUrl", () => {
  it("drops query strings and fragments, which may contain tokens", () => {
    expect(sanitizePageUrl("https://app.example.com/reset?token=secret#x")).toBe("https://app.example.com/reset");
  });

  it("rejects non-http URLs", () => {
    expect(sanitizePageUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizePageUrl("not a url")).toBeNull();
  });
});

describe("looksLikeSpam", () => {
  it("flags a filled honeypot", () => {
    expect(looksLikeSpam({ website: "http://spam.example", elapsedMs: 10_000 })).toBe(true);
  });

  it("flags forms submitted faster than a human could type", () => {
    expect(looksLikeSpam({ website: "", elapsedMs: 200 })).toBe(true);
  });

  it("lets normal submissions through", () => {
    expect(looksLikeSpam({ website: "", elapsedMs: 8000 })).toBe(false);
    expect(looksLikeSpam({})).toBe(false);
  });
});

describe("widgetConfigSchema", () => {
  it("accepts valid settings and normalizes the color", () => {
    expect(widgetConfigSchema.parse({ buttonLabel: "Ideas?", accentColor: "#FF00AA", position: "bottom-left" })).toEqual({
      buttonLabel: "Ideas?",
      accentColor: "#ff00aa",
      position: "bottom-left",
    });
  });

  it("rejects values that could inject CSS", () => {
    expect(widgetConfigSchema.safeParse({ buttonLabel: "x", accentColor: "red;}body{display:none", position: "bottom-left" }).success).toBe(false);
    expect(widgetConfigSchema.safeParse({ buttonLabel: "x", accentColor: "#ffffff", position: "top-center" }).success).toBe(false);
  });
});
