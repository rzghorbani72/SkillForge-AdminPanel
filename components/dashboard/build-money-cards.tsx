import {
  BadgeCheck,
  Banknote,
  DollarSign,
  GraduationCap,
  HandCoins,
  Landmark,
  Percent,
  Wallet,
} from 'lucide-react';
import { TEACHER_SHARE_HREF } from '@/components/settings/academy-teacher-share-card';
import type { ManagerDashboard } from '@/types/dashboard';
import type { SettlementSummary } from '@/lib/api-settlement';
import type { CardModel } from './money-card';
import { PendingHint } from './money-pending-hint';

type Money = ManagerDashboard['money'];
type PayoutsDue = ManagerDashboard['payouts_due'];

type BuildArgs = {
  money: Money;
  payoutsDue: PayoutsDue;
  settlement: SettlementSummary | null;
  teacherShareRate: number;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCount: (n: number) => string;
  formatPercent: (n: number) => string;
};

function delta(current: number, previous: number): number | null {
  return previous === 0 ? null : Math.round(((current - previous) / previous) * 100);
}

export function buildAcademyMoneyCards({
  money,
  settlement,
  t,
}: Pick<BuildArgs, 'money' | 'settlement' | 't'>): CardModel[] {
  return [
    {
      key: 'gross',
      title: t('dashboard.money.gross'),
      value: money.gross,
      hint: t('dashboard.money.grossHint'),
      icon: DollarSign,
      change: delta(money.gross, money.gross_previous),
    },
    {
      key: 'net',
      title: t('dashboard.money.net'),
      value: money.net,
      hint: t('dashboard.money.netHint'),
      icon: Wallet,
      change: delta(money.net, money.net_previous),
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
      change: null,
    },
    {
      key: 'paidToAcademy',
      title: t('dashboard.money.paidToAcademy'),
      value: settlement?.balance.withdrawn_total ?? 0,
      hint: t('dashboard.money.paidToAcademyHint'),
      icon: Banknote,
      tone: 'paid',
      change: null,
    },
  ];
}

export function buildTeacherMoneyCards({
  money,
  payoutsDue,
  teacherShareRate,
  t,
  formatCount,
  formatPercent,
}: Omit<BuildArgs, 'settlement'>): CardModel[] {
  return [
    {
      key: 'teacherShare',
      title: t('dashboard.money.teacherShare'),
      value: money.teacher_payouts,
      hint: t('dashboard.money.teacherShareHint'),
      icon: GraduationCap,
      change: null,
    },
    {
      key: 'teacherPaid',
      title: t('dashboard.money.teacherPaid'),
      value: money.teacher_paid,
      hint: t('dashboard.money.teacherPaidHint'),
      icon: BadgeCheck,
      tone: 'paid',
      change: null,
    },
    {
      key: 'payouts',
      title: t('dashboard.money.payoutsDue'),
      value: payoutsDue.amount,
      hint: t('dashboard.money.payoutsDueHint', { count: formatCount(payoutsDue.count) }),
      icon: HandCoins,
      tone: 'pending',
      change: null,
    },
    {
      key: 'teacherRate',
      title: t('dashboard.money.teacherRate'),
      value: 0,
      valueLabel: formatPercent(teacherShareRate * 100),
      hint: t('dashboard.money.teacherRateHint'),
      icon: Percent,
      change: null,
      href: TEACHER_SHARE_HREF,
    },
  ];
}
