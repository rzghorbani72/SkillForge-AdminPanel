'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { UIBlockConfig } from '@/types/api';

interface BlockEditorProps {
  block: UIBlockConfig | null;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
}

export function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const { t } = useTranslation();

  if (!block) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <svg
          className="h-8 w-8 opacity-25"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
        <p>{t('settings.selectBlockToEdit')}</p>
      </div>
    );
  }

  const cfg = block.config ?? {};

  const set = (key: string, value: unknown) =>
    onUpdate(block.id, { ...cfg, [key]: value });

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('settings.editBlock')}
        </p>
        <p className="text-sm font-medium capitalize">
          {t(`settings.${block.type}` as any) || block.type}
        </p>
      </div>

      <Separator />

      {block.type === 'hero' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.heroSection')}</Label>
            <Input
              value={(cfg.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('settings.heroSection')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.subtitle')}</Label>
            <Input
              value={(cfg.subtitle as string) ?? ''}
              onChange={(e) => set('subtitle', e.target.value)}
              placeholder={t('settings.subtitle')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.ctaText')}</Label>
            <Input
              value={(cfg.ctaText as string) ?? ''}
              onChange={(e) => set('ctaText', e.target.value)}
              placeholder={t('settings.ctaText')}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">{t('settings.showCtaButton')}</Label>
            <Switch
              checked={(cfg.showCta as boolean) ?? true}
              onCheckedChange={(v) => set('showCta', v)}
            />
          </div>
        </div>
      )}

      {block.type === 'features' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.featuresSection')}</Label>
            <Input
              value={(cfg.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('settings.featuresSection')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.gridColumns')}</Label>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('gridColumns', n)}
                  className={`flex-1 rounded border py-1.5 text-xs font-medium transition-colors ${
                    (cfg.gridColumns as number) === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {block.type === 'courses' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.coursesSection')}</Label>
            <Input
              value={(cfg.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('settings.coursesSection')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.gridColumns')}</Label>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('gridColumns', n)}
                  className={`flex-1 rounded border py-1.5 text-xs font-medium transition-colors ${
                    (cfg.gridColumns as number) === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {block.type === 'header' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.header')}</Label>
            <Input
              value={(cfg.brandName as string) ?? ''}
              onChange={(e) => set('brandName', e.target.value)}
              placeholder={t('settings.header')}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      {block.type === 'testimonials' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.testimonials')}</Label>
            <Input
              value={(cfg.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('settings.testimonials')}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      {(block.type === 'footer' || block.type === 'sidebar') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{t('settings.active')}</Label>
            <Switch
              checked={block.isVisible}
              onCheckedChange={(v) => set('visible', v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
