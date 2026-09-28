import { describe, expect, it } from "vitest";
import { filtersToSearchParams, parseFeedbackFilters, toSearchPattern } from "@/lib/validation/filters";

describe("parseFeedbackFilters", () => {
  it("reads valid filters from the URL", () => {
    expect(parseFeedbackFilters({ q: " login ", status: "in_progress", type: "bug" })).toEqual({
      q: "login",
      status: "in_progress",
      type: "bug",
    });
  });

  it("falls back to 'all' for unknown values", () => {
    expect(parseFeedbackFilters({ status: "deleted", type: ["x", "bug"] })).toEqual({ q: "", status: "all", type: "all" });
  });

  it("caps very long searches", () => {
    expect(parseFeedbackFilters({ q: "a".repeat(500) }).q).toHaveLength(100);
  });
});

describe("toSearchPattern", () => {
  it("wraps the search in wildcards", () => {
    expect(toSearchPattern("dark mode")).toBe("%dark mode%");
  });

  it("escapes LIKE wildcards so they match literally", () => {
    expect(toSearchPattern("100%_done")).toBe("%100\\%\\_done%");
  });

  it("strips characters that would break out of the PostgREST or() filter", () => {
    const pattern = toSearchPattern("x,status.eq.archived)");
    expect(pattern).not.toMatch(/[,()]/);
  });

  it("returns null for empty searches", () => {
    expect(toSearchPattern("   ")).toBeNull();
  });
});

describe("filtersToSearchParams", () => {
  it("omits defaults", () => {
    expect(filtersToSearchParams({ q: "", status: "all", type: "all" })).toBe("");
    expect(filtersToSearchParams({ q: "pay", status: "open", type: "all" })).toBe("?q=pay&status=open");
  });
});
