'use client';

import { useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/components/providers/user-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { clearAcademyData } from '@/lib/store-utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AcademyAvatar } from './academy-avatar';
import { TruncatedAcademyName } from './academy-name';
import { AcademyStatusBadge } from './academy-status-badge';
import { AcademySearchInput } from './academy-search-input';
import { AcademyPopoverList } from './academy-popover-list';
import { AcademySwitcherSkeleton } from './academy-switcher-skeleton';
import { filterAcademies, resolveAcademyRole } from './academy-utils';
import type { Academy } from '@/types/api';

function CurrentAcademyTrigger({
  current,
  hasMultiple,
  placeholder,
}: {
  current: Academy | undefined;
  hasMultiple: boolean;
  placeholder: string;
}) {
  if (!current) return <span className="text-sm text-muted-foreground">{placeholder}</span>;

  return (
    <div className="flex items-center gap-0 sm:gap-2.5">
      <AcademyAvatar name={current.name} id={current.id} logo={current.logo} />
      <div className="hidden min-w-0 items-center gap-1.5 text-start sm:flex">
        <TruncatedAcademyName name={current.name} />
        <AcademyStatusBadge academy={current} dotOnly />
      </div>
      {hasMultiple && <ChevronsUpDown className="ms-1 h-4 w-4 shrink-0 text-muted-foreground" />}
    </div>
  );
}

function ManagerSwitcherPopover({
  open,
  setOpen,
  selectorContent,
  query,
  setQuery,
  filtered,
  selectedAcademyId,
  onSelect,
  getRoleLabel,
  t,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectorContent: React.ReactNode;
  query: string;
  setQuery: (query: string) => void;
  filtered: Academy[];
  selectedAcademyId: string | undefined;
  onSelect: (academyId: string) => void;
  getRoleLabel: (academy: Academy) => string;
  t: (key: string) => string;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={t('stores.switchAcademy')}
                className="flex h-9 items-center rounded-xl border bg-background px-2 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent sm:h-10 sm:px-3"
              >
                {selectorContent}
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          {!open && <TooltipContent side="bottom">{t('stores.switchAcademy')}</TooltipContent>}
        </Tooltip>
        <PopoverContent align="start" className="w-72 p-0 shadow-xl" sideOffset={6}>
          <p className="px-3 pb-1 pt-2.5 text-xs font-semibold text-muted-foreground">
            {t('stores.switchAcademy')}
          </p>
          <AcademySearchInput
            value={query}
            onChange={setQuery}
            placeholder={t('stores.searchStores')}
          />
          <AcademyPopoverList
            academies={filtered}
            selectedId={selectedAcademyId}
            noResultsLabel={t('stores.noStoresFound')}
            onSelect={onSelect}
            getRoleLabel={getRoleLabel}
          />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}

/** Header switcher a manager or teacher uses to move between the academies
 * they belong to. Re-issues the auth token via `switchAcademy` so every
 * request scopes to the newly picked academy — see AdminModeSwitcher for the
 * platform-staff variant, which scopes with a header instead of a token. */
export function ManagerAcademySwitcher() {
  const { t } = useTranslation();
  const { academies, selectedAcademy, selectAcademy, isLoading } = useStore();
  const { user } = useAuthUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [switching, setSwitching] = useState(false);

  const handleSelectAcademy = async (academyId: string) => {
    if (academyId === selectedAcademy?.id) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    setQuery('');
    setOpen(false);
    try {
      await apiClient.switchAcademy(academyId);
      clearAcademyData();
      window.location.reload();
    } catch {
      selectAcademy(academyId);
      setSwitching(false);
    }
  };

  // Nothing to switch between, and no academy to name: the header stays clean
  // while the manager is being sent to create their first one.
  if (!isLoading && academies.length === 0) return null;
  if (isLoading || switching) return <AcademySwitcherSkeleton switching={switching} />;

  const filtered = filterAcademies(academies, query);
  const hasMultiple = academies.length > 1;
  const current = selectedAcademy ?? academies[0];
  const selectorContent = (
    <CurrentAcademyTrigger
      current={current}
      hasMultiple={hasMultiple}
      placeholder={t('stores.selectStore')}
    />
  );

  if (!hasMultiple) {
    return (
      <div className="flex h-10 items-center rounded-xl border bg-background px-3 shadow-sm">
        {selectorContent}
      </div>
    );
  }

  const getRoleLabel = (academy: Academy) => {
    const role = resolveAcademyRole(academy, user?.academyId, user?.role ?? '');
    return role ? t(`userNav.roles.${role}`) || role : '';
  };

  return (
    <ManagerSwitcherPopover
      open={open}
      setOpen={setOpen}
      selectorContent={selectorContent}
      query={query}
      setQuery={setQuery}
      filtered={filtered}
      selectedAcademyId={selectedAcademy?.id}
      onSelect={handleSelectAcademy}
      getRoleLabel={getRoleLabel}
      t={t}
    />
  );
}
