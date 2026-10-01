'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { FontFamily } from '../sidebar-types';
import { FONT_OPTIONS } from '../sidebar-types';

export function FontPreview({ fontFamily }: { fontFamily: FontFamily }) {
  const { t } = useTranslation();
  const css = FONT_OPTIONS.find((f) => f.slug === fontFamily)?.preview;
  return (
    <div
      className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center"
      style={{ fontFamily: css }}
    >
      <p className="text-lg font-bold text-zinc-900">{t('sitePreview.fontPreviewTitle')}</p>
      <p className="text-sm text-zinc-600">{t('sitePreview.fontPreviewSubtitle')}</p>
    </div>
  );
}
