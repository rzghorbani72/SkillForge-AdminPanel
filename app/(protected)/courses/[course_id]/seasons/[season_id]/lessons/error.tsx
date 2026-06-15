'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

export default function LessonsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Lessons page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-6">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {t('common.somethingWentWrong')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t('common.errorLoadingPage')}
          </p>
          <div className="flex flex-col space-y-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('common.tryAgain')}
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/courses')}
              className="w-full"
            >
              {t('courses.backToCourses')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
