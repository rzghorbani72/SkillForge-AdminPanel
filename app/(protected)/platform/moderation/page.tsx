'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Globe } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canAccessSupportOps } from '@/lib/roles';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Pagination } from '@/components/shared/Pagination';
import { ReviewQueueTable } from '@/components/compliance/review-queue-table';
import { ReviewActionDialog } from '@/components/compliance/review-action-dialog';
import { ModerationDefaultsCard } from '@/components/compliance/moderation-defaults-card';
import { ContentQueueCard } from '@/components/compliance/content-queue-card';
import { AbuseReportsCard } from '@/components/compliance/abuse-reports-card';
import { AcademyComplianceDialog } from '@/components/compliance/academy-compliance-dialog';
import {
  CONTENT_REVIEW_STATUS,
  type ContentReviewStatus,
  type ReviewQueueItem,
  type ReviewQueueResponse
} from '@/types/compliance';

const TABS: (ContentReviewStatus | 'ALL')[] = [
  CONTENT_REVIEW_STATUS.PENDING,
  CONTENT_REVIEW_STATUS.FLAGGED,
  CONTENT_REVIEW_STATUS.APPROVED,
  'ALL'
];

export default function PlatformModerationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuthUser();
  const allowed = canAccessSupportOps(user);

  const [queue, setQueue] = useState<ReviewQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ContentReviewStatus | 'ALL'>(
    CONTENT_REVIEW_STATUS.PENDING
  );
  const [publicOnly, setPublicOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<ReviewQueueItem | null>(null);
  const [action, setAction] = useState<ContentReviewStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [managing, setManaging] = useState<ReviewQueueItem | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!allowed) router.replace('/platform');
  }, [authLoading, allowed, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getReviewQueue({
        status: tab === 'ALL' ? undefined : tab,
        public_domain_only: publicOnly,
        page
      });
      setQueue(data);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [tab, publicOnly, page]);

  useEffect(() => {
    if (allowed) void load();
  }, [allowed, load]);

  const confirmAction = async (note: string) => {
    if (!target || !action) return;
    setSubmitting(true);
    try {
      await apiClient.reviewAcademyContent(target.academy_id, {
        status: action,
        note: note || undefined
      });
      setTarget(null);
      setAction(null);
      await load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !allowed) return null;

  return (
    <div className="container max-w-7xl space-y-6 py-8">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">
            {t('compliance.queue.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('compliance.queue.subtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                {t('compliance.queue.listTitle')}
              </CardTitle>
              <CardDescription>
                {queue
                  ? t('compliance.queue.count', { count: queue.total })
                  : ''}
              </CardDescription>
            </div>
            <Button
              variant={publicOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setPublicOnly((value) => !value);
                setPage(1);
              }}
            >
              <Globe className="me-1 h-4 w-4" />
              {t('compliance.queue.publicDomainOnly')}
            </Button>
          </div>

          <Tabs
            value={tab}
            onValueChange={(value) => {
              setTab(value as ContentReviewStatus | 'ALL');
              setPage(1);
            }}
          >
            <TabsList dir="rtl">
              {TABS.map((value) => (
                <TabsTrigger key={value} value={value}>
                  {t(`compliance.queue.tab.${value}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <ReviewQueueTable
                items={queue?.items ?? []}
                storefrontBaseUrl={
                  process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/$/, '') ??
                  null
                }
                onAct={(item, next) => {
                  setTarget(item);
                  setAction(next);
                }}
                onManage={setManaging}
              />
              {queue && queue.total > queue.page_size ? (
                <Pagination
                  currentPage={queue.page}
                  totalPages={Math.ceil(queue.total / queue.page_size)}
                  onPageChange={setPage}
                  hasNextPage={queue.page * queue.page_size < queue.total}
                  hasPreviousPage={queue.page > 1}
                  totalItems={queue.total}
                  itemsPerPage={queue.page_size}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <AcademyComplianceDialog
        item={managing}
        onClose={() => setManaging(null)}
        onChanged={load}
      />

      <AbuseReportsCard />

      <ContentQueueCard />

      <ModerationDefaultsCard />

      <ReviewActionDialog
        item={target}
        action={action}
        submitting={submitting}
        onClose={() => {
          setTarget(null);
          setAction(null);
        }}
        onConfirm={confirmAction}
      />
    </div>
  );
}
