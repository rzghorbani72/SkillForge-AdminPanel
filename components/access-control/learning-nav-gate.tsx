'use client';

import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearningNavCapabilities } from '@/hooks/useLearningNavCapabilities';
import type { LearningNavVisibility } from '@/lib/nav-filter';

type LearningCapability = keyof LearningNavVisibility;

interface LearningNavGateProps {
  requiredCapability: LearningCapability;
  children: ReactNode;
}

export function LearningNavGate({ requiredCapability, children }: LearningNavGateProps) {
  const { t } = useTranslation();
  const { visibility, isLoading, shouldResolve } = useLearningNavCapabilities();

  if (!shouldResolve) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center p-6">
        <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (visibility?.[requiredCapability]) {
    return <>{children}</>;
  }

  const messageKey =
    requiredCapability === 'ops_queue' || requiredCapability === 'tutoring'
      ? 'learningNav.privateSubRequired'
      : 'learningNav.noSellingCourses';

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('learningNav.accessDenied')}
          </CardTitle>
          <CardDescription>{t(messageKey)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('learningNav.accessDeniedHint')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
