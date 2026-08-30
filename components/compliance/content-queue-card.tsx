'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ShieldAlert } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatDate } from '@/lib/utils';
import {
  CONTENT_KIND_VALUES,
  MODERATION_STATUS,
  type ContentKind,
  type ContentQueueItem
} from '@/types/compliance';

/** Individual uploads held by a HOLD_FOR_REVIEW policy, awaiting approval. */
export function ContentQueueCard() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ContentQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [kind, setKind] = useState<ContentKind | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(
        await apiClient.getContentQueue({
          status: MODERATION_STATUS.PENDING_REVIEW,
          content_kind: kind ?? undefined
        })
      );
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (item: ContentQueueItem, approved: boolean) => {
    const note = approved
      ? undefined
      : (window.prompt(t('compliance.moderation.rejectReason')) ?? '');
    if (!approved && !note?.trim()) return;

    setBusy(item.id);
    try {
      await apiClient.reviewContentItem(item.id, {
        content_kind: item.content_kind,
        status: approved
          ? MODERATION_STATUS.APPROVED
          : MODERATION_STATUS.REJECTED,
        note: note || undefined
      });
      await load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('compliance.moderation.queueTitle')}
        </CardTitle>
        <CardDescription>
          {t('compliance.moderation.queueDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={kind === null ? 'default' : 'outline'}
            onClick={() => setKind(null)}
          >
            {t('compliance.queue.tab.ALL')}
          </Button>
          {CONTENT_KIND_VALUES.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={kind === value ? 'default' : 'outline'}
              onClick={() => setKind(value)}
            >
              {t(`compliance.moderation.kind.${value}`)}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('compliance.moderation.queueEmpty')}
          </p>
        ) : (
          <div className="table-h-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('compliance.moderation.item')}</TableHead>
                  <TableHead>{t('compliance.queue.academy')}</TableHead>
                  <TableHead>{t('compliance.queue.published')}</TableHead>
                  <TableHead className="text-end">
                    {t('compliance.queue.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.content_kind}-${item.id}`}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{item.title}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">
                            {t(
                              `compliance.moderation.kind.${item.content_kind}`
                            )}
                          </Badge>
                          {item.keyword_hits.length > 0 ? (
                            <Badge
                              variant="destructive"
                              title={item.keyword_hits.join('، ')}
                              className="gap-1"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              {item.keyword_hits.length}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.academy_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === item.id}
                          onClick={() => decide(item, true)}
                        >
                          {t('compliance.action.APPROVED.short')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busy === item.id}
                          onClick={() => decide(item, false)}
                        >
                          {t('compliance.moderation.reject')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
