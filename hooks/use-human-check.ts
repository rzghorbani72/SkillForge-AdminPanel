import { useCallback, useState } from 'react';

/**
 * State for one `HumanCheck` widget. A solved payload is single-use: `run()`
 * hands it to the request and keeps the box checked until the request ends,
 * then remounts the widget. Pass `resetKey` as the widget's `key`.
 */
export function useHumanCheck() {
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const reset = useCallback(() => {
    setToken('');
    setResetKey((key) => key + 1);
  }, []);

  /** Takes the payload without unchecking the widget; call `reset()` when the request ends. */
  const take = useCallback(() => {
    setToken('');
    return token;
  }, [token]);

  const run = useCallback(
    async <T>(request: (captchaToken: string) => Promise<T>): Promise<T> => {
      try {
        return await request(take());
      } finally {
        reset();
      }
    },
    [take, reset],
  );

  return { token, setToken, resetKey, reset, take, run, solved: token !== '' };
}

export type HumanCheckState = ReturnType<typeof useHumanCheck>;
