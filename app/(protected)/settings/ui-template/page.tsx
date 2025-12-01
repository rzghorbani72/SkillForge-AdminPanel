'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, GripVertical, Eye, EyeOff, Layout, Check } from 'lucide-react';
import { ErrorHandler } from '@/lib/error-handler';
import { apiClient } from '@/lib/api';
import { UIBlockConfig, TemplatePreset } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { TemplatePreview } from '@/components/ui-template/template-preview';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n/hooks';

const DEFAULT_BLOCKS: UIBlockConfig[] = [
  {
    id: 'header',
    type: 'header',
    order: 1,
    isVisible: true,
    config: {
      showLogo: true,
      showNavigation: true,
      navigationStyle: 'horizontal',
      sticky: true
    }
  },
  {
    id: 'hero',
    type: 'hero',
    order: 2,
    isVisible: true,
    config: {
      title: 'Welcome to Our School',
      subtitle: 'Learn something new today',
      showCTA: true,
      ctaText: 'Browse Courses',
      backgroundImage: null,
      overlay: true
    }
  },
  {
    id: 'features',
    type: 'features',
    order: 3,
    isVisible: true,
    config: {
      title: 'Why Choose Us',
      subtitle: 'Discover what makes us special',
      gridColumns: 3,
      showIcons: true
    }
  },
  {
    id: 'courses',
    type: 'courses',
    order: 4,
    isVisible: true,
    config: {
      title: 'Featured Courses',
      subtitle: 'Start your learning journey',
      showFilters: true,
      gridColumns: 3,
      limit: 6
    }
  },
  {
    id: 'footer',
    type: 'footer',
    order: 5,
    isVisible: true,
    config: {
      showSocialLinks: true,
      showNewsletter: true,
      columns: 4
    }
  }
];

// BLOCK_LABELS will be created inside component to use translations

interface SortableBlockProps {
  block: UIBlockConfig;
  isEditing: boolean;
  onToggleVisibility: (blockId: string) => void;
  onEdit: (blockId: string) => void;
  onStopEdit: () => void;
  onUpdateConfig: (blockId: string, config: Record<string, any>) => void;
  isCustomized?: boolean;
}

