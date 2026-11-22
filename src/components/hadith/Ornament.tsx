import { cn } from "@/lib/utils";

/** Eight-pointed star (khatam) drawn with the gold token. */
export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("text-gold", className)}>
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <rect x="11" y="11" width="26" height="26" />
        <rect x="11" y="11" width="26" height="26" transform="rotate(45 24 24)" />
      </g>
      <circle cx="24" cy="24" r="4" fill="currentColor" />
    </svg>
  );
}

export function OrnamentDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-l from-gold/70 to-transparent" />
      <StarMark className="size-4" />
      <span className="h-px w-16 bg-gradient-to-r from-gold/70 to-transparent" />
    </div>
  );
}
