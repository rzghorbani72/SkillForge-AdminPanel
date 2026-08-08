'use client';

import { Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

type UserContactActionsProps = {
  email?: string | null;
  phoneNumber?: string | null;
};

/**
 * "Contact this person" for the user details page. There is no in-app messaging
 * backend, so these hand off to the device's mail/SMS client instead of pretending
 * a message was delivered by the platform.
 */
export function UserContactActions({
  email,
  phoneNumber
}: UserContactActionsProps) {
  const { t } = useTranslation();

  if (!email && !phoneNumber) return null;

  return (
    <div className="flex items-center gap-2">
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
  );
}