function SortableBlock({
  block,
  isEditing,
  onToggleVisibility,
  onEdit,
  onStopEdit,
  onUpdateConfig,
  isCustomized = false
}: SortableBlockProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const BLOCK_LABELS: Record<string, string> = {
    header: t('settings.header'),
    hero: t('settings.heroSection'),
    features: t('settings.featuresSection'),
    courses: t('settings.coursesSection'),
    testimonials: t('settings.testimonials'),
    footer: t('settings.footer'),
    sidebar: t('settings.sidebar')
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border p-4 transition-colors ${
        isDragging ? 'border-primary bg-muted' : 'bg-card'
      } ${!block.isVisible ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label className="font-semibold">
                {BLOCK_LABELS[block.type] || block.type}
              </Label>
              {block.isVisible ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
              {isCustomized && (
                <Badge variant="secondary" className="text-xs">
                  {t('settings.customized')}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('settings.order')}: {block.order} • {t('settings.type')}:{' '}
              {block.type}
            </p>
          </div>
          <Switch
            checked={block.isVisible}
            onCheckedChange={() => onToggleVisibility(block.id)}
          />
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {block.type === 'hero' && (
              <>
                <div className="space-y-2">
                  <Label>{t('settings.title')}</Label>
                  <Input
                    value={block.config?.title || ''}
                    onChange={(e) =>
                      onUpdateConfig(block.id, {
                        title: e.target.value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.subtitle')}</Label>
                  <Input
                    value={block.config?.subtitle || ''}
                    onChange={(e) =>
                      onUpdateConfig(block.id, {
                        subtitle: e.target.value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.ctaText')}</Label>
                  <Input
                    value={block.config?.ctaText || ''}
                    onChange={(e) =>
                      onUpdateConfig(block.id, {
                        ctaText: e.target.value
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={block.config?.showCTA ?? true}
                    onCheckedChange={(checked) =>
                      onUpdateConfig(block.id, {
                        showCTA: checked
                      })
                    }
                  />
                  <Label>{t('settings.showCtaButton')}</Label>
                </div>
              </>
            )}

            {block.type === 'features' && (
              <>
                <div className="space-y-2">
                  <Label>{t('settings.title')}</Label>
                  <Input
                    value={block.config?.title || ''}
                    onChange={(e) =>
                      onUpdateConfig(block.id, {
                        title: e.target.value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.subtitle')}</Label>
                  <Input
                    value={block.config?.subtitle || ''}
                    onChange={(e) =>
                      onUpdateConfig(block.id, {
                        subtitle: e.target.value
                      })
                    }
                  />
                </div>
              </>
            )}

            {block.type === 'courses' && (
              <>
                <div className="space-y-2">
                  <Label>{t('settings.title')}</Label>
                  <Input
                    value={block.config?.title || ''}
                    onChange={(e) =>
                      onUpdateConfig(block.id, {
                        title: e.target.value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.subtitle')}</Label>
                  <Input
                    value={block.config?.subtitle || ''}
                    onChange={(e) =>
                      onUpdateConfig(block.id, {
                        subtitle: e.target.value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.gridColumns')}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="4"
                    value={block.config?.gridColumns || 3}
                    onChange={(e) =>
                      onUpdateConfig(block.id, {
                        gridColumns: parseInt(e.target.value) || 3
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onStopEdit}>
            {t('settings.done')}
          </Button>
        </div>
      )}

      {!isEditing && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => onEdit(block.id)}
        >
          {t('settings.configure')}
        </Button>
      )}
    </div>
  );
}

export default function UITemplateSettingsPage() {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<UIBlockConfig[]>(DEFAULT_BLOCKS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [currentPreset, setCurrentPreset] = useState<string | undefined>(
    undefined
  );
  const [availablePresets, setAvailablePresets] = useState<TemplatePreset[]>(
    []
  );
  const [isLoadingPresets, setIsLoadingPresets] = useState<boolean>(false);
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState<boolean>(false);
  const [basePresetBlocks, setBasePresetBlocks] = useState<UIBlockConfig[]>([]);

  const BLOCK_LABELS: Record<string, string> = {
    header: t('settings.header'),
    hero: t('settings.heroSection'),
    features: t('settings.featuresSection'),
    courses: t('settings.coursesSection'),
    testimonials: t('settings.testimonials'),
    footer: t('settings.footer'),
    sidebar: t('settings.sidebar')
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    let mounted = true;

    const loadTemplate = async () => {
      try {
        const response = await apiClient.getCurrentUITemplate();
        if (!mounted) return;

        const templateData = (response as any)?.data || response;
        if (templateData?.blocks && Array.isArray(templateData.blocks)) {
          const sortedBlocks = [...templateData.blocks].sort(
            (a, b) => a.order - b.order
          );
          setBlocks(sortedBlocks);
        } else {
          setBlocks(DEFAULT_BLOCKS);
        }
        setCurrentPreset(templateData?.template_preset);

        // Load base preset blocks for comparison - moved to separate effect
      } catch (error) {
        console.error('Failed to load UI template', error);
        if (!mounted) return;
        setBlocks(DEFAULT_BLOCKS);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const loadPresets = async () => {
      try {
        setIsLoadingPresets(true);
        const response = await apiClient.getAvailableTemplatePresets();
        if (!mounted) return;
        const presetsData = (response as any)?.data || response;
        if (presetsData && Array.isArray(presetsData)) {
          setAvailablePresets(presetsData);
        }
      } catch (error) {
        console.error('Failed to load template presets', error);
      } finally {
        if (mounted) setIsLoadingPresets(false);
      }
    };

    // Load presets first, then template (so we can compare)
    loadPresets().then(() => {
      loadTemplate();
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Update base preset blocks when preset or presets change
  useEffect(() => {
    if (currentPreset && availablePresets.length > 0) {
      const basePreset = availablePresets.find((p) => p.id === currentPreset);
      if (basePreset?.blocks) {
        const sortedBaseBlocks = [...basePreset.blocks].sort(
          (a, b) => a.order - b.order
        );
        setBasePresetBlocks(sortedBaseBlocks);
      } else {
        setBasePresetBlocks([]);
      }
    } else {
      setBasePresetBlocks([]);
    }
  }, [currentPreset, availablePresets]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        return newItems.map((block, index) => ({
          ...block,
          order: index + 1
        }));
      });
    }
  };

  const toggleBlockVisibility = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, isVisible: !block.isVisible } : block
      )
    );
  };

  const updateBlockConfig = (blockId: string, config: Record<string, any>) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, config: { ...block.config, ...config } }
          : block
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.updateUITemplate({
        blocks: blocks.map((block) => ({
          ...block,
          config: block.config || {}
        })),
        template_preset: currentPreset
      });

      ErrorHandler.showSuccess(t('settings.uiTemplateSavedSuccess'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      setIsSaving(true);
      const response = await apiClient.applyTemplatePreset(presetId);
      const templateData = (response as any)?.data || response;

      if (templateData?.blocks && Array.isArray(templateData.blocks)) {
        const sortedBlocks = [...templateData.blocks].sort(
          (a, b) => a.order - b.order
        );
        setBlocks(sortedBlocks);
        setCurrentPreset(templateData.template_preset);

        // Update base preset blocks
        const basePreset = availablePresets.find((p) => p.id === presetId);
        if (basePreset?.blocks) {
          const sortedBaseBlocks = [...basePreset.blocks].sort(
            (a, b) => a.order - b.order
          );
          setBasePresetBlocks(sortedBaseBlocks);
        }

        setIsPresetDialogOpen(false);
        ErrorHandler.showSuccess(
          t('settings.templateAppliedSuccess').replace('{presetId}', presetId)
        );
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get the current preset details
  const currentPresetDetails = availablePresets.find(
    (p) => p.id === currentPreset
  );

  // Check if a block has been customized from the base preset
  const isBlockCustomized = (block: UIBlockConfig): boolean => {
    if (!currentPreset || basePresetBlocks.length === 0) return false;
    const baseBlock = basePresetBlocks.find((b) => b.id === block.id);
    if (!baseBlock) return true; // New block not in preset

    // Compare key properties
    return (
      block.isVisible !== baseBlock.isVisible ||
      block.order !== baseBlock.order ||
      JSON.stringify(block.config) !== JSON.stringify(baseBlock.config)
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[420px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('settings.uiTemplateBuilderTitle')}
            </h1>
            <p className="text-muted-foreground">
              {t('settings.uiTemplateBuilderSubtitle')}
            </p>
            {currentPresetDetails && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Layout className="h-3 w-3" />
                  {t('settings.basedOn')}: {currentPresetDetails.name}
                </Badge>
                {currentPresetDetails.description && (
                  <span className="text-sm text-muted-foreground">
                    {currentPresetDetails.description}
                  </span>
                )}
              </div>
            )}
          </div>
          <Dialog
            open={isPresetDialogOpen}
            onOpenChange={setIsPresetDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Layout className="mr-2 h-4 w-4" />
                {t('settings.chooseTemplate')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('settings.chooseTemplateLayout')}</DialogTitle>
                <DialogDescription>
                  {t('settings.chooseTemplateLayoutDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {isLoadingPresets
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-80" />
                    ))
                  : availablePresets.map((preset) => (
                      <Card
                        key={preset.id}
                        className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                          currentPreset === preset.id
                            ? 'border-2 border-primary shadow-md'
                            : ''
                        }`}
                        onClick={() => handleApplyPreset(preset.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {preset.name}
                            </CardTitle>
                            {currentPreset === preset.id && (
                              <Badge variant="default" className="gap-1">
                                <Check className="h-3 w-3" />
                                {t('settings.active')}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mt-1 text-sm">
                            {preset.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Visual Preview */}
                          <div className="rounded-lg border bg-slate-50 p-3 dark:bg-slate-800/50">
                            <div className="flex justify-center">
                              <div className="w-full max-w-[280px]">
                                <TemplatePreview preset={preset} scale={0.8} />
                              </div>
                            </div>
                          </div>

                          {/* Blocks Info */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              {t('settings.blocks')} (
                              {preset.blocks.filter((b) => b.isVisible).length}
                              ):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {preset.blocks
                                .filter((b) => b.isVisible)
                                .map((block) => (
                                  <Badge
                                    key={block.id}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {block.type}
                                  </Badge>
                                ))}
                            </div>
                          </div>

                          <Button
                            className="w-full"
                            variant={
                              currentPreset === preset.id
                                ? 'secondary'
                                : 'default'
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyPreset(preset.id);
                            }}
                          >
                            {currentPreset === preset.id
                              ? t('settings.currentlyActive')
                              : t('settings.applyTemplate')}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.pageBlocks')}</CardTitle>
          <CardDescription>
            {t('settings.pageBlocksDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isEditing={editingBlock === block.id}
                    onToggleVisibility={toggleBlockVisibility}
                    onEdit={setEditingBlock}
                    onStopEdit={() => setEditingBlock(null)}
                    onUpdateConfig={updateBlockConfig}
                    isCustomized={isBlockCustomized(block)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? t('settings.saving') : t('settings.saveTemplate')}
        </Button>
      </div>
    </div>
  );
}
