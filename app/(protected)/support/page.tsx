'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LifeBuoy, MessageSquare } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/shared/Pagination';
import { StaffTicketDetail } from '@/components/support/staff-ticket-detail';
import {
  SupportInboxFilters,
  SupportInboxFiltersState
} from '@/components/support/support-inbox-filters';
import { StaffTicketListItem } from '@/components/support/staff-support-types';
import { isPlatformStaff } from '@/lib/roles';

type InboxKind = 'academy' | 'platform';

const emptyFilters = (): SupportInboxFiltersState => ({
  status: '',
  priority: '',
  academy_id: ''
});

export default function SupportPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const platformStaffMode = isPlatformStaff(user);

  const tabs = useMemo<InboxKind[]>(
    () => (platformStaffMode ? ['platform'] : ['academy', 'platform']),
    [platformStaffMode]
  );
  const [tab, setTab] = useState<InboxKind>('academy');
  const [filters, setFilters] =
    useState<SupportInboxFiltersState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<StaffTicketListItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setTab(tabs[0]);
  }, [tabs]);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const query = {
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        academy_id: filters.academy_id || undefined,
        page,
        limit
      };
      const res =
        tab === 'academy'
          ? await apiClient.getSupportInbox(query)
          : await apiClient.getSupportPlatformInbox(query);
      setItems((res.items ?? []) as StaffTicketListItem[]);
      setTotal(res.total ?? 0);
      setLimit(res.limit ?? limit);
    } catch {
      setItems([]);
      setTotal(0);
    }
  }, [tab, filters, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <LifeBuoy className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">{t('support.title')}</h1>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as InboxKind);
          setSelected(null);
          setPage(1);
          setFilters(emptyFilters());
        }}
      >
        <TabsList>
          {tabs.map((tk) => (
            <TabsTrigger key={tk} value={tk}>
              {tk === 'academy'
                ? t('support.academyInbox')
                : t('support.platformInbox')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SupportInboxFilters
        tab={tab}
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="grid gap-4 md:grid-cols-[minmax(260px,360px)_1fr]">
        <Card className="flex h-[70vh] flex-col overflow-hidden">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">
              {total} {t('support.messages')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 overflow-y-auto">
            {items === null && (
              <p className="text-sm text-muted-foreground">
                {t('support.loading')}
              </p>
            )}
            {items?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('support.empty')}
              </p>
            )}
            {items?.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelected(it.id)}
                className={`flex w-full flex-col gap-1 rounded-md border p-2 text-start transition-colors hover:border-primary ${selected === it.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{it.subject}</span>
                  <Badge variant="secondary">
                    {t(`support.statuses.${it.status}`)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">
                    {it.CreatedBy?.display_name ?? '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {it._count?.Message ?? 0}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
          {total > limit && (
            <div className="border-t p-2">
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

        <Card className="h-[70vh] overflow-hidden">
          <CardContent className="h-full p-4">
            {selected ? (
              <StaffTicketDetail ticketId={selected} onChanged={load} />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t('support.selectTicket')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
