'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { RiskHint } from './live-ui';

type PublishedCardProps = { courseId: string; title: string; onEdit: () => void };

export function PublishedCard({ courseId, title, onEdit }: PublishedCardProps) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
      <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
      <h2 className="text-2xl font-bold">{t('liveWizard.publishedTitle')}</h2>
      <p className="text-muted-foreground">{t('liveWizard.publishedHint', { title })}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href={`/courses/${courseId}/live`}>{t('liveWizard.manageClass')}</Link>
        </Button>
        <Button type="button" variant="outline" onClick={onEdit}>
          {t('liveWizard.editCourse')}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/courses">{t('liveWizard.backToCourses')}</Link>
        </Button>
      </div>
      <RiskHint>{t('liveWizard.noNeedToSendLink')}</RiskHint>
    </section>
  );
}
