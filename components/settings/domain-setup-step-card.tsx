'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { DomainSetupActor } from '@/types/custom-domain-setup';

type DomainSetupStepCardProps = {
  index: number;
  title: string;
  body: React.ReactNode;
  actor: DomainSetupActor;
  done: boolean;
  actorLabel: string;
  children?: React.ReactNode;
};

export function DomainSetupStepCard({
  index,
  title,
  body,
  actor,
  done,
  actorLabel,
  children,
}: DomainSetupStepCardProps) {
  return (
    <li
      className={cn(
        'rounded-xl border p-4',
        done ? 'border-green-500/40 bg-green-500/5' : 'bg-card',
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="mt-0.5">
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{index}.</span>
              <p className="text-sm font-semibold">{title}</p>
              <Badge
                variant={actor === 'platform' ? 'default' : 'secondary'}
                className="text-[10px] uppercase tracking-wide"
              >
                {actorLabel}
              </Badge>
              {done ? (
                <Badge variant="outline" className="border-green-600 text-green-700">
                  ✓
                </Badge>
              ) : null}
            </div>
            <div className="text-sm text-muted-foreground">{body}</div>
          </div>
          {children}
        </div>
      </div>
    </li>
  );
}

export function DomainSetupBlank({
  id,
  label,
  value,
  onChange,
  placeholder,
  dir = 'ltr',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="font-mono text-sm"
      />
    </div>
  );
}

export function DomainSetupCheckButton({
  label,
  loading,
  disabled,
  onClick,
  done,
}: {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  done?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={done ? 'outline' : 'default'}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" /> : null}
      {label}
    </Button>
  );
}
