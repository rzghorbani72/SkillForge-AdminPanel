'use client';

import { useTranslation } from '@/lib/i18n/hooks';

export const METRICS_TABS = [
  'overview',
  'revenue',
  'cohorts',
  'subscriptions',
  'transactions',
  'users',
  'catalog',
  'economics',
  'reconciliation',
] as const;

export type MetricsTab = (typeof METRICS_TABS)[number];

export const METRIC_TERM_KEYS: Readonly<Record<string, string>> = {
  mrr: 'mrr',
  arr: 'arr',
  arpa: 'arpa',
  nrr: 'nrr',
  grr: 'grr',
  new_mrr: 'mrr',
  expansion_mrr: 'expansion',
  contraction_mrr: 'contraction',
  churned_mrr: 'churn',
  gmv_paid_amount: 'gmv',
  gmv_paid_count: 'gmv',
  gmv_refunded_amount: 'gmv',
  dau: 'dau',
  wau: 'wau',
  mau: 'mau',
  stickiness: 'stickiness',
  cac: 'cac',
  ltv: 'ltv',
  ltv_to_cac: 'ltvCac',
  cac_payback_months: 'cac',
  rule_of_40: 'ruleOf40',
  quick_ratio: 'quickRatio',
  logo_retention: 'logoRetention',
  monthly_logo_churn: 'churn',
  learning_records: 'learningRecord',
};

const TAB_TERMS: Record<MetricsTab, readonly string[]> = {
  overview: ['mrr', 'arr', 'arpa', 'nrr', 'gmv'],
  revenue: ['mrr', 'arr', 'arpa', 'nrr', 'grr', 'expansion', 'contraction', 'churn'],
  cohorts: ['cohort', 'nrr', 'grr', 'logoRetention'],
  subscriptions: ['ttv', 'arpa'],
  transactions: ['gmv'],
  users: ['dau', 'wau', 'mau', 'stickiness'],
  catalog: ['learningRecord'],
  economics: ['cac', 'ltv', 'ltvCac', 'ruleOf40', 'quickRatio'],
  reconciliation: ['orphan'],
};

interface Props {
  tab: MetricsTab;
}

export function termFullHint(t: (key: string) => string, term: string): string {
  return `${t(`platformMetrics.terms.${term}.full`)} — ${t(`platformMetrics.terms.${term}.hint`)}`;
}

export function TabGuide({ tab }: Props) {
  const { t } = useTranslation();
  const terms = TAB_TERMS[tab];

  return (
    <aside className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t(`platformMetrics.guides.${tab}`)}
      </p>
      {terms.length > 0 ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {terms.map((term) => {
            const abbr = t(`platformMetrics.terms.${term}.abbr`);
            const full = t(`platformMetrics.terms.${term}.full`);
            const showFull = full.toLowerCase() !== abbr.toLowerCase();
            return (
              <li key={term} className="text-xs leading-relaxed">
                <span className="font-semibold text-foreground">{abbr}</span>
                {showFull ? <span className="text-foreground">{` (${full})`}</span> : null}
                <span className="text-muted-foreground">
                  {' — '}
                  {t(`platformMetrics.terms.${term}.hint`)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </aside>
  );
}
