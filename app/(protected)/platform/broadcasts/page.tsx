'use client';

import { useCallback, useEffect, useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPlatformAdmin } from '@/lib/roles';
import {
  apiClient,
  PlatformBroadcast,
  PlatformBroadcastAudience
} from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

const AUDIENCES: PlatformBroadcastAudience[] = [
  'ALL_MANAGERS',
  'ALL_TEACHERS',
  'SELECTED_ACADEMIES'
];

export default function BroadcastsPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuthUser();
  const allowed = isPlatformAdmin(user);
  const [broadcasts, setBroadcasts] = useState<PlatformBroadcast[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] =
    useState<PlatformBroadcastAudience>('ALL_MANAGERS');
  const [academyIds, setAcademyIds] = useState('');
  const [busy, setBusy] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!allowed) return;
    try {
      const rows = await apiClient.listPlatformBroadcasts();
      setBroadcasts(rows);
    } catch {
      setBroadcasts([]);
    }
  }, [allowed]);

  useEffect(() => {
    if (!isLoading) load();
  }, [isLoading, load]);

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      await apiClient.createPlatformBroadcast({
        title: title.trim(),
        body: body.trim(),
        audience,
        academy_ids:
          audience === 'SELECTED_ACADEMIES'
            ? academyIds
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean)
            : undefined
      });
      setTitle('');
      setBody('');
      setAcademyIds('');
      ErrorHandler.showSuccess(t('broadcasts.created'));
      await load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (id: string) => {
    setSendingId(id);
    try {
      await apiClient.sendPlatformBroadcast(id);
      ErrorHandler.showSuccess(t('broadcasts.sent'));
      await load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSendingId(null);
    }
  };

  if (isLoading) return <div className="flex-1 p-4 sm:p-6" />;

  if (!allowed) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('broadcasts.title')}</CardTitle>
            <CardDescription>{t('broadcasts.accessDenied')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">{t('broadcasts.title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('broadcasts.compose')}</CardTitle>
          <CardDescription>
            {t('broadcasts.composeDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('broadcasts.fields.title')}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('broadcasts.fields.body')}</Label>
            <Textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('broadcasts.fields.audience')}</Label>
            <select
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={audience}
              onChange={(e) =>
                setAudience(e.target.value as PlatformBroadcastAudience)
              }
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {t(`broadcasts.audiences.${a}`)}
                </option>
              ))}
            </select>
          </div>
          {audience === 'SELECTED_ACADEMIES' && (
            <div className="space-y-2">
              <Label>{t('broadcasts.fields.academyIds')}</Label>
              <Input
                value={academyIds}
                onChange={(e) => setAcademyIds(e.target.value)}
                placeholder={t('broadcasts.fields.academyIdsPlaceholder')}
              />
            </div>
          )}
          <Button onClick={handleCreate} disabled={busy}>
            {t('broadcasts.saveDraft')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('broadcasts.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {broadcasts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('broadcasts.empty')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('broadcasts.fields.title')}</TableHead>
                  <TableHead>{t('broadcasts.fields.audience')}</TableHead>
                  <TableHead>{t('broadcasts.fields.status')}</TableHead>
                  <TableHead>{t('broadcasts.fields.recipients')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell>
                      {t(`broadcasts.audiences.${b.audience}`)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={b.status === 'SENT' ? 'default' : 'secondary'}
                      >
                        {t(`broadcasts.statuses.${b.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{b.recipient_count ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      {b.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={sendingId === b.id}
                          onClick={() => handleSend(b.id)}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          {t('broadcasts.send')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
