'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = true,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-red-500'
  };

  const clampedProgress = Math.round(Math.min(Math.max(progress, 0), 100));
  const percentLabel = usePercentLabel();

  return (
    <div className={cn('w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'w-full overflow-hidden rounded-full bg-muted',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            variantClasses[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-center text-xs text-muted-foreground">
          {percentLabel(clampedProgress)}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
