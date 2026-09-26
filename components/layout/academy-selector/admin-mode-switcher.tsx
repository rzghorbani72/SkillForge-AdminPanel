'use client';

import { useState } from 'react';
import { Building2, Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { clearAcademyData, setSelectedAcademyId } from '@/lib/store-utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AcademyAvatar } from './academy-avatar';
import { TruncatedAcademyName } from './academy-name';
import { AcademyStatusBadge } from './academy-status-badge';
import { AcademySearchInput } from './academy-search-input';
import { AcademyPopoverList } from './academy-popover-list';
import { filterAcademies } from './academy-utils';
import type { Academy } from '@/types/api';

const PLATFORM_ICON = (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/90">
    <Building2 className="h-4 w-4 text-background" />
  </div>
);

function AdminSwitcherTrigger({
  selectedAcademy,
  platformLabel,
  open,
}: {
  selectedAcademy: Academy | null;
  platformLabel: string;
  open: boolean;
}) {
  const chevron = (
    <ChevronDown
      className={cn(
        'ms-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
        open && 'rotate-180',
      )}
    />
  );

  if (!selectedAcademy) {
    return (
      <div className="flex items-center gap-0 sm:gap-2.5">
        {PLATFORM_ICON}
        <p className="hidden text-sm font-semibold leading-tight sm:block">{platformLabel}</p>
        {chevron}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 sm:gap-2.5">
      <AcademyAvatar
        name={selectedAcademy.name}
        id={selectedAcademy.id}
        logo={selectedAcademy.logo}
      />
      <div className="hidden min-w-0 items-center gap-1.5 text-start sm:flex">
        <TruncatedAcademyName name={selectedAcademy.name} />
        <AcademyStatusBadge academy={selectedAcademy} dotOnly />
      </div>
      {chevron}
    </div>
  );
}

function PlatformModeEntry({
  active,
  platformLabel,
  platformLevelLabel,
  onClick,
}: {
  active: boolean;
  platformLabel: string;
  platformLevelLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-b px-3 py-2.5 transition-colors hover:bg-accent',
        active && 'bg-primary/5',
      )}
    >
      {PLATFORM_ICON}
      <div className="min-w-0 flex-1 text-start">
        <p className={cn('truncate text-sm font-medium', active && 'text-primary')}>
          {platformLabel}
        </p>
        <p className="truncate text-xs text-muted-foreground">{platformLevelLabel}</p>
      </div>
      {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </button>
  );
}

/** Platform admin: switch between Platform mode (no academy) and managing a
 * specific academy. Unlike managers, admins never reissue their token — they
 * hold an academy-less platform token and scope into an academy purely via the
 * X-Academy-ID header (persisted as the selected academy id), so a reload is
 * enough to re-scope every request and reset the view context. */
export function AdminModeSwitcher() {
  const { t } = useTranslation();
  const { academies, selectedAcademy, isLoading } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const enterPlatformMode = () => {
    setOpen(false);
    if (!selectedAcademy) return;
    clearAcademyData();
    // Full navigation (not router.push) clears all in-memory academy state, so
    // no academy data bleeds into Platform mode.
    window.location.href = '/platform';
  };

  const enterAcademyMode = (academyId: string) => {
    setOpen(false);
    setQuery('');
    if (academyId === selectedAcademy?.id) return;
    setSelectedAcademyId(academyId);
    window.location.href = '/dashboard';
  };

  const platformLabel = t('stores.platformAdmin') || 'Platform Admin';
  const filtered = filterAcademies(academies, query);

  return (
    <TooltipProvider delayDuration={200}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-9 items-center rounded-xl border bg-background px-2 shadow-sm transition-colors hover:bg-accent sm:h-10 sm:px-3"
          >
            <AdminSwitcherTrigger
              selectedAcademy={selectedAcademy}
              platformLabel={platformLabel}
              open={open}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0 shadow-xl" sideOffset={6}>
          <PlatformModeEntry
            active={!selectedAcademy}
            platformLabel={platformLabel}
            platformLevelLabel={t('stores.platformLevel') || 'Platform level'}
            onClick={enterPlatformMode}
          />

          <AcademySearchInput
            value={query}
            onChange={setQuery}
            placeholder={t('stores.searchStores')}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AcademyPopoverList
              academies={filtered}
              selectedId={selectedAcademy?.id}
              noResultsLabel={t('stores.noStoresFound')}
              onSelect={enterAcademyMode}
            />
          )}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
