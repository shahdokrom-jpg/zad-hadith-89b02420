import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { HadithBrowser } from "@/components/hadith/HadithBrowser";
import { HadithCard } from "@/components/hadith/HadithCard";
import { InstallButton, IosInstallHint } from "@/components/hadith/InstallButton";
import { StarMark } from "@/components/hadith/Ornament";
import { ReminderDialog } from "@/components/hadith/ReminderDialog";
import { Button } from "@/components/ui/button";
import { HADITHS } from "@/data/hadiths";
import { useFavorites } from "@/hooks/use-favorites";
import { toArabicDigits } from "@/lib/arabic";
import { dailyIndex, localDateKey, randomIndex, wrapIndex } from "@/lib/daily";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حديث اليوم — حديث نبوي كل يوم من الصحيحين" },
      {
        name: "description",
        content:
          "حديث نبوي شريف كل يوم من مائتي حديث قصير من صحيحي البخاري ومسلم، مع البحث والمفضلة والمشاركة والتذكير اليومي.",
      },
      { property: "og:title", content: "حديث اليوم — حديث نبوي كل يوم" },
      {
        property: "og:description",
        content: "مائتا حديث قصير من الصحيحين، حديث جديد كل يوم مع التذكير اليومي.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function formatDates(d: Date) {
  try {
    const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    const greg = new Intl.DateTimeFormat("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(d);
    return `${greg} · ${hijri}`;
  } catch {
    return "";
  }
}

function Index() {
  const [today, setToday] = useState<{ index: number; key: string; label: string } | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const { ids: favorites, toggle, has } = useFavorites();

  useEffect(() => {
    const sync = () => {
      const now = new Date();
      const key = localDateKey(now);
      setToday((prev) => {
        if (prev?.key === key) return prev;
        const i = dailyIndex(now);
        // On a new day, jump to the new daily Hadith unless the user is browsing.
        setIndex((cur) => (cur === null || cur === prev?.index ? i : cur));
        return { index: i, key, label: formatDates(now) };
      });
    };
    sync();
    const onVisible = () => document.visibilityState === "visible" && sync();
    document.addEventListener("visibilitychange", onVisible);
    const t = setInterval(sync, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(t);
    };
  }, []);

  const go = useCallback((next: number, scroll = false) => {
    setIndex(wrapIndex(next));
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (index === null || (e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === "ArrowLeft") go(index + 1);
      if (e.key === "ArrowRight") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const hadith = index === null ? null : HADITHS[index];
  const isToday = today !== null && index === today.index;

  return (
    <div dir="rtl" className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <header className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary shadow-soft">
            <StarMark className="size-7" />
          </span>
          <div className="leading-tight">
            <h1 className="font-hadith text-2xl font-bold text-primary">حديث اليوم</h1>
            <p className="text-[0.7rem] text-muted-foreground">الأحاديث القصار · ٢٠٠ حديث من الصحيحين</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InstallButton />
          <ReminderDialog />
        </div>
      </header>

      <main className="mt-4">
        <div className="mb-4 flex min-h-9 flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{today?.label}</p>
          {today && !isToday && (
            <Button variant="soft" size="sm" className="rounded-full" onClick={() => go(today.index)}>
              <RotateCcw className="size-3.5" />
              العودة إلى حديث اليوم
            </Button>
          )}
        </div>

        {hadith ? (
          <HadithCard
            key={hadith.id}
            hadith={hadith}
            label={isToday ? "حديث اليوم" : `حديث رقم ${toArabicDigits(hadith.id)}`}
            isFavorite={has(hadith.id)}
            onToggleFavorite={() => toggle(hadith.id)}
          />
        ) : (
          <div className="paper-frame h-[26rem] animate-pulse rounded-3xl" aria-hidden />
        )}

        <nav aria-label="التنقل بين الأحاديث" className="mt-5 grid grid-cols-3 gap-2">
          <Button
            variant="paper"
            size="pill"
            disabled={index === null}
            onClick={() => index !== null && go(index - 1)}
          >
            <ChevronRight />
            السابق
          </Button>
          <Button
            variant="default"
            size="pill"
            disabled={index === null}
            onClick={() => index !== null && go(randomIndex(index))}
          >
            <Shuffle />
            عشوائي
          </Button>
          <Button
            variant="paper"
            size="pill"
            disabled={index === null}
            onClick={() => index !== null && go(index + 1)}
          >
            التالي
            <ChevronLeft />
          </Button>
        </nav>

        <HadithBrowser
          currentId={hadith?.id ?? 0}
          favorites={favorites}
          onSelect={(i) => go(i, true)}
        />

        <IosInstallHint />

        <footer className="mt-12 text-center text-xs leading-6 text-muted-foreground">
          الأحاديث من كتاب «الأحاديث القصار: ٢٠٠ حديث من الصحيحين»
          <br />
          تأليف د. محمد بن علي بن جميل المطري
        </footer>
      </main>
    </div>
  );
}
