'use client';

import type { LucideIcon } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CopyBtn } from '@/components/affiliates/copy-btn';
import { useTranslation } from '@/lib/i18n/hooks';

type SupportContactCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  copyValue: string;
  href: string;
  actionLabel: string;
  hint: string;
};

export function SupportContactCard({
  icon: Icon,
  title,
  description,
  value,
  copyValue,
  href,
  actionLabel,
  hint
}: SupportContactCardProps) {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={title}
          description={description}
          icon={<Icon className="h-5 w-5" />}
        />
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p
                  dir="ltr"
                  className="truncate text-start text-lg font-semibold"
                >
                  {value}
                </p>
                <CopyBtn text={copyValue} label={t('common.copy')} />
              </div>
              <p className="text-sm text-muted-foreground">{hint}</p>
            </div>
            <Button asChild className="shrink-0">
              <a href={href}>
                {actionLabel}
                <ExternalLink className="ms-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
