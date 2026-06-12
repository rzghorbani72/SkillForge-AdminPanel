'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutTemplate,
  ImageIcon,
  RefreshCw,
  Loader2,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';
import { useTranslation } from '@/lib/i18n/hooks';

interface CatalogEntry {
  presetId: string;
  presetName: string;
  presetPreview: string | null;
  blockId: string;
  blockType: string;
  coverImage: string | null;
}

interface TemplateGroup {
  key: string;
  name: string;
  cover: string | null;
  sections: { blockId: string; blockType: string; coverImage: string | null }[];
}

// One snapshot task; blockId null means the whole-template cover.
interface CaptureJob {
  templateKey: string;
  blockId: string | null;
}

type JobStatus = 'queued' | 'done' | 'failed';

const CAPTURE_TIMEOUT_MS = 45_000;

const jobKey = (job: CaptureJob) => `${job.templateKey}::${job.blockId ?? ''}`;

const captureUrl = (base: string, job: CaptureJob) => {
  const params = new URLSearchParams({ template: job.templateKey });
  if (job.blockId) params.set('only', job.blockId);
  return `${base.replace(/\/$/, '')}/preview/capture?${params.toString()}`;
};

function dataUrlToFile(dataUrl: string, name: string): File {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: 'image/png' });
}

function toGroups(entries: CatalogEntry[]): TemplateGroup[] {
  const map = new Map<string, TemplateGroup>();
  for (const e of entries) {
    let group = map.get(e.presetId);
    if (!group) {
      group = {
        key: e.presetId,
        name: e.presetName,
        cover: e.presetPreview,
        sections: []
      };
      map.set(e.presetId, group);
    }
    group.sections.push({
      blockId: e.blockId,
      blockType: e.blockType,
      coverImage: e.coverImage
    });
  }
  return Array.from(map.values());
}

const allJobs = (groups: TemplateGroup[]): CaptureJob[] =>
  groups.flatMap((g) => [
    { templateKey: g.key, blockId: null },
    ...g.sections.map((s) => ({ templateKey: g.key, blockId: s.blockId }))
  ]);

const missingJobs = (groups: TemplateGroup[]): CaptureJob[] =>
  groups.flatMap((g) => [
    ...(g.cover ? [] : [{ templateKey: g.key, blockId: null }]),
    ...g.sections
      .filter((s) => !s.coverImage)
      .map((s) => ({ templateKey: g.key, blockId: s.blockId }))
  ]);

