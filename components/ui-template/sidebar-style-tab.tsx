'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  BorderRadius,
  ElementAnimation,
  Shadow,
  SectionSpacing,
  ContainerWidth,
  HeadingScale,
  FontFamily,
  TextDirection,
} from './sidebar-types';
import { BrandColorSection } from './sidebar-style-tab/brand-color-section';
import { DesignSizeSection } from './sidebar-style-tab/design-size-section';
import { DirectionSection } from './sidebar-style-tab/direction-section';
import { FontFamilySection } from './sidebar-style-tab/font-family-section';
import { MotionSection } from './sidebar-style-tab/motion-section';
import { RoundedCornersSection } from './sidebar-style-tab/rounded-corners-section';
import { ShadowSection } from './sidebar-style-tab/shadow-section';
import { ThemeModeSection } from './sidebar-style-tab/theme-mode-section';

// ── Main Style Tab ────────────────────────────────────────────────────────────

export interface SidebarStyleTabProps {
  primaryColor: string;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  shadow: Shadow;
  elementAnimation: ElementAnimation;
  darkMode: boolean | null;
  textDirection: TextDirection;
  sectionSpacing: SectionSpacing;
  containerWidth: ContainerWidth;
  headingScale: HeadingScale;
  onColorChange: (color: string) => void;
  onFontFamilyChange: (f: FontFamily) => void;
  onBorderRadiusChange: (r: BorderRadius) => void;
  onShadowChange: (s: Shadow) => void;
  onElementAnimationChange: (a: ElementAnimation) => void;
  onDarkModeChange: (mode: boolean | null) => void;
  onTextDirectionChange: (d: TextDirection) => void;
  onDesignSizeChange: (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => void;
}

export function SidebarStyleTab({
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
  onColorChange,
  onFontFamilyChange,
  onBorderRadiusChange,
  onShadowChange,
  onElementAnimationChange,
  onDarkModeChange,
  onTextDirectionChange,
  onDesignSizeChange,
}: SidebarStyleTabProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  return (
    <div>
      <BrandColorSection primaryColor={primaryColor} onColorChange={onColorChange} />
      <FontFamilySection fontFamily={fontFamily} onFontFamilyChange={onFontFamilyChange} />
      <ThemeModeSection darkMode={darkMode} onDarkModeChange={onDarkModeChange} />

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex w-full items-center justify-between border-b border-zinc-200 px-4 py-3 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      >
        <span>{t('sitePreview.moreAppearance')}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
      </button>

      {showMore && (
        <>
          <DirectionSection
            textDirection={textDirection}
            onTextDirectionChange={onTextDirectionChange}
          />
          <RoundedCornersSection
            borderRadius={borderRadius}
            onBorderRadiusChange={onBorderRadiusChange}
          />
          <ShadowSection shadow={shadow} onShadowChange={onShadowChange} />
          <MotionSection
            elementAnimation={elementAnimation}
            onElementAnimationChange={onElementAnimationChange}
          />
          <DesignSizeSection
            sectionSpacing={sectionSpacing}
            containerWidth={containerWidth}
            headingScale={headingScale}
            onChange={onDesignSizeChange}
          />
        </>
      )}
    </div>
  );
}
