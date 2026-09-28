import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit within the window, then blocks", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect([0, 10, 20].map((t) => limiter.check("ip", t).allowed)).toEqual([true, true, true]);
    const blocked = limiter.check("ip", 30);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(970);
  });

  it("frees up capacity as the window slides", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    limiter.check("ip", 0);
    limiter.check("ip", 500);
    expect(limiter.check("ip", 900).allowed).toBe(false);
    expect(limiter.check("ip", 1001).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("b", 0).allowed).toBe(true);
    expect(limiter.check("a", 1).allowed).toBe(false);
  });

  it("bounds memory by evicting the least recently used key", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });
    limiter.check("a", 0);
    limiter.check("b", 1);
    limiter.check("c", 2); // evicts "a"
    expect(limiter.check("a", 3).allowed).toBe(true);
    expect(limiter.check("c", 4).allowed).toBe(false);
  });
});
