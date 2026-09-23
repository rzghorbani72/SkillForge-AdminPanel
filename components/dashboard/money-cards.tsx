'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import type { ManagerDashboard } from '@/types/dashboard';
import type { SettlementSummary } from '@/lib/api-settlement';
import { MoneyCard, type CardModel } from './money-card';
import { buildAcademyMoneyCards, buildTeacherMoneyCards } from './build-money-cards';

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
  row,
}: Props) {
  const { t, language } = useTranslation();
  const academy = useCurrentAcademy();
  const percent = usePercentLabel();
  const isAcademy = row === 'academy';

  const cards = isAcademy
    ? buildAcademyMoneyCards({ money, settlement, t })
    : buildTeacherMoneyCards({
        money,
        payoutsDue,
        teacherShareRate: academy?.teacher_share_rate ?? 0,
        t,
        formatCount: (n) => formatNumber(n, language),
        formatPercent: percent,
      });

  return (
    <CardRow
      title={t(isAcademy ? 'dashboard.money.academyRow' : 'dashboard.money.teacherRow')}
      cards={cards}
      isLoading={isLoading}
      className="sm:grid-cols-2 xl:grid-cols-4"
    />
  );
}

function CardRow({
  title,
  cards,
  isLoading,
  className,
}: {
  title: string;
  cards: CardModel[];
  isLoading: boolean;
  className: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className={`grid gap-3 ${className}`}>
        {cards.map((card) => (
          <MoneyCard key={card.key} card={card} isLoading={isLoading} />
        ))}
      </div>
    </section>
  );
}
