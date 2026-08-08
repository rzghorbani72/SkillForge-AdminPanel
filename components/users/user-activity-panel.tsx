'use client';

import { BookOpen, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  UserDetailsEnrollment,
  UserDetailsPayment
} from '@/types/user-details';

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fa-IR');
}

function formatAmount(value?: number | null): string {
  return value == null ? '—' : value.toLocaleString('fa-IR');
}

function EmptyRow({ label }: { label: string }) {
  return (
    <p className="py-6 text-center text-[13px] text-muted-foreground">
      {label}
    </p>
  );
}

export function UserEnrollmentsCard({
  enrollments
}: {
  enrollments: UserDetailsEnrollment[];
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          {t('userDetails.enrollments')}
        </CardTitle>
        <CardDescription>
          {t('userDetails.enrollmentsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <EmptyRow label={t('userDetails.noEnrollments')} />
        ) : (
          <ul className="divide-y divide-border/60">
            {enrollments.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">
                    {item.Course?.title || '—'}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {t('userDetails.enrolledOn')} {formatDate(item.enrolled_at)}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {item.status || '—'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function UserPaymentsCard({
  payments
}: {
  payments: UserDetailsPayment[];
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          {t('userDetails.purchases')}
        </CardTitle>
        <CardDescription>
          {t('userDetails.purchasesDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyRow label={t('userDetails.noPurchases')} />
        ) : (
          <ul className="divide-y divide-border/60">
            {payments.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">
                    {item.Course?.title || item.Order?.order_number || '—'}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-[13px] font-semibold">
                    {formatAmount(item.amount)} {t('common.toman')}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {item.status || '—'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
