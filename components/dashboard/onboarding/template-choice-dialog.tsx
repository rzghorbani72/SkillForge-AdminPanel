'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

export type TemplateChoice = 'default' | 'choose';

type Props = {
  open: boolean;
  /** Key of the template the platform picked, so its name can be shown. */
  presetKey: string | null;
  onConfirm: (choice: TemplateChoice) => void;
  onClose: () => void;
};

type PresetSummary = { id?: string; key?: string; name?: string };

export function TemplateChoiceDialog({ open, presetKey, onConfirm, onClose }: Props) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<TemplateChoice>('default');
  const [templateName, setTemplateName] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !presetKey) return;
    let cancelled = false;
    void (async () => {
      const presets = (await apiClient
        .getAvailableTemplatePresets()
        .catch(() => [])) as PresetSummary[];
      if (cancelled) return;
      const match = presets.find((p) => p.key === presetKey || p.id === presetKey);
      setTemplateName(match?.name ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, presetKey]);

  const options: Array<{ value: TemplateChoice; title: string; hint: string }> = [
    {
      value: 'default',
      title: t('onboarding.templateChoiceDefault'),
      hint: templateName
        ? t('onboarding.templateChoiceDefaultHintNamed', { name: templateName })
        : t('onboarding.templateChoiceDefaultHint'),
    },
    {
      value: 'choose',
      title: t('onboarding.templateChoiceOwn'),
      hint: t('onboarding.templateChoiceOwnHint'),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('onboarding.templateChoiceTitle')}</DialogTitle>
          <DialogDescription>{t('onboarding.templateChoiceDescription')}</DialogDescription>
        </DialogHeader>

        <RadioGroup value={choice} onValueChange={(v) => setChoice(v as TemplateChoice)}>
          {options.map((option) => (
            <Label
              key={option.value}
              htmlFor={`template-choice-${option.value}`}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                choice === option.value ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <RadioGroupItem
                id={`template-choice-${option.value}`}
                value={option.value}
                className="mt-1"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{option.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{option.hint}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => onConfirm(choice)}>{t('common.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
