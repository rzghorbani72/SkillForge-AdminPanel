'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, LayoutTemplate, RefreshCw, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { TemplatePreset, UIBlockConfig, UITemplate } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

export default function UITemplateSettingsPage() {
  const { t } = useTranslation();
  const [template, setTemplate] = useState<UITemplate | null>(null);
  const [presets, setPresets] = useState<TemplatePreset[]>([]);
  const [blocks, setBlocks] = useState<UIBlockConfig[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  const hasTemplate = !!template?.id;

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [currentTemplate, availablePresets] = await Promise.all([
        apiClient.getCurrentUITemplate().catch(() => null),
        apiClient.getAvailableTemplatePresets().catch(() => [])
      ]);

      const templateData = (currentTemplate ?? null) as UITemplate | null;
      const presetsData = Array.isArray(availablePresets)
        ? availablePresets
        : [];

      setTemplate(templateData);
      setPresets(presetsData);
      setBlocks(templateData?.blocks ?? []);
      setSelectedPreset(templateData?.template_preset ?? '');
      setIsActive(templateData?.is_active ?? true);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleBlockVisibility = (blockId: string, checked: boolean) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, isVisible: checked } : block
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        blocks,
        template_preset: selectedPreset || undefined,
        is_active: isActive
      };

      if (hasTemplate) {
        await apiClient.updateUITemplate(payload);
      } else {
        await apiClient.createUITemplate({
          blocks,
          is_active: isActive
        });
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
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-[380px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('settings.uiTemplateBuilderTitle')}
          </h1>
          <p className="text-muted-foreground">
            {t('settings.uiTemplateBuilderSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('settings.refreshData')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            {t('settings.uiTemplateBuilder')}
          </CardTitle>
          <CardDescription>
            {t('settings.uiTemplateBuilderDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Template status</p>
              <p className="text-xs text-muted-foreground">
                Disable to fall back to default storefront template.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Available presets</p>
            <div className="grid gap-3 md:grid-cols-2">
              {presets.length ? (
                presets.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <Card
                      key={preset.id}
                      className={isSelected ? 'border-primary' : ''}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-base">
                          <span>{preset.name}</span>
                          {isSelected ? <Badge>Active</Badge> : null}
                        </CardTitle>
                        <CardDescription>{preset.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex gap-2">
                        <Button
                          size="sm"
                          variant={isSelected ? 'secondary' : 'outline'}
                          onClick={() => setSelectedPreset(preset.id)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Select
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApplyPreset(preset.id)}
                          disabled={isApplyingPreset}
                        >
                          Apply
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No preset is available yet.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Current blocks</p>
            {sortedBlocks.length ? (
              <div className="space-y-2">
                {sortedBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {block.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Order: {block.order}
                      </p>
                    </div>
                    <Switch
                      checked={block.isVisible}
                      onCheckedChange={(checked) =>
                        toggleBlockVisibility(block.id, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No blocks defined. Select and apply a preset to bootstrap your
                template.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
