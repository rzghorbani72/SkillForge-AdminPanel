'use client';

import Link from '@/components/ui/link';
import { DEFAULT_LANGUAGE, getLanguageConfig } from '@/lib/i18n/config';
import { t as translate } from '@/lib/i18n';

const language = DEFAULT_LANGUAGE;
const { direction } = getLanguageConfig(language);
const t = (key: string) => translate(key, language);

export default function Page() {
  return (
    <main
      dir={direction}
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4"
    >
      <nav className="flex w-full justify-end px-8 py-6">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
        >
          {t('navigation.login')}
        </Link>
      </nav>
      <section className="mt-12 flex flex-col items-center text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-gray-900 drop-shadow-lg md:text-6xl">
          {t('home.welcomeToSkillForge')}
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-gray-700 md:text-2xl">
          {t('home.description')}
        </p>
        <Link
          href="/login"
          className="mb-4 rounded-xl bg-blue-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700"
        >
          {t('home.getStarted')}
        </Link>
      </section>
      <footer className="mt-auto py-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} آکادمی. {t('home.allRightsReserved')}
      </footer>
    </main>
  );
}
