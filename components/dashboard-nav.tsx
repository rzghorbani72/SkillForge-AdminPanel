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
    path,
    translatedTitle
  }: {
    item: NavItem;
    isMinimized: boolean;
    isExpanded: boolean;
    path: string;
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
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
          path === item.href ? 'bg-accent' : 'transparent',
          item.disabled && 'cursor-not-allowed opacity-80'
        )}
      >
        <Icon className="size-5 flex-none" />
        {!isMinimized && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate">{translatedTitle}</span>
            {(item as any).badge && (
              <Badge variant="secondary" className="h-5 px-1.5 py-0.5 text-xs">
                {(item as any).badge}
              </Badge>
            )}
          </div>
        )}
        {hasChildren && !isMinimized && (
          <ChevronRight className={cn('h-4 w-4', isExpanded && 'rotate-90')} />
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
      className={cn('block', item.disabled && 'cursor-not-allowed opacity-80')}
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
      // If translation exists and is different from the key, use it
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

  const renderNavItem = useCallback(
    (item: NavItem, depth = 0) => {
      // Prevent infinite recursion by limiting depth
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
      const translatedTitle = translateNavTitle(item.label || '', item.title);

      const content = (
        <NavItemContent
          item={item}
          isMinimized={isMinimized}
          isExpanded={isExpanded}
          path={path}
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
              className="w-48 space-y-1"
              align="start"
              side="right"
              sideOffset={5}
              avoidCollisions={true}
            >
              <DropdownMenuLabel>{translatedTitle}</DropdownMenuLabel>
              {item.children &&
                item.children.map((child, index) => {
                  const childTranslatedTitle = translateNavTitle(
                    child.label || '',
                    child.title
                  );
                  return (
                    <DropdownMenuItem key={`${child.title}-${index}`}>
                      {child.href ? (
                        <Link
                          href={child.href}
                          onClick={handleSetOpen}
                          className="w-full cursor-pointer"
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
                <div className="ml-4 mt-1 space-y-1">
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
      path,
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
    <nav className={cn('grid items-start gap-2')}>
      <TooltipProvider>
        {memoizedItems.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>{renderNavItem(item)}</TooltipTrigger>
            <TooltipContent
              align="center"
              side="right"
              sideOffset={8}
              className={!isMinimized ? 'hidden' : 'inline-block'}
            >
              {translateNavTitle(item.label || '', item.title)}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </nav>
  );
}
