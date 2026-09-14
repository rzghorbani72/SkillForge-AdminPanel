'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with the text instead of scrolling inside a fixed box. */
  autoResize?: boolean;
}

function useAutoResize(
  enabled: boolean,
  value: unknown,
): [React.RefObject<HTMLTextAreaElement | null>, () => void] {
  const innerRef = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const el = innerRef.current;
    if (!enabled || !el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [enabled]);

  // Text set from outside (form.reset, loading a saved course) also resizes.
  React.useEffect(resize, [resize, value]);

  return [innerRef, resize];
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = true, onChange, ...props }, ref) => {
    const [innerRef, resize] = useAutoResize(autoResize, props.value);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          autoResize && 'resize-none overflow-hidden',
          className,
        )}
        ref={innerRef}
        onChange={(event) => {
          resize();
          onChange?.(event);
        }}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
