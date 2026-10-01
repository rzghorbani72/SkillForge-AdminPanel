'use client';

import type { TemplatePreset, UIBlockConfig } from '@/types/api';
import type { HeroPreviewContext } from '@/components/ui-template/hero-variant-picker';
import {
  TemplateCustomizationSidebar,
  type SaveMode,
} from '@/components/ui-template/template-customization-sidebar';
import { SectionLibraryModal } from '@/components/ui-template/section-library-modal';
import { EditorPreview } from '@/components/ui-template/editor-preview';
import {
  TemplateMediaPicker,
  type TemplateMediaPickerHandle,
} from '@/components/ui-template/template-media-picker';
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
import type { Dispatch, SetStateAction, RefObject } from 'react';
import { PendingSave } from '@/app/(protected)/website/appearance/_components/appearance-workspace';

export function EditorBody({
  academyName,
  borderRadius,
  containerWidth,
  darkMode,
  draftBlocks,
  elementAnimation,
  fontFamily,
  handleBlockConfigChange,
  handleBlockDelete,
  handleBlockToggleVisible,
  handleBlocksChange,
  handleBorderRadiusChange,
  handleColorChange,
  handleDarkModeChange,
  handleDesignSizeChange,
  handleElementAnimationChange,
  handleFontFamilyChange,
  handleMediaUploaded,
  handleOpenPicker,
  handlePickBlockType,
  handleSectionPicked,
  handleShadowChange,
  handleTextDirectionChange,
  headingScale,
  heroPreview,
  iframeSrc,
  isPreviewLoading,
  isPublicPreset,
  isSaving,
  mediaPickerRef,
  pickerOpen,
  pickerTarget,
  postHighlight,
  previewIframeRef,
  primaryColor,
  saveMode,
  sectionSpacing,
  selectedBlockId,
  selectedPreset,
  setPendingSave,
  setPickerOpen,
  setSelectedBlockId,
  setShowCustomizer,
  shadow,
  showCustomizer,
  textDirection,
  viewport,
}: {
  academyName: string;
  borderRadius: BorderRadius;
  containerWidth: ContainerWidth;
  darkMode: boolean | null;
  draftBlocks: UIBlockConfig[];
  elementAnimation: ElementAnimation;
  fontFamily: 'vazirmatn' | 'markazi' | 'noto-naskh' | 'lalezar' | 'inter' | 'poppins' | 'playfair';
  handleBlockConfigChange: (
    blockId: string,
    patch: Record<string, unknown>,
    options?: { syncPreview?: boolean },
  ) => void;
  handleBlockDelete: (blockId: string) => void;
  handleBlockToggleVisible: (blockId: string, visible: boolean) => void;
  handleBlocksChange: (blocks: UIBlockConfig[]) => void;
  handleBorderRadiusChange: (br: BorderRadius) => void;
  handleColorChange: (color: string) => void;
  handleDarkModeChange: (dm: boolean | null) => void;
  handleDesignSizeChange: (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => void;
  handleElementAnimationChange: (a: ElementAnimation) => void;
  handleFontFamilyChange: (f: FontFamily) => void;
  handleMediaUploaded: (blockId: string, fieldKey: string, url: string) => void;
  handleOpenPicker: (target?: { blockId: string; type: string }) => void;
  handlePickBlockType: (blockId: string, type: string) => void;
  handleSectionPicked: () => Promise<void>;
  handleShadowChange: (sh: Shadow) => void;
  handleTextDirectionChange: (d: TextDirection) => void;
  headingScale: HeadingScale;
  heroPreview: HeroPreviewContext | null;
  iframeSrc: string | null;
  isPreviewLoading: boolean;
  isPublicPreset: boolean;
  isSaving: boolean;
  mediaPickerRef: RefObject<TemplateMediaPickerHandle | null>;
  pickerOpen: boolean;
  pickerTarget: { blockId: string; type: string } | null;
  postHighlight: (blockId: string | null, scroll: boolean) => void;
  previewIframeRef: RefObject<HTMLIFrameElement | null>;
  primaryColor: string;
  saveMode: SaveMode;
  sectionSpacing: SectionSpacing;
  selectedBlockId: string | null;
  selectedPreset: TemplatePreset;
  setPendingSave: Dispatch<SetStateAction<PendingSave | null>>;
  setPickerOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedBlockId: Dispatch<SetStateAction<string | null>>;
  setShowCustomizer: Dispatch<SetStateAction<boolean>>;
  shadow: Shadow;
  showCustomizer: boolean;
  textDirection: TextDirection;
  viewport: ViewportMode;
}) {
  return (
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
          templateId={selectedPreset?.id}
          saveMode={saveMode}
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
  );
}
