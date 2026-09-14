'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Star, Users, Wallet } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useIranMoney } from '../_hooks/use-iran-money';
import type { AnalyticsOverview } from '@/types/analytics';

export function OverviewKpis({ overview }: { overview: AnalyticsOverview }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatPercent = usePercentLabel();
  const { formatToman } = useIranMoney();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.totalRevenue')}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatToman(overview.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">{t('analytics.combinedPayments')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.totalEnrollments')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(overview.totalEnrollments)}</div>
          <p className="text-xs text-muted-foreground">{t('analytics.recentEnrollmentActivity')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.activeStudents')}</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(overview.activeEnrollments)}</div>
          <p className="text-xs text-muted-foreground">
            {t('analytics.currentlyProgressingCourses')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.completionRate')}</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercent(overview.completionRate)}</div>
          <p className="text-xs text-muted-foreground">
            {t('analytics.shareOfFinishedEnrollments')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
