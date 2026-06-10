'use client';

import { useEffect, useMemo, useState } from 'react';
import { ImageIcon, LayoutTemplate, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';
import { SectionPreviewFrame } from './section-preview-frame';

// Canonical section name shown in the picker, independent of the source
// template's variant label.
const CANON_NAME: Record<string, string> = {
  header: 'ناوبری',
  hero: 'هیرو',
  features: 'ویژگی‌ها',
  courses: 'دوره‌ها',
  testimonials: 'نظرات',
  pricing: 'تعرفه‌ها',
  cta: 'فراخوان',
  categories: 'دسته‌بندی‌ها',
  projects: 'نمونه‌کارها',
  'course-grid': 'شبکه دوره‌ها',
  footer: 'فوتر',
  slideshow: 'اسلایدشو',
  marquee: 'مارکی',
  membership: 'اشتراک'
};

export interface ImageSlot {
  key: string;
  aspect: '16:9' | '4:3' | '1:1' | 'auto';
  sizeOptions: ('sm' | 'md' | 'lg' | 'full')[];
}

export interface SectionCatalogEntry {
  id: string;
  presetId: string;
  presetName: string;
  presetPreview: string | null;
  blockId: string;
  blockType: string;
  sectionVariant: string | null;
  label: string;
  hasImagePlaceholder: boolean;
  imageSlots: ImageSlot[];
}

const SLOT_LABELS: Record<string, string> = {
  backgroundImage: 'background image',
  illustration: 'illustration',
  avatar: 'avatar',
  logo: 'logo',
  image: 'image',
  slides: 'slide image'
};

function summarizeImageSlots(slots: ImageSlot[]): string {
  const counts = slots.reduce<Record<string, number>>((acc, slot) => {
    acc[slot.key] = (acc[slot.key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([key, n]) => `${n} ${SLOT_LABELS[key] ?? key}${n > 1 ? 's' : ''}`)
    .join(', ');
}

interface SectionLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  // When set, the picker runs in swap mode: it offers only same-type sections
  // and replaces the given slot instead of appending a new one.
  swapTarget?: { blockId: string; type: string } | null;
}

const BLOCK_TYPE_LABEL_KEYS: Record<string, string> = {
  header: 'settings.header',
  hero: 'settings.heroSection',
  features: 'settings.featuresSection',
  courses: 'settings.coursesSection',
  testimonials: 'settings.testimonials',
  footer: 'settings.footer'
};

export function SectionLibraryModal({
  open,
  onClose,
  onImported,
  swapTarget
}: SectionLibraryModalProps) {
  const { t } = useTranslation();
  const [sections, setSections] = useState<SectionCatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [preview, setPreview] = useState<{
    baseUrl: string;
    token: string;
  } | null>(null);

  // Preview session powers the live section thumbnails (storefront origin +
  // academy-scoped token). Fetched once per open; failure degrades to no thumbs.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    apiClient
      .getTemplatePreviewSession()
      .then((session) => {
        const baseUrl = session.storefrontBaseUrl ?? resolveStorefrontBaseUrl();
        if (!cancelled && baseUrl) {
          setPreview({ baseUrl, token: session.token });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoading(true);

    apiClient
      .getSectionCatalog()
      .then((data) => {
        if (!cancelled) {
          setSections(data as SectionCatalogEntry[]);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          ErrorHandler.handleApiError(error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const blockTypes = useMemo(() => {
    const types = new Set(sections.map((section) => section.blockType));
    return Array.from(types).sort();
  }, [sections]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sections.filter((section) => {
      // Swap mode offers only the equivalent section type from other templates.
      if (swapTarget && section.blockType !== swapTarget.type) {
        return false;
      }
      if (
        !swapTarget &&
        typeFilter !== 'all' &&
        section.blockType !== typeFilter
      ) {
        return false;
      }
      if (!query) return true;
      return (
        section.label.toLowerCase().includes(query) ||
        section.presetName.toLowerCase().includes(query) ||
        section.blockType.toLowerCase().includes(query) ||
        (section.sectionVariant?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [sections, search, typeFilter, swapTarget]);

  // Group by source template so each section is labelled with its origin.
  const groups = useMemo(() => {
    const byPreset = new Map<string, SectionCatalogEntry[]>();
    for (const section of filtered) {
      const list = byPreset.get(section.presetId) ?? [];
      list.push(section);
      byPreset.set(section.presetId, list);
    }
    return Array.from(byPreset.values()).map((items) => ({
      presetId: items[0].presetId,
      presetName: items[0].presetName,
      presetPreview: items[0].presetPreview,
      items
    }));
  }, [filtered]);

  const handleSelect = async (section: SectionCatalogEntry) => {
    try {
      setIsImporting(section.id);
      if (swapTarget) {
        await apiClient.swapSectionInDraft(swapTarget.blockId, {
          presetId: section.presetId,
          blockId: section.blockId
        });
        ErrorHandler.showSuccess(t('settings.sectionSwappedSuccess'));
      } else {
        await apiClient.importSectionToDraft({
          presetId: section.presetId,
          blockId: section.blockId
        });
        ErrorHandler.showSuccess(t('settings.sectionImportedSuccess'));
      }
      onImported();
      onClose();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsImporting(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {swapTarget
                ? t('settings.sectionReplaceTitle')
                : t('settings.sectionLibraryTitle')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {swapTarget
                ? t('settings.sectionReplaceDescription')
                : t('settings.sectionLibraryDescription')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-accent"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 border-b px-5 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('settings.sectionLibrarySearch')}
              className="h-8 pl-8 text-sm"
            />
          </div>
          {!swapTarget && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {t('settings.sectionFilterAll')}
              </button>
              {blockTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {BLOCK_TYPE_LABEL_KEYS[type]
                    ? t(BLOCK_TYPE_LABEL_KEYS[type] as Parameters<typeof t>[0])
                    : type}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('common.loading')}
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('settings.sectionLibraryEmpty')}
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.presetId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {group.presetPreview ? (
                      <img
                        src={group.presetPreview}
                        alt={group.presetName}
                        className="h-7 w-12 shrink-0 rounded border object-cover"
                      />
                    ) : (
                      <span className="flex h-7 w-12 shrink-0 items-center justify-center rounded border bg-muted">
                        <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    )}
                    <p className="text-xs font-semibold">{group.presetName}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.items.map((section) => (
                      <div
                        key={section.id}
                        className="group/card overflow-hidden rounded-lg border transition-colors hover:border-primary/40"
                      >
                        {/* Live storefront render of this section */}
                        <div className="relative h-28 w-full border-b bg-muted/30">
                          {preview ? (
                            <SectionPreviewFrame
                              baseUrl={preview.baseUrl}
                              templateKey={section.presetId}
                              blockId={section.blockId}
                              token={preview.token}
                              className="h-full w-full"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <LayoutTemplate className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/card:opacity-100">
                            <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-zinc-900">
                              {swapTarget
                                ? t('settings.sectionReplace')
                                : t('settings.sectionAddToDraft')}
                            </span>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-col gap-2 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {CANON_NAME[section.blockType] ?? section.label}
                              </p>
                              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <LayoutTemplate className="h-3 w-3 shrink-0" />
                                {t('settings.sectionFromTemplate', {
                                  name: section.presetName
                                })}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              {section.sectionVariant && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px]"
                                >
                                  {section.sectionVariant}
                                </Badge>
                              )}
                              {section.imageSlots.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="gap-0.5 text-[9px] text-muted-foreground"
                                >
                                  <ImageIcon className="h-2.5 w-2.5" />
                                  {section.imageSlots.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {section.imageSlots.length > 0 && (
                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <ImageIcon className="h-2.5 w-2.5 shrink-0" />
                              {t('settings.sectionNeedsImages')}:{' '}
                              {summarizeImageSlots(section.imageSlots)}
                            </p>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={isImporting === section.id}
                            onClick={() => handleSelect(section)}
                          >
                            {isImporting === section.id
                              ? swapTarget
                                ? t('settings.sectionReplacing')
                                : t('settings.sectionImporting')
                              : swapTarget
                                ? t('settings.sectionReplace')
                                : t('settings.sectionAddToDraft')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
