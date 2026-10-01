'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ImageIcon, LayoutTemplate } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { SectionLibraryContent } from './section-library-modal/section-library-content';
import { SectionCatalogEntry, ImageSlot } from './_lib/section-library-modal-helpers';

const SLOT_LABELS: Record<string, string> = {
  backgroundImage: 'background image',
  illustration: 'illustration',
  avatar: 'avatar',
  logo: 'logo',
  image: 'image',
  slides: 'slide image',
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
    cta: (
      <div className="flex w-full flex-col items-center gap-1.5">
        <div className={`h-2 w-1/2 ${bar}`} />
        <div className="h-4 w-20 rounded-md bg-primary/40" />
      </div>
    ),
    footer: <div className={`h-4 w-full rounded-sm bg-muted-foreground/15`} />,
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
  swapTarget,
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
      if (!swapTarget && typeFilter !== 'all' && section.blockType !== typeFilter) {
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
      items,
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
          blockId: selected.blockId,
        });
        ErrorHandler.showSuccess(t('settings.sectionSwappedSuccess'));
      } else {
        await apiClient.importSectionToDraft({
          presetId: selected.presetId,
          blockId: selected.blockId,
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
  const renderCard = (section: SectionCatalogEntry, title: string, sublabel: string | null) => {
    const isSelected = selected?.id === section.id;
    return (
      <button
        key={section.id}
        type="button"
        onClick={() => setSelected(section)}
        className={`group/card overflow-hidden rounded-lg border text-right transition-colors ${
          isSelected ? 'border-primary ring-2 ring-primary/40' : 'hover:border-primary/40'
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
              {t('settings.sectionNeedsImages')}: {summarizeImageSlots(section.imageSlots)}
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
      <SectionLibraryContent
        blockLabel={blockLabel}
        blockTypes={blockTypes}
        filtered={filtered}
        groups={groups}
        handleConfirm={handleConfirm}
        isImporting={isImporting}
        isLoading={isLoading}
        onClose={onClose}
        renderCard={renderCard}
        search={search}
        selected={selected}
        setSearch={setSearch}
        setSelected={setSelected}
        setTypeFilter={setTypeFilter}
        swapTarget={swapTarget}
        typeFilter={typeFilter}
      />
    </Dialog>
  );
}
