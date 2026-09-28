import { useCallback, useState } from 'react';

/**
 * State for one `HumanCheck` widget. A solved payload is single-use, so call
 * `reset()` after every submit and pass `resetKey` as the widget's `key`.
 */
export function useHumanCheck() {
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const reset = useCallback(() => {
    setToken('');
    setResetKey((key) => key + 1);
  }, []);

  return { token, setToken, resetKey, reset, solved: token !== '' };
}

export type HumanCheckState = ReturnType<typeof useHumanCheck>;
