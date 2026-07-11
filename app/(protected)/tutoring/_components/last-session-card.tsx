'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringSession } from '@/types/learning-operations';

interface LastSessionCardProps {
  session: TutoringSession;
}

export function LastSessionCard({ session }: LastSessionCardProps) {
  const { t, language } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tutoring.lastSessionResult')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          {t('tutoring.sessionId')}: {session.id}
        </p>
        <p>
          {t('common.status')}: {session.status}
        </p>
        <p>
          {t('tutoring.startsAt')}:{' '}
          {new Date(session.starts_at).toLocaleString(language)}
        </p>
      </CardContent>
    </Card>
  );
}
