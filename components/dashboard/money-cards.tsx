'use client';

import {
  BadgeCheck,
  Banknote,
  DollarSign,
  GraduationCap,
  HandCoins,
  Landmark,
  Percent,
  Wallet
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn, formatCurrencyWithStore, formatNumber } from '@/lib/utils';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import type { ManagerDashboard } from '@/types/dashboard';
import type { SettlementSummary } from '@/lib/api-settlement';
import { MoneyCard, TONE_CLASS, type CardModel } from './money-card';

type Props = Pick<ManagerDashboard, 'money' | 'payouts_due'> & {
  settlement: SettlementSummary | null;
  isLoading: boolean;
  row: 'academy' | 'teacher';
};

/**
 * One row per call: the academy's own money (what came in, what it keeps, what
 * the platform still holds / paid), or the teachers' money (earned, paid, owed).
 */
export default function MoneyCards({
  money,
  payouts_due: payoutsDue,
  settlement,
  isLoading,
  row
}: Props) {
  const { t, language } = useTranslation();
  const academy = useCurrentAcademy();
  const percent = usePercentLabel();

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
      hint: (
        <PendingHint
          template={t('dashboard.money.platformOwesHint')}
          amount={settlement?.balance.pending ?? 0}
        />
      ),
      icon: Landmark,
      tone: 'pending',
      change: null
    },
    {
      key: 'paidToAcademy',
      title: t('dashboard.money.paidToAcademy'),
      value: settlement?.balance.withdrawn_total ?? 0,
      hint: t('dashboard.money.paidToAcademyHint'),
      icon: Banknote,
      tone: 'paid',
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
      tone: 'paid',
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
      tone: 'pending',
      change: null
    },
    {
      key: 'teacherRate',
      title: t('dashboard.money.teacherRate'),
      value: 0,
      valueLabel: percent((academy?.teacher_share_rate ?? 0) * 100),
      hint: t('dashboard.money.teacherRateHint'),
      icon: Percent,
      change: null
    }
  ];

  const isAcademy = row === 'academy';
  return (
    <CardRow
      title={t(
        isAcademy ? 'dashboard.money.academyRow' : 'dashboard.money.teacherRow'
      )}
      cards={isAcademy ? academyCards : teacherCards}
      isLoading={isLoading}
      className="sm:grid-cols-2 xl:grid-cols-4"
    />
  );
}

function CardRow({
  title,
  cards,
  isLoading,
  className
}: {
  title: string;
  cards: CardModel[];
  isLoading: boolean;
  className: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
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

/** The hint's amount turns orange while money is still on its way. */
function PendingHint({
  template,
  amount
}: {
  template: string;
  amount: number;
}) {
  const { language } = useTranslation();
  const academy = useCurrentAcademy();
  const [before, after] = template.split('{{pending}}');
  return (
    <>
      {before}
      <span className={cn('font-medium', amount > 0 && TONE_CLASS.pending)}>
        {formatCurrencyWithStore(amount, academy, undefined, language)}
      </span>
      {after}
    </>
  );
}
