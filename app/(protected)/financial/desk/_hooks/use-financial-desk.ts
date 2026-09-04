'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { LedgerPaymentsResponse, SettlementDesk } from '@/types/financial';

const EMPTY_DESK: SettlementDesk = {
  to_deposit: 0,
  pending_amount: 0,
  academy_share: 0,
  platform_share: 0,
  academies: [],
  settlements: [],
  gross_trend: []
};

const EMPTY_PAYMENTS: LedgerPaymentsResponse = {
  total: 0,
  page: 1,
  limit: 50,
  payments: []
};

export function useFinancialDesk() {
  const { t } = useTranslation();
  const [desk, setDesk] = useState<SettlementDesk>(EMPTY_DESK);
  const [payments, setPayments] =
    useState<LedgerPaymentsResponse>(EMPTY_PAYMENTS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      setLoading(true);
      try {
        const [nextDesk, nextPayments] = await Promise.all([
          apiClient.getSettlementDesk(),
          apiClient.getSettlementPayments({ page: nextPage, limit: 50 })
        ]);
        setDesk({
          ...EMPTY_DESK,
          ...(nextDesk ?? EMPTY_DESK),
          gross_trend: nextDesk?.gross_trend ?? []
        });
        setPayments((prev) => {
          const incoming = nextPayments ?? EMPTY_PAYMENTS;
          if (!append) return incoming;
          return {
            ...incoming,
            payments: [...prev.payments, ...incoming.payments]
          };
        });
        setPage(nextPage);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    void load(1, false);
  }, [load]);

  const loadMore = useCallback(() => {
    void load(page + 1, true);
  }, [load, page]);

  const notify = useCallback(
    async (requestId: string) => {
      setNotifyingId(requestId);
      try {
        await apiClient.notifySettlementManager(requestId);
        toast.success(t('financial.desk.notifyOk'));
        await load(1, false);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setNotifyingId(null);
      }
    },
    [load, page, t]
  );

  return { desk, payments, loading, notifyingId, loadMore, notify };
}
