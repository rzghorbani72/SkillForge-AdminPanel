'use client';

import { Link2, LockKeyhole, Video } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { FieldError, OptionCard, RiskHint } from './live-ui';
import type { LiveClassDraftApi } from './use-live-class-draft';

const ACCESS_STEPS = [
  'liveWizard.accessStep1',
  'liveWizard.accessStep2',
  'liveWizard.accessStep3',
] as const;

export function StepMeeting({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { draft, shownErrors: errors, update, group } = live;
  const roomReady = group?.meeting_url_source === 'AUTO_JITSI' && Boolean(group.meeting_url);

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">{t('liveWizard.howStudentsEnter')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            selected={draft.meeting === 'AUTO'}
            onSelect={() => update({ meeting: 'AUTO' })}
            icon={Video}
            title={t('liveWizard.autoRoomTitle')}
            hint={t('liveWizard.autoRoomHint')}
            badge={t('liveWizard.recommended')}
          />
          <OptionCard
            selected={draft.meeting === 'OWN'}
            onSelect={() => update({ meeting: 'OWN' })}
            icon={Link2}
            title={t('liveWizard.ownLinkTitle')}
            hint={t('liveWizard.ownLinkHint')}
          />
        </div>

        {draft.meeting === 'AUTO' ? (
          <RiskHint>
            {t(roomReady ? 'liveWizard.autoRoomReady' : 'liveWizard.autoRoomOnPublish')}
          </RiskHint>
        ) : (
          <div className="space-y-3">
            <div className="max-w-xl space-y-1.5">
              <Label htmlFor="live-meeting-url">{t('liveWizard.ownLinkLabel')} *</Label>
              <Input
                id="live-meeting-url"
                dir="ltr"
                inputMode="url"
                placeholder="https://"
                value={draft.meetingUrl}
                onChange={(event) => update({ meetingUrl: event.target.value })}
              />
              <FieldError messageKey={errors.meetingUrl} />
            </div>
            <RiskHint tone="warn">{t('liveWizard.ownLinkRisk')}</RiskHint>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <h2 className="text-base font-semibold">{t('liveWizard.protectedTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('liveWizard.protectedHint')}</p>
          </div>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {ACCESS_STEPS.map((key, index) => (
            <li key={key} className="flex items-start gap-2 rounded-xl border p-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {formatNumber(index + 1)}
              </span>
              {t(key)}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
