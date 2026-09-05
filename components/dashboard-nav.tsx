'use client';

import { Icons } from '@/components/icons';
import { useBreakpoint } from '@/hooks/useBreakPoints';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { ChevronRight, Lock } from 'lucide-react';
import Link from '@/components/ui/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

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
    isChildItem,
    translatedTitle
  }: {
    item: NavItem;
    isMinimized: boolean;
    isExpanded: boolean;
    isActive: boolean;
    isChildItem: boolean;
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
          isActive && (isChildItem ? 'active-child' : 'active'),
          item.disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent'
        )}
      >
        {/* Plain icon — no box, matches Mentoma design */}
        <Icon
          className={cn(
            'h-[17px] w-[17px] shrink-0 transition-[transform,color] duration-200 ease-out',
            isActive ? 'text-primary' : 'text-muted-foreground',
            !isActive &&
              !item.disabled &&
              'group-hover:scale-110 group-hover:text-primary'
          )}
        />
        {!isMinimized && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                'truncate text-sm transition-colors duration-150',
                isActive
                  ? 'font-semibold text-primary'
                  : 'font-medium text-foreground/75 group-hover:text-primary'
              )}
            >
              {translatedTitle}
            </span>
            {item.disabled && (
              <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
            {item.badge !== undefined && (
              <Badge
                variant="secondary"
                className={cn(
                  'h-[18px] rounded-full px-1.5 py-0 text-[10px] font-semibold',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {item.badge}
              </Badge>
            )}
          </div>
        )}
        {hasChildren && !isMinimized && !item.disabled && (
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-150',
              isExpanded ? 'rotate-90 text-primary' : 'rotate-180'
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
    <button className="w-full text-start" onClick={onClick}>
      {children}
    </button>
  )
);

NavItemButton.displayName = 'NavItemButton';

/**
 * How well an item's href matches the current URL. Longer wins, so a deep page
 * highlights (and expands) the most specific item: at /website/blog the Blog
 * child is active, not its Website sibling. -1 = no match.
 */
function matchScore(href: string, path: string, query: string): number {
  const [hrefPath, hrefQuery] = href.split('?');
  if (hrefQuery) {
    if (path !== hrefPath || !query) return -1;
    const current = new URLSearchParams(query);
    const wanted = new URLSearchParams(hrefQuery);
    for (const [key, value] of Array.from(wanted.entries())) {
      if (current.get(key) !== value) return -1;
    }
    return hrefPath.length + hrefQuery.length;
  }
  if (path !== hrefPath && !path.startsWith(`${hrefPath}/`)) return -1;
  return hrefPath.length;
}

function collectHrefs(items: NavItem[]): string[] {
  return items.flatMap((item) => [
    ...(item.href ? [item.href] : []),
    ...(item.children ? collectHrefs(item.children) : [])
  ]);
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false
}: DashboardNavProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isMinimized: isSidebarMinimized } = useSidebar();
  const isMinimized = isMobileNav ? false : isSidebarMinimized;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { isAboveLg } = useBreakpoint('lg');

  // Construct full path with query parameters
  const fullPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

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

  // Accordion: one group open at a time, so the list never grows past the
  // viewport and the next group is always one click away.
  const toggleExpand = useCallback((title: string) => {
    setExpandedItems((prev) =>
      prev.has(title) ? new Set<string>() : new Set([title])
    );
  }, []);

  const handleSetOpen = useCallback(() => {
    if (setOpen) setOpen(false);
  }, [setOpen]);

  const activeHref = useMemo(() => {
    const [path, query = ''] = fullPath.split('?');
    let best: { href: string; score: number } | null = null;
    for (const href of collectHrefs(items)) {
      const score = matchScore(href, path, query);
      if (score >= 0 && (!best || score > best.score)) best = { href, score };
    }
    return best?.href ?? null;
  }, [fullPath, items]);

  const isPathActive = useCallback(
    (href: string | undefined) => Boolean(href) && href === activeHref,
    [activeHref]
  );

  const hasActiveChild = useCallback(
    (item: NavItem) => {
      if (!item.children || item.children.length === 0) return false;
      return item.children.some((child) => isPathActive(child.href));
    },
    [isPathActive]
  );

  // Open the group holding the current page. A group the user opened by hand
  // stays open until they open another one, so navigating never closes it.
  React.useEffect(() => {
    const active = items.find((item) => hasActiveChild(item));
    if (!active) return;
    setExpandedItems((prev) =>
      prev.has(active.title) ? prev : new Set([active.title])
    );
  }, [fullPath, items, hasActiveChild]);

  // Nesting is one level deep by construction (see nav-filter), so a plain
  // recursive function is enough — no memo dance around itself.
  function renderNavItem(item: NavItem, depth = 0) {
    const hasChildren =
      item.children && Array.isArray(item.children) && item.children.length > 0;
    const isExpanded = expandedItems.has(item.title);

    const isActive = hasChildren
      ? isPathActive(item.href) || hasActiveChild(item)
      : isPathActive(item.href);
    const isChildItem = depth > 0 && !hasChildren;

    const translatedTitle = translateNavTitle(item.label || '', item.title);

    const content = (
      <NavItemContent
        item={item}
        isMinimized={isMinimized}
        isExpanded={isExpanded}
        isActive={isActive}
        isChildItem={isChildItem}
        translatedTitle={translatedTitle}
      />
    );

    if (hasChildren && isAboveLg && isMinimized && !item.disabled) {
      return (
        <DropdownMenu key={item.title}>
          <DropdownMenuTrigger className="w-full" asChild>
            <div>{content}</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-52 space-y-1 rounded-xl border-border/50 bg-popover/95 p-2 shadow-xl backdrop-blur-xl"
            align="start"
            side={isRTL ? 'left' : 'right'}
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
                    asChild
                  >
                    {child.href ? (
                      <Link
                        href={child.href}
                        onClick={handleSetOpen}
                        className={cn(
                          'w-full cursor-pointer font-medium',
                          childIsActive ? 'text-primary' : 'text-foreground/80'
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

    // A group with no page of its own only opens; one with an href also goes there.
    const handleParentClick = () => {
      if (item.href) {
        router.push(item.href);
        if (setOpen) setOpen(false);
      }
      toggleExpand(item.title);
    };

    return (
      <div key={item.title}>
        {item.disabled ? (
          // A preview, not a destination: no link and no submenu, so the item
          // shows what exists without leading anywhere it cannot go yet.
          <div aria-disabled="true">{content}</div>
        ) : hasChildren ? (
          <NavItemButton onClick={handleParentClick}>{content}</NavItemButton>
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
              <div className="ms-4 mt-0.5 space-y-px border-s border-border/60 ps-2.5">
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
  }

  const memoizedItems = useMemo(() => items, [items]);

  if (!memoizedItems?.length) {
    return null;
  }

  // Track which section labels have been rendered to avoid duplicates
  const renderedSections = new Set<string>();

  return (
    <nav className="flex flex-col gap-1">
      <TooltipProvider delayDuration={0}>
        {memoizedItems.map((item) => {
          const showSection =
            item.section && !renderedSections.has(item.section);
          if (item.section) renderedSections.add(item.section);

          return (
            <React.Fragment key={item.title}>
              {showSection && !isMinimized && (
                <div className="nav-section-label">
                  {t(`navigation.section.${item.section}`) || item.section}
                </div>
              )}
              {showSection && isMinimized && (
                <div className="mx-2 my-1.5 h-px bg-border/50" />
              )}
              <Tooltip>
                <TooltipTrigger asChild>{renderNavItem(item)}</TooltipTrigger>
                <TooltipContent
                  align="center"
                  side={isRTL ? 'left' : 'right'}
                  sideOffset={12}
                  className={cn(
                    'rounded-md border-border/50 bg-popover/95 px-3 py-1.5 text-sm font-medium shadow-lg backdrop-blur-xl',
                    !isMinimized && 'hidden'
                  )}
                >
                  {translateNavTitle(item.label || '', item.title)}
                </TooltipContent>
              </Tooltip>
            </React.Fragment>
          );
        })}
      </TooltipProvider>
    </nav>
  );
}
