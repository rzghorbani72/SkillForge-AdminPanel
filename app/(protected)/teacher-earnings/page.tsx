'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TeacherPayoutsTable } from '@/components/teacher-earnings/teacher-payouts-table';
import { useTeacherEarnings } from '@/components/teacher-earnings/use-teacher-earnings';
import { useTranslation } from '@/lib/i18n/hooks';
import { MoneyValue } from '@/components/dashboard/money-value';
import { TeacherShareNote } from '@/components/shared/teacher-share-note';

export default function TeacherEarningsPage() {
  const { t } = useTranslation();
  const { balance, payouts, isLoading, reload } = useTeacherEarnings();
  const cards = [
    { key: 'earned', value: balance?.total_earned ?? 0 },
    { key: 'paid', value: balance?.total_paid_out ?? 0 },
    { key: 'owed', value: balance?.available_balance ?? 0 }
  ] as const;

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <header className="space-y-1 border-b pb-5">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('teacherEarnings.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('teacherEarnings.description')}
        </p>
        <TeacherShareNote className="pt-1" />
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardContent className="p-5">
              <p className="text-[13px] font-medium text-muted-foreground">
                {t(`teacherEarnings.${card.key}`)}
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-28" />
              ) : (
                <p className="mt-1">
                  <MoneyValue value={card.value} />
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <TeacherPayoutsTable
        rows={payouts}
        isLoading={isLoading}
        onChanged={reload}
      />
    </div>
  );
}
