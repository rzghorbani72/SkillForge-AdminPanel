'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  LayoutTemplate,
  Monitor,
  Smartphone,
  Tablet,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useUserStore } from '@/lib/store';
import type { TemplatePreset, UIBlockConfig, UITemplate } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { BlockEditor } from '@/components/ui-template/block-editor';
import { SitePreview } from '@/components/ui-template/site-preview';
import { BlocksList } from '@/components/ui-template/blocks-list';
import { TemplateSelectModal } from '@/components/ui-template/template-select-modal';
import { DESIGN_SYSTEMS, buildThemePayload } from '@/lib/design-systems';
import { applyThemeVariables, dispatchThemeUpdate } from '@/lib/theme';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export default function UITemplateSettingsPage() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const storeSlug = user?.currentAcademy?.slug ?? '';

  const [template, setTemplate] = useState<UITemplate | null>(null);
  const [presets, setPresets] = useState<TemplatePreset[]>([]);
  const [blocks, setBlocks] = useState<UIBlockConfig[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  const hasTemplate = !!template?.id;

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  );

  const activeBlock = useMemo(
    () => blocks.find((b) => b.id === activeBlockId) ?? null,
    [blocks, activeBlockId]
  );

  const activePresetId = template?.template_preset ?? '';

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL
    ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/s/${storeSlug}`
    : storeSlug
      ? `/s/${storeSlug}`
      : undefined;

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [templateData, presetsData] = await Promise.all([
        apiClient.getCurrentUITemplate().catch(() => null),
        apiClient.getAvailableTemplatePresets().catch(() => [])
      ]);

      setTemplate(templateData as UITemplate | null);
      setPresets(presetsData as TemplatePreset[]);
      setBlocks((templateData as UITemplate | null)?.blocks ?? []);
      setIsActive((templateData as UITemplate | null)?.is_active ?? true);

      // Auto-open template selector on first visit (no preset applied)
      if (!(templateData as UITemplate | null)?.template_preset) {
        setShowTemplateModal(true);
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVisibility = (blockId: string, checked: boolean) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, isVisible: checked } : b))
    );
  };

  const handleUpdateBlockConfig = (
    blockId: string,
    config: Record<string, unknown>
  ) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, config } : b))
    );
  };

  const handleMoveUp = (blockId: string) => {
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === blockId);
    if (idx <= 0) return;
    const updated = sorted.map((b, i) => {
      if (i === idx) return { ...b, order: sorted[idx - 1].order };
      if (i === idx - 1) return { ...b, order: sorted[idx].order };
      return b;
    });
    setBlocks(updated);
  };

  const handleMoveDown = (blockId: string) => {
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === blockId);
    if (idx >= sorted.length - 1) return;
    const updated = sorted.map((b, i) => {
      if (i === idx) return { ...b, order: sorted[idx + 1].order };
      if (i === idx + 1) return { ...b, order: sorted[idx].order };
      return b;
    });
    setBlocks(updated);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        blocks,
        template_preset: activePresetId || undefined,
        is_active: isActive
      };

      if (hasTemplate) {
        await apiClient.updateUITemplate(payload);
      } else {
        await apiClient.createUITemplate({ blocks, is_active: isActive });
      }

      ErrorHandler.showSuccess(t('settings.uiTemplateSavedSuccess'));
      await loadData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      setIsApplyingPreset(true);
      await apiClient.applyTemplatePreset(presetId);

      // Apply the design system (colors, radius, shadow) paired with this template.
      // Persisted to backend so the storefront picks it up on SSR, and applied
      // client-side immediately so the admin preview updates without a reload.
      const ds = DESIGN_SYSTEMS[presetId];
      if (ds) {
        const presetName =
          presets.find((p) => p.id === presetId)?.name ?? presetId;
        const themePayload = buildThemePayload(ds, presetName);
        await apiClient.updateCurrentThemeConfig(themePayload);
        applyThemeVariables(themePayload);
        dispatchThemeUpdate(themePayload);
      }

      ErrorHandler.showSuccess(t('settings.uiTemplateSavedSuccess'));
      await loadData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsApplyingPreset(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[calc(100vh-8rem)]" />
      </div>
    );
  }

  const previewWidthClass =
    deviceMode === 'mobile'
      ? 'max-w-sm mx-auto'
      : deviceMode === 'tablet'
        ? 'max-w-2xl mx-auto'
        : 'w-full';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b bg-background px-6 py-3">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight">
            {t('settings.uiTemplateBuilderTitle')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t('settings.uiTemplateBuilderSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Device switcher */}
          <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              title="Desktop"
              onClick={() => setDeviceMode('desktop')}
              className={`rounded p-1.5 transition-colors ${deviceMode === 'desktop' ? 'bg-background shadow-sm' : 'hover:bg-accent'}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Tablet"
              onClick={() => setDeviceMode('tablet')}
              className={`rounded p-1.5 transition-colors ${deviceMode === 'tablet' ? 'bg-background shadow-sm' : 'hover:bg-accent'}`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Mobile"
              onClick={() => setDeviceMode('mobile')}
              className={`rounded p-1.5 transition-colors ${deviceMode === 'mobile' ? 'bg-background shadow-sm' : 'hover:bg-accent'}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateModal(true)}
          >
            <LayoutTemplate className="mr-1.5 h-4 w-4" />
            {t('settings.changeTemplate')}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!storefrontUrl}
            onClick={() =>
              storefrontUrl && window.open(storefrontUrl, '_blank')
            }
          >
            <Eye className="mr-1.5 h-4 w-4" />
            {t('settings.previewSite')}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? t('settings.saving') : t('settings.publishSite')}
          </Button>
        </div>
      </div>

      {/* 3-panel body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left panel — Block editor */}
        <aside className="flex w-64 flex-shrink-0 flex-col overflow-hidden border-r bg-background">
          {/* Active preset badge */}
          {activePresetId && (
            <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
              <span className="text-xs text-muted-foreground">
                {t('settings.basedOn')}
              </span>
              <Badge variant="secondary" className="text-xs">
                {activePresetId}
              </Badge>
            </div>
          )}

          {/* Template active toggle */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-xs font-medium">
                {t('settings.templateStatus')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.templateStatusDescription')}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <BlockEditor
              block={activeBlock}
              onUpdate={handleUpdateBlockConfig}
            />
          </div>
        </aside>

        {/* Center panel — Site preview */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/20 p-4">
          <div
            className={`flex min-h-0 flex-1 flex-col transition-all duration-300 ${previewWidthClass}`}
          >
            <SitePreview
              blocks={sortedBlocks}
              siteUrl={storefrontUrl}
              activeBlockId={activeBlockId}
              onSelectBlock={setActiveBlockId}
            />
          </div>
        </main>

        {/* Right panel — Blocks list */}
        <aside className="flex w-60 flex-shrink-0 flex-col overflow-hidden border-l bg-background">
          <BlocksList
            blocks={sortedBlocks}
            activeBlockId={activeBlockId}
            onSelectBlock={setActiveBlockId}
            onToggleVisibility={handleToggleVisibility}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        </aside>
      </div>

      <TemplateSelectModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        presets={presets}
        activePresetId={activePresetId}
        onApply={handleApplyPreset}
        isApplying={isApplyingPreset}
      />
    </div>
  );
}
