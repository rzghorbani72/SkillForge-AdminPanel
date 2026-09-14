'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Link2, ShieldAlert, ExternalLink, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatDate } from '@/lib/utils';
import {
  CONTENT_REVIEW_STATUS,
  type ContentReviewStatus,
  type ReviewQueueItem,
} from '@/types/compliance';
import { EnamadStatusBadge, ReviewStatusBadge } from './review-status-badge';

type Props = {
  items: ReviewQueueItem[];
  onAct: (item: ReviewQueueItem, action: ContentReviewStatus) => void;
  onManage: (item: ReviewQueueItem) => void;
  storefrontBaseUrl: string | null;
};

function siteUrl(item: ReviewQueueItem, storefrontBaseUrl: string | null) {
  if (item.custom_domain) return `https://${item.custom_domain}`;
  if (!item.academy_slug || !storefrontBaseUrl) return null;
  return `${storefrontBaseUrl}/${item.academy_slug}`;
}

export function ReviewQueueTable({ items, onAct, onManage, storefrontBaseUrl }: Props) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t('compliance.queue.empty')}
      </p>
    );
  }

  return (
    <div className="table-h-scroll">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('compliance.queue.academy')}</TableHead>
            <TableHead>{t('compliance.queue.operator')}</TableHead>
            <TableHead>{t('compliance.queue.signals')}</TableHead>
            <TableHead>{t('compliance.queue.published')}</TableHead>
            <TableHead className="text-end">{t('compliance.queue.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const url = siteUrl(item, storefrontBaseUrl);
            return (
              <TableRow key={item.academy_id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{item.academy_name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {item.is_public_domain ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Link2 className="h-3 w-3" />
                      )}
                      {item.custom_domain ?? item.academy_slug ?? '—'}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {item.legal_entity_name ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{item.legal_entity_name}</span>
                      <EnamadStatusBadge status={item.enamad_status} />
                    </div>
                  ) : (
                    <Badge variant="destructive">{t('compliance.queue.noIdentity')}</Badge>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap items-center gap-1">
                    <ReviewStatusBadge status={item.review_status} />
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
                </TableCell>

                <TableCell className="text-xs text-muted-foreground">
                  {item.last_published_at ? formatDate(item.last_published_at) : '—'}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      title={t('compliance.manage.title')}
                      onClick={() => onManage(item)}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAct(item, CONTENT_REVIEW_STATUS.APPROVED)}
                    >
                      {t('compliance.action.APPROVED.short')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAct(item, CONTENT_REVIEW_STATUS.FLAGGED)}
                    >
                      {t('compliance.action.FLAGGED.short')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onAct(item, CONTENT_REVIEW_STATUS.SUSPENDED)}
                    >
                      {t('compliance.action.SUSPENDED.short')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
