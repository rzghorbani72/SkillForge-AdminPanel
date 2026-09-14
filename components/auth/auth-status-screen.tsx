'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';

type AuthStatusScreenProps = {
  title: string;
  message: string;
  embedded?: boolean;
};

export function AuthStatusScreen({ title, message, embedded = false }: AuthStatusScreenProps) {
  const content = (
    <div className="fade-in-up space-y-3 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="auth-card rounded-2xl p-8">{content}</div>;
  }

  return (
    <AuthLayout>
      <div className="auth-card fade-in-up rounded-2xl p-8">{content}</div>
    </AuthLayout>
  );
}
