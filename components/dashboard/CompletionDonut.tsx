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
import type { StatusSegment } from './dashboard-metrics';

const COLORS: Record<StatusSegment['key'], string> = {
  completed: 'hsl(var(--viz-accent))',
  inProgress: 'hsl(var(--viz-1))',
  notStarted: 'hsl(var(--viz-2))',
  ended: 'hsl(var(--viz-4))'
};

const LABELS: Record<StatusSegment['key'], { fa: string; en: string }> = {
  completed: { fa: 'تکمیل شده', en: 'Completed' },
  inProgress: { fa: 'در حال یادگیری', en: 'In progress' },
  notStarted: { fa: 'شروع نشده', en: 'Not started' },
  ended: { fa: 'پایان‌یافته', en: 'Ended' }
};

const chartConfig: ChartConfig = {
  completed: { label: 'Completed', color: 'hsl(var(--viz-accent))' },
  inProgress: { label: 'In progress', color: 'hsl(var(--viz-1))' },
  notStarted: { label: 'Not started', color: 'hsl(var(--viz-2))' },
  ended: { label: 'Ended', color: 'hsl(var(--viz-4))' }
};

type Props = { segments: StatusSegment[]; completion: number };

export default function CompletionDonut({ segments, completion }: Props) {
  const { language } = useTranslation();
  const t = language === 'fa';
  const fmt = (n: number) => (t ? n.toLocaleString('fa-IR') : String(n));
  // An all-zero pie renders nothing; one neutral slice keeps the ring visible.
  const isEmpty = segments.every((segment) => segment.value === 0);
  const pieData = isEmpty ? [{ key: 'ended', value: 100 }] : segments;

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
            {segments.map((seg) => (
              <div key={seg.key} className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: COLORS[seg.key] }}
                />
                <span className="flex-1 text-[13px] text-muted-foreground">
                  {LABELS[seg.key][t ? 'fa' : 'en']}
                </span>
                <span className="text-[13px] font-semibold tabular-nums">
                  {fmt(seg.value)}٪
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                  dataKey="value"
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {pieData.map((seg) => (
                    <Cell
                      key={seg.key}
                      fill={
                        isEmpty
                          ? 'hsl(var(--viz-grid))'
                          : COLORS[seg.key as StatusSegment['key']]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums leading-none">
                {fmt(completion)}٪
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
