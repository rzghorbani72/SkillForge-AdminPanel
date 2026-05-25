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
    <Card>
      <CardHeader className="pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t ? 'قیف فروش' : 'Conversion funnel'}
        </p>
        <CardTitle className="text-base">
          {t ? 'مسیر از بازدید تا خرید' : 'Visit to purchase'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {FUNNEL_STEPS.map((step) => (
          <div key={step.key}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px]">
                {LABELS[step.key][t ? 'fa' : 'en']}
              </span>
              <span className="font-mono text-[13px] font-semibold">
                {fmt(step.value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(step.value / max) * 100}%`,
                  background: step.color
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
