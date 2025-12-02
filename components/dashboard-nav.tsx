'use client';

import { Icons } from '@/components/icons';
import { useBreakpoint } from '@/hooks/useBreakPoints';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';
import { useTranslation } from '@/lib/i18n/hooks';

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

const NavItemContent = React.memo(
  ({
    item,
    isMinimized,
    isExpanded,
    isActive,
    translatedTitle
  }: {
    item: NavItem;
    isMinimized: boolean;
    isExpanded: boolean;
    isActive: boolean;
    translatedTitle: string;
  }) => {
    const Icon =
      item.icon && Icons[item.icon as keyof typeof Icons]
        ? Icons[item.icon as keyof typeof Icons]
        : Icons.logo;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div
        className={cn(
          'sidebar-item group',
          isActive && 'active',
          item.disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {!isMinimized && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                'truncate font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-foreground/80 group-hover:text-foreground'
              )}
            >
              {translatedTitle}
            </span>
            {(item as any).badge && (
              <Badge
                variant="secondary"
                className="h-5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
              >
                {(item as any).badge}
              </Badge>
            )}
          </div>
        )}
        {hasChildren && !isMinimized && (
          <ChevronRight
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-90 text-primary'
            )}
          />
        )}
      </div>
    );
  }
);

NavItemContent.displayName = 'NavItemContent';

const NavItemLink = React.memo(
  ({
    item,
    onClick,
    children
  }: {
    item: NavItem;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <Link
      href={item.disabled ? '/' : item.href || '#'}
      className={cn(
        'block rounded-xl transition-all duration-200',
        item.disabled && 'cursor-not-allowed opacity-60'
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  )
);

NavItemLink.displayName = 'NavItemLink';

const NavItemButton = React.memo(
  ({
    onClick,
    children
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button className="w-full text-right" onClick={onClick}>
      {children}
    </button>
  )
);

NavItemButton.displayName = 'NavItemButton';

export function DashboardNav({ items, setOpen }: DashboardNavProps) {
  const { t } = useTranslation();
  const path = usePathname();
  const { isMinimized } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { isAboveLg } = useBreakpoint('lg');

  const translateNavTitle = useCallback(
    (label: string, title: string): string => {
      const translationKey = `navigation.${label}`;
      const translated = t(translationKey);
      if (translated && translated !== translationKey) {
        return translated;
      }
      return title;
    },
    [t]
  );

  const toggleExpand = useCallback((title: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  }, []);

  const handleSetOpen = useCallback(() => {
    if (setOpen) setOpen(false);
  }, [setOpen]);

  const isPathActive = useCallback(
    (href: string | undefined) => {
      if (!href) return false;
      const pathWithoutQuery = path.split('?')[0];
      const hrefWithoutQuery = href.split('?')[0];
      return (
        pathWithoutQuery === hrefWithoutQuery ||
        pathWithoutQuery.startsWith(hrefWithoutQuery + '/')
      );
    },
    [path]
  );

  const renderNavItem = useCallback(
    (item: NavItem, depth = 0) => {
      if (depth > 5) {
        console.warn(
          'Maximum navigation depth reached, skipping item:',
          item.title
        );
        return null;
      }

      const hasChildren =
        item.children &&
        Array.isArray(item.children) &&
        item.children.length > 0;
      const isExpanded = expandedItems.has(item.title);
      const isActive = isPathActive(item.href);
      const translatedTitle = translateNavTitle(item.label || '', item.title);

      const content = (
        <NavItemContent
          item={item}
          isMinimized={isMinimized}
          isExpanded={isExpanded}
          isActive={isActive}
          translatedTitle={translatedTitle}
        />
      );

      if (hasChildren && isAboveLg && isMinimized) {
        return (
          <DropdownMenu key={item.title}>
            <DropdownMenuTrigger className="w-full">
              {content}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 space-y-1 rounded-xl border-border/50 bg-popover/95 p-2 shadow-xl backdrop-blur-xl"
              align="start"
              side="right"
              sideOffset={8}
              avoidCollisions={true}
            >
              <DropdownMenuLabel className="px-2 text-xs font-semibold text-muted-foreground">
                {translatedTitle}
              </DropdownMenuLabel>
              {item.children &&
                item.children.map((child, index) => {
                  const childTranslatedTitle = translateNavTitle(
                    child.label || '',
                    child.title
                  );
                  const childIsActive = isPathActive(child.href);
                  return (
                    <DropdownMenuItem
                      key={`${child.title}-${index}`}
                      className={cn(
                        'rounded-lg px-3 py-2 transition-colors',
                        childIsActive && 'bg-primary/10 text-primary'
                      )}
                    >
                      {child.href ? (
                        <Link
                          href={child.href}
                          onClick={handleSetOpen}
                          className={cn(
                            'w-full cursor-pointer font-medium',
                            childIsActive
                              ? 'text-primary'
                              : 'text-foreground/80'
                          )}
                        >
                          {childTranslatedTitle}
                        </Link>
                      ) : (
                        <span className="cursor-pointer">
                          {childTranslatedTitle}
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }

      return (
        <div key={item.title}>
          {hasChildren ? (
            <NavItemButton onClick={() => toggleExpand(item.title)}>
              {content}
            </NavItemButton>
          ) : item.href ? (
            <NavItemLink item={item} onClick={handleSetOpen}>
              {content}
            </NavItemLink>
          ) : (
            <div>{content}</div>
          )}
          {hasChildren &&
            !isMinimized &&
            isExpanded &&
            (() => {
              return (
                <div className="ml-5 mt-1 space-y-1 border-l-2 border-border/50 pl-3">
                  {item.children &&
                    item.children.map((child, index) => (
                      <div key={`${child.title}-${index}`}>
                        {renderNavItem(child, depth + 1)}
                      </div>
                    ))}
                </div>
              );
            })()}
        </div>
      );
    },
    [
      expandedItems,
      isMinimized,
      isAboveLg,
      isPathActive,
      handleSetOpen,
      toggleExpand,
      translateNavTitle
    ]
  );

  const memoizedItems = useMemo(() => items, [items]);

  if (!memoizedItems?.length) {
    return null;
  }

  return (
    <nav className="grid items-start gap-1">
      <TooltipProvider delayDuration={0}>
        {memoizedItems.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>{renderNavItem(item)}</TooltipTrigger>
            <TooltipContent
              align="center"
              side="right"
              sideOffset={12}
              className={cn(
                'rounded-lg border-border/50 bg-popover/95 px-3 py-1.5 text-sm font-medium shadow-lg backdrop-blur-xl',
                !isMinimized && 'hidden'
              )}
            >
              {translateNavTitle(item.label || '', item.title)}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </nav>
  );
}
