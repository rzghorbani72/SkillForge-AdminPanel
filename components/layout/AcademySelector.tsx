'use client';

import { useState } from 'react';
import {
  Building2,
  Check,
  ChevronDown,
  GraduationCap,
  Loader2,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { AcademyStatusPill } from '@/components/academies/academy-helpers';
import { useAuthUser } from '@/components/providers/user-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { clearAcademyData, setSelectedAcademyId } from '@/lib/store-utils';
import { colorIndexForId } from '@/lib/id-color';
import { isPlatformStaff } from '@/lib/roles';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import type { Academy } from '@/types/api';

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500'
];

const HIDDEN_ROLES = ['STUDENT', 'USER'];
const SELECTOR_NAME_MAX_CHARS = 16;

function truncateName(name: string): string {
  return name.length > SELECTOR_NAME_MAX_CHARS
    ? `${name.slice(0, SELECTOR_NAME_MAX_CHARS)}…`
    : name;
}

function TruncatedAcademyName({ name }: { name: string }) {
  const display = truncateName(name);
  const isTruncated = name.length > SELECTOR_NAME_MAX_CHARS;

  if (!isTruncated) {
    return <p className="text-sm font-semibold leading-tight">{display}</p>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="cursor-default text-sm font-semibold leading-tight">
          {display}
        </p>
      </TooltipTrigger>
      <TooltipContent side="bottom">{name}</TooltipContent>
    </Tooltip>
  );
}

function academyColor(id: string) {
  return AVATAR_COLORS[colorIndexForId(id, AVATAR_COLORS.length)];
}

