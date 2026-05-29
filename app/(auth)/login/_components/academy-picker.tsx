'use client';

import { Check, Loader2, Sparkles } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthBrand } from '@/components/auth/auth-brand';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500'
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

interface Academy {
  id: number;
  name: string;
  slug: string;
}

interface AcademyPickerProps {
  academies: Academy[];
  loading: boolean;
  onSelect: (id: number) => void;
  onBack: () => void;
}

export function AcademyPicker({
  academies,
  loading,
  onSelect,
  onBack
}: AcademyPickerProps) {
  const { t } = useTranslation();

  return (
    <AuthLayout maxWidth="md">
      <AuthBrand
        icon={<Sparkles className="h-6 w-6 text-primary-foreground" />}
        title={t('auth.chooseAcademy')}
        subtitle={t('auth.chooseAcademyDesc')}
      />

      <div className="space-y-2">
        {academies.map((academy) => (
          <button
            key={academy.id}
            type="button"
            disabled={loading}
            onClick={() => onSelect(academy.id)}
            className={cn(
              'group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-start transition-all',
              'hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm',
              'disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white',
                avatarColor(academy.id)
              )}
            >
              {academy.name[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold group-hover:text-primary">
                {academy.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {academy.slug}
              </p>
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Check className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={onBack}
      >
        ← {t('auth.backToLogin')}
      </button>
    </AuthLayout>
  );
}
