'use client';

import { useState } from 'react';
import {
  X,
  Sparkles,
  Languages,
  GraduationCap,
  Code2,
  Palette,
  Briefcase,
  Loader2,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mirrors Backend ACADEMY_FIELDS. One short question — "what does your academy
// teach?" — is the only input generation needs, Zarla-style.
export type AcademyField =
  | 'language'
  | 'exam'
  | 'coding'
  | 'arts'
  | 'business'
  | 'general';

const FIELD_OPTIONS: {
  value: AcademyField;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: 'language', label: 'آموزش زبان', icon: Languages },
  { value: 'exam', label: 'آمادگی آزمون', icon: GraduationCap },
  { value: 'coding', label: 'برنامه‌نویسی و فناوری', icon: Code2 },
  { value: 'arts', label: 'هنر و موسیقی', icon: Palette },
  { value: 'business', label: 'کسب‌وکار و مهارت', icon: Briefcase },
  { value: 'general', label: 'عمومی', icon: Sparkles }
];

interface GenerateTemplateDialogProps {
  open: boolean;
  academyName: string;
  isGenerating: boolean;
  onGenerate: (field: AcademyField) => void;
  onClose: () => void;
}

export function GenerateTemplateDialog({
  open,
  academyName,
  isGenerating,
  onGenerate,
  onClose
}: GenerateTemplateDialogProps) {
  const [field, setField] = useState<AcademyField | null>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      dir="rtl"
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-background shadow-xl">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold">ساخت خودکار سایت</h2>
              <p className="text-xs text-muted-foreground">
                برای «{academyName}» یک سایت آماده می‌سازیم
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="mb-3 text-sm font-semibold">
            آکادمی شما چه چیزی آموزش می‌دهد؟
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {FIELD_OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = field === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setField(value)}
                  disabled={isGenerating}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-right transition-all ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isGenerating}
          >
            انصراف
          </Button>
          <Button
            type="button"
            disabled={!field || isGenerating}
            onClick={() => field && onGenerate(field)}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال ساخت...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                بساز
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
