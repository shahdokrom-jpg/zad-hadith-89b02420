import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Shows an install button where the browser offers one (Android/desktop Chrome, Edge). */
export function InstallButton() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!event) return null;
  return (
    <Button
      variant="paper"
      size="icon-lg"
      aria-label="تثبيت التطبيق"
      title="تثبيت التطبيق"
      onClick={async () => {
        await event.prompt();
        await event.userChoice;
        setEvent(null);
      }}
    >
      <Download />
    </Button>
  );
}

/** iOS Safari has no install prompt, so explain the Share → Add to Home Screen steps. */
export function IosInstallHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setShow(ios && !standalone);
  }, []);
  if (!show) return null;
  return (
    <p className="mt-8 rounded-2xl bg-secondary/60 px-4 py-3 text-center text-xs leading-6 text-secondary-foreground">
      لتثبيت التطبيق على iPhone: اضغط زر المشاركة في Safari ثم «إضافة إلى الشاشة الرئيسية».
    </p>
  );
}
