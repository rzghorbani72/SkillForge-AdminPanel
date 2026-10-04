'use client';

import Link from 'next/link';
import { CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { useStore } from '@/hooks/useStore';
import { academySiteUrl } from '@/lib/academy-site-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { RiskHint } from './live-ui';
import { ReviewRows, Row } from './review-parts';
import type { LiveClassDraftApi } from './use-live-class-draft';
import { useLiveSummary } from './use-live-summary';

/** Shown once, right after publishing: what went live and the next useful actions. */
export function PublishedCard({ live, title }: { live: LiveClassDraftApi; title: string }) {
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();
  const summary = useLiveSummary(live);
  const site = academySiteUrl(selectedAcademy);
  const slug = live.course?.slug;
  const registrationUrl = site && slug ? `${site}/courses/${encodeURIComponent(slug)}` : null;

  const copyLink = async () => {
    if (!registrationUrl) return;
    try {
      await navigator.clipboard.writeText(registrationUrl);
      toast.success(t('liveWizard.linkCopied'));
    } catch {
      toast.info(registrationUrl);
    }
  };

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
      <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
      <h2 className="text-2xl font-bold">{t('liveWizard.publishedTitle')}</h2>
      <p className="text-muted-foreground">{t('liveWizard.publishedHint', { title })}</p>

      <div className="w-full rounded-xl border bg-muted/30 p-4 text-start">
        <ReviewRows>
          <Row label={t('liveWizard.successSchedule')}>
            <GroupScheduleSummary slots={live.draft.slots} timezone={live.group?.timezone} />
          </Row>
          <Row label={t('liveWizard.successSessions')}>{summary.sessions ?? '—'}</Row>
          <Row label={t('liveWizard.successPrice')}>
            {summary.kind} · {summary.price ?? '—'}
          </Row>
          <Row label={t('liveWizard.stepMeeting')}>{t('liveWizard.onlyEnrolled')}</Row>
        </ReviewRows>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href={`/courses/${live.courseId}/live`}>{t('liveWizard.viewCourse')}</Link>
        </Button>
        {registrationUrl ? (
          <Button type="button" variant="outline" className="gap-2" onClick={() => void copyLink()}>
            <Copy className="h-4 w-4" aria-hidden />
            {t('liveWizard.copyRegistrationLink')}
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href={`/courses/${live.courseId}/edit?step=basics`}>
            {t('liveWizard.editCourse')}
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">{t('liveWizard.backToDashboard')}</Link>
        </Button>
      </div>
      <RiskHint>{t('liveWizard.shareRegistrationHint')}</RiskHint>
    </section>
  );
}
