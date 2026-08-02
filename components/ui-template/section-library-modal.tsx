'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ImageIcon, LayoutTemplate, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
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
  presetPreview: string | null;
  blockId: string;
  blockType: string;
  sectionVariant: string | null;
  label: string;
  coverImage: string | null;
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

// Lightweight CSS layout hint shown when a section has no cover screenshot.
// It sketches the section's shape so the manager can tell types apart at a
// glance. Temporary until real per-section screenshots exist.
function SectionTypeThumb({ type }: { type: string }) {
  const bar = 'rounded-sm bg-muted-foreground/25';
  const shapes: Record<string, React.ReactNode> = {
    header: <div className={`h-2 w-full ${bar}`} />,
    hero: (
      <div className="flex w-full flex-col items-center gap-1.5">
        <div className={`h-2.5 w-1/2 ${bar}`} />
        <div className={`h-1.5 w-2/3 ${bar}`} />
        <div className="mt-1 h-3 w-16 rounded-md bg-primary/40" />
      </div>
    ),
    courses: (
      <div className="flex w-full gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-10 flex-1 ${bar}`} />
        ))}
      </div>
    ),
    testimonials: (
      <div className="flex w-full flex-col items-center gap-1">
        <div className="text-2xl leading-none text-muted-foreground/40">“</div>
        <div className={`h-1.5 w-3/4 ${bar}`} />
        <div className={`h-1.5 w-1/2 ${bar}`} />
      </div>
    ),
    pricing: (
      <div className="flex w-full items-end justify-center gap-1.5">
        <div className={`h-8 w-1/4 ${bar}`} />
        <div className="h-11 w-1/4 rounded-sm bg-primary/40" />
        <div className={`h-8 w-1/4 ${bar}`} />
      </div>
    ),
    cta: (
      <div className="flex w-full flex-col items-center gap-1.5">
        <div className={`h-2 w-1/2 ${bar}`} />
        <div className="h-4 w-20 rounded-md bg-primary/40" />
      </div>
    ),
    footer: <div className={`h-4 w-full rounded-sm bg-muted-foreground/15`} />
  };

  return (
    <div className="flex h-full w-full items-center justify-center px-6 py-4">
      {shapes[type] ?? (
        <div className="flex w-full flex-col gap-1.5">
          <div className={`h-2 w-1/3 ${bar}`} />
          <div className={`h-8 w-full ${bar}`} />
        </div>
      )}
    </div>
  );
}

interface SectionLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  // When set, the picker runs in swap mode: it offers only same-type sections
  // and replaces the given slot instead of appending a new one.
  swapTarget?: { blockId: string; type: string } | null;
}

export function SectionLibraryModal({
  open,
  onClose,
  onImported,
  swapTarget
}: SectionLibraryModalProps) {
  const { t } = useTranslation();
  const blockLabel = (type: string) => {
    const key =
      'sitePreview.block' +
      type
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
    return t(key) || type;
  };
  const [sections, setSections] = useState<SectionCatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selected, setSelected] = useState<SectionCatalogEntry | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoading(true);
    setSelected(null);

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

  // Clicking a card only selects it; the change is committed from the
  // confirmation footer so a swap/import is never applied by accident.
  const handleConfirm = async () => {
    if (!selected) return;
    try {
      setIsImporting(true);
      if (swapTarget) {
        await apiClient.swapSectionInDraft(swapTarget.blockId, {
          presetId: selected.presetId,
          blockId: selected.blockId
        });
        ErrorHandler.showSuccess(t('settings.sectionSwappedSuccess'));
      } else {
        await apiClient.importSectionToDraft({
          presetId: selected.presetId,
          blockId: selected.blockId
        });
        ErrorHandler.showSuccess(t('settings.sectionImportedSuccess'));
      }
      onImported();
      onClose();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsImporting(false);
    }
  };

  // One card, shared by the add-from-library grid and the swap "section style"
  // grid. `title`/`sublabel` differ per mode so swap mode reads as design
  // options (no "from template X" framing).
  const renderCard = (
    section: SectionCatalogEntry,
    title: string,
    sublabel: string | null
  ) => {
    const isSelected = selected?.id === section.id;
    return (
      <button
        key={section.id}
        type="button"
        onClick={() => setSelected(section)}
        className={`group/card overflow-hidden rounded-lg border text-right transition-colors ${
          isSelected
            ? 'border-primary ring-2 ring-primary/40'
            : 'hover:border-primary/40'
        }`}
      >
        <div className="relative aspect-[16/9] w-full border-b bg-muted/30">
          {section.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={section.coverImage}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <SectionTypeThumb type={section.blockType} />
          )}
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/15">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{title}</p>
              {sublabel && (
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <LayoutTemplate className="h-3 w-3 shrink-0" />
                  {sublabel}
                </p>
              )}
            </div>
            {section.imageSlots.length > 0 && (
              <Badge
                variant="outline"
                className="shrink-0 gap-0.5 text-[9px] text-muted-foreground"
              >
                <ImageIcon className="h-2.5 w-2.5" />
                {section.imageSlots.length}
              </Badge>
            )}
          </div>
          {section.imageSlots.length > 0 && (
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <ImageIcon className="h-2.5 w-2.5 shrink-0" />
              {t('settings.sectionNeedsImages')}:{' '}
              {summarizeImageSlots(section.imageSlots)}
            </p>
          )}
        </div>
      </button>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        hideCloseButton
        // Once a section is selected, a Cancel/Confirm footer appears —
        // from then on an accidental backdrop click shouldn't discard the
        // pick. Browsing with nothing selected can still close normally.
        onInteractOutside={(e) => {
          if (selected || isImporting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isImporting) e.preventDefault();
        }}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <DialogTitle className="text-lg font-semibold">
              {swapTarget
                ? t('settings.sectionReplaceTitle')
                : t('settings.sectionLibraryTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {swapTarget
                ? t('settings.sectionReplaceDescription')
                : t('settings.sectionLibraryDescription')}
            </DialogDescription>
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

        {swapTarget && (
          <div className="flex items-center gap-2 border-b bg-muted/40 px-5 py-2.5 text-xs text-muted-foreground">
            <span>{t('settings.sectionReplaceDescription')}</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
              {blockLabel(swapTarget.type)}
            </span>
          </div>
        )}

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
                  {blockLabel(type)}
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
          ) : swapTarget ? (
            // Style mode: a flat grid of design options for THIS section, with
            // no source-template framing — just "Design 1, 2, 3…".
            <div className="grid gap-2 sm:grid-cols-2">
              {filtered.map((section, i) =>
                renderCard(
                  section,
                  `${t('settings.sectionStyleLabel')} ${(i + 1).toLocaleString('fa-IR')}`,
                  null
                )
              )}
            </div>
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
                    {group.items.map((section) =>
                      renderCard(
                        section,
                        blockLabel(section.blockType),
                        t('settings.sectionFromTemplate', {
                          name: section.presetName
                        })
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-5 py-3">
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {blockLabel(selected.blockType)}
              </span>
              {!swapTarget && ` · ${selected.presetName}`}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                disabled={isImporting}
                onClick={() => setSelected(null)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs"
                disabled={isImporting}
                onClick={handleConfirm}
              >
                {isImporting
                  ? swapTarget
                    ? t('settings.sectionReplacing')
                    : t('settings.sectionImporting')
                  : swapTarget
                    ? t('settings.sectionReplace')
                    : t('settings.sectionAddToDraft')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
