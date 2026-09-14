'use client';

import { useCallback, useEffect, useState } from 'react';
import { Inbox, LifeBuoy, Loader2, MessageSquare } from 'lucide-react';
import { apiClient, type SupportInboxSummary } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/shared/Pagination';
import { StaffTicketDetail } from './staff-ticket-detail';
import { SupportInboxFilters, SupportInboxFiltersState } from './support-inbox-filters';
import { StaffTicketListItem, TicketTeam } from './staff-support-types';
import { TicketListItem } from './ticket-list-item';
import { InboxQueueBar, InboxView } from './inbox-queue-bar';

const emptyFilters = (): SupportInboxFiltersState => ({
  status: '',
  priority: '',
  academy_id: '',
});

interface Props {
  scope: 'academy' | 'platform';
}

/** Ticket list + open ticket, for one tier. Same shell, different queue rules. */
export function SupportInbox({ scope }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [filters, setFilters] = useState<SupportInboxFiltersState>(emptyFilters);
  const [view, setView] = useState<InboxView>('all');
  const [team, setTeam] = useState<TicketTeam | null>(null);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<StaffTicketListItem[] | null>(null);
  const [summary, setSummary] = useState<SupportInboxSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(null);
    const query = {
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      academy_id: filters.academy_id || undefined,
      team: team ?? undefined,
      mine: view === 'mine' || undefined,
      unassigned: view === 'unassigned' || undefined,
      page,
      limit,
    };
    // Counts describe the whole inbox, so they ignore the chosen queue —
    // otherwise every chip would just recount the list already on screen.
    const countQuery = {
      ...query,
      team: undefined,
      mine: undefined,
      unassigned: undefined,
    };
    try {
      const [res, sum] = await Promise.all([
        scope === 'academy'
          ? apiClient.getSupportInbox(query)
          : apiClient.getSupportPlatformInbox(query),
        apiClient.getSupportInboxSummary(scope, countQuery).catch(() => null),
      ]);
      setItems((res.items ?? []) as StaffTicketListItem[]);
      setTotal(res.total ?? 0);
      setLimit(res.limit ?? limit);
      setSummary(sum);
    } catch {
      setItems([]);
      setTotal(0);
    }
  }, [scope, filters, team, view, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const resetPage = () => setPage(1);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
      <Card className="flex h-[72vh] flex-col overflow-hidden">
        <div className="space-y-3 border-b p-3">
          <InboxQueueBar
            summary={summary}
            view={view}
            team={team}
            showTeams={scope === 'platform'}
            onViewChange={(next) => {
              setView(next);
              resetPage();
            }}
            onTeamChange={(next) => {
              setTeam(next);
              resetPage();
            }}
          />
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            {t('support.ticketCount', { count: formatNumber(total) })}
          </div>
          <SupportInboxFilters
            tab={scope}
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              resetPage();
            }}
          />
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {items === null && (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('support.loading')}
            </p>
          )}
          {items?.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 opacity-40" />
              {t('support.empty')}
            </div>
          )}
          {items?.map((it) => (
            <TicketListItem
              key={it.id}
              ticket={it}
              active={selected === it.id}
              onSelect={() => setSelected(it.id)}
            />
          ))}
        </div>

        {total > limit && (
          <div className="border-t p-3">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              hasNextPage={page < totalPages}
              hasPreviousPage={page > 1}
              totalItems={total}
              itemsPerPage={limit}
            />
          </div>
        )}
      </Card>

      <Card className="h-[72vh] overflow-hidden">
        <CardContent className="h-full p-4">
          {selected ? (
            <StaffTicketDetail ticketId={selected} onChanged={load} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
              <LifeBuoy className="h-10 w-10 opacity-30" />
              {t('support.selectTicket')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
