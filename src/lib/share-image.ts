import type { Hadith } from "@/data/hadiths";
import { toArabicDigits } from "@/lib/arabic";

const W = 1080;
const PAD = 120;

/** Resolve a CSS color token to something canvas understands (rgb via a 1px probe). */
function resolveColor(token: string, fallback: string): string {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    if (!raw) return fallback;
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const ctx = c.getContext("2d");
    if (!ctx) return fallback;
    ctx.fillStyle = fallback;
    ctx.fillStyle = raw;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return fallback;
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  for (const rot of [0, Math.PI / 4]) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = rot + Math.PI / 4 + (i * Math.PI) / 2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export async function renderHadithImage(h: Hadith, label: string): Promise<Blob> {
  const sans = '"IBM Plex Sans Arabic", sans-serif';
  const serif = '"Amiri", "Noto Naskh Arabic", serif';
  await Promise.all([
    document.fonts.load(`700 52px ${serif}`),
    document.fonts.load(`400 52px ${serif}`),
    document.fonts.load(`500 30px ${sans}`),
  ]).catch(() => undefined);

  const paper = resolveColor("--paper", "#fbf8f1");
  const ink = resolveColor("--ink", "#1f3a35");
  const primary = resolveColor("--primary", "#2c5e55");
  const muted = resolveColor("--muted-foreground", "#6b7d74");
  const gold = resolveColor("--gold", "#c9a35c");
  const goldSoft = resolveColor("--gold-soft", "#efe3c8");

  const measure = document.createElement("canvas").getContext("2d")!;
  measure.direction = "rtl";
  const inner = W - PAD * 2;

  let size = 54;
  let textLines: string[] = [];
  for (; size >= 38; size -= 4) {
    measure.font = `400 ${size}px ${serif}`;
    textLines = wrap(measure, h.text, inner);
    if (textLines.length * size * 1.95 < 1100) break;
  }
  const lh = size * 1.95;
  measure.font = `400 30px ${sans}`;
  const introLines = wrap(measure, h.intro, inner);
  measure.font = `400 28px ${sans}`;
  const noteLines = h.note ? wrap(measure, h.note, inner - 60) : [];

  const header = 250;
  const footerReserve = 190;
  const introH = introLines.length * 50;
  const gapIntro = 50;
  const textH = textLines.length * lh;
  const noteH = noteLines.length ? noteLines.length * 46 + 40 + 50 : 0;
  const metaH = 40 + 70;
  const contentH = introH + gapIntro + textH + metaH + noteH;
  const H = Math.max(1350, Math.ceil(header + contentH + footerReserve + 40));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, 60, W - 120, H - 120);
  ctx.globalAlpha = 1;

  star(ctx, W / 2, 140, 30, gold);
  ctx.fillStyle = primary;
  ctx.font = `700 42px ${serif}`;
  ctx.fillText(label, W / 2, 215);

  // Vertically centre the content between the header and the footer line.
  let y = header + Math.max(30, (H - header - footerReserve - contentH) / 2) + 25;
  ctx.fillStyle = muted;
  ctx.font = `400 30px ${sans}`;
  for (const l of introLines) {
    ctx.fillText(l, W / 2, y);
    y += 50;
  }
  y += gapIntro - 50 + lh / 2;
  ctx.fillStyle = ink;
  ctx.font = `400 ${size}px ${serif}`;
  for (const l of textLines) {
    ctx.fillText(l, W / 2, y);
    y += lh;
  }

  y += 40 - lh / 2;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 160, y);
  ctx.lineTo(W / 2 - 24, y);
  ctx.moveTo(W / 2 + 24, y);
  ctx.lineTo(W / 2 + 160, y);
  ctx.stroke();
  star(ctx, W / 2, y, 12, gold);
  y += 70;
  ctx.fillStyle = primary;
  ctx.font = `600 32px ${sans}`;
  ctx.fillText(`${h.source} · الراوي: ${h.narrator}`, W / 2, y);

  if (noteLines.length) {
    y += 50;
    const boxH = noteLines.length * 46 + 40;
    ctx.fillStyle = goldSoft;
    ctx.beginPath();
    ctx.roundRect(PAD, y, inner, boxH, 22);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.font = `400 28px ${sans}`;
    let ny = y + 20 + 23;
    for (const l of noteLines) {
      ctx.fillText(l, W / 2, ny);
      ny += 46;
    }
  }

  ctx.fillStyle = muted;
  ctx.font = `400 24px ${sans}`;
  ctx.fillText(`حديث رقم ${toArabicDigits(h.id)} · الأحاديث القصار — ٢٠٠ حديث من الصحيحين`, W / 2, H - 105);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
