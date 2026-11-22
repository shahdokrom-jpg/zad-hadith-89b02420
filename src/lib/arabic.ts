import type { Hadith } from "@/data/hadiths";

const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

/** Strip Tashkeel/tatweel and unify letter variants so searches ignore spelling details. */
export function normalizeArabic(input: string): string {
  return input
    .replace(DIACRITICS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[«»"()﴿﴾[\]،.:؛؟!]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function stripDiacritics(input: string): string {
  return input.replace(DIACRITICS, "");
}

const indexCache = new WeakMap<Hadith, string>();

function haystack(h: Hadith): string {
  let s = indexCache.get(h);
  if (!s) {
    s = normalizeArabic(`${h.intro} ${h.text} ${h.narrator} ${h.source} ${h.note}`);
    indexCache.set(h, s);
  }
  return s;
}

/** Every word of the query must appear (in any order). Numbers match the Hadith number. */
export function searchHadiths(list: readonly Hadith[], query: string): Hadith[] {
  const q = normalizeArabic(query.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))));
  if (!q) return [...list];
  if (/^\d+$/.test(q)) {
    const n = Number(q);
    return list.filter((h) => h.id === n);
  }
  const terms = q.split(" ");
  return list.filter((h) => {
    const s = haystack(h);
    return terms.every((t) => s.includes(t));
  });
}

export function toArabicDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)] ?? d);
}

/** Plain-text version used for copying and sharing. */
export function hadithShareText(h: Hadith): string {
  const parts = [h.intro, h.text, `${h.source}.`];
  if (h.note) parts.push(`(${h.note})`);
  parts.push(`— حديث رقم ${toArabicDigits(h.id)} من «الأحاديث القصار»`);
  return parts.join("\n");
}
