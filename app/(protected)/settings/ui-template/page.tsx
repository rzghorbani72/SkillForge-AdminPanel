'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  Check,
  Loader2,
  Wand2,
  LayoutTemplate,
  Pencil,
  Smartphone,
  Tablet,
  Monitor,
  Undo2,
  Redo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useAuthUser } from '@/hooks/useAuthUser';
import type { TemplatePreset, UIBlockConfig } from '@/types/api';
import { getDesignSystem, buildThemePayload } from '@/lib/design-systems';
import {
  buildTemplatePreviewUrl,
  appendPreviewCacheBuster
} from '@/lib/ui-template/preview-url';
import { buildThemeDraftFromPrimary } from '@/lib/ui-template/theme-draft-payload';
import { useRelativeTime } from '@/lib/ui-template/use-relative-time';
import {
  TemplateCustomizationSidebar,
  type SaveMode
} from '@/components/ui-template/template-customization-sidebar';
import { SectionCustomizationPanel } from '@/components/ui-template/section-customization-panel';
import { SectionLibraryModal } from '@/components/ui-template/section-library-modal';
import {
  GenerateTemplateDialog,
  type AcademyField
} from '@/components/ui-template/generate-template-dialog';
import { TemplateConfirmDialog } from '@/components/ui-template/template-confirm-dialog';
import { EditorPreview } from '@/components/ui-template/editor-preview';
import {
  TemplateSection,
  resolveTemplateColors,
  getTemplateCategory,
  CATEGORY_LABELS,
  type TemplateCategory
} from '@/components/ui-template/gallery-cards';
import type {
  BorderRadius,
  Shadow,
  SectionSpacing,
  ContainerWidth,
  HeadingScale,
  FontFamily,
  ViewportMode
} from '@/components/ui-template/sidebar-types';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

// Commit action awaiting explicit confirmation. Drafts keep auto-saving;
// only the committing step (publish/override/fork/delete) is gated.
type PendingSave =
  | { kind: 'publish' }
  | { kind: 'override' }
  | { kind: 'fork' }
  | { kind: 'delete'; preset: TemplatePreset };

const HISTORY_LIMIT = 30;

