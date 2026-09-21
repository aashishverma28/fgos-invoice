import { useEffect, useState } from 'react';

/** useAutoSave — localStorage retention indicator (store already persists; this surfaces status). */
export function useAutoSave(depKey: string): 'saved' | 'saving' {
  const [state, setState] = useState<'saved' | 'saving'>('saved');
  useEffect(() => {
    setState('saving');
    const t = window.setTimeout(() => setState('saved'), 500);
    return () => window.clearTimeout(t);
  }, [depKey]);
  return state;
}
