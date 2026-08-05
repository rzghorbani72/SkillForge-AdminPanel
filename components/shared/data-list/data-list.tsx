'use client';

import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/** Above this count a card grid becomes unreadable, so the list turns into a table. */
export const CARD_VIEW_MAX_ITEMS = 4;

type ColumnAlign = 'start' | 'center' | 'end';

export interface DataColumn<T> {
  id: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  align?: ColumnAlign;
  /** Applied to both the header cell and every body cell of this column. */
  className?: string;
}

interface DataListProps<T> {
  items: readonly T[];
  /** Omit when `alwaysCards` is set — the table is then never rendered. */
  columns?: readonly DataColumn<T>[];
  rowKey: (item: T) => string | number;
  /** Card renderer for short lists. Omit to always render the table. */
  renderCard?: (item: T) => ReactNode;
  /** Keep the card grid at any item count instead of falling back to the table. */
  alwaysCards?: boolean;
  /** Extra tile appended to the card grid, e.g. an "add new" placeholder. */
  cardExtra?: ReactNode;
  cardGridClassName?: string;
  onRowClick?: (item: T) => void;
  emptyState?: ReactNode;
  isLoading?: boolean;
  loadingRows?: number;
}

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end'
};

export function DataList<T>({
  items,
  columns = [],
  rowKey,
  renderCard,
  alwaysCards = false,
  cardExtra,
  cardGridClassName,
  onRowClick,
  emptyState,
  isLoading = false,
  loadingRows = 6
}: DataListProps<T>) {
  const showCards =
    Boolean(renderCard) && (alwaysCards || items.length <= CARD_VIEW_MAX_ITEMS);

  if (isLoading) {
    return alwaysCards ? (
      <CardGridSkeleton rows={loadingRows} className={cardGridClassName} />
    ) : (
      <DataListSkeleton columns={columns.length} rows={loadingRows} />
    );
  }

  // An empty list gets the empty state alone. A lone "add" card floating in an
  // otherwise empty grid reads as a stray tile; the empty state carries its own
  // call to action instead.
  if (items.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  if (renderCard && showCards) {
    return (
      <div
        className={cn(
          'grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3',
          cardGridClassName
        )}
      >
        {items.map((item) => (
          <div key={rowKey(item)}>{renderCard(item)}</div>
        ))}
        {cardExtra}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-none bg-muted/50 hover:bg-muted/50">
          {columns.map((column) => (
            <TableHead
              key={column.id}
              className={cn(
                'h-11 px-4 text-xs font-medium text-muted-foreground',
                ALIGN_CLASS[column.align ?? 'start'],
                column.className
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={rowKey(item)}
            className={cn(
              'border-border/50 hover:bg-muted/30',
              onRowClick && 'cursor-pointer'
            )}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
          >
            {columns.map((column) => (
              <TableCell
                key={column.id}
                className={cn(
                  'px-4 py-3 text-[13.5px]',
                  ALIGN_CLASS[column.align ?? 'start'],
                  column.className
                )}
              >
                {column.cell(item)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CardGridSkeleton({
  rows,
  className
}: {
  rows: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3', className)}
    >
      {Array.from({ length: rows }).map((_, card) => (
        <div
          key={card}
          className="h-40 animate-pulse rounded-xl border border-border/70 bg-muted"
        />
      ))}
    </div>
  );
}

function DataListSkeleton({
  columns,
  rows
}: {
  columns: number;
  rows: number;
}) {
  return (
    <div className="divide-y divide-border/50">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: columns }).map((_, column) => (
            <div
              key={column}
              className="h-3.5 flex-1 animate-pulse rounded bg-muted"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
