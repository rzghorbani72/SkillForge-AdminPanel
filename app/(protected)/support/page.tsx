'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LifeBuoy, MessageSquare } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaffTicketDetail } from '@/components/support/staff-ticket-detail';
import { StaffTicketListItem } from '@/components/support/staff-support-types';

type InboxKind = 'academy' | 'platform';

export default function SupportPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const role = (user as { role?: string } | null)?.role;
  const isPlatformStaff = role === 'ADMIN' || role === 'SUPPORT';

  const tabs = useMemo<InboxKind[]>(
    () => (isPlatformStaff ? ['platform'] : ['academy', 'platform']),
    [isPlatformStaff]
  );
  const [tab, setTab] = useState<InboxKind>('academy');
  const [items, setItems] = useState<StaffTicketListItem[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setTab(tabs[0]);
  }, [tabs]);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const res =
        tab === 'academy'
          ? await apiClient.getSupportInbox()
          : await apiClient.getSupportPlatformInbox();
      setItems(res.items ?? []);
    } catch {
      setItems([]);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

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

      <div className="grid gap-4 md:grid-cols-[minmax(260px,360px)_1fr]">
        <Card className="h-[70vh] overflow-y-auto">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">
              {items?.length ?? 0} {t('support.messages')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
