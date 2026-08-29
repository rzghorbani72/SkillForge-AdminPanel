'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Responsible,
  StaffTicketDetail,
  TICKET_PRIORITIES,
  TICKET_STATUSES
} from './staff-support-types';

interface Props {
  ticket: StaffTicketDetail;
  responsibles: Responsible[];
  busy: boolean;
  onAct: (fn: () => Promise<unknown>) => void;
}

export function TicketStaffControls({
  ticket,
  responsibles,
  busy,
  onAct
}: Props) {
  const { t } = useTranslation();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [resolutionSummary, setResolutionSummary] = useState('');

  const caps = ticket.capabilities;
  if (!caps.canManage) return null;

  const needsSummary = (status: string) =>
    status === 'RESOLVED' || status === 'CLOSED';

  const applyStatus = (status: string) => {
    if (needsSummary(status)) {
      setPendingStatus(status);
      return;
    }
    onAct(() => apiClient.changeSupportStatus(ticket.id, status));
  };

  const confirmStatus = () => {
    if (!pendingStatus || !resolutionSummary.trim()) return;
    onAct(async () => {
      await apiClient.changeSupportStatus(
        ticket.id,
        pendingStatus,
        resolutionSummary.trim()
      );
      setPendingStatus(null);
      setResolutionSummary('');
    });
  };

  const canReassign =
    caps.canReassign &&
    (ticket.scope === 'ACADEMY' || ticket.scope === 'PLATFORM');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={ticket.status}
          disabled={busy}
          onValueChange={applyStatus}
        >
          <SelectTrigger
            className="h-9 w-[150px]"
            aria-label={t('support.changeStatus')}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`support.statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={ticket.priority}
          disabled={busy}
          onValueChange={(v) =>
            onAct(() => apiClient.changeSupportPriority(ticket.id, v))
          }
        >
          <SelectTrigger
            className="h-9 w-[130px]"
            aria-label={t('support.changePriority')}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {t(`support.priorities.${p}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canReassign && responsibles.length > 0 && (
          <Select
            value={ticket.AssignedTo?.id ?? ''}
            disabled={busy}
            onValueChange={(v) =>
              v && onAct(() => apiClient.reassignSupportTicket(ticket.id, v))
            }
          >
            <SelectTrigger
              className="h-9 w-[170px]"
              aria-label={t('support.reassign')}
            >
              <SelectValue placeholder={t('support.reassign')} />
            </SelectTrigger>
            <SelectContent>
              {responsibles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {pendingStatus && (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium">
            {t('support.resolutionSummaryRequired')}
          </p>
          <Textarea
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder={t('support.resolutionSummaryPlaceholder')}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy || !resolutionSummary.trim()}
              onClick={confirmStatus}
            >
              {t('support.save')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setPendingStatus(null);
                setResolutionSummary('');
              }}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
