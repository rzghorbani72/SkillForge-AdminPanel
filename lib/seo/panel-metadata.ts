import type { Metadata } from 'next';

import { t } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/i18n/config';

export const PANEL_NOINDEX_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export function buildPanelMetadata(language: LanguageCode): Metadata {
  return {
    title: {
      default: t('meta.title', language),
      template: t('meta.titleTemplate', language),
    },
    description: t('meta.description', language),
    robots: PANEL_NOINDEX_ROBOTS,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
        { url: '/panel-icon.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.ico',
    },
  };
}
