'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  itemsPerPage: number;
}

const GAP = 'gap';

/** First, last, and a window around the current page — everything else collapses. */
function buildPageItems(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const window = [current - 1, current, current + 1].filter(
    (p) => p > 1 && p < total
  );
  const items: (number | string)[] = [1];

  if (window[0] > 2) items.push(`${GAP}-start`);
  items.push(...window);
  if (window[window.length - 1] < total - 1) items.push(`${GAP}-end`);
  items.push(total);

  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {t('common.showingResults', {
          from: formatNumber(from),
          to: formatNumber(to),
          total: formatNumber(totalItems)
        })}
      </p>

      {/* dir=ltr keeps page numbers ascending left-to-right in both scripts, the
          way every paginator is read, while the page itself stays RTL. */}
      <nav dir="ltr" className="flex items-center gap-1">
        <PageButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          label={t('common.previous')}
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>

        {buildPageItems(currentPage, totalPages).map((item) =>
          typeof item === 'string' ? (
            <span
              key={item}
              className="px-1 text-xs text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              onClick={() => onPageChange(item)}
              active={item === currentPage}
              label={String(item)}
            >
              {formatNumber(item)}
            </PageButton>
          )
        )}

        <PageButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          label={t('common.next')}
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
      </nav>
    </div>
  );
}

interface PageButtonProps {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

function PageButton({
  onClick,
  label,
  children,
  active = false,
  disabled = false
}: PageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-transparent px-2 text-xs font-medium transition-colors',
        active
          ? 'border-border bg-foreground text-background'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
      )}
    >
      {children}
    </button>
  );
}
