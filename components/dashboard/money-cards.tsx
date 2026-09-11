'use client';

import type { ReactNode } from 'react';
import {
  BadgeCheck,
  Banknote,
  Clock,
  DollarSign,
  GraduationCap,
  HandCoins,
  Landmark,
  Wallet
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';
import type { ManagerDashboard } from '@/types/dashboard';
import type { SettlementSummary } from '@/lib/api-settlement';
import { MoneyCard, type CardModel } from './money-card';
import { TeacherShareNote } from '@/components/shared/teacher-share-note';

type Props = Pick<ManagerDashboard, 'money' | 'payouts_due'> & {
  settlement: SettlementSummary | null;
  isLoading: boolean;
};

/**
 * Two rows: the academy's own money (what came in, what it keeps, what the
 * platform still holds / paid), then the teachers' money (earned, paid, owed).
 */
export default function MoneyCards({
  money,
  payouts_due: payoutsDue,
  settlement,
  isLoading
}: Props) {
  const { t, language } = useTranslation();

  const delta = (current: number, previous: number) =>
    previous === 0 ? null : Math.round(((current - previous) / previous) * 100);

  const academyCards: CardModel[] = [
    {
      key: 'gross',
      title: t('dashboard.money.gross'),
      value: money.gross,
      hint: t('dashboard.money.grossHint'),
      icon: DollarSign,
      change: delta(money.gross, money.gross_previous)
    },
    {
      key: 'net',
      title: t('dashboard.money.net'),
      value: money.net,
      hint: t('dashboard.money.netHint'),
      icon: Wallet,
      change: delta(money.net, money.net_previous)
    },
    {
      key: 'platformOwes',
      title: t('dashboard.money.platformOwes'),
      value: settlement?.balance.available ?? 0,
      hint: t('dashboard.money.platformOwesHint'),
      icon: Landmark,
      change: null
    },
    {
      key: 'settlementPending',
      title: t('dashboard.money.settlementPending'),
      value: settlement?.balance.pending ?? 0,
      hint: t('dashboard.money.settlementPendingHint'),
      icon: Clock,
      change: null
    },
    {
      key: 'paidToAcademy',
      title: t('dashboard.money.paidToAcademy'),
      value: settlement?.balance.withdrawn_total ?? 0,
      hint: t('dashboard.money.paidToAcademyHint'),
      icon: Banknote,
      change: null
    }
  ];

  const teacherCards: CardModel[] = [
    {
      key: 'teacherShare',
      title: t('dashboard.money.teacherShare'),
      value: money.teacher_payouts,
      hint: t('dashboard.money.teacherShareHint'),
      icon: GraduationCap,
      change: null
    },
    {
      key: 'teacherPaid',
      title: t('dashboard.money.teacherPaid'),
      value: money.teacher_paid,
      hint: t('dashboard.money.teacherPaidHint'),
      icon: BadgeCheck,
      change: null
    },
    {
      key: 'payouts',
      title: t('dashboard.money.payoutsDue'),
      value: payoutsDue.amount,
      hint: t('dashboard.money.payoutsDueHint', {
        count: formatNumber(payoutsDue.count, language)
      }),
      icon: HandCoins,
      change: null
    }
  ];

  return (
    <div className="space-y-5">
      <CardRow
        title={t('dashboard.money.academyRow')}
        cards={academyCards}
        isLoading={isLoading}
        className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      />
      <CardRow
        title={t('dashboard.money.teacherRow')}
        cards={teacherCards}
        isLoading={isLoading}
        className="sm:grid-cols-3"
        note={<TeacherShareNote />}
      />
    </div>
  );
}

function CardRow({
  title,
  cards,
  isLoading,
  className,
  note
}: {
  title: string;
  cards: CardModel[];
  isLoading: boolean;
  className: string;
  note?: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
        {note}
      </div>
      <div className={`grid gap-4 ${className}`}>
        {cards.map((card, index) => (
          <MoneyCard
            key={card.key}
            card={card}
            index={index}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}
