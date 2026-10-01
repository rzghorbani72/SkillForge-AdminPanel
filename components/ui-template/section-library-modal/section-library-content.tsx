'use client';

import { LayoutTemplate, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction, JSX } from 'react';
import { SectionCatalogEntry } from '../_lib/section-library-modal-helpers';

export function SectionLibraryContent({
  blockLabel,
  blockTypes,
  filtered,
  groups,
  handleConfirm,
  isImporting,
  isLoading,
  onClose,
  renderCard,
  search,
  selected,
  setSearch,
  setSelected,
  setTypeFilter,
  swapTarget,
  typeFilter,
}: {
  blockLabel: (type: string) => string;
  blockTypes: string[];
  filtered: SectionCatalogEntry[];
  groups: {
    presetId: string;
    presetName: string;
    presetPreview: string | null;
    items: SectionCatalogEntry[];
  }[];
  handleConfirm: () => Promise<void>;
  isImporting: boolean;
  isLoading: boolean;
  onClose: () => void;
  renderCard: (section: SectionCatalogEntry, title: string, sublabel: string | null) => JSX.Element;
  search: string;
  selected: SectionCatalogEntry | null;
  setSearch: Dispatch<SetStateAction<string>>;
  setSelected: Dispatch<SetStateAction<SectionCatalogEntry | null>>;
  setTypeFilter: Dispatch<SetStateAction<string>>;
  swapTarget: { blockId: string; type: string } | null | undefined;
  typeFilter: string;
}) {
  const { t } = useTranslation();
  return (
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
            {swapTarget ? t('settings.sectionReplaceTitle') : t('settings.sectionLibraryTitle')}
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
          <Search className="absolute start-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('settings.sectionLibrarySearch')}
            className="h-8 ps-8 text-sm"
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
          <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
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
                null,
              ),
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
                        name: section.presetName,
                      }),
                    ),
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
            <span className="font-semibold text-foreground">{blockLabel(selected.blockType)}</span>
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
  );
}
