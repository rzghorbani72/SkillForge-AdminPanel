'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Redo2,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { VisitSiteLink } from '@/components/shared/visit-site-link';
import type { TemplatePreset, UIBlockConfig, UITemplate } from '@/types/api';
import { presetSourceKey, formatPresetDisplayName } from '@/lib/ui-template/preset-source';
import { getDesignSystem, buildThemePayload } from '@/lib/design-systems';
import {
  buildTemplatePreviewUrl,
  appendPreviewCacheBuster,
  resolveStorefrontBaseUrl,
} from '@/lib/ui-template/preview-url';
import { getPreviewPostMessageTarget, isTrustedPreviewOrigin } from '@/lib/trusted-preview-origin';
import { uploadCanvasMedia } from '@/lib/ui-template/canvas-media-upload';
import type { HeroPreviewContext } from '@/components/ui-template/hero-variant-picker';
import { buildThemeDraftFromPrimary } from '@/lib/ui-template/theme-draft-payload';
import { buildFullThemePayload, type ThemeSyncState } from '@/lib/ui-template/theme-sync';
import { useRelativeTime } from '@/lib/ui-template/use-relative-time';
import {
  TemplateCustomizationSidebar,
  type SaveMode,
} from '@/components/ui-template/template-customization-sidebar';
import { SectionLibraryModal } from '@/components/ui-template/section-library-modal';
import { TemplateConfirmDialog } from '@/components/ui-template/template-confirm-dialog';
import { EditorPreview } from '@/components/ui-template/editor-preview';
import {
  TemplateMediaPicker,
  type TemplateMediaPickerHandle,
} from '@/components/ui-template/template-media-picker';
import {
  TemplateSection,
  resolveTemplateColors,
  getTemplateCategory,
} from '@/components/ui-template/gallery-cards';
import { CATEGORY_LABELS, type TemplateCategory } from '@/constants/template-names';
import type {
  BorderRadius,
  ElementAnimation,
  Shadow,
  SectionSpacing,
  ContainerWidth,
  HeadingScale,
  FontFamily,
  TextDirection,
  ViewportMode,
} from '@/components/ui-template/sidebar-types';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { useTranslation } from '@/lib/i18n/hooks';

// Commit action awaiting explicit confirmation. Saving is never gated — it
// always lands on the academy's one copy — so only the destructive or
// outward-facing steps ask first.
type PendingSave =
  | { kind: 'publish' }
  | { kind: 'quickApply'; preset: TemplatePreset }
  | { kind: 'reset' }
  | { kind: 'delete'; preset: TemplatePreset };

const HISTORY_LIMIT = 30;
const PREVIEW_LOAD_GUARD_MS = 8000;

export const APPEARANCE_LIST_PATH = '/website/appearance/list';
export const appearanceEditorPath = (presetId: string) =>
  `/website/appearance/${encodeURIComponent(presetId)}`;

/**
 * Gallery and editor share one component but live on two routes:
 * `/website/appearance/list` (no slug) and `/website/appearance/[slug]`, so
 * opening or closing a template is a real navigation, never a query-param
 * re-render of the same page.
 */
