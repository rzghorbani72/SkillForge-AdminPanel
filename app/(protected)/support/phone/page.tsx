'use client';

import { Phone } from 'lucide-react';
import { SupportContactCard } from '@/components/support/support-contact-card';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay } from '@/lib/phone-utils';
import { SUPPORT_PHONE_E164, SUPPORT_PHONE_HREF } from '@/lib/support-channels';

export default function SupportPhonePage() {
  const { t, language } = useTranslation();
  const display = formatPhoneDisplay(SUPPORT_PHONE_E164, language);

  return (
    <SupportContactCard
      icon={Phone}
      title={t('support.help.phoneTitle')}
      description={t('support.help.phoneSubtitle')}
      value={display}
      copyValue={SUPPORT_PHONE_E164}
      href={SUPPORT_PHONE_HREF}
      actionLabel={t('support.help.phoneAction')}
      hint={t('support.help.phoneHint')}
    />
  );
}
