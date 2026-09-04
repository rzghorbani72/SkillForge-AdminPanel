'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';

const FUNNEL_STEPS = [
  { key: 'siteVisits', color: 'hsl(var(--chart-2))', value: 84200 },
  { key: 'freeSignup', color: 'hsl(var(--chart-3))', value: 12840 },
  { key: 'coursePreview', color: 'hsl(var(--chart-4))', value: 4680 },
  { key: 'purchase', color: 'hsl(var(--chart-1))', value: 840 }
];

const LABELS: Record<string, { fa: string; en: string }> = {
  siteVisits: { fa: 'بازدید سایت', en: 'Site visits' },
  freeSignup: { fa: 'ثبت‌نام رایگان', en: 'Free signup' },
  coursePreview: { fa: 'پیش‌نمایش دوره', en: 'Course preview' },
  purchase: { fa: 'خرید', en: 'Purchase' }
};

export default function ConversionFunnel() {
  const { language } = useTranslation();
  const t = language === 'fa';
  const max = FUNNEL_STEPS[0].value;

  const fmt = (n: number) =>
    t ? n.toLocaleString('fa-IR') : n.toLocaleString('en-US');

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t ? 'قیف فروش' : 'Conversion funnel'}
        </p>
        <CardTitle className="text-base">
          {t ? 'مسیر از بازدید تا خرید' : 'Visit to purchase'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {FUNNEL_STEPS.map((step, i) => {
          const previous = i === 0 ? null : FUNNEL_STEPS[i - 1].value;
          const rate = previous
            ? Math.round((step.value / previous) * 100)
            : null;

          return (
            <div key={step.key}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[13px]">
                  {LABELS[step.key][t ? 'fa' : 'en']}
                </span>
                <span className="flex items-center gap-2">
                  {rate !== null && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                      {fmt(rate)}%
                    </span>
                  )}
                  <span className="text-[13px] font-semibold tabular-nums">
                    {fmt(step.value)}
                  </span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted/70">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(step.value / max) * 100}%`,
                    background: `linear-gradient(90deg, ${step.color}, ${step.color}99)`
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
