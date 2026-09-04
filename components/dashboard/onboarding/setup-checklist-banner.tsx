'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from '@/components/ui/link';
import {
  BookOpen,
  Check,
  ExternalLink,
  Globe,
  LayoutTemplate,
  X
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/components/providers/user-provider';
import { isPlatformStaff } from '@/lib/roles';
import { useStore } from '@/hooks/useStore';
import { buildAcademySiteUrl } from '@/lib/website/academy-site-url';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logging/app-logger';
import {
  SETUP_STEPS,
  useSetupChecklist,
  type SetupStepId
} from './use-setup-checklist';

const STEP_META: Record<
  SetupStepId,
  { href: string | 'site'; icon: typeof Globe; titleKey: string }
> = {
  website: {
    href: '/website',
    icon: Globe,
    titleKey: 'onboarding.setupStepWebsite'
  },
  template: {
    href: '/website/appearance',
    icon: LayoutTemplate,
    titleKey: 'onboarding.setupStepTemplate'
  },
  course: {
    href: '/courses/create',
    icon: BookOpen,
    titleKey: 'onboarding.setupStepCourse'
  },
  visit: {
    href: 'site',
    icon: ExternalLink,
    titleKey: 'onboarding.setupStepVisit'
  }
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
    !!selectedAcademy;

  const { visible, done, completedCount, markDone, dismiss } =
    useSetupChecklist({
      academyId: selectedAcademy?.id ?? null,
      hasCourse,
      enabled
    });

  const siteUrl = buildAcademySiteUrl(selectedAcademy);
  const shown = useRef(false);

  useEffect(() => {
    if (!visible || shown.current) return;
    shown.current = true;
    logger.ok('Onboarding', 'SetupBannerShown', {});
  }, [visible]);

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
        <h2 className="text-lg font-bold tracking-tight">
          {t('onboarding.setupBannerTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('onboarding.setupBannerDescription', { done: completedCount })}
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {SETUP_STEPS.map((step, index) => {
          const meta = STEP_META[step];
          const Icon = meta.icon;
          const complete = done[step];
          const href = meta.href === 'site' ? siteUrl : meta.href;
          const className = cn(
            'flex items-center gap-3 rounded-xl border px-3 py-3 text-start transition-colors',
            complete
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100'
              : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5'
          );

          const body = (
            <>
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  complete
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {complete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {t(meta.titleKey)}
                </span>
              </span>
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          );

          if (!href) {
            return (
              <li key={step}>
                <span className={cn(className, 'opacity-60')}>{body}</span>
              </li>
            );
          }

          if (meta.href === 'site') {
            return (
              <li key={step}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => markDone(step)}
                  className={className}
                >
                  {body}
                </a>
              </li>
            );
          }

          return (
            <li key={step}>
              <Link
                href={href}
                onClick={() => markDone(step)}
                className={className}
              >
                {body}
              </Link>
            </li>
          );
        })}
      </ol>
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
