'use client';

import Link from 'next/link';
import { PlayCircle, Video, type LucideIcon } from 'lucide-react';

import { IconBox } from '@/components/shared/icon-box';
import { buttonVariants } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { FlowSteps } from '@/components/shared/flow-steps';
import { Badge } from '@/components/ui/badge';

const HOW_STEPS = [
  ['liveWizard.howStep1', 'liveWizard.howStep1Hint'],
  ['liveWizard.howStep2', 'liveWizard.howStep2Hint'],
  ['liveWizard.howStep3', 'liveWizard.howStep3Hint'],
] as const;

function TypeCard({
  href,
  icon,
  title,
  hint,
  cta,
  badge,
  primary,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  hint: string;
  cta: string;
  badge?: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-start gap-2.5 rounded-xl border-[1.5px] p-4 transition-colors',
        primary ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40',
      )}
    >
      <span className="flex w-full items-center justify-between gap-3">
        <IconBox icon={icon} tone={primary ? 'primary' : 'muted'} />
        {badge ? <Badge variant="soft">{badge}</Badge> : null}
      </span>
      <span className="text-[15px] font-extrabold">{title}</span>
      <span className="text-[13px] text-muted-foreground">{hint}</span>
      <span className={buttonVariants({ variant: primary ? 'default' : 'outline' })}>{cta}</span>
    </Link>
  );
}

/** First visit to an empty course list: pick the kind of course and see how a live one works. */
export function CourseTypeEntry() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-[820px] flex-col gap-6 py-8">
      <div className="flex flex-col items-center gap-3.5 text-center">
        <span className="grid h-[72px] w-[72px] place-items-center rounded-[20px] bg-primary/10 text-primary">
          <Video className="h-[34px] w-[34px]" aria-hidden />
        </span>
        <h2 className="text-[22px] font-extrabold">{t('liveWizard.entryTitle')}</h2>
        <p className="max-w-[560px] text-[15px] text-muted-foreground">
          {t('liveWizard.entryHint')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TypeCard
          primary
          href="/courses/create?type=LIVE"
          icon={Video}
          badge={t('liveWizard.liveClassBadge')}
          title={t('liveWizard.entryLiveTitle')}
          hint={t('liveWizard.entryLiveHint')}
          cta={t('liveWizard.entryLiveCta')}
        />
        <TypeCard
          href="/courses/create?type=OFFLINE"
          icon={PlayCircle}
          title={t('liveWizard.entryRecordedTitle')}
          hint={t('liveWizard.entryRecordedHint')}
          cta={t('liveWizard.entryRecordedCta')}
        />
      </div>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-[13px] font-bold">{t('liveWizard.howItWorks')}</h3>
        <FlowSteps steps={HOW_STEPS.map(([title, hint]) => ({ title: t(title), hint: t(hint) }))} />
      </section>
    </div>
  );
}
