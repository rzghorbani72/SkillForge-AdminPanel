'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Payment, Transaction } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

export interface PaymentsSnapshot {
  payments: Payment[];
  transactions: Transaction[];
  monetizationSummary: any | null;
  isLoading: boolean;
  refresh: () => void;
}

export function usePaymentsData(): PaymentsSnapshot {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [monetizationSummary, setMonetizationSummary] = useState<any | null>(
    null
  );
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const refresh = useCallback(() => {
    setRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [paymentsResponse, transactionsResponse, monetizationResponse] =
          await Promise.allSettled([
            apiClient.getPayments({ page: 1, limit: 20 }),
            apiClient.getTransactionTracking({ page: 1, limit: 20 }),
            apiClient.getMonetizationSummary()
          ]);

        if (!isMounted) return;

        if (paymentsResponse.status === 'fulfilled') {
          const payload = paymentsResponse.value as any;
          const list = Array.isArray(payload)
            ? (payload as Payment[])
            : Array.isArray(payload?.payments)
              ? (payload.payments as Payment[])
              : Array.isArray(payload?.data?.payments)
                ? (payload.data.payments as Payment[])
                : Array.isArray(payload?.data)
                  ? (payload.data as Payment[])
                  : [];
          setPayments(list);
        } else {
          console.error('Failed to fetch payments:', paymentsResponse.reason);
          setPayments([]);
        }

        if (transactionsResponse.status === 'fulfilled') {
          const payload = transactionsResponse.value as any;
          const list = Array.isArray(payload)
            ? (payload as Transaction[])
            : Array.isArray(payload?.records)
              ? (payload.records as Transaction[])
              : Array.isArray(payload?.data?.records)
                ? (payload.data.records as Transaction[])
                : Array.isArray(payload?.transactions)
                  ? (payload.transactions as Transaction[])
                  : Array.isArray(payload?.data?.transactions)
                    ? (payload.data.transactions as Transaction[])
                    : Array.isArray(payload?.data)
                      ? (payload.data as Transaction[])
                      : [];
          setTransactions(list);
        } else {
          console.error(
            'Failed to fetch transactions:',
            transactionsResponse.reason
          );
          setTransactions([]);
        }
        if (monetizationResponse?.status === 'fulfilled') {
          const payload = monetizationResponse.value as any;
          setMonetizationSummary(payload?.data ?? payload ?? null);
        } else {
          setMonetizationSummary(null);
        }
      } catch (error) {
        console.error('Error loading payments data:', error);
        ErrorHandler.handleApiError(error);
        if (isMounted) {
          setPayments([]);
          setTransactions([]);
          setMonetizationSummary(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  return useMemo(
    () => ({
      payments,
      transactions,
      monetizationSummary,
      isLoading,
      refresh
    }),
    [payments, transactions, monetizationSummary, isLoading, refresh]
  );
}
