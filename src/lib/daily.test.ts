import { describe, expect, it } from "vitest";

import { dailyIndex, localDateKey, randomIndex, wrapIndex } from "./daily";

describe("daily hadith selection", () => {
  it("shows Hadith #1 on 1 January 2026", () => {
    expect(dailyIndex(new Date(2026, 0, 1, 9, 30))).toBe(0);
  });

  it("gives every day of a 200-day cycle a different Hadith", () => {
    const seen = new Set<number>();
    for (let d = 0; d < 200; d++) seen.add(dailyIndex(new Date(2026, 0, 1 + d)));
    expect(seen.size).toBe(200);
  });

  it("keeps the same Hadith all day, then advances by one at local midnight", () => {
    const morning = dailyIndex(new Date(2026, 10, 22, 0, 1));
    const night = dailyIndex(new Date(2026, 10, 22, 23, 59));
    const next = dailyIndex(new Date(2026, 10, 23, 0, 1));
    expect(night).toBe(morning);
    expect(next).toBe((morning + 1) % 200);
  });

  it("restarts the cycle after 200 days", () => {
    expect(dailyIndex(new Date(2026, 0, 1 + 200))).toBe(0);
  });

  it("wraps previous/next around the ends", () => {
    expect(wrapIndex(-1)).toBe(199);
    expect(wrapIndex(200)).toBe(0);
  });

  it("never returns the current Hadith as the random one", () => {
    for (let i = 0; i < 300; i++) expect(randomIndex(7)).not.toBe(7);
  });

  it("formats local date keys", () => {
    expect(localDateKey(new Date(2026, 1, 5))).toBe("2026-02-05");
  });
});
