import { describe, expect, it } from "vitest";
import { routeDecision } from "@/lib/supabase/proxy";
import { widgetSnippets } from "@/lib/snippets";
import { parseUserAgent } from "@/lib/user-agent";
import { feedbackTitle, safeRedirectPath, timeAgo } from "@/lib/utils";

describe("safeRedirectPath", () => {
  it("allows same-site paths", () => {
    expect(safeRedirectPath("/dashboard/projects")).toBe("/dashboard/projects");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "", null])(
    "blocks open redirects to %s",
    (next) => {
      expect(safeRedirectPath(next)).toBe("/dashboard");
    },
  );
});

describe("routeDecision (auth guard)", () => {
  it("sends signed-out visitors on dashboard routes to sign in", () => {
    expect(routeDecision("/dashboard", false)).toBe("login");
    expect(routeDecision("/dashboard/projects/abc", false)).toBe("login");
    expect(routeDecision("/reset-password", false)).toBe("login");
  });

  it("keeps public pages public", () => {
    expect(routeDecision("/", false)).toBe("allow");
    expect(routeDecision("/demo", false)).toBe("allow");
    expect(routeDecision("/dashboardish", false)).toBe("allow");
  });

  it("skips the sign-in page for signed-in users", () => {
    expect(routeDecision("/login", true)).toBe("dashboard");
    expect(routeDecision("/signup", true)).toBe("dashboard");
    expect(routeDecision("/dashboard", true)).toBe("allow");
  });
});

describe("feedbackTitle", () => {
  it("uses the first sentence", () => {
    expect(feedbackTitle("Login button doesn't work. It does nothing on mobile.")).toBe("Login button doesn't work.");
  });

  it("truncates long first lines", () => {
    expect(feedbackTitle("a".repeat(100), 20)).toBe(`${"a".repeat(19)}…`);
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-09-28T12:00:00Z");
  it("formats recent times relatively", () => {
    expect(timeAgo("2026-09-28T11:59:30Z", now)).toBe("just now");
    expect(timeAgo("2026-09-28T10:00:00Z", now)).toBe("2 hours ago");
    expect(timeAgo("2026-09-27T12:00:00Z", now)).toBe("yesterday");
  });
});

describe("parseUserAgent", () => {
  it("detects common browsers and systems", () => {
    expect(
      parseUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"),
    ).toEqual({ browser: "Chrome", os: "macOS" });
    expect(
      parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"),
    ).toEqual({ browser: "Safari", os: "iOS" });
    expect(parseUserAgent(null)).toEqual({ browser: null, os: null });
  });
});

describe("widgetSnippets", () => {
  it("embeds the project id and app URL in every framework snippet", () => {
    const snippets = widgetSnippets("https://fb.example.com/", "abc-123");
    for (const { code } of Object.values(snippets)) {
      expect(code).toContain("https://fb.example.com/widget.js");
      expect(code).toContain("abc-123");
    }
  });
});
