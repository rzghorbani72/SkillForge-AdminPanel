'use client';

import { useMemo, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupportInbox } from '@/components/support/support-inbox';
import { isPlatformStaff } from '@/lib/roles';
import { NewPlatformTicketDialog } from '@/components/support/new-platform-ticket-dialog';
import { ContactMessagesPanel } from '@/components/support/contact-messages-panel';

type InboxKind = 'academy' | 'platform' | 'contact';

export default function SupportPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const platformStaffMode = isPlatformStaff(user);

  const tabs = useMemo<InboxKind[]>(
    () => (platformStaffMode ? ['platform', 'contact'] : ['academy', 'platform']),
    [platformStaffMode],
  );
  const [chosenTab, setChosenTab] = useState<InboxKind | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const tab: InboxKind = chosenTab && tabs.includes(chosenTab) ? chosenTab : tabs[0];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">{t('support.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('support.subtitle')}</p>
          </div>
        </div>
        {/* Academy staff raise tickets to the platform; platform staff answer
            them, so the create button is theirs only. */}
        {!platformStaffMode && (
          <NewPlatformTicketDialog onCreated={() => setReloadKey((k) => k + 1)} />
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setChosenTab(v as InboxKind)}>
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

      {tab === 'contact' ? (
        <ContactMessagesPanel />
      ) : (
        // Remounting per tab keeps each inbox's queue, filters and page its own.
        <SupportInbox key={`${tab}-${reloadKey}`} scope={tab} />
      )}
    </div>
  );
}
