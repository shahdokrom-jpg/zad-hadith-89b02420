import { Bell, BellRing } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDailyReminder } from "@/hooks/use-daily-reminder";
import { showHadithNotification } from "@/lib/reminder";

export function ReminderDialog() {
  const { settings, permission, update } = useDailyReminder();
  const [open, setOpen] = useState(false);

  const onToggle = async (enabled: boolean) => {
    if (permission === "unsupported") {
      toast.error("هذا المتصفح لا يدعم الإشعارات. ثبّت التطبيق على الشاشة الرئيسية ثم حاول مجددًا.");
      return;
    }
    const res = await update({ enabled });
    if (!res.ok) {
      toast.error("لم يُسمح بالإشعارات. فعّلها من إعدادات المتصفح ثم حاول مجددًا.");
      return;
    }
    if (enabled) {
      toast.success(`سيصلك حديث اليوم يوميًا الساعة ${settings.time}`);
      void showHadithNotification();
    } else toast("تم إيقاف التذكير اليومي");
  };

  const onTime = (time: string) => {
    if (!/^\d{2}:\d{2}$/.test(time)) return;
    void update({ time });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={settings.enabled ? "gold" : "paper"}
          size="pill"
          className="gap-1.5 px-3.5"
          aria-label="التذكير اليومي"
        >
          {settings.enabled ? <BellRing /> : <Bell />}
          <span className="text-xs sm:text-sm">
            {settings.enabled ? settings.time : "التذكير اليومي"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-sm rounded-3xl text-right">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="font-hadith text-2xl">التذكير اليومي</DialogTitle>
          <DialogDescription className="leading-6">
            اختر الوقت المناسب ليصلك إشعار بنص حديث اليوم.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted px-4 py-3">
            <Label htmlFor="reminder-enabled" className="text-base">
              تفعيل التذكير
            </Label>
            <Switch id="reminder-enabled" checked={settings.enabled} onCheckedChange={onToggle} />
          </div>

          <div className="flex items-center justify-between gap-4 px-1">
            <Label htmlFor="reminder-time" className="text-base">
              وقت التذكير
            </Label>
            <Input
              id="reminder-time"
              type="time"
              dir="ltr"
              value={settings.time}
              onChange={(e) => onTime(e.target.value)}
              className="h-11 w-36 rounded-xl text-center text-base"
            />
          </div>

          {settings.enabled && (
            <Button variant="soft" className="w-full rounded-xl" onClick={() => void showHadithNotification()}>
              إرسال إشعار تجريبي الآن
            </Button>
          )}

          <p className="rounded-2xl border border-border px-4 py-3 text-xs leading-6 text-muted-foreground">
            {permission === "denied"
              ? "الإشعارات محظورة لهذا الموقع؛ فعّلها من إعدادات المتصفح."
              : "على iPhone يلزم إضافة التطبيق إلى الشاشة الرئيسية أولًا (iOS 16.4 أو أحدث). يصل التذكير في وقته عندما يكون التطبيق مفتوحًا أو في الخلفية، وقد تؤخره بعض الأجهزة عند إغلاقه تمامًا."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
