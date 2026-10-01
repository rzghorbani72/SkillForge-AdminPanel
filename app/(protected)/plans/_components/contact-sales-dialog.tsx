'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';

export function ContactSalesDialog({
  contactMessage,
  handleSubmitContactSales,
  isContactOpen,
  isSubmittingContact,
  setContactMessage,
  setIsContactOpen,
}: {
  contactMessage: string;
  handleSubmitContactSales: () => Promise<void>;
  isContactOpen: boolean;
  isSubmittingContact: boolean;
  setContactMessage: Dispatch<SetStateAction<string>>;
  setIsContactOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{t('plans.enterpriseContactDialogTitle')}</DialogTitle>
          <DialogDescription>{t('plans.enterpriseContactDialogDesc')}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={contactMessage}
          onChange={(e) => setContactMessage(e.target.value)}
          placeholder={t('plans.enterpriseContactPlaceholder')}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsContactOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmitContactSales} disabled={isSubmittingContact}>
            {isSubmittingContact && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t('plans.enterpriseContactSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
