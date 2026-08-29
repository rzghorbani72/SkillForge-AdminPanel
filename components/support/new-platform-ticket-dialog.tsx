'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Order follows how often academy staff pick them, not the enum order.
const CATEGORIES = [
  'TECHNICAL',
  'BILLING',
  'PAYMENT',
  'SALES',
  'CONSULTING',
  'ONBOARDING',
  'COURSE_ACCESS',
  'LIVE_CLASS',
  'CONTENT',
  'OTHER'
] as const;

/** Lets academy staff raise a ticket to the platform from the support inbox. */
export function NewPlatformTicketDialog({
  onCreated
}: {
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string>('TECHNICAL');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await apiClient.createPlatformTicket({
        subject: subject.trim(),
        category,
        body: body.trim()
      });
      toast.success(t('support.ticketCreated'));
      setOpen(false);
      setSubject('');
      setBody('');
      setCategory('TECHNICAL');
      onCreated();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t('support.newTicket')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('support.newTicket')}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-subject">{t('support.subject')}</Label>
            <Input
              id="ticket-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('support.category')}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`support.categories.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ticket-body">{t('support.message')}</Label>
            <Textarea
              id="ticket-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={saving || !subject.trim() || !body.trim()}
          >
            {saving ? t('common.saving') : t('support.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
