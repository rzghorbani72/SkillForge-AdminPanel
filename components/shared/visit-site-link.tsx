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
import { useVisitSiteGate, type VisitClick } from './use-visit-site-gate';

interface VisitSiteLinkProps {
  academy: (AcademyAddress & { id?: string }) | null | undefined;
  /** Ask once per academy whether to keep the auto-picked template before opening the site. */
  askTemplateChoice?: boolean;
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
  onClick,
}: {
  href: string;
  label: string;
  host?: string;
  iconOnly: boolean;
  variant: VisitSiteLinkProps['variant'];
  size: VisitSiteLinkProps['size'];
  className?: string;
  onClick?: VisitClick;
}) {
  return (
    <Button
      asChild
      variant={variant}
      size={iconOnly ? 'icon' : size}
      className={cn('gap-1.5', className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" title={label} onClick={onClick}>
        <ExternalLink className="h-4 w-4" />
        {!iconOnly && <span>{host ? `${label} · ${host}` : label}</span>}
      </a>
    </Button>
  );
}

export function VisitSiteLink({
  academy,
  askTemplateChoice = false,
  variant = 'outline',
  size = 'sm',
  iconOnly = false,
  className,
}: VisitSiteLinkProps) {
  const { t } = useTranslation();
  const { guard, dialog } = useVisitSiteGate(academy?.id ?? null, askTemplateChoice);
  const urls = resolveAcademySiteUrls(academy);
  const singleHref = academySiteUrl(academy);

  if (!singleHref) return null;

  const visitLabel = t('academy.visitSite');

  if (!urls.subdomain || !urls.public) {
    return (
      <>
        <SiteLinkAnchor
          href={singleHref}
          label={visitLabel}
          iconOnly={iconOnly}
          variant={variant}
          size={size}
          className={className}
          onClick={guard(singleHref)}
        />
        {dialog}
      </>
    );
  }

  const subdomainHost = academySiteHost(urls.subdomain);
  const publicHost = academySiteHost(urls.public);

  return (
    <>
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
              href={urls.subdomain}
              target="_blank"
              rel="noopener noreferrer"
              onClick={guard(urls.subdomain)}
              className="flex cursor-pointer flex-col items-start gap-0.5"
            >
              <span className="font-medium">{t('academy.visitSiteSubdomain')}</span>
              <span className="text-xs text-muted-foreground">{subdomainHost}</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={urls.public}
              target="_blank"
              rel="noopener noreferrer"
              onClick={guard(urls.public)}
              className="flex cursor-pointer flex-col items-start gap-0.5"
            >
              <span className="font-medium">{t('academy.visitSiteCustomDomain')}</span>
              <span className="text-xs text-muted-foreground">{publicHost}</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </>
  );
}
