import { describe, expect, it } from "vitest";

import { HADITHS } from "@/data/hadiths";

import { normalizeArabic, searchHadiths } from "./arabic";

describe("search", () => {
  it("ignores Tashkeel and hamza forms", () => {
    expect(normalizeArabic("إِنَّمَا الأَعْمَالُ")).toBe("انما الاعمال");
  });

  it("finds the Hadith of intentions by a plain-letter word", () => {
    const ids = searchHadiths(HADITHS, "بالنيات").map((h) => h.id);
    expect(ids).toContain(1);
  });

  it("matches a Hadith number typed in Arabic digits", () => {
    expect(searchHadiths(HADITHS, "١٢٥").map((h) => h.id)).toEqual([125]);
  });

  it("filters by narrator name", () => {
    const res = searchHadiths(HADITHS, "عائشة");
    expect(res.length).toBeGreaterThan(5);
    expect(res.every((h) => normalizeArabic(`${h.intro} ${h.narrator}`).includes("عايشه"))).toBe(true);
  });
});
