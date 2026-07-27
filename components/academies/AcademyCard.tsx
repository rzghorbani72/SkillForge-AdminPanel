'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Loader2, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Academy } from '@/types/api';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import { ACADEMY_DOMAIN } from '@/lib/slug';

const CARD_COLORS = [
  { bg: 'bg-blue-100', icon: 'bg-blue-200 text-blue-700' },
  { bg: 'bg-rose-100', icon: 'bg-rose-200 text-rose-700' },
  { bg: 'bg-purple-100', icon: 'bg-purple-200 text-purple-700' },
  { bg: 'bg-amber-100', icon: 'bg-amber-200 text-amber-700' },
  { bg: 'bg-emerald-100', icon: 'bg-emerald-200 text-emerald-700' },
  { bg: 'bg-cyan-100', icon: 'bg-cyan-200 text-cyan-700' },
  { bg: 'bg-orange-100', icon: 'bg-orange-200 text-orange-700' },
  { bg: 'bg-teal-100', icon: 'bg-teal-200 text-teal-700' }
];

function colorIndex(id: string | number): number {
  if (typeof id === 'number') return id % CARD_COLORS.length;
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % CARD_COLORS.length;
}

export function AcademyIcon({
  name,
  id,
  logo,
  size = 40
}: {
  name: string;
  id: number;
  logo?: { id: number; publicUrl: string } | null;
  size?: number;
}) {
  const color = CARD_COLORS[colorIndex(id)];
  const logoUrl = logo?.publicUrl
    ? logo.publicUrl.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${logo.publicUrl}`
      : logo.publicUrl
    : null;
  const style = { width: size, height: size };

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        style={style}
        className="shrink-0 rounded-xl object-cover shadow-sm"
      />
    );
  }
  return (
    <div
      style={{ ...style, fontSize: size * 0.45 }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl font-bold',
        color.icon
      )}
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

type AcademyCardProps = {
  academy: Academy & {
    course_count?: number;
    student_count?: number;
    mentor_count?: number;
  };
  isCurrent: boolean;
  userRole?: string;
  onSwitch: (id: number) => void;
  onEdit: (academy: Academy) => void;
  onManageSite: (academy: Academy) => void;
  switching: number | null;
  t: (k: string) => string;
};

export function AcademyCard({
  academy,
  isCurrent,
  userRole,
  onSwitch,
  onEdit,
  onManageSite,
  switching,
  t
}: AcademyCardProps) {
  const color = CARD_COLORS[colorIndex(academy.id)];
  const isSwitch = switching === academy.id;
  const canEnter =
    !isCurrent &&
    ['AFFILIATE', 'TEACHER', 'MANAGER', 'ADMIN'].includes(
      (academy.userRole ?? '').toUpperCase()
    );
  const canEdit = ['MANAGER', 'ADMIN'].includes(
    (academy.userRole ?? '').toUpperCase()
  );
  const domain =
    academy.domain?.private_address ??
    academy.Domain?.private_address ??
    academy.slug ??
    '';
  const plan =
    getPlanDisplayName(academy.subscription_plan) ?? t('stores.planBasic');
  const isActive = academy.is_active !== false;
  const siteDisabled = Boolean(academy.site_disabled_at);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Colored header band */}
      <div className={cn('relative flex h-24 items-start px-4 pt-3', color.bg)}>
        {/* Status badge */}
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            siteDisabled
              ? 'bg-red-100 text-red-700'
              : isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              siteDisabled
                ? 'bg-red-500'
                : isActive
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
            )}
          />
          {siteDisabled
            ? t('stores.statusSiteDisabled')
            : isActive
              ? t('stores.statusActive')
              : t('stores.statusPaused')}
        </span>

        {/* Icon floats at bottom-right of header */}
        <div className="absolute bottom-[-20px] left-4">
          <AcademyIcon
            name={academy.name}
            id={academy.id}
            logo={academy.logo}
          />
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4 pt-8">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-bold leading-tight">
            {academy.name}
          </h3>
          {userRole && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {userRole}
            </span>
          )}
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-xl p-0"
              onClick={() => onEdit(academy)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <a
          href={`https://${domain}.${ACADEMY_DOMAIN}`}
          target="blank"
          className="mt-0.5 truncate font-mono text-xs text-muted-foreground hover:text-blue-400"
        >
          {domain}.{ACADEMY_DOMAIN}
        </a>

        {/* Stats row */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground">
              {(academy as any).student_count ?? academy.students_count ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('stores.students')}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground">
              {(academy as any).course_count ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('stores.courses')}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground">{plan}</span>
            <span className="text-xs text-muted-foreground">
              {t('stores.plan')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {isCurrent ? (
            <>
              <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {t('stores.currentAcademy')}
              </span>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 rounded-xl p-0"
                  title={t('stores.siteStatusTitle')}
                  aria-label={t('stores.siteStatusTitle')}
                  onClick={() => onManageSite(academy)}
                >
                  <Power className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : canEnter ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-xl text-sm font-medium"
              onClick={() => onSwitch(academy.id)}
              disabled={isSwitch}
            >
              {isSwitch ? (
                <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              {t('stores.enter')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Add-new placeholder card ─────────────────────────────────────────────────

type AddAcademyCardProps = {
  onClick: () => void;
  t: (k: string) => string;
};

export function AddAcademyCard({ onClick, t }: AddAcademyCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-2xl text-muted-foreground/50">
        +
      </div>
      <div>
        <p className="font-semibold text-foreground">
          {t('stores.addNewAcademy')}
        </p>
        <p className="mt-1 max-w-[160px] text-xs text-muted-foreground">
          {t('stores.addNewAcademyDesc')}
        </p>
      </div>
    </button>
  );
}
