'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { academySiteUrl, type AcademyAddress } from '@/lib/academy-site-url';
import { cn } from '@/lib/utils';

interface VisitSiteLinkProps {
  academy: AcademyAddress | null | undefined;
  variant?: 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'icon';
  /** Icon-only rendering keeps the header compact on small screens. */
  iconOnly?: boolean;
  className?: string;
}

export function VisitSiteLink({
  academy,
  variant = 'outline',
  size = 'sm',
  iconOnly = false,
  className
}: VisitSiteLinkProps) {
  const { t } = useTranslation();
  const href = academySiteUrl(academy);
  if (!href) return null;

  const label = t('academy.visitSite');

  return (
    <Button
      asChild
      variant={variant}
      size={iconOnly ? 'icon' : size}
      className={cn('gap-1.5', className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" title={label}>
        <ExternalLink className="h-4 w-4" />
        {!iconOnly && <span>{label}</span>}
      </a>
    </Button>
  );
}