export default function UITemplateSettingsPage() {
  const { user } = useAuthUser();

  const [presets, setPresets] = useState<TemplatePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(
    null
  );
  const [baseIframeSrc, setBaseIframeSrc] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    TemplateCategory | 'all'
  >('all');

  // Customizer state
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [fontFamily, setFontFamily] = useState<FontFamily>('vazirmatn');
  const [borderRadius, setBorderRadius] = useState<BorderRadius>('soft');
  const [shadow, setShadow] = useState<Shadow>('medium');
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [sectionSpacing, setSectionSpacing] =
    useState<SectionSpacing>('comfortable');
  const [containerWidth, setContainerWidth] =
    useState<ContainerWidth>('standard');
  const [headingScale, setHeadingScale] = useState<HeadingScale>('standard');
  const [draftBlocks, setDraftBlocks] = useState<UIBlockConfig[]>([]);
  const [history, setHistory] = useState<UIBlockConfig[][]>([]);
  const [future, setFuture] = useState<UIBlockConfig[][]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    blockId: string;
    type: string;
  } | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);

  // A typing burst captures the pre-burst block state once; it is committed to
  // history only after the user pauses, so undo jumps per edit, not per key.
  const pendingHistoryRef = useRef<UIBlockConfig[] | null>(null);

  const savedAgo = useRelativeTime(lastSavedAt);

  const iframeSrc = baseIframeSrc
    ? appendPreviewCacheBuster(baseIframeSrc, refreshKey)
    : null;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [templateData, presetsData] = await Promise.all([
          apiClient.getCurrentUITemplate().catch(() => null),
          apiClient.getAvailableTemplatePresets().catch(() => [])
        ]);
        setPresets(presetsData as TemplatePreset[]);
        setActivePresetId(
          ((templateData as Record<string, unknown>)
            ?.template_preset as string) ?? ''
        );
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleCardClick = async (
    preset: TemplatePreset,
    opts?: { seededBlocks?: UIBlockConfig[]; draftPreviewToken?: string }
  ) => {
    setSelectedPreset(preset);
    setBaseIframeSrc(null);
    setRefreshKey(0);
    setIsApplied(false);
    setShowCustomizer(false);
    setSelectedBlockId(null);
    setHistory([]);
    setFuture([]);
    pendingHistoryRef.current = null;
    setLastSavedAt(null);
    setViewport('desktop');
    setCoverImage(preset.preview ?? null);
    setIsPreviewLoading(true);

    const isDedicated = preset.visibility === 'DEDICATED';
    const ds = getDesignSystem(preset.id);
    if (!isDedicated) {
      setPrimaryColor(ds.colors.primary);
      setBorderRadius(ds.shape.borderRadius);
      setShadow(ds.shape.shadow);
      setDarkMode(ds.darkMode);
      setFontFamily(ds.typography.fontFamily as FontFamily);
    }
    setDraftBlocks(opts?.seededBlocks ?? preset.blocks);

    try {
      // Generation has already written the seeded draft server-side; a re-apply
      // here would overwrite that copy with the bare preset, so skip it.
      if (!opts?.seededBlocks) {
        await apiClient.applyTemplatePreset(preset.id);
      }

      if (!isDedicated) {
        const { name: _omitName, ...themeSeed } = buildThemePayload(ds);
        await apiClient.saveThemeDraft(themeSeed);
      }

      const themeRaw = await apiClient
        .getCurrentThemeConfig()
        .catch(() => null);
      const cfg = ((themeRaw as Record<string, any> | null)?.data?.configs ??
        (themeRaw as Record<string, any> | null)?.configs ??
        {}) as Record<string, string | boolean | null>;

      if (isDedicated) {
        if (cfg.primary_color) setPrimaryColor(cfg.primary_color as string);
        if (cfg.border_radius_style)
          setBorderRadius(cfg.border_radius_style as BorderRadius);
        if (cfg.shadow_style) setShadow(cfg.shadow_style as Shadow);
        setDarkMode(
          cfg.dark_mode === 'true' || cfg.dark_mode === true
            ? true
            : cfg.dark_mode === 'false' || cfg.dark_mode === false
              ? false
              : null
        );
      }
      if (cfg.font_family) setFontFamily(cfg.font_family as FontFamily);
      if (cfg.section_spacing)
        setSectionSpacing(cfg.section_spacing as SectionSpacing);
      if (cfg.container_width)
        setContainerWidth(cfg.container_width as ContainerWidth);
      if (cfg.heading_scale) setHeadingScale(cfg.heading_scale as HeadingScale);

      setBaseIframeSrc(
        opts?.draftPreviewToken
          ? buildTemplatePreviewUrl(preset.id, null, {
              draft: true,
              token: opts.draftPreviewToken
            })
          : buildTemplatePreviewUrl(preset.id, null, { sample: !isDedicated })
      );
      setActivePresetId(preset.id);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setSelectedPreset(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Quick apply: apply the preset and publish it live without opening the
  // editor — the fast path for a returning manager who knows the template.
  const handleQuickApply = async (preset: TemplatePreset) => {
    try {
      setIsPreviewLoading(true);
      await apiClient.applyTemplatePreset(preset.id);
      const ds = getDesignSystem(preset.id);
      const { name: _omit, ...themeSeed } = buildThemePayload(ds);
      await apiClient.saveThemeDraft(themeSeed);
      await apiClient.publishSite();
      setActivePresetId(preset.id);
      ErrorHandler.showSuccess(`قالب «${preset.name}» منتشر شد`);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Field → recommended preset, mirrors Backend FIELD_CONTENT.recommendedPreset.
  const FIELD_PRESET: Record<AcademyField, string> = {
    language: 'flow',
    exam: 'flow',
    coding: 'code',
    arts: 'creative',
    business: 'flow',
    general: 'flow'
  };

  const handleGenerate = async (field: AcademyField) => {
    try {
      setIsGenerating(true);
      const result = await apiClient.generateTemplate({ field });
      // Open the editor on the just-generated preset. `template_preset` on the
      // response is the still-published one, so resolve from the field instead.
      const presetId = FIELD_PRESET[field];
      const preset = presets.find((p) => p.id === presetId);
      const seededBlocks = (result?.blocks as UIBlockConfig[]) ?? undefined;

      // Mint a preview token so the editor renders the seeded DRAFT (the
      // personalized site), not the bare catalog preset.
      const tokenRes = await apiClient
        .createTemplatePreviewToken()
        .catch(() => null);

      setShowGenerate(false);
      if (preset) {
        await handleCardClick(preset, {
          seededBlocks,
          draftPreviewToken: tokenRes?.token
        });
        ErrorHandler.showSuccess('سایت شما ساخته شد');
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const doPublish = async () => {
    setIsPublishing(true);
    try {
      await apiClient.publishSite();
      setIsApplied(true);
      ErrorHandler.showSuccess('قالب با موفقیت روی سایت منتشر شد');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClosePreview = () => {
    setSelectedPreset(null);
    setBaseIframeSrc(null);
    setShowCustomizer(false);
    setSelectedBlockId(null);
  };

  const refreshPresets = useCallback(async () => {
    const data = await apiClient.getAvailableTemplatePresets().catch(() => []);
    setPresets(data as TemplatePreset[]);
  }, []);

  const doDeleteTemplate = async (preset: TemplatePreset) => {
    try {
      await apiClient.deleteDedicatedTemplate(preset.id);
      await refreshPresets();
      ErrorHandler.showSuccess('قالب اختصاصی حذف شد');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isPublicPreset = selectedPreset?.visibility === 'PUBLIC';
  const academyName = user?.currentAcademy?.name ?? '';
  const saveMode: SaveMode = isAdmin
    ? isPublicPreset
      ? 'both'
      : 'admin-override'
    : 'copy';

  const flushStyleDraft = async () => {
    await apiClient.saveThemeDraft({
      border_radius_style: borderRadius,
      shadow_style: shadow,
      dark_mode: darkMode,
      font_family: fontFamily
    });
  };

  const doSaveAsCopy = async (name: string) => {
    setIsSaving(true);
    try {
      await flushStyleDraft();
      await apiClient.saveUITemplateDraft({ blocks: draftBlocks });
      const saved = (await apiClient.saveDraftAsTemplate({
        name,
        preview: coverImage ?? undefined
      })) as TemplatePreset | null;
      if (saved) {
        setSelectedPreset(saved);
        setCoverImage(saved.preview ?? null);
      }
      await refreshPresets();
      ErrorHandler.showSuccess(`قالب اختصاصی "${name}" ذخیره شد`);
      handleClosePreview();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const doSaveOverride = async () => {
    if (!selectedPreset) return;
    setIsSaving(true);
    try {
      await flushStyleDraft();
      await apiClient.saveUITemplateDraft({ blocks: draftBlocks });
      if (isAdmin && isPublicPreset) {
        await apiClient.overridePublicTemplate(selectedPreset.id, {
          blocks: draftBlocks,
          ...(coverImage ? { preview: coverImage } : {})
        });
      } else {
        const saved = (await apiClient.saveDraftAsTemplate({
          name: selectedPreset.name,
          preview: coverImage ?? undefined
        })) as TemplatePreset | null;
        if (saved) {
          setSelectedPreset(saved);
          setCoverImage(saved.preview ?? null);
        }
      }
      await refreshPresets();
      ErrorHandler.showSuccess(`قالب "${selectedPreset.name}" به‌روزرسانی شد`);
      handleClosePreview();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Draft save helpers ──────────────────────────────────────────────────────

  const saveThemeDraft = useCallback(
    async (color: string, br: BorderRadius, sh: Shadow, dm: boolean | null) => {
      setIsSaving(true);
      try {
        const payload = buildThemeDraftFromPrimary(color, {
          borderRadius: br,
          shadow: sh,
          backgroundSvgPattern: ''
        });
        await apiClient.saveThemeDraft({ ...payload, dark_mode: dm });
        setRefreshKey((k) => k + 1);
        setLastSavedAt(Date.now());
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const saveBlocksDraft = useCallback(async (blocks: UIBlockConfig[]) => {
    setIsSaving(true);
    try {
      await apiClient.saveUITemplateDraft({ blocks });
      setRefreshKey((k) => k + 1);
      setLastSavedAt(Date.now());
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const debouncedSaveTheme = useDebouncedCallback(saveThemeDraft, 800);
  const debouncedSaveBlocks = useDebouncedCallback(saveBlocksDraft, 800);

  const pushHistory = useCallback((snapshot: UIBlockConfig[]) => {
    setHistory((h) => {
      const next = [...h, snapshot];
      return next.length > HISTORY_LIMIT ? next.slice(1) : next;
    });
    setFuture([]);
  }, []);

  const flushPendingHistory = useCallback(() => {
    if (pendingHistoryRef.current) {
      pushHistory(pendingHistoryRef.current);
      pendingHistoryRef.current = null;
    }
  }, [pushHistory]);

  const debouncedFlushHistory = useDebouncedCallback(flushPendingHistory, 600);

  // Discrete structural change (move/delete/duplicate/reorder/visibility) —
  // each is its own undo step, so any in-progress typing burst is finalized
  // first, then the current state is snapshotted.
  const commitBlocks = useCallback(
    (next: UIBlockConfig[]) => {
      flushPendingHistory();
      pushHistory(draftBlocks);
      setDraftBlocks(next);
      debouncedSaveBlocks(next);
    },
    [draftBlocks, flushPendingHistory, pushHistory, debouncedSaveBlocks]
  );

  // Continuous content edit (typing) — coalesced into one undo step.
  const commitContent = useCallback(
    (next: UIBlockConfig[]) => {
      if (pendingHistoryRef.current === null) {
        pendingHistoryRef.current = draftBlocks;
      }
      setDraftBlocks(next);
      debouncedSaveBlocks(next);
      debouncedFlushHistory();
    },
    [draftBlocks, debouncedSaveBlocks, debouncedFlushHistory]
  );

  const undo = useCallback(() => {
    // An unfinished typing burst is the most recent step to reverse.
    if (pendingHistoryRef.current) {
      const prev = pendingHistoryRef.current;
      pendingHistoryRef.current = null;
      setFuture((f) => [...f, draftBlocks]);
      setDraftBlocks(prev);
      void saveBlocksDraft(prev);
      return;
    }
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [...f, draftBlocks]);
    setDraftBlocks(prev);
    void saveBlocksDraft(prev);
  }, [history, draftBlocks, saveBlocksDraft]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const nextState = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setHistory((h) => [...h, draftBlocks]);
    setDraftBlocks(nextState);
    void saveBlocksDraft(nextState);
  }, [future, draftBlocks, saveBlocksDraft]);

  useEffect(() => {
    if (!selectedPreset) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPreset, undo, redo]);

  // ── Customizer handlers ─────────────────────────────────────────────────────

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    debouncedSaveTheme(color, borderRadius, shadow, darkMode);
  };

  const handleBorderRadiusChange = (br: BorderRadius) => {
    setBorderRadius(br);
    debouncedSaveTheme(primaryColor, br, shadow, darkMode);
  };

  const handleDarkModeChange = (dm: boolean | null) => {
    setDarkMode(dm);
    debouncedSaveTheme(primaryColor, borderRadius, shadow, dm);
  };

  const handleFontFamilyChange = (f: FontFamily) => {
    setFontFamily(f);
    setIsSaving(true);
    apiClient
      .saveThemeDraft({ font_family: f })
      .then(() => {
        setRefreshKey((k) => k + 1);
        setLastSavedAt(Date.now());
      })
      .catch((error) => ErrorHandler.handleApiError(error))
      .finally(() => setIsSaving(false));
  };

  const handleDesignSizeChange = (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => {
    if (patch.section_spacing) setSectionSpacing(patch.section_spacing);
    if (patch.container_width) setContainerWidth(patch.container_width);
    if (patch.heading_scale) setHeadingScale(patch.heading_scale);
    setIsSaving(true);
    apiClient
      .saveThemeDraft(patch)
      .then(() => {
        setRefreshKey((k) => k + 1);
        setLastSavedAt(Date.now());
      })
      .catch((error) => ErrorHandler.handleApiError(error))
      .finally(() => setIsSaving(false));
  };

  const handleBlocksChange = (blocks: UIBlockConfig[]) => commitBlocks(blocks);

  const handleBlockConfigChange = (
    blockId: string,
    config: Record<string, unknown>
  ) => {
    commitContent(
      draftBlocks.map((b) => (b.id === blockId ? { ...b, config } : b))
    );
  };

  const handleBlockMove = (blockId: string, dir: 'up' | 'down') => {
    const sorted = [...draftBlocks].sort((a, b) => a.order - b.order);
    const header = sorted.find((b) => b.type === 'header');
    const footer = sorted.find((b) => b.type === 'footer');
    const middle = sorted.filter(
      (b) => b.type !== 'header' && b.type !== 'footer'
    );
    const i = middle.findIndex((b) => b.id === blockId);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= middle.length) return;
    [middle[i], middle[j]] = [middle[j], middle[i]];
    const next = [
      ...(header ? [header] : []),
      ...middle,
      ...(footer ? [footer] : [])
    ].map((block, index) => ({ ...block, order: index + 1 }));
    commitBlocks(next);
  };

  const handleBlockDelete = (blockId: string) => {
    const block = draftBlocks.find((b) => b.id === blockId);
    if (!block || block.type === 'header' || block.type === 'footer') return;
    const next = draftBlocks
      .filter((b) => b.id !== blockId)
      .sort((a, b) => a.order - b.order)
      .map((b, index) => ({ ...b, order: index + 1 }));
    setSelectedBlockId(null);
    commitBlocks(next);
  };

  const handleBlockToggleVisible = (blockId: string, visible: boolean) => {
    commitBlocks(
      draftBlocks.map((b) =>
        b.id === blockId ? { ...b, isVisible: visible } : b
      )
    );
  };

  const handleBlockDuplicate = (blockId: string) => {
    const block = draftBlocks.find((b) => b.id === blockId);
    if (!block || block.type === 'header' || block.type === 'footer') return;
    const clone: UIBlockConfig = {
      ...block,
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${block.id}-copy-${Date.now()}`,
      config: { ...(block.config ?? {}) }
    };
    const sorted = [...draftBlocks].sort((a, b) => a.order - b.order);
    const at = sorted.findIndex((b) => b.id === blockId);
    const next = [
      ...sorted.slice(0, at + 1),
      clone,
      ...sorted.slice(at + 1)
    ].map((b, index) => ({ ...b, order: index + 1 }));
    commitBlocks(next);
  };

  const handleOpenPicker = (target?: { blockId: string; type: string }) => {
    setPickerTarget(target ?? null);
    setPickerOpen(true);
  };

  const handleSectionPicked = async () => {
    try {
      const data = (await apiClient.getCurrentUITemplate()) as Record<
        string,
        unknown
      > | null;
      const blocks = (data?.draft_blocks ?? data?.blocks) as
        | UIBlockConfig[]
        | undefined;
      if (blocks) setDraftBlocks(blocks);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const handleBannerImageChange = (url: string) => {
    commitBlocks(
      draftBlocks.map((b) =>
        b.type === 'hero' || b.type === 'slideshow'
          ? {
              ...b,
              config: {
                ...(b.config ?? {}),
                backgroundImage: url,
                bgImage: url,
                bgType: 'image'
              }
            }
          : b
      )
    );
  };

  const handleReset = async () => {
    if (!selectedPreset) return;
    const ds = getDesignSystem(selectedPreset.id);
    if (ds) {
      setPrimaryColor(ds.colors.primary);
      setBorderRadius(ds.shape.borderRadius);
      setShadow(ds.shape.shadow);
      setDarkMode(ds.darkMode);
      setFontFamily(ds.typography.fontFamily as FontFamily);
      await saveThemeDraft(
        ds.colors.primary,
        ds.shape.borderRadius,
        ds.shape.shadow,
        ds.darkMode
      );
    }
    setDraftBlocks(selectedPreset.blocks);
    setHistory([]);
    setFuture([]);
    pendingHistoryRef.current = null;
    await saveBlocksDraft(selectedPreset.blocks);
  };

  // ── Save confirmation ───────────────────────────────────────────────────────

  const defaultForkName =
    selectedPreset && academyName
      ? `${academyName} - ${selectedPreset.name}`
      : (selectedPreset?.name ?? '');

  const closeConfirm = () => setPendingSave(null);

  const confirmDialog = (() => {
    if (!pendingSave) return null;
    switch (pendingSave.kind) {
      case 'publish':
        return (
          <TemplateConfirmDialog
            open
            title="انتشار قالب در سایت"
            description="قالب و تنظیمات فعلی روی سایت عمومی آکادمی شما منتشر می‌شود."
            confirmLabel="انتشار"
            onConfirm={() => {
              closeConfirm();
              void doPublish();
            }}
            onCancel={closeConfirm}
          />
        );
      case 'override': {
        const isMasterOverride = isAdmin && isPublicPreset;
        return (
          <TemplateConfirmDialog
            open
            title={isMasterOverride ? 'ذخیره قالب اصلی' : 'ذخیره قالب اختصاصی'}
            description={
              isMasterOverride
                ? 'این تغییرات روی قالب همه مدیران اعمال می‌شود.'
                : 'تغییرات روی قالب اختصاصی شما ذخیره می‌شود.'
            }
            confirmLabel="ذخیره"
            onConfirm={() => {
              closeConfirm();
              void doSaveOverride();
            }}
            onCancel={closeConfirm}
          />
        );
      }
      case 'fork':
        return (
          <TemplateConfirmDialog
            open
            title="ساخت نسخهٔ اختصاصی"
            description="یک نسخه اختصاصی با نام آکادمی شما ساخته می‌شود؛ در صورت نیاز نام را تغییر دهید."
            confirmLabel="ساخت نسخهٔ اختصاصی"
            defaultName={defaultForkName}
            onConfirm={(name) => {
              closeConfirm();
              if (name) void doSaveAsCopy(name);
            }}
            onCancel={closeConfirm}
          />
        );
      case 'delete': {
        const { preset } = pendingSave;
        return (
          <TemplateConfirmDialog
            open
            destructive
            title="حذف قالب اختصاصی"
            description={`قالب اختصاصی «${preset.name}» برای همیشه حذف می‌شود.`}
            confirmLabel="حذف"
            onConfirm={() => {
              closeConfirm();
              void doDeleteTemplate(preset);
            }}
            onCancel={closeConfirm}
          />
        );
      }
    }
  })();

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-full bg-stone-50 p-8" dir="rtl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <Skeleton className="mb-3 h-8 w-44" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-52 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Preview / editor mode ─────────────────────────────────────────────────

  if (selectedPreset) {
    const ds = getDesignSystem(selectedPreset.id);
    const colors = resolveTemplateColors(selectedPreset);
    const selectedBlock =
      draftBlocks.find((b) => b.id === selectedBlockId) ?? null;
    const middleBlocks = [...draftBlocks]
      .sort((a, b) => a.order - b.order)
      .filter((b) => b.type !== 'header' && b.type !== 'footer');
    const midIndex = selectedBlock
      ? middleBlocks.findIndex((b) => b.id === selectedBlock.id)
      : -1;
    const isEditingMaster = isAdmin && isPublicPreset && showCustomizer;

    const VIEWPORTS: {
      mode: ViewportMode;
      icon: typeof Monitor;
      label: string;
    }[] = [
      { mode: 'mobile', icon: Smartphone, label: 'موبایل' },
      { mode: 'tablet', icon: Tablet, label: 'تبلت' },
      { mode: 'desktop', icon: Monitor, label: 'دسکتاپ' }
    ];

    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-zinc-950">
        {confirmDialog}

        {/* Action bar */}
        <div className="flex flex-shrink-0 items-center gap-2 bg-zinc-900 px-4 py-2.5">
          <button
            type="button"
            title="بستن پیش‌نمایش"
            onClick={handleClosePreview}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="text-sm font-semibold text-white">
            {selectedPreset.name}
          </span>

          {isAdmin && isPublicPreset && (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              قالب اصلی
            </span>
          )}

          {/* Draft status chip */}
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isSaving
                  ? 'animate-pulse bg-amber-400'
                  : isEditingMaster
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
              }`}
            />
            <span className="text-[11px] text-zinc-400">
              {isSaving
                ? 'در حال ذخیره...'
                : savedAgo
                  ? `ذخیره شد ${savedAgo}`
                  : isEditingMaster
                    ? 'در حال ویرایش قالب اصلی'
                    : 'پیش‌نمایش زنده'}
            </span>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="واگرد (Ctrl+Z)"
              onClick={undo}
              disabled={history.length === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-30"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="ازنو (Ctrl+Y)"
              onClick={redo}
              disabled={future.length === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-30"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Viewport switcher */}
            <div className="flex items-center gap-0.5 rounded-lg bg-zinc-800 p-0.5">
              {VIEWPORTS.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  title={label}
                  onClick={() => setViewport(mode)}
                  className={`flex h-6 w-7 items-center justify-center rounded-md transition-colors ${
                    viewport === mode
                      ? 'bg-white text-zinc-900'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {ds.tagline && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                style={{ background: colors.primary }}
              >
                {ds.tagline}
              </span>
            )}

            <Button
              size="sm"
              onClick={() => setShowCustomizer((v) => !v)}
              className={`h-8 gap-1.5 px-3 text-xs font-semibold ${
                showCustomizer
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
              }`}
            >
              {isAdmin ? (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  ویرایش
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  سفارشی‌سازی
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={() => setPendingSave({ kind: 'publish' })}
              disabled={isApplied || isPublishing}
              className="h-8 gap-1.5 bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-70"
            >
              {isApplied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  منتشر شد
                </>
              ) : isPublishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  در حال انتشار...
                </>
              ) : (
                'انتشار در سایت'
              )}
            </Button>
          </div>
        </div>

        {/* Content: sidebar + section panel + preview */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {showCustomizer && (
            <TemplateCustomizationSidebar
              primaryColor={primaryColor}
              fontFamily={fontFamily}
              borderRadius={borderRadius}
              shadow={shadow}
              darkMode={darkMode}
              sectionSpacing={sectionSpacing}
              containerWidth={containerWidth}
              headingScale={headingScale}
              blocks={draftBlocks}
              isSaving={isSaving}
              onColorChange={handleColorChange}
              onFontFamilyChange={handleFontFamilyChange}
              onBorderRadiusChange={handleBorderRadiusChange}
              onDarkModeChange={handleDarkModeChange}
              onDesignSizeChange={handleDesignSizeChange}
              onBlocksChange={handleBlocksChange}
              onBannerImageChange={handleBannerImageChange}
              onOpenPicker={handleOpenPicker}
              onReset={handleReset}
              saveMode={saveMode}
              onSaveAsCopy={() => setPendingSave({ kind: 'fork' })}
              onSaveOverride={() => setPendingSave({ kind: 'override' })}
              onClose={() => setShowCustomizer(false)}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              coverImage={coverImage}
              onCoverImageChange={setCoverImage}
            />
          )}

          {selectedBlock && (
            <SectionCustomizationPanel
              block={selectedBlock}
              canMoveUp={midIndex > 0}
              canMoveDown={midIndex >= 0 && midIndex < middleBlocks.length - 1}
              canDelete={
                selectedBlock.type !== 'header' &&
                selectedBlock.type !== 'footer'
              }
              onUpdate={handleBlockConfigChange}
              onMove={handleBlockMove}
              onDelete={handleBlockDelete}
              onDuplicate={handleBlockDuplicate}
              onToggleVisible={handleBlockToggleVisible}
              onClose={() => setSelectedBlockId(null)}
            />
          )}

          <SectionLibraryModal
            open={pickerOpen}
            swapTarget={pickerTarget}
            onClose={() => setPickerOpen(false)}
            onImported={handleSectionPicked}
          />

          <EditorPreview
            viewport={viewport}
            iframeSrc={iframeSrc}
            isLoading={isPreviewLoading}
            title={`Preview: ${selectedPreset.name}`}
          />
        </div>
      </div>
    );
  }

  // ── Gallery mode ──────────────────────────────────────────────────────────

  const academyPresets = presets.filter((p) => p.visibility === 'DEDICATED');
  const platformPresets = presets.filter((p) => p.visibility === 'PUBLIC');
  const filteredPlatform =
    categoryFilter === 'all'
      ? platformPresets
      : platformPresets.filter(
          (p) => getTemplateCategory(p) === categoryFilter
        );
  const activePreset = presets.find((p) => p.id === activePresetId) ?? null;

  return (
    <div className="min-h-full bg-[#f2ece4] p-8" dir="rtl">
      {confirmDialog}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            قالب‌های آماده
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            یک قالب کامل فارسی انتخاب کنید تا پیش‌نمایش کامل ببینید — مستقیم روی
            آن کلیک کنید
          </p>
        </div>
      </div>

      {/* Lead action — generate a starter site from the academy's field */}
      <button
        type="button"
        onClick={() => setShowGenerate(true)}
        className="mb-6 flex w-full items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/10 to-primary/5 px-5 py-4 text-right transition-colors hover:from-primary/15"
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Wand2 className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className="text-base font-bold text-foreground">
            ساخت خودکار سایت
          </p>
          <p className="text-sm text-muted-foreground">
            بگویید آکادمی شما چه آموزش می‌دهد تا یک سایت آماده با متن‌های مرتبط
            بسازیم
          </p>
        </div>
        <span className="hidden flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:block">
          شروع
        </span>
      </button>

      <GenerateTemplateDialog
        open={showGenerate}
        academyName={academyName || 'آکادمی'}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        onClose={() => setShowGenerate(false)}
      />

      {/* Currently live callout */}
      {activePreset && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-900">
              قالب فعلی: {activePreset.name}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-emerald-300 text-xs text-emerald-800"
            onClick={() => handleCardClick(activePreset)}
          >
            <Pencil className="h-3.5 w-3.5" />
            ویرایش
          </Button>
        </div>
      )}

      {/* Category filter bar */}
      {platformPresets.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORY_LABELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                categoryFilter === value
                  ? 'bg-foreground text-background'
                  : 'border border-border/60 bg-background text-muted-foreground hover:bg-muted/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {presets.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 text-center">
          <LayoutTemplate className="mb-4 h-10 w-10 text-muted-foreground/60" />
          <h2 className="text-lg font-semibold text-foreground">
            هنوز قالبی تعریف نشده
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            کاتالوگ قالب‌های آماده خالی است. پس از افزودن قالب‌های جدید، اینجا
            نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredPlatform.length > 0 && (
            <TemplateSection
              title="قالب‌های پلتفرم"
              description="کاتالوگ آماده پلتفرم؛ برای شروع یک قالب را انتخاب و سفارشی کنید."
              presets={filteredPlatform}
              activePresetId={activePresetId}
              onSelect={handleCardClick}
              onQuickApply={handleQuickApply}
              onDelete={(preset) => setPendingSave({ kind: 'delete', preset })}
            />
          )}
          {academyPresets.length > 0 && (
            <TemplateSection
              title="قالب‌های آکادمی ها"
              description="قالب‌های اختصاصی."
              presets={academyPresets}
              activePresetId={activePresetId}
              onSelect={handleCardClick}
              onQuickApply={handleQuickApply}
              onDelete={(preset) => setPendingSave({ kind: 'delete', preset })}
            />
          )}
        </div>
      )}
    </div>
  );
}
