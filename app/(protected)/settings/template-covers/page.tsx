'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, LayoutTemplate, ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
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

// Admin-only: curate the static cover images shown on public template cards and
// section picker cards. Locked to the 16/9 ratio the cards crop to.
export default function TemplateCoversPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<TemplateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const blockLabel = (type: string) => {
    const key =
      'sitePreview.block' +
      type
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
    return t(key) || type;
  };

  useEffect(() => {
    (async () => {
      try {
        const data = (await apiClient.getSectionCatalog()) as CatalogEntry[];
        setGroups(toGroups(data));
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setTemplateCover = (key: string, url: string) =>
    setGroups((prev) =>
      prev.map((g) => (g.key === key ? { ...g, cover: url } : g))
    );

  const setSectionCover = (key: string, blockId: string, url: string) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.key === key
          ? {
              ...g,
              sections: g.sections.map((s) =>
                s.blockId === blockId ? { ...s, coverImage: url } : s
              )
            }
          : g
      )
    );

  return (
    <div className="min-h-full bg-[#f2ece4] p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          تصاویر کاور قالب‌ها
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          برای هر قالب عمومی و هر بخش آن، تصویر کاور بارگذاری کنید. این تصاویر
          در گالری و کتابخانه بخش‌ها نمایش داده می‌شوند (نسبت ۱۶:۹).
        </p>
      </div>

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
                  <CoverUploader
                    image={group.cover}
                    title={`کاور قالب ${group.name}`}
                    onUploaded={async (url) => {
                      await apiClient.setTemplateCover(group.key, url);
                      setTemplateCover(group.key, url);
                    }}
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
                        <CoverUploader
                          image={section.coverImage}
                          title={`${blockLabel(section.blockType)} — ${group.name}`}
                          onUploaded={async (url) => {
                            await apiClient.setSectionCover(
                              group.key,
                              section.blockId,
                              url
                            );
                            setSectionCover(group.key, section.blockId, url);
                          }}
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
    </div>
  );
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

function CoverUploader({
  image,
  title,
  onUploaded
}: {
  image: string | null;
  title: string;
  onUploaded: (url: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const result = await apiClient.uploadImage(file, { title });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        await onUploaded(`${getBrowserApiBaseUrl()}/images/get-image?id=${id}`);
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <button
        type="button"
        title={title}
        onClick={() => fileRef.current?.click()}
        className="group relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted/40 transition-colors hover:border-primary/50"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground/60">
            <Upload className="h-4 w-4" />
            <span className="text-[10px]">بارگذاری (۱۶:۹)</span>
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Upload className="h-3.5 w-3.5" />
          {busy ? 'در حال آپلود...' : image ? 'تغییر' : 'بارگذاری'}
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        title={title}
        aria-label={title}
        className="hidden"
        onChange={handleUpload}
        disabled={busy}
      />
    </>
  );
}
