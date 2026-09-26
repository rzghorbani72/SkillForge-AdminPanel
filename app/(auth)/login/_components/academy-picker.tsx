'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronRight, Info, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthBrand } from '@/components/auth/auth-brand';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { colorIndexForId } from '@/lib/id-color';

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];
const avatarColor = (id: string) => AVATAR_COLORS[colorIndexForId(id, AVATAR_COLORS.length)];

interface Academy {
  id: string;
  name: string;
  slug: string;
}

interface AcademyPickerProps {
  academies: Academy[];
  loading: boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function AcademyPicker({ academies, loading, onSelect, onBack }: AcademyPickerProps) {
  const { t } = useTranslation();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setPendingId(id);
    onSelect(id);
  };

  return (
    <AuthLayout maxWidth="md">
      <AuthBrand title={t('auth.chooseAcademy')} subtitle={t('auth.chooseAcademyDesc')} />

      <div className="space-y-2">
        {academies.map((academy) => {
          const isPending = loading && pendingId === academy.id;
          return (
            <button
              key={academy.id}
              type="button"
              disabled={loading}
              onClick={() => handleSelect(academy.id)}
              className={cn(
                'group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-start shadow-sm transition-all',
                'hover:border-primary hover:shadow-md hover:ring-2 hover:ring-primary/15',
                'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                isPending && 'border-primary ring-2 ring-primary/20',
                'disabled:cursor-not-allowed',
                loading && !isPending && 'opacity-50',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white',
                  avatarColor(academy.id),
                )}
              >
                {academy.name[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground group-hover:text-primary">
                  {academy.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{academy.slug}</p>
              </div>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary rtl:rotate-180" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-card/70 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{t('auth.chooseAcademyHint')}</span>
      </p>

      <button
        type="button"
        className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={onBack}
      >
        <span className="inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {t('auth.backToLogin')}
        </span>
      </button>
    </AuthLayout>
  );
}
