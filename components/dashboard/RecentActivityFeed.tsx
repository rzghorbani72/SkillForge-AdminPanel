'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  GraduationCap,
  CreditCard,
  Edit,
  Settings,
  UserPlus,
  Wallet
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type Activity = {
  id: string;
  type: 'course_created' | 'student_enrolled' | 'payment_received' | string;
  title: string;
  description: string;
  timestamp: string;
  user: string;
};

type Props = { activities: Activity[] };

const TYPE_STYLE: Record<
  string,
  { Icon: React.ElementType; bg: string; fg: string }
> = {
  course_created: { Icon: BookOpen, bg: 'bg-primary/10', fg: 'text-primary' },
  student_enrolled: {
    Icon: GraduationCap,
    bg: 'bg-green-500/10',
    fg: 'text-green-600 dark:text-green-400'
  },
  payment_received: {
    Icon: CreditCard,
    bg: 'bg-amber-500/10',
    fg: 'text-amber-600 dark:text-amber-400'
  },
  edit: {
    Icon: Edit,
    bg: 'bg-sky-500/10',
    fg: 'text-sky-600 dark:text-sky-400'
  },
  settings: { Icon: Settings, bg: 'bg-muted', fg: 'text-muted-foreground' },
  user: {
    Icon: UserPlus,
    bg: 'bg-sky-500/10',
    fg: 'text-sky-600 dark:text-sky-400'
  },
  withdraw: {
    Icon: Wallet,
    bg: 'bg-amber-500/10',
    fg: 'text-amber-600 dark:text-amber-400'
  }
};

const DEFAULT_STYLE = {
  Icon: BookOpen,
  bg: 'bg-primary/10',
  fg: 'text-primary'
};

export default function RecentActivityFeed({ activities }: Props) {
  const { t, language } = useTranslation();
  const isFa = language === 'fa';

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {isFa ? 'فعالیت اخیر' : 'Recent activity'}
        </p>
        <CardTitle className="mt-1 text-base">
          {isFa ? 'تاریخچه آکادمی' : 'Academy history'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {activities.slice(0, 8).map((activity) => {
          const { Icon, bg, fg } = TYPE_STYLE[activity.type] ?? DEFAULT_STYLE;
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  bg
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', fg)} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug">
                  <strong className="font-semibold">{activity.user}</strong>{' '}
                  {activity.description}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {t('common.noData')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
