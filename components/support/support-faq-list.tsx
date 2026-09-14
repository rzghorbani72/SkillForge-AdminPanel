'use client';

import { CircleHelp } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation } from '@/lib/i18n/hooks';

const FAQ_KEYS = ['ticket', 'enrollment', 'payment', 'teacher', 'live', 'plan'] as const;

export function SupportFaqList() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={t('support.help.faqTitle')}
          description={t('support.help.faqSubtitle')}
          icon={<CircleHelp className="h-5 w-5" />}
        />
        <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-start">
                {t(`support.help.faq.${key}.q`)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t(`support.help.faq.${key}.a`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PageContainer>
  );
}
