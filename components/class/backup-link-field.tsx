'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  value: string | null | undefined;
  busy: boolean;
  onSave: (url: string | null) => void;
};

/** Optional external room (e.g. Skyroom) students can switch to if Meet quality drops. */
export const BackupLinkField = ({ value, busy, onSave }: Props) => {
  const { t } = useTranslation();
  const [link, setLink] = useState(value ?? '');

  useEffect(() => setLink(value ?? ''), [value]);

  const changed = link.trim() !== (value ?? '');

  return (
    <div className="space-y-2">
      <Label htmlFor="group-backup-url">{t('tutoring.groups.backupLink')}</Label>
      <Input
        id="group-backup-url"
        type="url"
        dir="ltr"
        placeholder="https://www.skyroom.online/..."
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">{t('tutoring.groups.backupLinkHint')}</p>
      {changed ? (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onSave(link.trim() || null)}
        >
          {t('tutoring.groups.saveLink')}
        </Button>
      ) : null}
    </div>
  );
};
