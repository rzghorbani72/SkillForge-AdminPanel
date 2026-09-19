'use client';

import { useEffect, useState } from 'react';
import { LayoutTemplate, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';
import { SectionPreviewFrame } from '@/components/ui-template/section-preview-frame';
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
  sectionTypes: string[];
}

function toGroups(entries: CatalogEntry[]): TemplateGroup[] {
  const map = new Map<string, TemplateGroup>();
  for (const e of entries) {
    let group = map.get(e.presetId);
    if (!group) {
      group = { key: e.presetId, name: e.presetName, sectionTypes: [] };
      map.set(e.presetId, group);
    }
    group.sectionTypes.push(e.blockType);
  }
  return Array.from(map.values());
}

// Admin-only: live catalog of public templates. Each card embeds the real
// storefront render of the whole template in a scrollable box, so every
// section is seen exactly as it ships — fonts, slideshows and all.
export default function TemplateCoversPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<TemplateGroup[]>([]);
  const [storefrontBase, setStorefrontBase] = useState<string | null>(null);
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
        const [data, session] = await Promise.all([
          apiClient.getSectionCatalog() as Promise<CatalogEntry[]>,
          apiClient.getTemplatePreviewSession().catch(() => null),
        ]);
        setGroups(toGroups(data));
        setStorefrontBase(resolveStorefrontBaseUrl(session?.storefrontBaseUrl) ?? null);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-full bg-[#f2ece4] p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          پیش‌نمایش بخش‌های قالب‌ها
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          هر قالب عمومی با رندر واقعی فروشگاه نمایش داده می‌شود — داخل هر کادر اسکرول کنید تا همه
          بخش‌ها را ببینید.
        </p>
      </div>

      {!isLoading && !storefrontBase && (
        <p className="mb-6 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          آدرس سایت فروشگاه در دسترس نیست؛ پیش‌نمایش زنده ممکن نیست.
        </p>
      )}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : groups.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">قالب عمومی‌ای یافت نشد.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {groups.map((group) => (
            <div key={group.key} className="rounded-2xl border border-border/60 bg-background p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <LayoutTemplate className="h-4 w-4" />
                  {group.name}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  ({group.sectionTypes.length} بخش)
                </span>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {group.sectionTypes.map((type, i) => (
                  <span
                    key={`${type}-${i}`}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {blockLabel(type)}
                  </span>
                ))}
              </div>

              {storefrontBase ? (
                <SectionPreviewFrame
                  baseUrl={storefrontBase}
                  templateKey={group.key}
                  interactive
                  className="h-[440px] w-full rounded-xl border border-border bg-muted/30"
                />
              ) : (
                <div className="flex h-[440px] w-full items-center justify-center rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
                  پیش‌نمایش در دسترس نیست
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
