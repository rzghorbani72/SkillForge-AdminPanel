'use client';

import { useCallback, useEffect, useState } from 'react';
import { Inbox, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CONTACT_MESSAGE_STATUSES,
  ContactMessageItem,
  ContactMessageStatus,
} from './staff-support-types';

/**
 * Public contact-page submissions. These are NOT tickets: the sender has no
 * account, so there is no thread to reply into — staff triage the status here
 * and answer by email.
 */
export function ContactMessagesPanel() {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const [status, setStatus] = useState<string>('NEW');
  const [items, setItems] = useState<ContactMessageItem[] | null>(null);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const res = await apiClient.getContactMessages({
        status: status || undefined,
        limit: 50,
      });
      setItems(res.items ?? []);
    } catch {
      setItems([]);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id: string, next: ContactMessageStatus) => {
    try {
      await apiClient.updateContactMessage(id, { status: next });
      toast.success(t('support.contactMessages.updated'));
      load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-56">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_MESSAGE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`support.contactMessages.statuses.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items === null && <p className="text-sm text-muted-foreground">{t('support.loading')}</p>}
      {items?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
          <Inbox className="h-8 w-8 opacity-40" />
          {t('support.empty')}
        </div>
      )}

      {items?.map((item) => (
        <Card key={item.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{item.subject}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t(`support.categories.${item.category}`)}</Badge>
                <div className="w-40">
                  <Select
                    value={item.status}
                    onValueChange={(next) => changeStatus(item.id, next as ContactMessageStatus)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_MESSAGE_STATUSES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`support.contactMessages.statuses.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.body}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{item.name}</span>
              <span>
                {formatDate(item.created_at, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <a
                href={`mailto:${item.email}`}
                dir="ltr"
                className="flex items-center gap-1 hover:text-primary"
              >
                <Mail className="h-3 w-3" />
                {item.email}
              </a>
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  dir="ltr"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Phone className="h-3 w-3" />
                  {item.phone}
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
