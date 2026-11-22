import { Check, Copy, Heart, ImageIcon, Share2, Type } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Hadith } from "@/data/hadiths";
import { hadithShareText, toArabicDigits } from "@/lib/arabic";
import { renderHadithImage } from "@/lib/share-image";
import { cn } from "@/lib/utils";

import { OrnamentDivider, StarMark } from "./Ornament";

interface Props {
  hadith: Hadith;
  label: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function HadithCard({ hadith, label, isFavorite, onToggleFavorite }: Props) {
  const [copied, setCopied] = useState(false);
  const imageRef = useRef<{ id: number; blob: Promise<Blob> } | null>(null);

  const prepareImage = () => {
    if (imageRef.current?.id !== hadith.id) {
      imageRef.current = { id: hadith.id, blob: renderHadithImage(hadith, label) };
    }
    return imageRef.current.blob;
  };

  const onCopy = async () => {
    if (await copyText(hadithShareText(hadith))) {
      setCopied(true);
      toast.success("تم نسخ الحديث");
      setTimeout(() => setCopied(false), 1800);
    } else toast.error("تعذّر النسخ");
  };

  const onShareText = async () => {
    const text = hadithShareText(hadith);
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return;
      }
    }
    if (await copyText(text)) toast.success("تم نسخ النص للمشاركة");
  };

  const onShareImage = async () => {
    try {
      const blob = await prepareImage();
      const file = new File([blob], `hadith-${hadith.id}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "حديث شريف" });
          return;
        } catch (e) {
          if ((e as DOMException).name === "AbortError") return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast.success("تم حفظ صورة الحديث");
    } catch {
      toast.error("تعذّر إنشاء الصورة");
    }
  };

  return (
    <article
      key={hadith.id}
      className="paper-frame animate-fade-rise rounded-3xl px-6 pb-5 pt-8 sm:px-10 sm:pt-10"
      aria-labelledby={`hadith-${hadith.id}-label`}
    >
      <header className="flex flex-col items-center gap-2 text-center">
        <StarMark className="size-7" />
        <p id={`hadith-${hadith.id}-label`} className="font-hadith text-lg font-bold text-primary">
          {label}
        </p>
        <p className="text-xs text-muted-foreground">
          الحديث {toArabicDigits(hadith.id)} من {toArabicDigits(200)}
        </p>
      </header>

      <p className="mt-6 text-center text-sm leading-7 text-muted-foreground">{hadith.intro}</p>

      <blockquote className="hadith-text mt-4 text-center text-[1.6rem] text-ink sm:text-[1.85rem]">
        {hadith.text}
      </blockquote>

      <OrnamentDivider className="mt-6" />

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
          {hadith.source}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
          الراوي: <span className="text-foreground">{hadith.narrator}</span>
        </span>
      </div>

      {hadith.note && (
        <aside className="mt-5 rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm leading-7 text-gold-foreground">
          <span className="font-semibold">شرح المفردات: </span>
          {hadith.note}
        </aside>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 border-t border-border/70 pt-4">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          <Heart className={cn(isFavorite && "fill-destructive text-destructive")} />
        </Button>
        <Button variant="ghost" size="icon-lg" onClick={onCopy} aria-label="نسخ الحديث" title="نسخ">
          {copied ? <Check className="text-primary" /> : <Copy />}
        </Button>
        <DropdownMenu
          dir="rtl"
          onOpenChange={(open) => {
            if (open) void prepareImage().catch(() => undefined);
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-lg" aria-label="مشاركة" title="مشاركة">
              <Share2 />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-44">
            <DropdownMenuItem onSelect={onShareImage} className="gap-2 py-2.5">
              <ImageIcon className="size-4" /> مشاركة كصورة
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onShareText} className="gap-2 py-2.5">
              <Type className="size-4" /> مشاركة كنص
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