// Admin-only: covers for public template cards and section-picker cards are
// snapshotted automatically from the storefront's real render (16:9). The
// storefront /preview/capture page screenshots its own DOM (the parent can't —
// it's cross-origin) and posts the PNG back here for upload.
export default function TemplateCoversPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<TemplateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storefrontBase, setStorefrontBase] = useState<string | null>(null);
  const [queue, setQueue] = useState<CaptureJob[]>([]);
  const [status, setStatus] = useState<Record<string, JobStatus>>({});

  const queueRef = useRef<CaptureJob[]>([]);
  queueRef.current = queue;
  const currentJob = queue[0] ?? null;

  const blockLabel = (type: string) => {
    const key =
      'sitePreview.block' +
      type
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
    return t(key) || type;
  };

  const enqueue = useCallback((jobs: CaptureJob[]) => {
    const seen = new Set(queueRef.current.map(jobKey));
    const added = jobs.filter((j) => !seen.has(jobKey(j)));
    if (!added.length) return;
    setStatus((s) => ({
      ...s,
      ...Object.fromEntries(
        added.map((j) => [jobKey(j), 'queued' as JobStatus])
      )
    }));
    setQueue((q) => [...q, ...added]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [data, session] = await Promise.all([
          apiClient.getSectionCatalog() as Promise<CatalogEntry[]>,
          apiClient.getTemplatePreviewSession().catch(() => null)
        ]);
        const loaded = toGroups(data);
        setGroups(loaded);
        setStorefrontBase(
          resolveStorefrontBaseUrl(session?.storefrontBaseUrl) ?? null
        );
        // Anything still without a cover gets generated right away.
        enqueue(missingJobs(loaded));
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [enqueue]);

  const applyCover = (job: CaptureJob, url: string) =>
    setGroups((prev) =>
      prev.map((g) => {
        if (g.key !== job.templateKey) return g;
        if (!job.blockId) return { ...g, cover: url };
        return {
          ...g,
          sections: g.sections.map((s) =>
            s.blockId === job.blockId ? { ...s, coverImage: url } : s
          )
        };
      })
    );

  // Drives one capture iframe at a time: wait for its postMessage (or time
  // out), upload the PNG through the existing cover APIs, advance the queue.
  useEffect(() => {
    if (!currentJob || !storefrontBase) return;
    const expectedOrigin = new URL(storefrontBase).origin;
    let finished = false;

    const finish = (ok: boolean) => {
      if (finished) return;
      finished = true;
      setStatus((s) => ({
        ...s,
        [jobKey(currentJob)]: ok ? 'done' : 'failed'
      }));
      setQueue((q) => q.slice(1));
    };

    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return;
      const msg = event.data as {
        type?: string;
        template?: string;
        only?: string | null;
        dataUrl?: string;
      };
      if (msg?.type !== 'template-cover-capture') return;
      if (
        msg.template !== currentJob.templateKey ||
        (msg.only ?? null) !== currentJob.blockId
      )
        return;
      if (!msg.dataUrl) {
        finish(false);
        return;
      }
      try {
        const file = dataUrlToFile(
          msg.dataUrl,
          `cover-${currentJob.templateKey}${
            currentJob.blockId ? `-${currentJob.blockId}` : ''
          }.png`
        );
        const result = (await apiClient.uploadImage(file, {
          title: `Template cover ${currentJob.templateKey}`
        })) as Record<string, unknown> | null;
        const id =
          (result?.id as number | undefined) ??
          ((result?.data as Record<string, unknown> | undefined)?.id as
            | number
            | undefined);
        if (!id) throw new Error('Cover upload failed');
        const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
        if (currentJob.blockId) {
          await apiClient.setSectionCover(
            currentJob.templateKey,
            currentJob.blockId,
            url
          );
        } else {
          await apiClient.setTemplateCover(currentJob.templateKey, url);
        }
        applyCover(currentJob, url);
        finish(true);
      } catch (error) {
        ErrorHandler.handleApiError(error);
        finish(false);
      }
    };

    window.addEventListener('message', onMessage);
    const timeout = setTimeout(() => finish(false), CAPTURE_TIMEOUT_MS);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timeout);
    };
  }, [currentJob, storefrontBase]);

  const statusOf = (job: CaptureJob): JobStatus | undefined =>
    status[jobKey(job)];
  const isBusy = queue.length > 0;

  return (
    <div className="min-h-full bg-[#f2ece4] p-8" dir="rtl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            تصاویر کاور قالب‌ها
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            کاورها به‌صورت خودکار از رندر واقعی هر قالب و بخش ساخته می‌شوند
            (نسبت ۱۶:۹) و در گالری و کتابخانه بخش‌ها نمایش داده می‌شوند.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          {isBusy && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              در حال تولید ({queue.length} باقی‌مانده)
            </span>
          )}
          <button
            type="button"
            onClick={() => enqueue(allJobs(groups))}
            disabled={isLoading || isBusy || !storefrontBase}
            className="flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            بازتولید همه کاورها
          </button>
        </div>
      </div>

      {!isLoading && !storefrontBase && (
        <p className="mb-6 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          آدرس سایت فروشگاه در دسترس نیست؛ تولید خودکار کاور ممکن نیست.
        </p>
      )}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('common.loading')}
        </p>
      ) : groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          قالب عمومی‌ای یافت نشد.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div
              key={group.key}
              className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="sm:w-72">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
                    <LayoutTemplate className="h-4 w-4" />
                    {group.name}
                  </p>
                  <CoverCard
                    image={group.cover}
                    title={`کاور قالب ${group.name}`}
                    state={statusOf({ templateKey: group.key, blockId: null })}
                    isActive={
                      !!currentJob &&
                      currentJob.templateKey === group.key &&
                      currentJob.blockId === null
                    }
                    onRegenerate={() =>
                      enqueue([{ templateKey: group.key, blockId: null }])
                    }
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    کاور کارت قالب در گالری
                  </p>
                </div>

                <div className="flex-1">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    کاور بخش‌ها
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {group.sections.map((section) => (
                      <div key={section.blockId} className="space-y-1">
                        <CoverCard
                          image={section.coverImage}
                          title={`${blockLabel(section.blockType)} — ${group.name}`}
                          state={statusOf({
                            templateKey: group.key,
                            blockId: section.blockId
                          })}
                          isActive={
                            !!currentJob &&
                            currentJob.templateKey === group.key &&
                            currentJob.blockId === section.blockId
                          }
                          onRegenerate={() =>
                            enqueue([
                              {
                                templateKey: group.key,
                                blockId: section.blockId
                              }
                            ])
                          }
                        />
                        <p className="truncate text-center text-[11px] font-medium text-foreground">
                          {blockLabel(section.blockType)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offscreen capture surface for the job at the head of the queue. It
          must stay rendered (not display:none) so the storefront lays out at
          the real 1280×720 viewport before snapshotting itself. */}
      {currentJob && storefrontBase && (
        <iframe
          key={jobKey(currentJob)}
          src={captureUrl(storefrontBase, currentJob)}
          width={1280}
          height={720}
          title="Cover capture"
          className="pointer-events-none fixed left-[-2000px] top-0 h-[720px] w-[1280px] border-0"
        />
      )}
    </div>
  );
}

function CoverCard({
  image,
  title,
  state,
  isActive,
  onRegenerate
}: {
  image: string | null;
  title: string;
  state?: JobStatus;
  isActive: boolean;
  onRegenerate: () => void;
}) {
  const pending = state === 'queued';
  return (
    <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted/40">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground/60">
          <ImageIcon className="h-4 w-4" />
          <span className="text-[10px]">بدون کاور</span>
        </span>
      )}

      {pending && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-[11px] font-medium text-white">
          <Loader2 className="h-4 w-4 animate-spin" />
          {isActive ? 'در حال تولید...' : 'در صف'}
        </span>
      )}

      {state === 'failed' && !pending && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
          ناموفق
        </span>
      )}

      {!pending && (
        <button
          type="button"
          title={`بازتولید ${title}`}
          onClick={onRegenerate}
          className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-zinc-700 opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
