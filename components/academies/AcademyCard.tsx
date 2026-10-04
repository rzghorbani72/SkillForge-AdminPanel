'use client';

import { Pencil, Loader2, LogIn, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Academy } from '@/types/api';
import { ACADEMY_DOMAIN } from '@/lib/slug';
import { colorIndexForId } from '@/lib/id-color';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { resizedMediaUrl, resolveMediaUrl } from '@/lib/media-url';
import {
  AcademyStatusPill,
  academyDomain,
  canEditAcademy,
  canEnterAcademy,
  canRemoveAcademy,
  type AcademyRow,
} from './academy-helpers';
import { AcademyStaffActions } from './academy-staff-actions';
import { CopyableId } from './copyable-id';

const CARD_COLORS = [
  { bg: 'bg-blue-100', icon: 'bg-blue-200 text-blue-700' },
  { bg: 'bg-rose-100', icon: 'bg-rose-200 text-rose-700' },
  { bg: 'bg-purple-100', icon: 'bg-purple-200 text-purple-700' },
  { bg: 'bg-amber-100', icon: 'bg-amber-200 text-amber-700' },
  { bg: 'bg-emerald-100', icon: 'bg-emerald-200 text-emerald-700' },
  { bg: 'bg-cyan-100', icon: 'bg-cyan-200 text-cyan-700' },
  { bg: 'bg-orange-100', icon: 'bg-orange-200 text-orange-700' },
  { bg: 'bg-teal-100', icon: 'bg-teal-200 text-teal-700' },
];

const ACTION_BUTTON = 'h-9 flex-1 gap-1.5 whitespace-nowrap rounded-lg px-2 text-xs font-medium';
const ACTION_ICON = 'h-4 w-4 shrink-0';
const BANNER_WIDTH = 480;
const BANNER_WIDTH_2X = 828;
const BANNER_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';

export function AcademyIcon({
  name,
  id,
  logo,
  size = 40,
}: {
  name: string;
  id: string;
  logo?: { id: string; publicUrl: string } | null;
  size?: number;
}) {
  const color = CARD_COLORS[colorIndexForId(id, CARD_COLORS.length)];
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
      className={cn('flex shrink-0 items-center justify-center rounded-xl font-bold', color.icon)}
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

type AcademyCardProps = {
  academy: AcademyRow;
  isCurrent: boolean;
  userRole?: string;
  onSwitch: (id: string) => void;
  onDetails: (academy: Academy) => void;
  onEdit: (academy: Academy) => void;
  switching: string | null;
  platformControls?: boolean;
  onStaffChanged?: () => void;
  t: (k: string) => string;
};

export function AcademyCard({
  academy,
  isCurrent,
  userRole,
  onSwitch,
  onDetails,
  onEdit,
  switching,
  platformControls = false,
  onStaffChanged,
  t,
}: AcademyCardProps) {
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const color = CARD_COLORS[colorIndexForId(academy.id, CARD_COLORS.length)];
  const isSwitch = switching === academy.id;
  const canEnter = canEnterAcademy(academy);
  const canEdit = canEditAcademy(academy);
  const domain = academyDomain(academy);
  const bannerUrl = resolveMediaUrl(academy.template_banner);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-card',
        isCurrent && 'border-2 border-primary',
      )}
    >
      <div className={cn('relative isolate flex h-24 items-start px-4 pt-3', color.bg)}>
        {bannerUrl && (
          <img
            src={resizedMediaUrl(bannerUrl, BANNER_WIDTH)}
            srcSet={`${resizedMediaUrl(bannerUrl, BANNER_WIDTH)} ${BANNER_WIDTH}w, ${resizedMediaUrl(bannerUrl, BANNER_WIDTH_2X)} ${BANNER_WIDTH_2X}w`}
            sizes={BANNER_SIZES}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        )}
        <AcademyStatusPill academy={academy} t={t} />
        {academy.listed_publicly === false && (
          <span className="ms-auto inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t('stores.hiddenFromPublic')}
          </span>
        )}
        <div className="absolute bottom-[-20px] start-4">
          <AcademyIcon name={academy.name} id={academy.id} logo={academy.logo} />
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4 pt-8">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-bold leading-tight">{academy.name}</h3>
          {userRole && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {userRole}
            </span>
          )}
        </div>
        <a
          href={`https://${domain}.${ACADEMY_DOMAIN}`}
          target="blank"
          className="mt-0.5 truncate font-mono text-xs text-muted-foreground hover:text-blue-400"
        >
          {domain}.{ACADEMY_DOMAIN}
        </a>
        <CopyableId value={academy.id} className="mt-1 max-w-full" />
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between gap-2">
            <span>{t('stores.creatingManager')}</span>
            <span className="truncate text-end font-medium text-foreground">
              {academy.manager_name ?? '—'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>{t('stores.createdAt')}</span>
            <span className="text-end font-medium text-foreground">
              {academy.created_at ? formatDate(academy.created_at) : '—'}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground">
              {formatNumber(academy.student_count ?? academy.students_count ?? 0)}
            </span>
            <span className="text-xs text-muted-foreground">{t('stores.students')}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold text-foreground">
              {formatNumber(academy.course_count ?? 0)}
            </span>
            <span className="text-xs text-muted-foreground">{t('stores.courses')}</span>
          </div>
        </div>

        {/* Actions — the current academy is already open, so it needs no enter
            button; details always sits on the far side of the row */}
        <div className="mt-4 flex items-center gap-1.5">
          {!isCurrent && (
            <Button
              size="sm"
              className={ACTION_BUTTON}
              onClick={() => onSwitch(academy.id)}
              disabled={!canEnter || isSwitch}
            >
              {isSwitch ? (
                <Loader2 className={cn(ACTION_ICON, 'animate-spin')} />
              ) : (
                <LogIn className={ACTION_ICON} />
              )}
              {t('stores.enter')}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className={ACTION_BUTTON}
            onClick={() => onEdit(academy)}
            disabled={!canEdit}
          >
            <Pencil className={ACTION_ICON} />
            {t('common.edit')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={cn(ACTION_BUTTON, 'ms-auto flex-none')}
            onClick={() => onDetails(academy)}
          >
            <Info className={ACTION_ICON} />
            {t('stores.details')}
          </Button>
          {canRemoveAcademy(academy) && onStaffChanged && (
            <AcademyStaffActions
              academy={academy}
              onChanged={onStaffChanged}
              platformControls={platformControls}
            />
          )}
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
        <p className="font-semibold text-foreground">{t('stores.addNewAcademy')}</p>
        <p className="mt-1 max-w-[160px] text-xs text-muted-foreground">
          {t('stores.addNewAcademyDesc')}
        </p>
      </div>
    </button>
  );
}
