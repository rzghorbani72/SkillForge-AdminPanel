'use client';

import { useEffect, useRef } from 'react';

export function ProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${value}%`;
  }, [value]);
  return <div ref={ref} className="h-full rounded-full bg-current transition-all" />;
}
