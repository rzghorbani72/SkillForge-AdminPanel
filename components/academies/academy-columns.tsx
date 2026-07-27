'use client';

import { Loader2, Pencil, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DataColumn } from '@/components/shared/data-list';
import { AcademyIcon } from './AcademyCard';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import { ACADEMY_DOMAIN } from '@/lib/slug';
import { cn } from '@/lib/utils';
import type { InterpolationParams } from '@/lib/i18n';
import type { Academy } from '@/types/api';

export interface AcademyRow extends Academy {
  course_count?: number;
  student_count?: number;
}

interface BuildAcademyColumnsArgs {
  t: (key: string, params?: InterpolationParams) => string;
  formatNumber: (value: number) => string;
  currentAcademyId: number | null;
  resolveUserRole: (academy: AcademyRow) => string;
  switching: number | null;
  onSwitch: (id: number) => void;
  onEdit: (academy: Academy) => void;
  onManageSite: (academy: Academy) => void;
}

export function canEnterAcademy(academy: Academy, isCurrent: boolean): boolean {
  return (
    !isCurrent &&
    ['AFFILIATE', 'TEACHER', 'MANAGER', 'ADMIN'].includes(
      (academy.userRole ?? '').toUpperCase()
    )
  );
}

export function canEditAcademy(academy: Academy): boolean {
  return ['MANAGER', 'ADMIN'].includes((academy.userRole ?? '').toUpperCase());
}

export function AcademyStatusPill({
  academy,
  t
}: {
  academy: Academy;
  t: (key: string) => string;
}) {
  const siteDisabled = Boolean(academy.site_disabled_at);
  const isActive = academy.is_active !== false;
  const tone = siteDisabled
    ? 'bg-destructive/10 text-destructive'
    : isActive
      ? 'bg-success/10 text-success'
      : 'bg-muted text-muted-foreground';
  const dot = siteDisabled
    ? 'bg-destructive'
    : isActive
      ? 'bg-success'
      : 'bg-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {siteDisabled
        ? t('stores.statusSiteDisabled')
        : isActive
          ? t('stores.statusActive')
          : t('stores.statusPaused')}
    </span>
  );
}

export function buildAcademyColumns({
  t,
  formatNumber,
  currentAcademyId,
  resolveUserRole,
  switching,
  onSwitch,
  onEdit,
  onManageSite
}: BuildAcademyColumnsArgs): DataColumn<AcademyRow>[] {
  return [
    {
      id: 'academy',
      header: t('stores.colAcademy'),
      cell: (academy) => {
        const domain =
          academy.domain?.private_address ??
          academy.Domain?.private_address ??
          academy.slug ??
          '';
        return (
          <div className="flex items-center gap-2.5">
            <AcademyIcon
              name={academy.name}
              id={academy.id}
              logo={academy.logo}
              size={32}
            />
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">
                {academy.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {domain}.{ACADEMY_DOMAIN}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      id: 'role',
      header: t('stores.yourRole'),
      className: 'hidden sm:table-cell',
      cell: (academy) => (
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11.5px] font-medium text-primary">
          {resolveUserRole(academy)}
        </span>
      )
    },
    {
      id: 'students',
      header: t('stores.students'),
      className: 'hidden md:table-cell',
      cell: (academy) => (
        <span className="font-medium">
          {formatNumber(academy.student_count ?? academy.students_count ?? 0)}
        </span>
      )
    },
    {
      id: 'courses',
      header: t('stores.courses'),
      className: 'hidden md:table-cell',
      cell: (academy) => (
        <span className="font-medium">
          {formatNumber(academy.course_count ?? 0)}
        </span>
      )
    },
    {
      id: 'plan',
      header: t('stores.plan'),
      className: 'hidden lg:table-cell',
      cell: (academy) => (
        <span className="text-muted-foreground">
          {getPlanDisplayName(academy.subscription_plan) ??
            t('stores.planBasic')}
        </span>
      )
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (academy) => <AcademyStatusPill academy={academy} t={t} />
    },
    {
      id: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (academy) => {
        const isCurrent = academy.id === currentAcademyId;
        return (
          <div className="flex items-center justify-end gap-1.5">
            {isCurrent ? (
              <span className="rounded-md bg-success/10 px-2 py-1 text-[11.5px] font-medium text-success">
                {t('stores.currentAcademy')}
              </span>
            ) : canEnterAcademy(academy, isCurrent) ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs"
                disabled={switching === academy.id}
                onClick={() => onSwitch(academy.id)}
              >
                {switching === academy.id && (
                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                {t('stores.enter')}
              </Button>
            ) : null}
            {canEditAcademy(academy) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  aria-label={t('stores.editDetails')}
                  onClick={() => onEdit(academy)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {isCurrent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    aria-label={t('stores.siteStatusTitle')}
                    onClick={() => onManageSite(academy)}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      }
    }
  ];
}
