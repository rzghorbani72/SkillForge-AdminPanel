'use client';

import { LockKeyhole, ShieldCheck } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Note } from '@/components/shared/note';
import { useTranslation } from '@/lib/i18n/hooks';
import { ChoiceCard } from '@/components/shared/choice-card';
import { FieldError, FieldLabel } from '@/components/shared/field-label';
import { FlowSteps } from '@/components/shared/flow-steps';
import { SectionCard } from '@/components/shared/section-card';
import type { LiveClassDraftApi } from './use-live-class-draft';

const ACCESS_STEPS = [
  'liveWizard.accessStep1',
  'liveWizard.accessStep2',
  'liveWizard.accessStep3',
] as const;

export function StepMeeting({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const { draft, shownErrors: errors, update, group } = live;
  const roomReady = group?.meeting_url_source === 'AUTO_JITSI' && Boolean(group.meeting_url);
  const isAuto = draft.meeting === 'AUTO';

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t('liveWizard.howStudentsEnter')}
        hint={t('liveWizard.howStudentsEnterHint')}
      >
        <div role="radiogroup" className="flex flex-col gap-4">
          <ChoiceCard
            selected={isAuto}
            onSelect={() => update({ meeting: 'AUTO' })}
            title={t('liveWizard.autoRoomTitle')}
            hint={t('liveWizard.autoRoomHint')}
            badge={t('liveWizard.recommended')}
          />
          {isAuto ? (
            <Note tone="success" className="ms-8">
              {t(roomReady ? 'liveWizard.autoRoomReady' : 'liveWizard.autoRoomOnPublish')}
            </Note>
          ) : null}
          <ChoiceCard
            selected={!isAuto}
            onSelect={() => update({ meeting: 'OWN' })}
            title={t('liveWizard.ownLinkTitle')}
            hint={t('liveWizard.ownLinkHint')}
          />
        </div>
        {isAuto ? null : (
          <div className="ms-8 flex flex-col gap-3">
            <div className="flex max-w-xl flex-col gap-1.5">
              <FieldLabel htmlFor="live-meeting-url" required>
                {t('liveWizard.ownLinkLabel')}
              </FieldLabel>
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
            <Note tone="warn">{t('liveWizard.ownLinkRisk')}</Note>
          </div>
        )}
      </SectionCard>

      <SectionCard
        icon={ShieldCheck}
        iconTone="success"
        title={t('liveWizard.protectedTitle')}
        hint={t('liveWizard.protectedHint')}
      >
        <FlowSteps steps={ACCESS_STEPS.map((key) => ({ title: t(key) }))} />
        <Note icon={LockKeyhole}>{t('liveWizard.notEnrolledBlocked')}</Note>
      </SectionCard>
    </div>
  );
}
