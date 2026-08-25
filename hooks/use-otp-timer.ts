'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

const DURATION = 120;

export function useOtpTimer() {
  const [seconds, setSeconds] = useState(DURATION);
  const formatNumber = useNumberFormat();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const start = useCallback(() => {
    clear();
    setSeconds(DURATION);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clear();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clear(), []);

  const pad = (value: number) =>
    formatNumber(value, { minimumIntegerDigits: 2, useGrouping: false });
  const mm = pad(Math.floor(seconds / 60));
  const ss = pad(seconds % 60);

  return {
    formatted: `${mm}:${ss}`,
    canResend: seconds === 0,
    start
  };
}
