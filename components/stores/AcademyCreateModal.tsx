'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const STEPS = ['stepSpecs', 'stepBranding', 'stepPlan'] as const;
type Step = (typeof STEPS)[number];

type Category = {
  key: string;
  label: string;
};

type AcademyCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    slug: string;
    description?: string;
    category?: string;
  }) => Promise<void>;
  t: (k: string) => string;
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

export function AcademyCreateModal({
  open,
  onClose,
  onSubmit,
  t
}: AcademyCreateModalProps) {
  const [step, setStep] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const categories: Category[] = [
    { key: 'programming', label: t('stores.categoryProgramming') },
    { key: 'design', label: t('stores.categoryDesign') },
    { key: 'language', label: t('stores.categoryLanguage') },
    { key: 'business', label: t('stores.categoryBusiness') },
    { key: 'entrance', label: t('stores.categoryEntrance') },
    { key: 'art', label: t('stores.categoryArt') },
    { key: 'finance', label: t('stores.categoryFinance') }
  ];

  function handleNameChange(value: string) {
    setName(value);
    setSlug(toSlug(value));
  }

  function handleClose() {
    setStep(0);
    setName('');
    setSlug('');
    setDescription('');
    setCategory('');
    onClose();
  }

  async function handleSubmit() {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name, slug, description, category });
      handleClose();
    } finally {
      setSaving(false);
    }
  }

  const stepKeys = STEPS.map((k) => t(`stores.${k}`));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[560px]" dir="rtl">
        <DialogHeader className="text-right">
          <p className="text-xs text-muted-foreground">
            {t('stores.createModalTitle')}
          </p>
          <DialogTitle className="text-xl">
            {t('stores.createModalHeading')}
          </DialogTitle>
        </DialogHeader>

        {/* Step tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
          {stepKeys.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                i === step
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : i < step
                    ? 'text-foreground hover:bg-background/50'
                    : 'cursor-default text-muted-foreground'
              )}
            >
              <span className="bg-current/20 mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold">
                {i + 1}
              </span>{' '}
              {label}
            </button>
          ))}
        </div>

        {/* Step 0 — مشخصات */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('stores.academyName')}
                </label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t('stores.academyNamePlaceholder')}
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('stores.subdomain')}
                </label>
                <div className="flex items-center overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    value={slug}
                    onChange={(e) => setSlug(toSlug(e.target.value))}
                    placeholder="mehr"
                    dir="ltr"
                  />
                  <span className="shrink-0 border-r bg-muted px-3 py-2 text-xs text-muted-foreground">
                    mentoryar.ir
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t('stores.mainCategory')}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      setCategory(category === cat.key ? '' : cat.key)
                    }
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm transition-colors',
                      category === cat.key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary/50'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('stores.shortDescription')}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('stores.shortDescriptionPlaceholder')}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 1 — برندینگ (placeholder) */}
        {step === 1 && (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            {t('stores.stepBranding')}
          </div>
        )}

        {/* Step 2 — پلن (placeholder) */}
        {step === 2 && (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            {t('stores.stepPlan')}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            {t('stores.cancel')}
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              {t('stores.draft')}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && (!name.trim() || !slug.trim())}
              >
                {t('stores.nextStep')} &lsaquo;
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} disabled={saving}>
                {saving && (
                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                {t('common.create')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
