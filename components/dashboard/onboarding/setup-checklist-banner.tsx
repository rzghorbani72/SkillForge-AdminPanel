'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/ui/link';
import { BookOpen, Check, ExternalLink, Globe, LayoutTemplate, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/components/providers/user-provider';
import { isPlatformStaff } from '@/lib/roles';
import { useStore } from '@/hooks/useStore';
import { buildAcademySiteUrl } from '@/lib/website/academy-site-url';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logging/app-logger';
import { SETUP_STEPS, useSetupChecklist, type SetupStepId } from './use-setup-checklist';
import { TemplateChoiceDialog, type TemplateChoice } from './template-choice-dialog';
import { useTemplateChoiceGate } from './use-template-choice-gate';

const STEP_META: Record<
  SetupStepId,
  { href: string | 'site'; icon: typeof Globe; titleKey: string }
> = {
  website: {
    href: '/website',
    icon: Globe,
    titleKey: 'onboarding.setupStepWebsite',
  },
  template: {
    href: '/website/appearance/list',
    icon: LayoutTemplate,
    titleKey: 'onboarding.setupStepTemplate',
  },
  course: {
    href: '/courses',
    icon: BookOpen,
    titleKey: 'onboarding.setupStepCourse',
  },
  visit: {
    href: 'site',
    icon: ExternalLink,
    titleKey: 'onboarding.setupStepVisit',
  },
};

type BannerProps = {
  hasCourse: boolean;
};

function SetupChecklistBannerInner({ hasCourse }: BannerProps) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const { selectedAcademy } = useStore();
  const enabled =
    !!user &&
    !isPlatformStaff(user) &&
    user.isSelfRegisteredManager === true &&
    user.role === 'MANAGER' &&
    !!selectedAcademy;

  const [choiceOpen, setChoiceOpen] = useState(false);
  const router = useRouter();
  const academyId = selectedAcademy?.id ?? null;

  // A template already applied to this academy counts as done, whether or not
  // this browser ever ticked the step.
  const { hasTemplate, presetKey, shouldAsk, markChoiceMade } = useTemplateChoiceGate(
    academyId,
    enabled,
  );

  const { visible, done, completedCount, markDone, dismiss } = useSetupChecklist({
    academyId,
    hasCourse,
    hasTemplate,
    enabled,
  });

  const siteUrl = buildAcademySiteUrl(selectedAcademy);
  const shown = useRef(false);

  useEffect(() => {
    if (!visible || shown.current) return;
    shown.current = true;
    logger.ok('Onboarding', 'SetupBannerShown', {});
  }, [visible]);

  const confirmTemplateChoice = (choice: TemplateChoice) => {
    markChoiceMade(choice);
    setChoiceOpen(false);
    if (choice === 'choose') {
      router.push(STEP_META.template.href);
      return;
    }
    markDone('visit');
    window.open(siteUrl, '_blank', 'noreferrer');
  };

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-l from-primary/10 to-card p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('onboarding.setupDismiss')}
        className="absolute end-3 top-3 rounded-md p-1 text-muted-foreground/50 hover:text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-4 pe-8">
        <h2 className="text-lg font-bold tracking-tight">{t('onboarding.setupBannerTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('onboarding.setupBannerDescription', { done: completedCount })}
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {SETUP_STEPS.map((step, index) => {
          const meta = STEP_META[step];
          const Icon = meta.icon;
          const complete = done[step];
          // template/course are verified against real account state, so a
          // click must not mark them done before the step actually happens.
          const onStepClick =
            step === 'template' || step === 'course' ? undefined : () => markDone(step);
          const href = meta.href === 'site' ? siteUrl : meta.href;
          const className = cn(
            'flex items-center gap-3 rounded-xl border px-3 py-3 text-start transition-colors',
            complete
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100'
              : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5',
          );

          const body = (
            <>
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  complete ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary',
                )}
              >
                {complete ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{t(meta.titleKey)}</span>
              </span>
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </>
          );

          // Completed steps are read-only status — not links.
          if (complete || !href) {
            return (
              <li key={step}>
                <span
                  className={cn(className, !complete && 'opacity-60')}
                  aria-current={complete ? 'step' : undefined}
                >
                  {body}
                </span>
              </li>
            );
          }

          if (meta.href === 'site') {
            const onVisit = shouldAsk
              ? (event: React.MouseEvent) => {
                  event.preventDefault();
                  setChoiceOpen(true);
                }
              : onStepClick;
            return (
              <li key={step}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onVisit}
                  className={className}
                >
                  {body}
                </a>
              </li>
            );
          }

          return (
            <li key={step}>
              <Link href={href} onClick={onStepClick} className={className}>
                {body}
              </Link>
            </li>
          );
        })}
      </ol>

      <TemplateChoiceDialog
        open={choiceOpen}
        presetKey={presetKey}
        onConfirm={confirmTemplateChoice}
        onClose={() => {
          markChoiceMade('default');
          setChoiceOpen(false);
        }}
      />
    </div>
  );
}

export function SetupChecklistBanner({ hasCourse }: BannerProps) {
  return (
    <Suspense fallback={null}>
      <SetupChecklistBannerInner hasCourse={hasCourse} />
    </Suspense>
  );
}
