'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Responsible,
  StaffTicketDetail,
  TICKET_PRIORITIES,
  TICKET_STATUSES
} from './staff-support-types';

const field =
  'rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

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
        <select
          aria-label={t('support.changeStatus')}
          className={field}
          value={ticket.status}
          disabled={busy}
          onChange={(e) => applyStatus(e.target.value)}
        >
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`support.statuses.${s}`)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('support.changePriority')}
          className={field}
          value={ticket.priority}
          disabled={busy}
          onChange={(e) =>
            onAct(() =>
              apiClient.changeSupportPriority(ticket.id, e.target.value)
            )
          }
        >
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t(`support.priorities.${p}`)}
            </option>
          ))}
        </select>
        {canReassign && responsibles.length > 0 && (
          <select
            aria-label={t('support.reassign')}
            className={field}
            value={ticket.AssignedTo?.id ?? ''}
            disabled={busy}
            onChange={(e) =>
              e.target.value &&
              onAct(() =>
                apiClient.reassignSupportTicket(ticket.id, e.target.value)
              )
            }
          >
            {responsibles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.display_name}
              </option>
            ))}
          </select>
        )}
      </div>
      {pendingStatus && (
        <div className="space-y-2 rounded-md border bg-muted/30 p-2">
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
