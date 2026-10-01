'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { SectionSpacing, ContainerWidth, HeadingScale } from '../sidebar-types';
import { AccordionSection } from '../sidebar-primitives';
import { SizeRow } from './size-row';

// ── Design Sizes ──────────────────────────────────────────────────────────────

export const SPACING_OPTIONS: { labelKey: string; value: SectionSpacing }[] = [
  { labelKey: 'sitePreview.designSpacingCompact', value: 'compact' },
  { labelKey: 'sitePreview.designSpacingNormal', value: 'comfortable' },
  { labelKey: 'sitePreview.designSpacingSpacious', value: 'spacious' },
];

export const WIDTH_OPTIONS: { labelKey: string; value: ContainerWidth }[] = [
  { labelKey: 'sitePreview.designWidthNarrow', value: 'narrow' },
  { labelKey: 'sitePreview.designWidthNormal', value: 'standard' },
  { labelKey: 'sitePreview.designWidthWide', value: 'wide' },
  { labelKey: 'sitePreview.designWidthFull', value: 'full' },
];

export const HEADING_OPTIONS: { labelKey: string; value: HeadingScale }[] = [
  { labelKey: 'sitePreview.designHeadingSmall', value: 'compact' },
  { labelKey: 'sitePreview.designHeadingNormal', value: 'standard' },
  { labelKey: 'sitePreview.designHeadingLarge', value: 'large' },
];

export function DesignSizeSection({
  sectionSpacing,
  containerWidth,
  headingScale,
  onChange,
}: {
  sectionSpacing: SectionSpacing;
  containerWidth: ContainerWidth;
  headingScale: HeadingScale;
  onChange: (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => void;
}) {
  const { t } = useTranslation();
  return (
    <AccordionSection title={t('sitePreview.designSizes')}>
      <div className="space-y-4">
        <SizeRow
          title={t('sitePreview.designSpacing')}
          options={SPACING_OPTIONS}
          value={sectionSpacing}
          onChange={(v) => onChange({ section_spacing: v })}
        />
        <SizeRow
          title={t('sitePreview.designWidth')}
          options={WIDTH_OPTIONS}
          value={containerWidth}
          onChange={(v) => onChange({ container_width: v })}
        />
        <SizeRow
          title={t('sitePreview.designHeading')}
          options={HEADING_OPTIONS}
          value={headingScale}
          onChange={(v) => onChange({ heading_scale: v })}
        />
      </div>
    </AccordionSection>
  );
}
