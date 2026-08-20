'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useEntitySearch } from '@/hooks/use-entity-search';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { EntitySearchOption } from '@/types/entity-search';

export interface EntitySearchComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  fetchOptions: (
    query: string,
    signal?: AbortSignal
  ) => Promise<EntitySearchOption[]>;
  resolveOption?: (id: string) => Promise<EntitySearchOption | null>;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  clearable?: boolean;
  id?: string;
  className?: string;
}

export function EntitySearchCombobox({
  value,
  onValueChange,
  fetchOptions,
  resolveOption,
  placeholder,
  emptyMessage,
  disabled = false,
  clearable = false,
  id,
  className
}: EntitySearchComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EntitySearchOption | null>(null);

  const { options, loading, query, setQuery, refresh } = useEntitySearch({
    fetchOptions,
    enabled: open && !disabled
  });

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }

    if (selected?.value === value) {
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      if (resolveOption) {
        const resolved = await resolveOption(value);
        if (!cancelled && resolved) {
          setSelected(resolved);
        }
        return;
      }

      const match = options.find((option) => option.value === value);
      if (!cancelled && match) {
        setSelected(match);
      }
    };

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [value, resolveOption, selected?.value, options]);

  const handleSelect = useCallback(
    (option: EntitySearchOption) => {
      setSelected(option);
      onValueChange(option.value);
      setOpen(false);
    },
    [onValueChange]
  );

  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setSelected(null);
      onValueChange('');
    },
    [onValueChange]
  );

  const resolvedPlaceholder =
    placeholder ?? t('entitySearch.searchPlaceholder');
  const resolvedEmptyMessage = emptyMessage ?? t('entitySearch.noResults');

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setQuery('');
          refresh();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-between font-normal',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate text-start">
            {selected?.label ?? resolvedPlaceholder}
          </span>
          <span className="ms-2 flex shrink-0 items-center gap-1">
            {clearable && value ? (
              <span
                role="button"
                tabIndex={0}
                aria-label={t('entitySearch.clear')}
                className="rounded-sm p-0.5 hover:bg-accent"
                onClick={handleClear}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelected(null);
                    onValueChange('');
                  }
                }}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        collisionPadding={16}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={resolvedPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[min(300px,calc(var(--radix-popover-content-available-height)-3rem))]">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('entitySearch.loading')}
              </div>
            ) : (
              <>
                <CommandEmpty>{resolvedEmptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option)}
                    >
                      <Check
                        className={cn(
                          'me-2 h-4 w-4',
                          value === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{option.label}</p>
                        {option.description ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
