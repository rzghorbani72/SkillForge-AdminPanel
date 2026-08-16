'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { UserAvatar } from './user-avatar';
import type { User } from '@/types/api';

const MEMBER_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 350;

type MemberPickerProps = {
  /** Reload candidates when this flips true (i.e. the host dialog opened). */
  active: boolean;
  selected: Set<string>;
  onToggle: (profileId: string) => void;
  /** Profile ids already in the group — hidden so they can't be re-added. */
  excludeIds?: Set<string>;
  disabled?: boolean;
};

/**
 * Searchable, checkbox list of the academy's users. Shared by "create group" and
 * "add members" so both pick people the same way.
 */
export function MemberPicker({
  active,
  selected,
  onToggle,
  excludeIds,
  disabled = false
}: MemberPickerProps) {
  const { t } = useTranslation();
  const { user: authUser } = useAuthUser();
  const selfId = authUser?.id != null ? String(authUser.id) : '';
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getUsers({
        page: 1,
        limit: MEMBER_PAGE_SIZE,
        search: debouncedSearch || undefined
      });
      setCandidates(data?.users ?? data?.profiles ?? []);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (!active) return;
    fetchCandidates();
  }, [active, fetchCandidates]);

  useEffect(() => {
    if (active) return;
    setSearch('');
  }, [active]);

  const hiddenIds = useMemo(() => {
    const ids = new Set(excludeIds);
    if (selfId) ids.add(selfId);
    return ids;
  }, [excludeIds, selfId]);

  const visible = candidates.filter((candidate) => !hiddenIds.has(candidate.id));

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute start-[10px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="ps-8"
          placeholder={t('users.searchUsersPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="max-h-52 overflow-y-auto rounded-lg border border-border">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            {t('users.noUsersFound')}
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {visible.map((candidate) => {
              const displayName =
                candidate.display_name || candidate.name || '—';
              return (
                <li key={candidate.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors hover:bg-muted/40">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selected.has(candidate.id)}
                      onChange={() => onToggle(candidate.id)}
                      disabled={disabled}
                    />
                    <UserAvatar name={displayName} tone={210} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {displayName}
                      </span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">
                        {candidate.email || candidate.phone_number || '—'}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
