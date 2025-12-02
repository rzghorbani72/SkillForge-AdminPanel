'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  variant?: 'default' | 'minimal' | 'fullscreen';
  className?: string;
}

export function LoadingSpinner({
  message = 'Loading...',
  variant = 'default',
  className
}: LoadingSpinnerProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Sparkles className="h-10 w-10 animate-pulse text-white" />
            </div>
          </div>
          <p className="mt-6 text-sm font-medium text-muted-foreground">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex-1 space-y-6 p-6', className)}>
      <div className="flex h-[calc(100vh-280px)] min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Sparkles className="h-8 w-8 animate-pulse text-white" />
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            {message}
          </p>
          <div className="mx-auto mt-4 flex justify-center gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
