'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

/** Auth screens use 120s; profile contact OTP matches Backend's 60s cooldown. */
const DEFAULT_DURATION = 120;

type OtpTimerOptions = {
  /** Start counting down immediately (auth OTP screens). */
  autoStart?: boolean;
};

export function useOtpTimer(defaultDuration = DEFAULT_DURATION, options?: OtpTimerOptions) {
  const [seconds, setSeconds] = useState(options?.autoStart ? defaultDuration : 0);
  const formatNumber = useNumberFormat();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(defaultDuration);
  durationRef.current = defaultDuration;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback((overrideSeconds?: number) => {
    clear();
    const next = Math.max(0, Math.floor(overrideSeconds ?? durationRef.current));
    setSeconds(next);
    if (next <= 0) return;
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

  useEffect(() => {
    if (options?.autoStart) start();
    return () => clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only autoStart
  }, []);

  const pad = (value: number) =>
    formatNumber(value, { minimumIntegerDigits: 2, useGrouping: false });
  const mm = pad(Math.floor(seconds / 60));
  const ss = pad(seconds % 60);

  return {
    secondsLeft: seconds,
    formatted: `${mm}:${ss}`,
    canResend: seconds === 0,
    start,
  };
}
