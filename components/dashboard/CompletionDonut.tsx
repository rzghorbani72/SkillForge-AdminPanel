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
  { key: 'completed', value: 42, color: 'hsl(var(--viz-accent))' },
  { key: 'inProgress', value: 38, color: 'hsl(var(--viz-1))' },
  { key: 'paused', value: 14, color: 'hsl(var(--viz-2))' },
  { key: 'notStarted', value: 6, color: 'hsl(var(--viz-4))' }
];

const LABELS: Record<string, { fa: string; en: string }> = {
  completed: { fa: 'تکمیل شده', en: 'Completed' },
  inProgress: { fa: 'در حال یادگیری', en: 'In progress' },
  paused: { fa: 'متوقف شده', en: 'Paused' },
  notStarted: { fa: 'شروع نشده', en: 'Not started' }
};

const chartConfig: ChartConfig = {
  completed: { label: 'Completed', color: 'hsl(var(--viz-accent))' },
  inProgress: { label: 'In progress', color: 'hsl(var(--viz-1))' },
  paused: { label: 'Paused', color: 'hsl(var(--viz-2))' },
  notStarted: { label: 'Not started', color: 'hsl(var(--viz-4))' }
};

export default function CompletionDonut() {
  const { language } = useTranslation();
  const t = language === 'fa';

  return (
    <Card className="dashboard-card h-full">
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
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: seg.color }}
                />
                <span className="flex-1 text-[13px] text-muted-foreground">
                  {LABELS[seg.key][t ? 'fa' : 'en']}
                </span>
                <span className="text-[13px] font-semibold tabular-nums">
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
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                  dataKey="value"
                >
                  {SEGMENTS.map((seg) => (
                    <Cell key={seg.key} fill={seg.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums leading-none">
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
