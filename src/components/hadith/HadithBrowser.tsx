import { Heart, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HADITHS } from "@/data/hadiths";
import { searchHadiths, toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

interface Props {
  currentId: number;
  favorites: number[];
  onSelect: (index: number) => void;
}

export function HadithBrowser({ currentId, favorites, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "fav">("all");
  const q = useDeferredValue(query);

  const results = useMemo(() => {
    const base = tab === "fav" ? HADITHS.filter((h) => favorites.includes(h.id)) : HADITHS;
    return searchHadiths(base, q);
  }, [q, tab, favorites]);

  return (
    <section id="browse" aria-label="تصفح الأحاديث" className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-hadith text-2xl font-bold text-primary">تصفّح الأحاديث</h2>
        <span className="text-xs text-muted-foreground">النتائج: {toArabicDigits(results.length)}</span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بكلمة، أو اسم الراوي، أو رقم الحديث"
          aria-label="البحث في الأحاديث"
          className="h-12 rounded-2xl border-border bg-paper pe-10 ps-10 text-base shadow-soft [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="مسح البحث"
            className="absolute left-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "fav")} dir="rtl" className="mt-4">
        <TabsList className="h-11 w-full rounded-2xl bg-muted p-1">
          <TabsTrigger value="all" className="flex-1 rounded-xl text-sm">
            كل الأحاديث
          </TabsTrigger>
          <TabsTrigger value="fav" className="flex-1 gap-1.5 rounded-xl text-sm">
            <Heart className="size-3.5" /> المفضلة
            {favorites.length > 0 && (
              <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                {toArabicDigits(favorites.length)}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ul className="mt-4 space-y-2.5">
        {results.map((h) => {
          const index = HADITHS.indexOf(h);
          const active = h.id === currentId;
          return (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border bg-paper/80 p-3.5 text-right transition-colors hover:border-gold/60 hover:bg-paper",
                  active ? "border-primary/50 ring-1 ring-primary/30" : "border-border",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground">
                  {toArabicDigits(h.id)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="hadith-text line-clamp-2 text-lg leading-8 text-ink">{h.text}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{h.narrator}</span>
                    <span aria-hidden>·</span>
                    <span>{h.source}</span>
                    {favorites.includes(h.id) && (
                      <Heart className="size-3 fill-destructive text-destructive" aria-label="في المفضلة" />
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {results.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          {tab === "fav" && !q
            ? "لم تُضف أي حديث إلى المفضلة بعد. اضغط على رمز القلب في بطاقة الحديث لحفظه هنا."
            : "لا توجد نتائج مطابقة لبحثك."}
        </div>
      )}
    </section>
  );
}
