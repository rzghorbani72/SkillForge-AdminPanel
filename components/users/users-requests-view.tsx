'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, BookOpen } from 'lucide-react';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay } from '@/lib/phone-utils';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { UserAvatar, toneToHsl } from './user-avatar';
import { UserStatusPill } from './user-status-pill';
import type { UserStat } from './users-stats-bar';

type TeacherRequest = {
  id: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  profile: {
    id: number;
    display_name: string;
    role: { id: number; name: string } | null;
    user: {
      id: number;
      name: string;
      email: string | null;
      phone_number: string | null;
    } | null;
  } | null;
  store: { id: number; name: string; slug: string } | null;
  reviewer?: { id: number; user: { id: number; name: string } } | null;
};

function requestTone(id: number) {
  return (22 + id * 47) % 360;
}

export function UsersRequestsView({
  onPendingCountChange,
  onStats
}: {
  onPendingCountChange?: (count: number) => void;
  /** Feeds the page-level stats row so it stays in place across tabs. */
  onStats?: (stats: UserStat[]) => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTeacherRequests({ limit: 50 });
      const list: TeacherRequest[] = (data as any)?.requests ?? [];
      setRequests(list);
      const countOf = (status: TeacherRequest['status']) =>
        list.filter((request) => request.status === status).length;
      onPendingCountChange?.(countOf('PENDING'));
      onStats?.([
        { labelKey: 'users.requests', value: list.length },
        { labelKey: 'users.pendingApproval', value: countOf('PENDING') },
        { labelKey: 'teacherRequests.approved', value: countOf('APPROVED') },
        { labelKey: 'teacherRequests.rejected', value: countOf('REJECTED') }
      ]);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setLoading(false);
    }
  }, [onPendingCountChange, onStats]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDecide = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.reviewTeacherRequest(id, { status });
      ErrorHandler.showSuccess(
        status === 'APPROVED'
          ? t('teacherRequests.approved')
          : t('teacherRequests.rejected')
      );
      fetchRequests();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
        {t('teacherRequests.noRequestsDescription')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => {
        const tone = requestTone(r.id);
        const colors = toneToHsl(tone);
        const name =
          r.profile?.user?.name || r.profile?.display_name || t('common.none');
        const email = r.profile?.user?.email;
        const phone = r.profile?.user?.phone_number;
        const phoneDisplay = phone ? formatPhoneDisplay(phone, language) : null;
        const submittedAt = new Date(r.created_at).toLocaleDateString('fa-IR');

        return (
          <div
            key={r.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start gap-4">
              <UserAvatar name={name} tone={tone} size={48} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2.5">
                  <span className="text-[15px] font-semibold">{name}</span>
                  <UserStatusPill status={r.status.toLowerCase()} />
                  <span className="ms-auto text-[11px] text-muted-foreground">
                    {submittedAt}
                  </span>
                </div>
                {(email || phoneDisplay) && (
                  <div className="mb-3 text-sm text-muted-foreground">
                    {[email, phoneDisplay].filter(Boolean).join(' · ')}
                  </div>
                )}
                {r.reason && (
                  <div className="mb-3 text-[13px] leading-relaxed text-muted-foreground/80">
                    {r.reason}
                  </div>
                )}
                {r.store && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/40 p-3">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      <BookOpen style={{ width: 13, height: 13 }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold">
                        {r.store.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {r.status === 'PENDING' && (
                <div className="flex w-36 flex-col gap-2">
                  <button
                    onClick={() => handleDecide(r.id, 'APPROVED')}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Check style={{ width: 13, height: 13 }} />{' '}
                    {t('users.approveTeacher')}
                  </button>
                  <button
                    onClick={() => handleDecide(r.id, 'REJECTED')}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    {t('teacherRequests.reject')}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