export function AppearanceWorkspace({ slug }: { slug?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const templateParam = slug ?? null;
  const { user } = useAuthUser();
  const currentAcademy = useCurrentAcademy();

  const [presets, setPresets] = useState<TemplatePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(null);
  const [baseIframeSrc, setBaseIframeSrc] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  // "Applied" = the public site already shows this draft. Any draft save clears
  // it, so the publish button only rests while live and draft are identical.
  const [isApplied, setIsApplied] = useState(false);
  const hasUnpublishedRef = useRef(false);
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');

  // Customizer state
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [fontFamily, setFontFamily] = useState<FontFamily>('vazirmatn');
  const [borderRadius, setBorderRadius] = useState<BorderRadius>('soft');
  const [shadow, setShadow] = useState<Shadow>('medium');
  const [elementAnimation, setElementAnimation] = useState<ElementAnimation>('subtle');
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [textDirection, setTextDirection] = useState<TextDirection>('rtl');
  const [sectionSpacing, setSectionSpacing] = useState<SectionSpacing>('comfortable');
  const [containerWidth, setContainerWidth] = useState<ContainerWidth>('standard');
  const [headingScale, setHeadingScale] = useState<HeadingScale>('standard');
  const [draftBlocks, setDraftBlocks] = useState<UIBlockConfig[]>([]);
  const [history, setHistory] = useState<UIBlockConfig[][]>([]);
  const [future, setFuture] = useState<UIBlockConfig[][]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const markDraftSaved = useCallback(() => {
    setLastSavedAt(Date.now());
    setIsApplied(false);
  }, []);
  const [isPublishing, setIsPublishing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    blockId: string;
    type: string;
  } | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [storefrontBase, setStorefrontBase] = useState<string | null>(null);
  // Only a customized (dedicated) card renders a live iframe — it is the one
  // case a static banner can't represent, since it's this academy's own
  // edited copy. Public catalog cards never need this session.
  const [galleryPreviewToken, setGalleryPreviewToken] = useState<string | null>(null);
  const [galleryStorefrontUrl, setGalleryStorefrontUrl] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);
  // Preview data source: false = placeholder/sample design, true = the academy's
  // real backend records (courses, stats) so the manager sees the live site view.
  // Persisted in localStorage so the preference survives editor close/reopen.
  const [useRealData, setUseRealData] = useState(
    () => localStorage.getItem('preview_real_data') === '1',
  );

  // A typing burst captures the pre-burst block state once; it is committed to
  // history only after the user pauses, so undo jumps per edit, not per key.
  const pendingHistoryRef = useRef<UIBlockConfig[] | null>(null);
  // Ctrl+S must always call the CURRENT save closure without re-binding the
  // keydown listener on every render.
  const saveRef = useRef<() => Promise<void>>(async () => {});
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const storefrontBaseRef = useRef(storefrontBase);
  useEffect(() => {
    storefrontBaseRef.current = storefrontBase;
  }, [storefrontBase]);
  const mediaPickerRef = useRef<TemplateMediaPickerHandle>(null);
  // Stable ref so the message handler always sees the latest blocks without
  // re-registering the listener on every keystroke.
  const draftBlocksRef = useRef(draftBlocks);
  useEffect(() => {
    draftBlocksRef.current = draftBlocks;
  }, [draftBlocks]);
  // Ref for handleBlockConfigChange — initialised to a no-op and patched after
  // the function is declared further below (avoids "used before declaration").
  const handleBlockConfigChangeRef = useRef<
    (blockId: string, config: Record<string, unknown>, options?: { syncPreview?: boolean }) => void
  >(() => {
    /* patched after declaration */
  });
  const handleBlockDeleteRef = useRef<(blockId: string) => void>(() => {});
  const handleBlockToggleVisibleRef = useRef<(blockId: string, visible: boolean) => void>(() => {});
  const handleBlockMoveRef = useRef<(blockId: string, dir: 'up' | 'down') => void>(() => {});
  // The canvas offers "undo" right after a hide/remove, so it needs the same
  // history step the toolbar's undo button uses.
  const undoRef = useRef<() => void>(() => {});
  // Same pattern: the message listener is registered before the debounced
  // rebuild exists, so it reaches it through a ref.
  const debouncedRebuildPreviewRef = useRef<() => void>(() => {
    /* patched after declaration */
  });
  const previewLoadingRef = useRef(false);
  const rebuildQueuedRef = useRef(false);
  const rebuildPreviewRef = useRef<() => void>(() => {});

  // Tell the in-canvas preview which section is selected, so it shows the dashed
  // outline. `scroll` is true only when the user picked a section — a reload
  // re-paints the ring in place so the canvas never jumps.
  const postHighlight = useCallback((blockId: string | null, scroll: boolean) => {
    previewIframeRef.current?.contentWindow?.postMessage(
      { source: 'template-admin', type: 'highlight', blockId, scroll },
      getPreviewPostMessageTarget(storefrontBaseRef.current),
    );
  }, []);
  // Read by the 'ready' handshake, which fires outside React's render cycle.
  const selectedBlockIdRef = useRef(selectedBlockId);
  useEffect(() => {
    selectedBlockIdRef.current = selectedBlockId;
  }, [selectedBlockId]);

  // Receive messages from the preview canvas:
  // - 'select'      → click-to-select a section, opens its edit panel
  // - 'field-update' → inline text edit committed, update draftBlocks directly
  // - 'list-update'  → inline edit inside a repeated list, rewrites the array
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!isTrustedPreviewOrigin(e.origin, storefrontBaseRef.current)) {
        return;
      }

      const data = e.data as {
        source?: string;
        type?: string;
        blockId?: string;
        fieldKey?: string;
        value?: string;
        listKey?: string;
        items?: unknown[];
        restore?: boolean;
        restoreKey?: string;
        action?: string;
        fileName?: string;
        mimeType?: string;
        kind?: 'image' | 'video';
        buffer?: ArrayBuffer;
        message?: string;
      };
      if (data?.source !== 'template-editor') return;

      if (data.type === 'media-error' && data.message) {
        ErrorHandler.showError(data.message);
      }

      // Preview finished (re)hydrating — restore the selection ring without
      // scrolling, so a save-triggered reload keeps the manager in place.
      if (data.type === 'ready') {
        previewLoadingRef.current = false;
        postHighlight(selectedBlockIdRef.current, false);
        if (rebuildQueuedRef.current) {
          rebuildQueuedRef.current = false;
          rebuildPreviewRef.current();
        }
      }

      // Ctrl/Cmd+S pressed inside the canvas: the iframe owns the key event, so
      // the shortcut only reaches the editor by being forwarded here.
      if (data.type === 'save') {
        void saveRef.current();
      }

      // The preview could not patch an edit in place — rebuild it. Scroll and
      // selection are preserved across the rebuild, so this stays unobtrusive.
      if (data.type === 'needs-reload') {
        debouncedRebuildPreviewRef.current();
      }

      if (data.type === 'select' && data.blockId) {
        setSelectedBlockId(data.blockId);
        setShowCustomizer(true);
      }

      if (data.type === 'field-update' && data.blockId && data.fieldKey) {
        handleBlockConfigChangeRef.current(data.blockId, {
          [data.fieldKey]: data.value ?? '',
        });
      }

      // Inline edit inside a repeated list — the canvas sends the whole array
      // so untouched items and their non-text fields are preserved.
      if (
        data.type === 'list-update' &&
        data.blockId &&
        data.listKey &&
        Array.isArray(data.items)
      ) {
        handleBlockConfigChangeRef.current(
          data.blockId,
          { [data.listKey]: data.items },
          { syncPreview: false },
        );
      }

      if (data.type === 'open-media-picker' && data.blockId && data.fieldKey) {
        mediaPickerRef.current?.open({
          blockId: data.blockId,
          fieldKey: data.fieldKey,
        });
      }

      if (
        data.type === 'media-file-selected' &&
        data.blockId &&
        data.fieldKey &&
        data.buffer instanceof ArrayBuffer
      ) {
        const fileName = typeof data.fileName === 'string' ? data.fileName : 'section-media.jpg';
        const mimeType = typeof data.mimeType === 'string' ? data.mimeType : 'image/jpeg';
        const file = new File([data.buffer], fileName, { type: mimeType });
        // The upload button lives in the canvas, so the canvas is where the
        // progress belongs — the panel only knows the percentages.
        const postUploadState = (uploading: boolean, percent: number) =>
          previewIframeRef.current?.contentWindow?.postMessage(
            {
              source: 'template-admin',
              type: 'media-uploading',
              blockId: data.blockId,
              fieldKey: data.fieldKey,
              uploading,
              percent,
            },
            getPreviewPostMessageTarget(storefrontBaseRef.current),
          );
        void (async () => {
          try {
            postUploadState(true, 0);
            const patch = await uploadCanvasMedia(
              data.kind ?? 'image',
              file,
              data.fieldKey!,
              (percent) => postUploadState(true, percent),
            );
            if (!patch) return;
            // "Restore with photo": land the visibility flag and the uploaded
            // URL in the same patch, so this is the slot's only reload.
            handleBlockConfigChangeRef.current(data.blockId!, {
              ...patch,
              ...(data.restoreKey ? { [data.restoreKey]: true } : {}),
            });
          } catch (error) {
            ErrorHandler.handleApiError(error);
          } finally {
            postUploadState(false, 100);
          }
        })();
      }

      if (data.type === 'accent-color-update' && data.blockId && data.fieldKey && data.value) {
        handleBlockConfigChangeRef.current(data.blockId, {
          [data.fieldKey]: data.value,
        });
      }

      if (data.type === 'toggle-removable' && data.blockId && data.fieldKey) {
        handleBlockConfigChangeRef.current(data.blockId, {
          [data.fieldKey]: data.restore === true,
        });
      }

      if (data.type === 'undo') {
        undoRef.current();
      }

      if (data.type === 'block-action' && data.blockId && data.action) {
        switch (data.action) {
          case 'hide':
            handleBlockToggleVisibleRef.current(data.blockId, false);
            break;
          case 'delete':
            handleBlockDeleteRef.current(data.blockId);
            break;
          case 'move-up':
            handleBlockMoveRef.current(data.blockId, 'up');
            break;
          case 'move-down':
            handleBlockMoveRef.current(data.blockId, 'down');
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postHighlight]);

  // The user picked a section — bring it into view.
  useEffect(() => {
    postHighlight(selectedBlockId, true);
  }, [selectedBlockId, postHighlight]);

  const savedAgo = useRelativeTime(lastSavedAt);

  const iframeSrc = baseIframeSrc ? appendPreviewCacheBuster(baseIframeSrc, refreshKey) : null;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [templateData, presetsData, previewSession] = await Promise.all([
          apiClient.getCurrentUITemplate().catch(() => null),
          apiClient.getAvailableTemplatePresets().catch(() => []),
          apiClient.getTemplatePreviewSession().catch(() => null),
        ]);
        setPresets(presetsData as TemplatePreset[]);
        setActivePresetId(
          ((templateData as Record<string, unknown>)?.template_preset as string) ?? '',
        );
        hasUnpublishedRef.current =
          (templateData as UITemplate | null)?.has_unpublished_changes ?? false;
        if (previewSession?.token) {
          setGalleryPreviewToken(previewSession.token);
          setGalleryStorefrontUrl(
            resolveStorefrontBaseUrl(previewSession.storefrontBaseUrl) ?? null,
          );
        }
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Editor route: open the slug's template once the gallery has loaded. The ref
  // makes it a one-shot per id; an unknown slug falls back to the list.
  const openedFromUrlRef = useRef<string | null>(null);
  useEffect(() => {
    if (!templateParam || isLoading || presets.length === 0) return;
    if (openedFromUrlRef.current === templateParam) return;
    const preset = presets.find((p) => p.id === templateParam);
    if (!preset) {
      router.replace(APPEARANCE_LIST_PATH);
      return;
    }
    openedFromUrlRef.current = templateParam;
    void handleCardClick(preset);
    // handleCardClick is recreated every render; the ref guard is what keeps
    // this from re-firing, so it is deliberately not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateParam, isLoading, presets]);

  // From the list, a card is a navigation to the editor route.
  const openTemplate = (preset: TemplatePreset) => {
    router.push(appearanceEditorPath(preset.id));
  };

  const handleCardClick = async (
    preset: TemplatePreset,
    opts?: {
      seededBlocks?: UIBlockConfig[];
      draftPreviewSession?: {
        token: string;
        storefrontBaseUrl: string | null;
      } | null;
    },
  ) => {
    setSelectedPreset(preset);
    setBaseIframeSrc(null);
    setPreviewToken(null);
    setRefreshKey(0);
    setIsApplied(preset.id === activePresetId && !hasUnpublishedRef.current);
    setShowCustomizer(false);
    setSelectedBlockId(null);
    setHistory([]);
    setFuture([]);
    pendingHistoryRef.current = null;
    setLastSavedAt(null);
    setViewport('desktop');
    setIsPreviewLoading(true);
    // Mark this id as opened so the route effect does not open it twice; keep
    // the URL honest when the editor itself swaps to another preset (reset).
    openedFromUrlRef.current = preset.id;
    if (preset.id !== slug) {
      router.replace(appearanceEditorPath(preset.id), { scroll: false });
    }

    const isDedicated = preset.visibility === 'DEDICATED';
    const ds = getDesignSystem(presetSourceKey(preset));
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

      const themeRaw = await apiClient.getCurrentThemeConfig().catch(() => null);
      const cfg = ((themeRaw as Record<string, any> | null)?.data?.configs ??
        (themeRaw as Record<string, any> | null)?.configs ??
        {}) as Record<string, string | boolean | null>;

      if (isDedicated) {
        if (cfg.primary_color) setPrimaryColor(cfg.primary_color as string);
        if (cfg.border_radius_style) setBorderRadius(cfg.border_radius_style as BorderRadius);
        if (cfg.shadow_style) setShadow(cfg.shadow_style as Shadow);
        setDarkMode(
          cfg.dark_mode === 'true' || cfg.dark_mode === true
            ? true
            : cfg.dark_mode === 'false' || cfg.dark_mode === false
              ? false
              : null,
        );
      }
      if (cfg.font_family) setFontFamily(cfg.font_family as FontFamily);
      if (cfg.element_animation_style)
        setElementAnimation(cfg.element_animation_style as ElementAnimation);
      if (cfg.section_spacing) setSectionSpacing(cfg.section_spacing as SectionSpacing);
      if (cfg.container_width) setContainerWidth(cfg.container_width as ContainerWidth);
      if (cfg.heading_scale) setHeadingScale(cfg.heading_scale as HeadingScale);
      if (cfg.text_direction === 'ltr' || cfg.text_direction === 'rtl')
        setTextDirection(cfg.text_direction);

      // The editor always previews the academy's DRAFT (not the catalog preset)
      // so swaps, text, colors and layout edits show live, and sections become
      // click-to-select (edit=1). A preview token scopes it to this academy.
      // The storefront lives on a different domain than the panel, so the
      // backend tells us where it is — a relative URL would 404 on the panel.
      const session =
        opts?.draftPreviewSession ??
        (await apiClient.createTemplatePreviewToken().catch(() => null));
      const token = session?.token;
      const storefront = session?.storefrontBaseUrl ?? null;
      setPreviewToken(token ?? null);
      setStorefrontBase(storefront);
      setBaseIframeSrc(
        token
          ? buildTemplatePreviewUrl(preset.id, storefront, {
              draft: true,
              edit: true,
              token,
              realData: useRealData,
            })
          : buildTemplatePreviewUrl(preset.id, storefront, {
              sample: !isDedicated,
              realData: useRealData,
            }),
      );
      setActivePresetId(preset.id);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setSelectedPreset(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Rating a template also reorders the gallery, so the list is refetched from
  // the API rather than patched locally — the server owns the order.
  const handleRate = async (preset: TemplatePreset, stars: number | null) => {
    // Optimistic: the star fills immediately, the reorder lands on refetch.
    setPresets((current) =>
      current.map((item) => (item.id === preset.id ? { ...item, myRating: stars } : item)),
    );
    try {
      if (stars === null) await apiClient.clearTemplateRating(preset.id);
      else await apiClient.rateTemplate(preset.id, stars);
      const refreshed = await apiClient.getAvailableTemplatePresets();
      setPresets(refreshed as TemplatePreset[]);
    } catch {
      const refreshed = await apiClient.getAvailableTemplatePresets();
      setPresets(refreshed as TemplatePreset[]);
    }
  };

  // Quick apply: apply the preset and publish it live without opening the
  // editor — the fast path for a returning manager who knows the template.
  // A customized copy keeps its saved theme; only catalog presets seed one.
  const doQuickApply = async (preset: TemplatePreset) => {
    try {
      setIsPreviewLoading(true);
      await apiClient.applyTemplatePreset(preset.id);
      if (preset.visibility !== 'DEDICATED') {
        const ds = getDesignSystem(presetSourceKey(preset));
        const { name: _omit, ...themeSeed } = buildThemePayload(ds);
        await apiClient.saveThemeDraft(themeSeed);
      }
      await apiClient.publishSite();
      setActivePresetId(preset.id);
      hasUnpublishedRef.current = false;
      ErrorHandler.showSuccess(t('sitePreview.quickApplySuccess', { name: preset.name }));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsPreviewLoading(false);
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
    router.push(APPEARANCE_LIST_PATH);
  };

  // Flip the preview between placeholder/sample content and the academy's real
  // backend data, rebuilding the iframe URL so dynamic blocks refetch.
  const handleToggleRealData = () => {
    const next = !useRealData;
    setUseRealData(next);
    localStorage.setItem('preview_real_data', next ? '1' : '0');
    if (!selectedPreset) return;
    const isDedicated = selectedPreset.visibility === 'DEDICATED';
    setBaseIframeSrc(
      previewToken
        ? buildTemplatePreviewUrl(selectedPreset.id, storefrontBase, {
            draft: true,
            edit: true,
            token: previewToken,
            realData: next,
          })
        : buildTemplatePreviewUrl(selectedPreset.id, storefrontBase, {
            sample: !isDedicated,
            realData: next,
          }),
    );
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
  // Managers always save to their own copy; only platform admins editing a
  // public preset write the original.
  const saveMode: SaveMode = isAdmin && isPublicPreset ? 'admin-override' : 'copy';

  // Committing (fork/override) snapshots whatever the draft holds server-side.
  // Colour edits are debounced by 800ms, so a save clicked right after picking a
  // colour would snapshot the OLD one. Writing the full current style state here
  // makes the commit authoritative — a late debounce then writes the same values.
  const themeState: ThemeSyncState = {
    primaryColor,
    fontFamily,
    borderRadius,
    shadow,
    elementAnimation,
    darkMode,
    textDirection,
    sectionSpacing,
    containerWidth,
    headingScale,
  };

  const flushStyleDraft = async () => {
    await apiClient.saveThemeDraft(buildFullThemePayload(themeState));
  };

  // One save for managers: it always lands on this academy's single copy of the
  // selected template, created on first save and updated afterwards. No dialog,
  // no name to invent — the manager just gets a confirmation snackbar.
  const doSave = async () => {
    if (!selectedPreset || isSaving) return;
    setIsSaving(true);
    try {
      await flushStyleDraft();
      await apiClient.saveUITemplateDraft({ blocks: draftBlocks });
      if (isAdmin && isPublicPreset) {
        await apiClient.overridePublicTemplate(selectedPreset.id, {
          blocks: draftBlocks,
        });
        ErrorHandler.showSuccess(t('sitePreview.saveOriginalDone'));
      } else {
        const saved = (await apiClient.saveDraftAsTemplate()) as TemplatePreset | null | undefined;
        if (saved) setSelectedPreset(saved);
        ErrorHandler.showSuccess(t('sitePreview.saveCopyDone'));
      }
      await refreshPresets();
      markDraftSaved();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  saveRef.current = doSave;

  // ── Draft save helpers ──────────────────────────────────────────────────────

  const saveThemeDraft = useCallback(
    async (color: string, br: BorderRadius, sh: Shadow, dm: boolean | null) => {
      setIsSaving(true);
      try {
        const payload = buildThemeDraftFromPrimary(color, {
          borderRadius: br,
          shadow: sh,
          backgroundSvgPattern: '',
        });
        await apiClient.saveThemeDraft({ ...payload, dark_mode: dm });
        markDraftSaved();
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  // Content and ordering are already mirrored into the live preview by the
  // sync-field / sync-order messages, so persisting must not reload the iframe.
  // Only structural additions (a brand-new section) still need server HTML.
  const saveBlocksDraft = useCallback(async (blocks: UIBlockConfig[]) => {
    setIsSaving(true);
    try {
      await apiClient.saveUITemplateDraft({ blocks });
      markDraftSaved();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // The preview asks for this when an edit cannot be patched into the live DOM.
  // Debounced so a burst of un-patchable fields costs one rebuild, not many.
  // Guarded so a rebuild asked for while the iframe is still loading is queued
  // and fired once on `ready` — a slow storefront never stacks reloads.
  const rebuildPreview = useCallback(() => {
    if (previewLoadingRef.current) {
      rebuildQueuedRef.current = true;
      return;
    }
    setRefreshKey((k) => k + 1);
  }, []);
  rebuildPreviewRef.current = rebuildPreview;
  const debouncedRebuildPreview = useDebouncedCallback(rebuildPreview, 500);
  debouncedRebuildPreviewRef.current = debouncedRebuildPreview;

  // Every src change is a load in flight. The timer is the fallback for a
  // storefront that never answers `ready`, so the guard cannot stay stuck.
  useEffect(() => {
    if (!iframeSrc) return;
    previewLoadingRef.current = true;
    const timer = setTimeout(() => {
      previewLoadingRef.current = false;
    }, PREVIEW_LOAD_GUARD_MS);
    return () => clearTimeout(timer);
  }, [iframeSrc]);

  const debouncedSaveTheme = useDebouncedCallback(saveThemeDraft, 800);
  // 400ms gives fast preview refresh for discrete style/layout clicks while
  // still batching rapid keystrokes into a single API call.
  const debouncedSaveBlocks = useDebouncedCallback(saveBlocksDraft, 400);

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
    [draftBlocks, flushPendingHistory, pushHistory, debouncedSaveBlocks],
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
    [draftBlocks, debouncedSaveBlocks, debouncedFlushHistory],
  );

  // Undo/redo can reverse any kind of edit at once, so the preview is rebuilt
  // rather than patched — the one place a jump is still the honest behaviour.
  const restoreBlocks = useCallback(
    async (blocks: UIBlockConfig[]) => {
      setDraftBlocks(blocks);
      await saveBlocksDraft(blocks);
      rebuildPreview();
    },
    [saveBlocksDraft, rebuildPreview],
  );

  const undo = useCallback(() => {
    // An unfinished typing burst is the most recent step to reverse.
    if (pendingHistoryRef.current) {
      const prev = pendingHistoryRef.current;
      pendingHistoryRef.current = null;
      setFuture((f) => [...f, draftBlocks]);
      void restoreBlocks(prev);
      return;
    }
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [...f, draftBlocks]);
    void restoreBlocks(prev);
  }, [history, draftBlocks, restoreBlocks]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const nextState = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setHistory((h) => [...h, draftBlocks]);
    void restoreBlocks(nextState);
  }, [future, draftBlocks, restoreBlocks]);

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
      } else if (key === 's') {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPreset, undo, redo]);

  // ── Customizer handlers ─────────────────────────────────────────────────────

  // Every style control repaints the preview through this one path: push the
  // full theme into the live document (CSS variables only — no navigation),
  // then persist in the background. The preview derives the variables with the
  // same function the server uses, so live and reloaded output are identical.
  const applyStyle = (patch: Partial<ThemeSyncState>) => {
    const next = { ...themeState, ...patch };
    const payload = buildFullThemePayload(next);
    previewIframeRef.current?.contentWindow?.postMessage(
      {
        source: 'template-admin',
        type: 'sync-theme',
        theme: payload,
        direction: next.textDirection,
      },
      getPreviewPostMessageTarget(storefrontBaseRef.current),
    );
    return payload;
  };

  // The preview needs the whole theme to derive its variables, but the API only
  // needs what changed — sending everything would let one rejected field fail a
  // save that has nothing to do with it.
  const persistStyle = (patch: Partial<ThemeSyncState>, apiPatch: Record<string, unknown>) => {
    applyStyle(patch);
    setIsSaving(true);
    apiClient
      .saveThemeDraft(apiPatch)
      .then(markDraftSaved)
      .catch((error) => ErrorHandler.handleApiError(error))
      .finally(() => setIsSaving(false));
  };

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    applyStyle({ primaryColor: color });
    debouncedSaveTheme(color, borderRadius, shadow, darkMode);
  };

  const handleBorderRadiusChange = (br: BorderRadius) => {
    setBorderRadius(br);
    applyStyle({ borderRadius: br });
    debouncedSaveTheme(primaryColor, br, shadow, darkMode);
  };

  const handleShadowChange = (sh: Shadow) => {
    setShadow(sh);
    applyStyle({ shadow: sh });
    debouncedSaveTheme(primaryColor, borderRadius, sh, darkMode);
  };

  const handleElementAnimationChange = (a: ElementAnimation) => {
    setElementAnimation(a);
    persistStyle({ elementAnimation: a }, { element_animation_style: a });
  };

  const handleDarkModeChange = (dm: boolean | null) => {
    setDarkMode(dm);
    applyStyle({ darkMode: dm });
    debouncedSaveTheme(primaryColor, borderRadius, shadow, dm);
  };

  const handleFontFamilyChange = (f: FontFamily) => {
    setFontFamily(f);
    persistStyle({ fontFamily: f }, { font_family: f });
  };

  const handleTextDirectionChange = (d: TextDirection) => {
    setTextDirection(d);
    persistStyle({ textDirection: d }, { text_direction: d });
  };

  const handleDesignSizeChange = (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => {
    if (patch.section_spacing) setSectionSpacing(patch.section_spacing);
    if (patch.container_width) setContainerWidth(patch.container_width);
    if (patch.heading_scale) setHeadingScale(patch.heading_scale);
    persistStyle(
      {
        ...(patch.section_spacing ? { sectionSpacing: patch.section_spacing } : {}),
        ...(patch.container_width ? { containerWidth: patch.container_width } : {}),
        ...(patch.heading_scale ? { headingScale: patch.heading_scale } : {}),
      },
      patch,
    );
  };

  // Reorder / remove sections in the live document. The nodes are already
  // rendered, so moving them beats re-fetching identical HTML.
  const postOrder = (blocks: UIBlockConfig[]) => {
    previewIframeRef.current?.contentWindow?.postMessage(
      {
        source: 'template-admin',
        type: 'sync-order',
        order: [...blocks].sort((a, b) => a.order - b.order).map((b) => b.id),
      },
      getPreviewPostMessageTarget(storefrontBaseRef.current),
    );
  };

  const handleBlocksChange = (blocks: UIBlockConfig[]) => {
    postOrder(blocks);
    commitBlocks(blocks);
  };

  const handleBlockConfigChange = (
    blockId: string,
    patch: Record<string, unknown>,
    // The canvas already shows an edit it made itself; pushing it back would
    // miss the marked-up node and make the preview reload on every keystroke.
    options?: { syncPreview?: boolean },
  ) => {
    // Merge onto the latest draft config so a stale sidebar snapshot cannot
    // wipe `style` (gallery → classic fallback) or other concurrent edits.
    const latest = draftBlocksRef.current;
    const prev = latest.find((b) => b.id === blockId)?.config ?? {};
    const config = { ...prev, ...patch };
    const next = latest.map((b) => (b.id === blockId ? { ...b, config } : b));
    commitContent(next);

    // Push each changed field to the preview instantly so the live text updates
    // without waiting for the full debounced save + iframe reload cycle.
    for (const [fieldKey, value] of Object.entries(options?.syncPreview === false ? {} : patch)) {
      if (prev[fieldKey] !== value) {
        previewIframeRef.current?.contentWindow?.postMessage(
          {
            source: 'template-admin',
            type: 'sync-field',
            blockId,
            fieldKey,
            value,
          },
          getPreviewPostMessageTarget(storefrontBaseRef.current),
        );
      }
    }

    // Media is server-rendered — persist then rebuild so the iframe never
    // loads a draft that still lacks the new URL.
    if (
      'bgImage' in patch ||
      'illustration' in patch ||
      'backgroundImage' in patch ||
      Object.keys(patch).some((k) => k.startsWith('show'))
    ) {
      void (async () => {
        await saveBlocksDraft(next);
        rebuildPreview();
      })();
    }
  };
  // Keep the ref in sync so the message handler (registered once) always calls
  // the latest version of this function without needing to re-register.
  handleBlockConfigChangeRef.current = handleBlockConfigChange;

  const handleBlockDelete = (blockId: string) => {
    const block = draftBlocks.find((b) => b.id === blockId);
    if (!block || block.type === 'header' || block.type === 'footer') return;

    if (block.type === 'placeholder') {
      const next = draftBlocks
        .filter((b) => b.id !== blockId)
        .sort((a, b) => a.order - b.order)
        .map((b, index) => ({ ...b, order: index + 1 }));
      setSelectedBlockId(null);
      postOrder(next);
      commitBlocks(next);
      return;
    }

    const next = draftBlocks.map((b) =>
      b.id === blockId
        ? {
            id: blockId,
            type: 'placeholder' as const,
            order: b.order,
            isVisible: true,
            config: { previousType: b.type },
          }
        : b,
    );
    setSelectedBlockId(blockId);
    setShowCustomizer(true);
    previewIframeRef.current?.contentWindow?.postMessage(
      { source: 'template-admin', type: 'sync-placeholder', blockId },
      getPreviewPostMessageTarget(storefrontBaseRef.current),
    );
    commitBlocks(next);
  };

  const handlePickBlockType = (blockId: string, type: string) => {
    setPickerTarget({ blockId, type });
    setPickerOpen(true);
  };

  const handleBlockToggleVisible = (blockId: string, visible: boolean) => {
    // Instantly hide/show the section in the preview without waiting for the
    // full save + iframe reload cycle — gives immediate visual feedback.
    previewIframeRef.current?.contentWindow?.postMessage(
      { source: 'template-admin', type: 'toggle-visible', blockId, visible },
      getPreviewPostMessageTarget(storefrontBaseRef.current),
    );
    commitBlocks(draftBlocks.map((b) => (b.id === blockId ? { ...b, isVisible: visible } : b)));
  };

  const handleBlockMove = (blockId: string, dir: 'up' | 'down') => {
    const sorted = [...draftBlocks].sort((a, b) => a.order - b.order);
    const header = sorted.find((b) => b.type === 'header') ?? null;
    const footer = sorted.find((b) => b.type === 'footer') ?? null;
    const middle = sorted.filter((b) => b.type !== 'header' && b.type !== 'footer');
    const midIndex = middle.findIndex((b) => b.id === blockId);
    if (midIndex === -1) return;
    const target = midIndex + (dir === 'up' ? -1 : 1);
    if (target < 0 || target >= middle.length) return;
    const nextMiddle = middle.slice();
    const [item] = nextMiddle.splice(midIndex, 1);
    nextMiddle.splice(target, 0, item);
    const ordered = [...(header ? [header] : []), ...nextMiddle, ...(footer ? [footer] : [])].map(
      (block, index) => ({ ...block, order: index + 1 }),
    );
    postOrder(ordered);
    commitBlocks(ordered);
  };

  undoRef.current = undo;
  handleBlockDeleteRef.current = handleBlockDelete;
  handleBlockToggleVisibleRef.current = handleBlockToggleVisible;
  handleBlockMoveRef.current = handleBlockMove;

  const handleMediaUploaded = (blockId: string, fieldKey: string, url: string) => {
    handleBlockConfigChange(blockId, { [fieldKey]: url });
  };

  const handleOpenPicker = (target?: { blockId: string; type: string }) => {
    setPickerTarget(target ?? null);
    setPickerOpen(true);
  };

  const handleSectionPicked = async () => {
    try {
      const data = (await apiClient.getCurrentUITemplate()) as Record<string, unknown> | null;
      const blocks = (data?.draft_blocks ?? data?.blocks) as UIBlockConfig[] | undefined;
      if (blocks) setDraftBlocks(blocks);
      rebuildPreview();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  // Reset throws the academy's copy away on the server and re-applies the
  // untouched original, so the editor and the gallery agree afterwards.
  const doReset = async () => {
    if (!selectedPreset) return;
    setIsSaving(true);
    try {
      await apiClient.resetTemplateToOriginal();
      const presets = (await apiClient
        .getAvailableTemplatePresets()
        .catch(() => [])) as TemplatePreset[];
      setPresets(presets);
      const original =
        presets.find((p) => p.id === selectedPreset.id) ??
        presets.find((p) => p.visibility === 'PUBLIC');
      setHistory([]);
      setFuture([]);
      pendingHistoryRef.current = null;
      if (original) {
        await handleCardClick(original);
      }
      ErrorHandler.showSuccess(t('sitePreview.resetDone'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save confirmation ───────────────────────────────────────────────────────

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
      case 'quickApply': {
        const { preset } = pendingSave;
        return (
          <TemplateConfirmDialog
            open
            title={t('sitePreview.quickApplyConfirmTitle')}
            description={t('sitePreview.quickApplyConfirmBody', { name: preset.name })}
            confirmLabel={t('sitePreview.quickApplyConfirmAction')}
            onConfirm={() => {
              closeConfirm();
              void doQuickApply(preset);
            }}
            onCancel={closeConfirm}
          />
        );
      }
      case 'reset':
        return (
          <TemplateConfirmDialog
            open
            destructive
            title={t('sitePreview.resetConfirmTitle')}
            description={t('sitePreview.resetConfirmBody')}
            confirmLabel={t('sitePreview.resetConfirmAction')}
            onConfirm={() => {
              closeConfirm();
              void doReset();
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
    const ds = getDesignSystem(presetSourceKey(selectedPreset));
    const colors = resolveTemplateColors(selectedPreset);
    const isEditingMaster = isAdmin && isPublicPreset && showCustomizer;

    // Live-preview context for the hero design picker — needs a storefront URL
    // and an academy-scoped token to render real, themed hero thumbnails.
    const storefrontBaseUrl = resolveStorefrontBaseUrl(storefrontBase);
    const heroPreview: HeroPreviewContext | null =
      previewToken && storefrontBaseUrl
        ? {
            baseUrl: storefrontBaseUrl,
            templateKey: selectedPreset.id,
            token: previewToken,
          }
        : null;

    const VIEWPORTS: {
      mode: ViewportMode;
      icon: typeof Monitor;
      label: string;
    }[] = [
      { mode: 'mobile', icon: Smartphone, label: 'موبایل' },
      { mode: 'tablet', icon: Tablet, label: 'تبلت' },
      { mode: 'desktop', icon: Monitor, label: 'دسکتاپ' },
    ];

    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-zinc-100">
        {confirmDialog}

        {/* Action bar */}
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2.5">
          <button
            type="button"
            title="بستن پیش‌نمایش"
            onClick={handleClosePreview}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>

          <span
            title={selectedPreset.name}
            className="max-w-[40vw] truncate text-sm font-semibold text-zinc-900"
          >
            {formatPresetDisplayName(selectedPreset.name)}
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
            <span className="text-[11px] text-zinc-600">
              {isSaving
                ? 'در حال ذخیره...'
                : savedAgo
                  ? `ذخیره شد ${savedAgo}${isApplied ? '' : ' · منتشر نشده'}`
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
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-30"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="ازنو (Ctrl+Y)"
              onClick={redo}
              disabled={future.length === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-30"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Data source toggle: sample design vs real backend data */}
            <button
              type="button"
              onClick={handleToggleRealData}
              title={useRealData ? 'نمایش داده واقعی آکادمی' : 'نمایش داده نمونه'}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                useRealData
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              {useRealData ? 'داده واقعی' : 'داده نمونه'}
            </button>

            {/* Viewport switcher */}
            <div className="flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5">
              {VIEWPORTS.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  title={label}
                  onClick={() => setViewport(mode)}
                  className={`flex h-6 w-7 items-center justify-center rounded-md transition-colors ${
                    viewport === mode
                      ? 'bg-white text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900'
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
                  : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
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

            <VisitSiteLink academy={currentAcademy} variant="ghost" />
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
              elementAnimation={elementAnimation}
              darkMode={darkMode}
              textDirection={textDirection}
              sectionSpacing={sectionSpacing}
              containerWidth={containerWidth}
              headingScale={headingScale}
              blocks={draftBlocks}
              isSaving={isSaving}
              onColorChange={handleColorChange}
              onFontFamilyChange={handleFontFamilyChange}
              onBorderRadiusChange={handleBorderRadiusChange}
              onShadowChange={handleShadowChange}
              onElementAnimationChange={handleElementAnimationChange}
              onDarkModeChange={handleDarkModeChange}
              onTextDirectionChange={handleTextDirectionChange}
              onDesignSizeChange={handleDesignSizeChange}
              onBlocksChange={handleBlocksChange}
              onUpdateBlock={handleBlockConfigChange}
              onOpenPicker={handleOpenPicker}
              onPickBlockType={handlePickBlockType}
              onToggleVisibleBlock={handleBlockToggleVisible}
              onDeleteBlock={handleBlockDelete}
              onReset={() => setPendingSave({ kind: 'reset' })}
              isOriginalSelected={isPublicPreset}
              saveMode={saveMode}
              onSave={doSave}
              onClose={() => setShowCustomizer(false)}
              onCloseSection={() => setSelectedBlockId(null)}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              preview={heroPreview}
              academyName={academyName}
            />
          )}

          <SectionLibraryModal
            open={pickerOpen}
            swapTarget={pickerTarget}
            onClose={() => setPickerOpen(false)}
            onImported={handleSectionPicked}
          />

          <TemplateMediaPicker ref={mediaPickerRef} onUploaded={handleMediaUploaded} />

          <EditorPreview
            viewport={viewport}
            iframeSrc={iframeSrc}
            isLoading={isPreviewLoading}
            isSaving={isSaving}
            title={`Preview: ${selectedPreset.name}`}
            iframeRef={previewIframeRef}
            onIframeLoad={() => postHighlight(selectedBlockId, false)}
          />
        </div>
      </div>
    );
  }

  // ── Gallery mode ──────────────────────────────────────────────────────────

  // A customized template is still ONE design, so its copy stands in for the
  // original card instead of adding a second, near-identical card next to it.
  // Two shelves, the academy's own first: a manager looks for their site before
  // they look for a new design. Copies are already academy-scoped by the API, so
  // this shelf is never visible to another academy.
  const academyPresets = presets.filter((p) => p.visibility === 'DEDICATED');
  const platformPresets = presets.filter((p) => p.visibility === 'PUBLIC');
  const filteredPlatform =
    categoryFilter === 'all'
      ? platformPresets
      : platformPresets.filter((p) => getTemplateCategory(p) === categoryFilter);
  const activePreset = presets.find((p) => p.id === activePresetId) ?? null;
  // While a customized template's live iframe loads, the card shows the base
  // template's own banner instead of a blank/gradient placeholder.
  const getBaseCover = (preset: TemplatePreset) =>
    presets.find((p) => p.id === preset.sourcePresetKey)?.preview;

  return (
    <div className="min-h-full bg-[#f7faf9] p-8" dir="rtl">
      {confirmDialog}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">قالب‌های آماده</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            یک قالب کامل فارسی انتخاب کنید تا پیش‌نمایش کامل ببینید — مستقیم روی آن کلیک کنید
          </p>
        </div>
      </div>

      {/* Currently live callout */}
      {activePreset && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-emerald-500" />
          <div className="flex-1">
            <p
              title={activePreset.name}
              className="truncate text-sm font-semibold text-emerald-900"
            >
              قالب فعلی: {formatPresetDisplayName(activePreset.name)}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-emerald-300 text-xs text-emerald-800"
            onClick={() => openTemplate(activePreset)}
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
          <h2 className="text-lg font-semibold text-foreground">هنوز قالبی تعریف نشده</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            کاتالوگ قالب‌های آماده خالی است. پس از افزودن قالب‌های جدید، اینجا نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {academyPresets.length > 0 && (
            <TemplateSection
              title="قالب‌های آکادمی من"
              description="نسخه‌های سفارشی‌شدهٔ شما. فقط برای همین آکادمی دیده می‌شوند."
              presets={academyPresets}
              activePresetId={activePresetId}
              previewToken={galleryPreviewToken}
              storefrontBaseUrl={galleryStorefrontUrl}
              getBaseCover={getBaseCover}
              onSelect={openTemplate}
              onQuickApply={(preset) => setPendingSave({ kind: 'quickApply', preset })}
              onDelete={(preset) => setPendingSave({ kind: 'delete', preset })}
              onRate={handleRate}
            />
          )}
          {filteredPlatform.length > 0 && (
            <TemplateSection
              title="قالب‌های اصلی"
              description="کاتالوگ آمادهٔ پلتفرم. سفارشی‌سازی و ذخیره، نسخهٔ اختصاصی خودتان را می‌سازد."
              presets={filteredPlatform}
              activePresetId={activePresetId}
              onSelect={openTemplate}
              onQuickApply={(preset) => setPendingSave({ kind: 'quickApply', preset })}
              onDelete={(preset) => setPendingSave({ kind: 'delete', preset })}
              onRate={handleRate}
              onCoverUploaded={(preset, url) =>
                setPresets((current) =>
                  current.map((p) => (p.id === preset.id ? { ...p, preview: url } : p)),
                )
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
