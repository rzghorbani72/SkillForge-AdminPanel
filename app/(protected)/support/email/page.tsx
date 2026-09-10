'use client';

import { Mail } from 'lucide-react';
import { SupportContactCard } from '@/components/support/support-contact-card';
import { useTranslation } from '@/lib/i18n/hooks';
import { SUPPORT_EMAIL } from '@/lib/support-channels';

export default function SupportEmailPage() {
  const { t } = useTranslation();

  return (
    <SupportContactCard
      icon={Mail}
      title={t('support.help.emailTitle')}
      description={t('support.help.emailSubtitle')}
      value={SUPPORT_EMAIL}
      copyValue={SUPPORT_EMAIL}
      href={`mailto:${SUPPORT_EMAIL}`}
      actionLabel={t('support.help.emailAction')}
      hint={t('support.help.emailHint')}
    />
  );
}
