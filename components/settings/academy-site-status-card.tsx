'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { AcademySiteStatusDialog } from '@/components/academies/academy-site-status-dialog';
import { apiClient } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import { ErrorHandler } from '@/lib/error-handler';

export function AcademySiteStatusCard({
  academyName
}: {
  academyName: string;
}) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const { refreshAcademies } = useStore();
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disabledAt, setDisabledAt] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const status = await apiClient.getAcademySiteStatus();
      setDisabled(status.disabled);
      setDisabledAt(status.disabled_at);
    } catch {
      setDisabled(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const description = disabled
    ? disabledAt
      ? t('stores.siteStatusCardDescDisabled', { date: formatDate(disabledAt) })
      : t('stores.siteStatusCardDescDisabledNoDate')
    : t('stores.siteStatusCardDesc');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="h-4 w-4" />
          {disabled
            ? t('stores.siteStatusTitleEnable')
            : t('stores.siteStatusTitle')}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={disabled ? 'default' : 'outline'}
          onClick={() => setOpen(true)}
        >
          {disabled
            ? t('stores.siteStatusEnableShort')
            : t('stores.siteStatusManage')}
        </Button>
      </CardContent>

      <AcademySiteStatusDialog
        open={open}
        academyName={academyName}
        onClose={() => setOpen(false)}
        onChanged={(nowDisabled) => {
          setDisabled(nowDisabled);
          ErrorHandler.showSuccess(
            t(
              nowDisabled
                ? 'stores.siteDisabledToast'
                : 'stores.siteEnabledToast'
            )
          );
          void loadStatus();
          // The switcher badge reads the cached academy list, so it stays on the
          // old status until the list is refetched.
          void refreshAcademies();
        }}
        t={t}
      />
    </Card>
  );
}
