'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Payment, Transaction } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

export interface PaymentsSnapshot {
  payments: Payment[];
  transactions: Transaction[];
  isLoading: boolean;
  refresh: () => void;
}

export function usePaymentsData(): PaymentsSnapshot {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const refresh = useCallback(() => {
    setRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [paymentsResponse, transactionsResponse] =
          await Promise.allSettled([
            apiClient.getPayments(),
            apiClient.getTransactions()
          ]);

        if (!isMounted) return;

        if (paymentsResponse.status === 'fulfilled') {
          const payload = paymentsResponse.value as any;
          const list = Array.isArray(payload)
            ? (payload as Payment[])
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
      } catch (error) {
        console.error('Error loading payments data:', error);
        ErrorHandler.handleApiError(error);
        if (isMounted) {
          setPayments([]);
          setTransactions([]);
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
      isLoading,
      refresh
    }),
    [payments, transactions, isLoading, refresh]
  );
}
