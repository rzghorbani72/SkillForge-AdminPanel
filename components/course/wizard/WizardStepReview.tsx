'use client';

import { WizardValues } from './wizard-schema';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe, EyeOff, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface Props {
  values: WizardValues;
  categories: { id: number; name: string }[];
  courses: { id: number; title: string }[];
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="min-w-[140px] text-sm text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-medium">{value ?? '—'}</span>
    </div>
  );
}

export default function WizardStepReview({
  values,
  categories,
  courses
}: Props) {
  const { t } = useTranslation();

  const PRICING_LABELS: Record<string, string> = {
    FREE: t('wizard.free'),
    ONE_TIME: t('wizard.oneTime'),
    PAYMENT_PLAN: t('wizard.paymentPlan'),
    SUBSCRIPTION: t('wizard.subscriptionType')
  };

  const category = categories.find((c) => String(c.id) === values.category_id);
  const prereq = courses.find((c) => c.id === values.prerequisite_course_id);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border bg-card">
        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-muted/40 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{values.title}</p>
            {values.subtitle && (
              <p className="text-xs text-muted-foreground">{values.subtitle}</p>
            )}
          </div>
          <div className="ml-auto flex gap-2">
            <Badge variant={values.is_published ? 'default' : 'secondary'}>
              {values.is_published
                ? t('wizard.willPublish')
                : t('wizard.draft')}
            </Badge>
            {values.is_featured && (
              <Badge
                variant="outline"
                className="border-amber-400 text-amber-600"
              >
                <Star className="mr-1 h-3 w-3" />
                {t('wizard.featuredCourse')}
              </Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-2">
          <Row
            label={t('wizard.description')}
            value={
              <span className="line-clamp-3 text-left">
                {values.description}
              </span>
            }
          />
          <Row label={t('wizard.category')} value={category?.name} />
          <Row
            label={t('wizard.coverImage')}
            value={values.cover_id ? '✓' : t('common.none')}
          />
        </div>
      </div>

      {/* Pricing summary */}
      <div className="rounded-xl border bg-card px-5 py-2">
        <p className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('wizard.pricing')}
        </p>
        <Row
          label={t('wizard.pricingModel')}
          value={PRICING_LABELS[values.pricing_type]}
        />
        {values.pricing_type === 'ONE_TIME' && (
          <>
            <Row
              label={t('wizard.priceToman')}
              value={
                values.price
                  ? `${values.price.toLocaleString()} Toman`
                  : t('wizard.free')
              }
            />
            <Row
              label={t('wizard.accessDuration')}
              value={
                values.access_duration_days
                  ? `${values.access_duration_days}d`
                  : t('wizard.lifetime')
              }
            />
          </>
        )}
        {values.pricing_type === 'PAYMENT_PLAN' && (
          <>
            <Row
              label={t('wizard.installmentCount')}
              value={`${values.installment_count}x`}
            />
            <Row
              label={t('wizard.amountPerInstallment')}
              value={
                values.amount_per_installment
                  ? `${values.amount_per_installment.toLocaleString()} T`
                  : '—'
              }
            />
            <Row
              label={t('wizard.interval')}
              value={values.interval_days ? `${values.interval_days}d` : '—'}
            />
            {values.installment_count && values.amount_per_installment && (
              <Row
                label={t('paymentPlans.total')}
                value={`${(values.installment_count * values.amount_per_installment).toLocaleString()} T`}
              />
            )}
          </>
        )}
      </div>

      {/* Access summary */}
      <div className="rounded-xl border bg-card px-5 py-2">
        <p className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('wizard.access')}
        </p>
        <Row
          label={t('common.status')}
          value={
            <span
              className={`flex items-center gap-1 ${values.is_published ? 'text-emerald-600' : 'text-muted-foreground'}`}
            >
              {values.is_published ? (
                <>
                  <Globe className="h-3.5 w-3.5" />
                  {t('courses.published')}
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  {t('courses.draft')}
                </>
              )}
            </span>
          }
        />
        <Row
          label={t('wizard.prerequisite')}
          value={prereq ? prereq.title : t('wizard.noPrerequisite')}
        />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t('wizard.reviewNote')}
      </p>
    </div>
  );
}
