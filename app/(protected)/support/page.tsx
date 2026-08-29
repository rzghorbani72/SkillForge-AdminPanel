'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Inbox, LifeBuoy, Loader2, MessageSquare } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/shared/Pagination';
import { StaffTicketDetail } from '@/components/support/staff-ticket-detail';
import {
  SupportInboxFilters,
  SupportInboxFiltersState
} from '@/components/support/support-inbox-filters';
import { StaffTicketListItem } from '@/components/support/staff-support-types';
import { TicketListItem } from '@/components/support/ticket-list-item';
import { isPlatformStaff } from '@/lib/roles';
import { NewPlatformTicketDialog } from '@/components/support/new-platform-ticket-dialog';
import { ContactMessagesPanel } from '@/components/support/contact-messages-panel';

type InboxKind = 'academy' | 'platform' | 'contact';

const emptyFilters = (): SupportInboxFiltersState => ({
  status: '',
  priority: '',
  academy_id: ''
});

export default function SupportPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { user, isLoading: userLoading } = useAuthUser();
  const platformStaffMode = isPlatformStaff(user);

  const tabs = useMemo<InboxKind[]>(
    () =>
      platformStaffMode ? ['platform', 'contact'] : ['academy', 'platform'],
    [platformStaffMode]
  );
  const [chosenTab, setChosenTab] = useState<InboxKind | null>(null);
  const tab: InboxKind =
    chosenTab && tabs.includes(chosenTab) ? chosenTab : tabs[0];
  const [filters, setFilters] =
    useState<SupportInboxFiltersState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<StaffTicketListItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (userLoading || !user || tab === 'contact') return;
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
  }, [userLoading, user, tab, filters, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">{t('support.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('support.subtitle')}
            </p>
          </div>
        </div>
        {/* Academy staff raise tickets to the platform; platform staff answer
            them, so the create button is theirs only. */}
        {!platformStaffMode && <NewPlatformTicketDialog onCreated={load} />}
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setChosenTab(v as InboxKind);
          setSelected(null);
          setPage(1);
          setFilters(emptyFilters());
        }}
      >
        <TabsList>
          {tabs.map((tk) => (
            <TabsTrigger key={tk} value={tk}>
              {tk === 'academy' && t('support.academyInbox')}
              {tk === 'platform' && t('support.platformInbox')}
              {tk === 'contact' && t('support.contactMessages.tab')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === 'contact' && <ContactMessagesPanel />}

      {tab !== 'contact' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
          <Card className="flex h-[72vh] flex-col overflow-hidden">
            <div className="space-y-3 border-b p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                {t('support.ticketCount', { count: formatNumber(total) })}
              </div>
              <SupportInboxFilters
                tab={tab}
                filters={filters}
                onChange={(next) => {
                  setFilters(next);
                  setPage(1);
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
      )}
    </div>
  );
}
