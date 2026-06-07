'use client';

import { useEffect, useMemo, useState } from 'react';
import { ImageIcon, LayoutTemplate, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

export interface ImageSlot {
  key: string;
  aspect: '16:9' | '4:3' | '1:1' | 'auto';
  sizeOptions: ('sm' | 'md' | 'lg' | 'full')[];
}

export interface SectionCatalogEntry {
  id: string;
  presetId: string;
  presetName: string;
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
  onImported
}: SectionLibraryModalProps) {
  const { t } = useTranslation();
  const [sections, setSections] = useState<SectionCatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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
      if (typeFilter !== 'all' && section.blockType !== typeFilter) {
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
  }, [sections, search, typeFilter]);

  const handleImport = async (section: SectionCatalogEntry) => {
    try {
      setIsImporting(section.id);
      await apiClient.importSectionToDraft({
        presetId: section.presetId,
        blockId: section.blockId
      });
      ErrorHandler.showSuccess(t('settings.sectionImportedSuccess'));
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
              {t('settings.sectionLibraryTitle')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('settings.sectionLibraryDescription')}
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
            <div className="grid gap-2 sm:grid-cols-2">
              {filtered.map((section) => (
                <div
                  key={section.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {section.label}
                      </p>
                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <LayoutTemplate className="h-3 w-3 shrink-0" />
                        {section.presetName}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant="secondary" className="text-[9px]">
                        {section.blockType}
                      </Badge>
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
                    onClick={() => handleImport(section)}
                  >
                    {isImporting === section.id
                      ? t('settings.sectionImporting')
                      : t('settings.sectionAddToDraft')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
