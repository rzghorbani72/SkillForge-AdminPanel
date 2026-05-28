'use client';

import { useState } from 'react';
import { Check, ChevronDown, Loader2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/components/providers/user-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { clearAcademyData } from '@/lib/store-utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

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

function academyColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function AcademyAvatar({ name, id }: { name: string; id: number }) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white',
        academyColor(id)
      )}
    >
      {name ? name[0].toUpperCase() : '?'}
    </div>
  );
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
  academy: { id: number; userRole?: string },
  currentAcademyId: number | null | undefined,
  currentRole: string
): string {
  if (academy.userRole) return academy.userRole;
  if (academy.id === currentAcademyId) return currentRole;
  return '';
}

export function StoreSelector() {
  const { t } = useTranslation();
  const router = useRouter();
  const { academies, selectedAcademy, selectAcademy, isLoading } = useStore();
  const { user } = useAuthUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [switching, setSwitching] = useState(false);

  const isPlatformAdmin = user?.isAdminProfile || user?.platformLevel || false;
  if (isPlatformAdmin) return null;

  if (HIDDEN_ROLES.includes(user?.role ?? '')) return null;

  const handleSelectAcademy = async (academyId: number) => {
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

  if (isLoading || switching) {
    return (
      <div className="flex h-10 w-48 animate-pulse items-center gap-2.5 rounded-xl bg-muted px-3">
        <div className="h-8 w-8 rounded-lg bg-muted-foreground/20" />
        <div className="flex flex-col gap-1">
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
  const currentRole = resolveAcademyRole(
    current ?? { id: 0 },
    user?.academyId,
    user?.role ?? ''
  );
  const currentRoleLabel = currentRole
    ? t(`userNav.roles.${currentRole}`) || currentRole
    : '';

  const selectorContent = current ? (
    <div className="flex items-center gap-2.5">
      <AcademyAvatar name={current.name} id={current.id} />
      <div className="min-w-0 text-start">
        <p className="max-w-[130px] truncate text-sm font-semibold leading-tight">
          {current.name}
        </p>
        <p className="max-w-[130px] truncate text-xs text-muted-foreground">
          {currentRoleLabel || getAcademyDomain(current)}
        </p>
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
    <div className="flex items-center gap-1.5">
      {/* Academy switcher trigger */}
      {hasMultiple ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-10 items-center rounded-xl border bg-background px-3 shadow-sm transition-colors hover:bg-accent"
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
                      <AcademyAvatar name={academy.name} id={academy.id} />
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

      {/* Add new academy */}
      <button
        type="button"
        onClick={() => router.push('/onboarding/create-academy')}
        aria-label={t('stores.createStore')}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
