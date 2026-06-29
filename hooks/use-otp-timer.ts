'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const DURATION = 120;

export function useOtpTimer() {
  const [seconds, setSeconds] = useState(DURATION);
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

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return {
    formatted: `${mm}:${ss}`,
    canResend: seconds === 0,
    start
  };
}
