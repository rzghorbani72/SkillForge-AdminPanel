'use client';

import { CircleCheck } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Note } from '@/components/shared/note';
import { useTranslation } from '@/lib/i18n/hooks';
import { ChoiceCard } from '@/components/shared/choice-card';
import { FieldError, FieldLabel } from '@/components/shared/field-label';
import { SectionCard } from '@/components/shared/section-card';
import type { LiveClassDraftApi } from './use-live-class-draft';

export function StepMeeting({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const { draft, shownErrors: errors, update, groups } = live;
  const roomReady =
    groups.length > 0 &&
    groups.every(
      (group) => group.meeting_url_source === 'AUTO_JITSI' && Boolean(group.meeting_url),
    );
  const isAuto = draft.meeting === 'AUTO';

  return (
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
        >
          {isAuto ? (
            <span className="mt-2 flex items-center gap-2 border-t border-primary/15 pt-3 text-[13px] font-medium text-success">
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden />
              {t(roomReady ? 'liveWizard.autoRoomReady' : 'liveWizard.autoRoomOnPublish')}
            </span>
          ) : null}
        </ChoiceCard>
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
  );
}
