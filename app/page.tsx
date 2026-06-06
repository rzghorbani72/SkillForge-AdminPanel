'use client';

import Link from '@/components/ui/link';
import { DEFAULT_LANGUAGE, getLanguageConfig } from '@/lib/i18n/config';
import { t as translate } from '@/lib/i18n';
import { redirect } from 'next/navigation';

const language = DEFAULT_LANGUAGE;
const { direction } = getLanguageConfig(language);
const t = (key: string) => translate(key, language);

export default function Page() {
  return redirect('/login');
}