function AcademyAvatar({
  name,
  id,
  logo
}: {
  name: string;
  id: string;
  logo?: { id: string; publicUrl: string } | null;
}) {
  const logoUrl = logo?.publicUrl
    ? logo.publicUrl.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${logo.publicUrl}`
      : logo.publicUrl
    : null;
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="h-8 w-8 shrink-0 rounded-lg object-cover"
      />
    );
  }
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        academyColor(id)
      )}
    >
      <GraduationCap className="h-4 w-4 text-white" />
    </div>
  );
}

function AcademyStatusBadge({
  academy,
  dotOnly = false
}: {
  academy: Academy;
  dotOnly?: boolean;
}) {
  const { t } = useTranslation();
  return <AcademyStatusPill academy={academy} dotOnly={dotOnly} t={t} />;
}

function getAcademyDomain(academy: any): string {
  return (
    academy?.domain?.private_address ??
    academy?.slug ??
    academy?.domain?.domain ??
    ''
  );
}

function resolveAcademyRole(
  academy: { id: string; userRole?: string },
  currentAcademyId: string | null | undefined,
  currentRole: string
): string {
  if (academy.userRole) return academy.userRole;
  if (academy.id === currentAcademyId) return currentRole;
  return '';
}

export function AcademySelector() {
  const { t } = useTranslation();
  const { academies, selectedAcademy, selectAcademy, isLoading } = useStore();
  const { user } = useAuthUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [switching, setSwitching] = useState(false);

  const isPlatformAdmin = isPlatformStaff(user);
  if (isPlatformAdmin) return <AdminModeSwitcher />;

  if (HIDDEN_ROLES.includes(user?.role ?? '')) return null;

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

  if (isLoading || switching) {
    return (
      <div className="flex h-9 w-9 shrink-0 animate-pulse items-center gap-2.5 rounded-xl bg-muted sm:h-10 sm:w-48 sm:px-3">
        <div className="hidden h-8 w-8 rounded-lg bg-muted-foreground/20 sm:block" />
        <div className="hidden flex-col gap-1 sm:flex">
          <div className="h-3 w-24 rounded bg-muted-foreground/20" />
          <div className="h-2.5 w-32 rounded bg-muted-foreground/15" />
        </div>
        {switching && (
          <Loader2 className="ms-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  const filtered = query
    ? academies.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          getAcademyDomain(a).toLowerCase().includes(query.toLowerCase())
      )
    : academies;

  const hasMultiple = academies.length > 1;
  const current = selectedAcademy ?? academies[0];

  const selectorContent = current ? (
    <div className="flex items-center gap-0 sm:gap-2.5">
      <AcademyAvatar name={current.name} id={current.id} logo={current.logo} />
      <div className="hidden min-w-0 items-center gap-1.5 text-start sm:flex">
        <TruncatedAcademyName name={current.name} />
        <AcademyStatusBadge academy={current} dotOnly />
      </div>
      {hasMultiple && (
        <ChevronDown
          className={cn(
            'ms-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      )}
    </div>
  ) : (
    <span className="text-sm text-muted-foreground">
      {t('stores.selectStore')}
    </span>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5">
        {/* Academy switcher trigger */}
        {hasMultiple ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-9 items-center rounded-xl border bg-background px-2 shadow-sm transition-colors hover:bg-accent sm:h-10 sm:px-3"
              >
                {selectorContent}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-72 p-0 shadow-xl"
              sideOffset={6}
            >
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={t('stores.searchStores')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="max-h-64 overflow-y-auto py-1.5">
                {filtered.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    {t('stores.noStoresFound')}
                  </p>
                ) : (
                  filtered.map((academy) => {
                    const isActive = selectedAcademy?.id === academy.id;
                    const role = resolveAcademyRole(
                      academy,
                      user?.academyId,
                      user?.role ?? ''
                    );
                    const roleLabel = role
                      ? t(`userNav.roles.${role}`) || role
                      : '';
                    return (
                      <button
                        key={academy.id}
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent',
                          isActive && 'bg-primary/5'
                        )}
                        onClick={() => handleSelectAcademy(academy.id)}
                      >
                        <AcademyAvatar
                          name={academy.name}
                          id={academy.id}
                          logo={academy.logo}
                        />
                        <div className="min-w-0 flex-1 text-start">
                          <p
                            className={cn(
                              'truncate text-sm font-medium',
                              isActive && 'text-primary'
                            )}
                          >
                            {academy.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs text-muted-foreground">
                              {getAcademyDomain(academy)}
                            </p>
                            {roleLabel && (
                              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {roleLabel}
                              </span>
                            )}
                            <AcademyStatusBadge academy={academy} />
                          </div>
                        </div>
                        {isActive && (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex h-10 items-center rounded-xl border bg-background px-3 shadow-sm">
            {selectorContent}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Platform admin: switch between Platform mode (no academy) and managing a
// specific academy. Unlike managers, admins never reissue their token — they
// hold an academy-less platform token and scope into an academy purely via the
// X-Academy-ID header (persisted as the selected academy id), so a reload is
// enough to re-scope every request and reset the view context.
function AdminModeSwitcher() {
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

  const trigger = selectedAcademy ? (
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
      <ChevronDown
        className={cn(
          'ms-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
          open && 'rotate-180'
        )}
      />
    </div>
  ) : (
    <div className="flex items-center gap-0 sm:gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/90">
        <Building2 className="h-4 w-4 text-background" />
      </div>
      <p className="hidden text-sm font-semibold leading-tight sm:block">
        {platformLabel}
      </p>
      <ChevronDown
        className={cn(
          'ms-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
          open && 'rotate-180'
        )}
      />
    </div>
  );

  const filtered = query
    ? academies.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          getAcademyDomain(a).toLowerCase().includes(query.toLowerCase())
      )
    : academies;

  return (
    <TooltipProvider delayDuration={200}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-9 items-center rounded-xl border bg-background px-2 shadow-sm transition-colors hover:bg-accent sm:h-10 sm:px-3"
          >
            {trigger}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 p-0 shadow-xl"
          sideOffset={6}
        >
          {/* Platform mode entry */}
          <button
            type="button"
            onClick={enterPlatformMode}
            className={cn(
              'flex w-full items-center gap-3 border-b px-3 py-2.5 transition-colors hover:bg-accent',
              !selectedAcademy && 'bg-primary/5'
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/90">
              <Building2 className="h-4 w-4 text-background" />
            </div>
            <div className="min-w-0 flex-1 text-start">
              <p
                className={cn(
                  'truncate text-sm font-medium',
                  !selectedAcademy && 'text-primary'
                )}
              >
                {platformLabel}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {t('stores.platformLevel') || 'Platform level'}
              </p>
            </div>
            {!selectedAcademy && (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            )}
          </button>

          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder={t('stores.searchStores')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1.5">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                {t('stores.noStoresFound')}
              </p>
            ) : (
              filtered.map((academy) => {
                const isActive = selectedAcademy?.id === academy.id;
                return (
                  <button
                    key={academy.id}
                    type="button"
                    onClick={() => enterAcademyMode(academy.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent',
                      isActive && 'bg-primary/5'
                    )}
                  >
                    <AcademyAvatar
                      name={academy.name}
                      id={academy.id}
                      logo={academy.logo}
                    />
                    <div className="min-w-0 flex-1 text-start">
                      <p
                        className={cn(
                          'truncate text-sm font-medium',
                          isActive && 'text-primary'
                        )}
                      >
                        {academy.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs text-muted-foreground">
                          {getAcademyDomain(academy)}
                        </p>
                        <AcademyStatusBadge academy={academy} />
                      </div>
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
