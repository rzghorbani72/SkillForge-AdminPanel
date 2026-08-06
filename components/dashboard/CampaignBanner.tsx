'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Users,
  CreditCard,
  ArrowLeft,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignBannerProps {
  onDismiss?: () => void;
}

export default function CampaignBanner({ onDismiss }: CampaignBannerProps) {
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all duration-500',
        active
          ? 'border-emerald-200 bg-gradient-to-l from-emerald-50 to-white dark:border-emerald-800 dark:from-emerald-950/40 dark:to-card'
          : 'border-border bg-card'
      )}
    >
      <button
        aria-label="بستن"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="absolute end-3 top-3 rounded-md p-1 text-muted-foreground/50 hover:text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      {active ? (
        <ActiveState onPause={() => setActive(false)} />
      ) : (
        <InactiveState onActivate={() => setActive(true)} />
      )}
    </div>
  );
}

function InactiveState({ onActivate }: { onActivate: () => void }) {
  return (
    <div className="flex items-center gap-6">
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
          کمپین نوروز ۱۴۰۴
        </p>
        <h2 className="mb-1.5 text-xl font-bold tracking-tight">
          ۳۰٪ تخفیف ویژه روی تمام دوره‌ها برای دانشجویان شما
        </h2>
        <p className="text-sm text-muted-foreground">
          بنر تبلیغاتی را در همه‌ی آکادمی‌های خود فعال کنید و فروش نوروزی را
          آغاز کنید.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          onClick={() => {}}
        >
          بعداً
        </button>
        <button
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={onActivate}
        >
          فعال کردن
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ActiveState({ onPause }: { onPause: () => void }) {
  return (
    <div className="flex items-center gap-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          کمپین نوروز فعال است
        </p>
        <h2 className="mb-1.5 text-lg font-bold tracking-tight">
          بنر روی ۵ آکادمی شما نمایش داده می‌شود
        </h2>
        <div className="flex items-center gap-5 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <strong className="font-mono font-semibold text-foreground">
              ۱۲٬۸۴۲
            </strong>{' '}
            بازدید
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <strong className="font-mono font-semibold text-foreground">
              ۴۸۰
            </strong>{' '}
            کلیک
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            <strong className="font-mono font-semibold text-foreground">
              ۲۸
            </strong>{' '}
            خرید
          </span>
          <span className="mr-auto text-muted-foreground/70">
            پایان: ۱۳ فروردین
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
          مشاهده آمار
        </button>
        <button
          className="rounded-lg px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          onClick={onPause}
        >
          توقف
        </button>
      </div>
    </div>
  );
}
