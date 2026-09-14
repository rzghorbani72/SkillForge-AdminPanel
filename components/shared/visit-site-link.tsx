'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  academySiteHost,
  academySiteUrl,
  resolveAcademySiteUrls,
  type AcademyAddress,
} from '@/lib/academy-site-url';
import { cn } from '@/lib/utils';

interface VisitSiteLinkProps {
  academy: AcademyAddress | null | undefined;
  variant?: 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'icon';
  /** Icon-only rendering keeps the header compact on small screens. */
  iconOnly?: boolean;
  className?: string;
}

function SiteLinkAnchor({
  href,
  label,
  host,
  iconOnly,
  variant,
  size,
  className,
}: {
  href: string;
  label: string;
  host?: string;
  iconOnly: boolean;
  variant: VisitSiteLinkProps['variant'];
  size: VisitSiteLinkProps['size'];
  className?: string;
}) {
  return (
    <Button
      asChild
      variant={variant}
      size={iconOnly ? 'icon' : size}
      className={cn('gap-1.5', className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" title={label}>
        <ExternalLink className="h-4 w-4" />
        {!iconOnly && <span>{host ? `${label} · ${host}` : label}</span>}
      </a>
    </Button>
  );
}

export function VisitSiteLink({
  academy,
  variant = 'outline',
  size = 'sm',
  iconOnly = false,
  className,
}: VisitSiteLinkProps) {
  const { t } = useTranslation();
  const urls = resolveAcademySiteUrls(academy);
  const hasBoth = Boolean(urls.subdomain && urls.public);
  const singleHref = academySiteUrl(academy);

  if (!singleHref) return null;

  const visitLabel = t('academy.visitSite');

  if (!hasBoth) {
    return (
      <SiteLinkAnchor
        href={singleHref}
        label={visitLabel}
        iconOnly={iconOnly}
        variant={variant}
        size={size}
        className={className}
      />
    );
  }

  const subdomainHost = academySiteHost(urls.subdomain!);
  const publicHost = academySiteHost(urls.public!);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={iconOnly ? 'icon' : size}
          className={cn('gap-1.5', className)}
          title={t('academy.visitSiteChoose')}
        >
          <ExternalLink className="h-4 w-4" />
          {!iconOnly && <span>{visitLabel}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuItem asChild>
          <a
            href={urls.subdomain!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer flex-col items-start gap-0.5"
          >
            <span className="font-medium">{t('academy.visitSiteSubdomain')}</span>
            <span className="text-xs text-muted-foreground">{subdomainHost}</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={urls.public!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer flex-col items-start gap-0.5"
          >
            <span className="font-medium">{t('academy.visitSiteCustomDomain')}</span>
            <span className="text-xs text-muted-foreground">{publicHost}</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
