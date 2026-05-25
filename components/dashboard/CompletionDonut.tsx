'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

const SEGMENTS = [
  { key: 'completed', value: 42, color: 'hsl(var(--chart-5))' },
  { key: 'inProgress', value: 38, color: 'hsl(var(--chart-1))' },
  { key: 'paused', value: 14, color: 'hsl(var(--chart-3))' },
  { key: 'notStarted', value: 6, color: 'hsl(var(--muted-foreground))' }
];

const LABELS: Record<string, { fa: string; en: string }> = {
  completed: { fa: 'تکمیل شده', en: 'Completed' },
  inProgress: { fa: 'در حال یادگیری', en: 'In progress' },
  paused: { fa: 'متوقف شده', en: 'Paused' },
  notStarted: { fa: 'شروع نشده', en: 'Not started' }
};

const chartConfig: ChartConfig = {
  completed: { label: 'Completed', color: 'hsl(var(--chart-5))' },
  inProgress: { label: 'In progress', color: 'hsl(var(--chart-1))' },
  paused: { label: 'Paused', color: 'hsl(var(--chart-3))' },
  notStarted: { label: 'Not started', color: 'hsl(var(--muted-foreground))' }
};

export default function CompletionDonut() {
  const { language } = useTranslation();
  const t = language === 'fa';

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t ? 'نرخ تکمیل دوره' : 'Course completion'}
        </p>
        <CardTitle className="mt-1 text-base">
          {t ? 'بر اساس وضعیت دانشجویان' : 'By student status'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-2.5">
            {SEGMENTS.map((seg) => (
              <div key={seg.key} className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ background: seg.color }}
                />
                <span className="flex-1 text-[13px] text-muted-foreground">
                  {LABELS[seg.key][t ? 'fa' : 'en']}
                </span>
                <span className="font-mono text-[13px] font-semibold">
                  {t ? seg.value.toLocaleString('fa-IR') : seg.value}٪
                </span>
              </div>
            ))}
          </div>
          <div className="relative shrink-0">
            <ChartContainer
              config={chartConfig}
              className="h-[180px] w-[180px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="key" />} />
                <Pie
                  data={SEGMENTS}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  strokeWidth={2}
                  dataKey="value"
                >
                  {SEGMENTS.map((seg) => (
                    <Cell key={seg.key} fill={seg.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold leading-none">
                {t ? '۴۲' : '42'}٪
              </span>
              <span className="mt-1 text-[11px] text-muted-foreground">
                {t ? 'تکمیل کل' : 'overall'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
