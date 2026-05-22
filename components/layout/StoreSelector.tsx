'use client';

import { useState } from 'react';
import {
  Check,
  ChevronsUpDown,
  Building2,
  Search,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { clearAcademyData } from '@/lib/store-utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

// Deterministic color per academy ID
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

function academyColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function AcademyAvatar({
  name,
  id,
  size = 'md'
}: {
  name: string;
  id: number;
  size?: 'sm' | 'md';
}) {
  const initial = name ? name[0].toUpperCase() : '?';
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg font-bold text-white',
        academyColor(id),
        size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm'
      )}
    >
      {initial}
    </div>
  );
}

export function StoreSelector() {
  const { t } = useTranslation();
  const router = useRouter();
  const { academies, selectedAcademy, selectAcademy, isLoading } = useStore();
  const { user } = useAuthUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [switching, setSwitching] = useState(false);

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
      // Fallback: store selection in localStorage only (platform admins use X-Academy-ID)
      selectAcademy(academyId);
      setSwitching(false);
    }
  };

  const isPlatformAdmin = user?.isAdminProfile || user?.platformLevel || false;

  if (isLoading || switching) {
    return (
      <div className="flex h-9 w-44 animate-pulse items-center gap-2 rounded-md bg-muted px-3">
        <div className="h-4 w-4 rounded bg-muted-foreground/20" />
        <div className="h-3 w-24 rounded bg-muted-foreground/20" />
        {switching && (
          <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  // Platform-level admin has no academy context
  if (isPlatformAdmin) return null;

  // No academies available — prompt to create one
  if (academies.length === 0) {
    return (
      <button
        type="button"
        onClick={() => router.push('/onboarding/create-academy')}
        className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Building2 className="h-4 w-4" />
        <span>{t('stores.createStore')}</span>
      </button>
    );
  }

  // Single academy — show static (no switcher needed)
  if (academies.length === 1) {
    const a = academies[0];
    return (
      <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
        <AcademyAvatar name={a.name} id={a.id} size="sm" />
        <span className="max-w-[140px] truncate text-sm font-medium">
          {a.name}
        </span>
      </div>
    );
  }

  const filtered = query
    ? academies.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          (a as any).slug?.toLowerCase().includes(query.toLowerCase())
      )
    : academies;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('stores.selectStore')}
          className={cn(
            'flex h-9 items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent',
            open && 'ring-1 ring-primary'
          )}
        >
          {selectedAcademy ? (
            <>
              <AcademyAvatar
                name={selectedAcademy.name}
                id={selectedAcademy.id}
                size="sm"
              />
              <span className="max-w-[130px] truncate">
                {selectedAcademy.name}
              </span>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t('stores.selectStore')}
              </span>
            </>
          )}
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 p-0 shadow-xl"
        sideOffset={6}
      >
        {/* Search */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder={t('stores.searchStores')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('stores.searchStores')}
          />
        </div>

        {/* Academy list */}
        <div className="max-h-72 overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
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
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent',
                    isActive && 'bg-primary/5'
                  )}
                  onClick={() => handleSelectAcademy(academy.id)}
                >
                  <AcademyAvatar name={academy.name} id={academy.id} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm font-medium',
                        isActive && 'text-primary'
                      )}
                    >
                      {academy.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {(academy as any).slug ??
                        (academy.domain as any)?.private_address ??
                        ''}
                    </p>
                  </div>
                  {isActive && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t p-1.5">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => {
              setOpen(false);
              router.push('/onboarding/create-academy');
            }}
          >
            <Building2 className="h-4 w-4" />
            {t('stores.createStore')}
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => {
              setOpen(false);
              router.push('/academies');
            }}
          >
            <Building2 className="h-4 w-4" />
            {t('stores.storesManagement')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
