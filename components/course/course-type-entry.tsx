'use client';

import Link from 'next/link';
import { PlayCircle, Video, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

const HOW_STEPS = [
  ['liveWizard.howStep1', 'liveWizard.howStep1Hint'],
  ['liveWizard.howStep2', 'liveWizard.howStep2Hint'],
  ['liveWizard.howStep3', 'liveWizard.howStep3Hint'],
] as const;

function TypeCard({
  href,
  icon: Icon,
  title,
  hint,
  cta,
  primary,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  hint: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-5',
        primary ? 'border-primary bg-primary/5' : 'bg-card',
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="flex-1 text-sm text-muted-foreground">{hint}</p>
      <Button asChild variant={primary ? 'default' : 'outline'} className="self-start">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

/** First visit to an empty course list: pick the kind of course and see how a live one works. */
export function CourseTypeEntry() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-8">
      <div className="space-y-2 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Video className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="text-xl font-bold">{t('liveWizard.entryTitle')}</h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          {t('liveWizard.entryHint')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TypeCard
          primary
          href="/courses/create?type=LIVE"
          icon={Video}
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

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">{t('liveWizard.howItWorks')}</h3>
        <ol className="grid gap-3 sm:grid-cols-3">
          {HOW_STEPS.map(([title, hint], index) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border bg-card p-3 text-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {formatNumber(index + 1)}
              </span>
              <span>
                <span className="block font-medium">{t(title)}</span>
                <span className="text-xs text-muted-foreground">{t(hint)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
