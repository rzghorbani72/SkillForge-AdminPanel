'use client';

import { useState } from 'react';
import { Power } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { AcademySiteStatusDialog } from '@/components/academies/academy-site-status-dialog';

export function AcademySiteStatusCard({
  academyName
}: {
  academyName: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="h-4 w-4" />
          {t('stores.siteStatusTitle')}
        </CardTitle>
        <CardDescription>{t('stores.siteStatusCardDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={() => setOpen(true)}>
          {t('stores.siteStatusManage')}
        </Button>
      </CardContent>

      <AcademySiteStatusDialog
        open={open}
        academyName={academyName}
        onClose={() => setOpen(false)}
        onChanged={() => {}}
        t={t}
      />
    </Card>
  );
}
