import { describe, expect, it } from "vitest";

import { HADITHS } from "./hadiths";

describe("hadith data", () => {
  it("contains all 200 Hadiths numbered 1 to 200", () => {
    expect(HADITHS).toHaveLength(200);
    expect(HADITHS.map((h) => h.id)).toEqual(Array.from({ length: 200 }, (_, i) => i + 1));
  });

  it("gives every Hadith a narrator, text and Bukhari/Muslim source", () => {
    for (const h of HADITHS) {
      expect(h.narrator, `#${h.id}`).not.toBe("");
      expect(h.text.length, `#${h.id}`).toBeGreaterThan(10);
      expect(h.source, `#${h.id}`).toMatch(/^رواه (البخاري|مسلم)/);
    }
  });

  it("keeps no broken PDF glyphs", () => {
    const all = HADITHS.map((h) => h.intro + h.text + h.note).join(" ");
    expect(all).not.toMatch(/[\uf000-\uf8ff\ufb50-\ufd3d\ufd40-\ufdf9\ufe70-\ufeff]/);
  });
});
