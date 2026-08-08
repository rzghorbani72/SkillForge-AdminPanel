'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { SendMessageDialog } from './send-message-dialog';

type UserContactActionsProps = {
  /** Profile id — enables sending through the platform. */
  profileId?: string;
  email?: string | null;
  phoneNumber?: string | null;
};

/**
 * "Contact this person" for the user details page. The primary action sends
 * through the platform (SMS / in-app / messenger, recorded and auditable); the
 * mail and SMS links remain as a direct hand-off to the device.
 */
export function UserContactActions({
  profileId,
  email,
  phoneNumber
}: UserContactActionsProps) {
  const { t } = useTranslation();
  const [sendOpen, setSendOpen] = useState(false);

  if (!profileId && !email && !phoneNumber) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {profileId && (
          <Button size="sm" onClick={() => setSendOpen(true)}>
            <Send className="me-2 h-3.5 w-3.5" />
            {t('messages.sendMessage')}
          </Button>
        )}
        {email && (
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${email}`}>
              <Mail className="me-2 h-3.5 w-3.5" />
              {t('userDetails.sendEmail')}
            </a>
          </Button>
        )}
        {phoneNumber && (
          <Button variant="outline" size="sm" asChild>
            <a href={`sms:${phoneNumber}`}>
              <MessageSquare className="me-2 h-3.5 w-3.5" />
              {t('userDetails.sendSms')}
            </a>
          </Button>
        )}
      </div>

      {profileId && (
        <SendMessageDialog
          open={sendOpen}
          onOpenChange={setSendOpen}
          profileIds={[profileId]}
          recipientCount={1}
        />
      )}
    </>
  );
}
