'use client';

import { useState } from 'react';
import { Ban } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { fromDateTimeInputValue, toDateTimeInputValue } from '@/lib/i18n/calendar-date';
import { useTranslation } from '@/lib/i18n/hooks';
import type { ClassSession } from '@/types/learning-operations';

type MakeupMode = 'append' | 'pick';

function defaultMakeupInput(startsAt: string): string {
  const weekLater = new Date(new Date(startsAt).getTime() + 7 * 24 * 60 * 60 * 1000);
  const soon = new Date(Date.now() + 60 * 60 * 1000);
  return toDateTimeInputValue(weekLater.getTime() > soon.getTime() ? weekLater : soon);
}

function formatSessionWhen(iso: string, timeZone: string, language: string): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone,
  }).format(new Date(iso));
}

function MakeupModePicker({
  mode,
  timeValue,
  onMode,
  onTime,
}: {
  mode: MakeupMode;
  timeValue: string;
  onMode: (next: MakeupMode) => void;
  onTime: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <RadioGroup
        value={mode}
        onValueChange={(value) => {
          if (value === 'append' || value === 'pick') onMode(value);
        }}
        className="gap-3"
      >
        <Label className="flex items-start gap-3 rounded-lg border p-3">
          <RadioGroupItem value="append" className="mt-0.5" />
          <span>
            <span className="block text-sm font-medium">{t('courses.live.cancelWithMakeup')}</span>
            <span className="text-xs text-muted-foreground">
              {t('courses.live.cancelWithMakeupHint')}
            </span>
          </span>
        </Label>
        <Label className="flex items-start gap-3 rounded-lg border p-3">
          <RadioGroupItem value="pick" className="mt-0.5" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">
              {t('courses.live.cancelWithMakeupAt')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('courses.live.cancelWithMakeupAtHint')}
            </span>
          </span>
        </Label>
      </RadioGroup>
      {mode === 'pick' ? (
        <DatePicker value={timeValue} onChange={onTime} withTime className="max-w-[240px]" />
      ) : null}
    </>
  );
}

interface CancelSessionDialogProps {
  session: ClassSession;
  onDone: () => void | Promise<void>;
}

export function CancelSessionDialog({ session, onDone }: CancelSessionDialogProps) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<MakeupMode>('append');
  const [timeValue, setTimeValue] = useState(() => defaultMakeupInput(session.starts_at));
  const [busy, setBusy] = useState(false);
  const cancelledWhen = formatSessionWhen(session.starts_at, session.timezone, language);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setMode('append');
      setTimeValue(defaultMakeupInput(session.starts_at));
    }
  };

  const submit = async () => {
    const makeupAt = mode === 'pick' ? fromDateTimeInputValue(timeValue) : null;
    if (mode === 'pick' && !makeupAt) return;
    setBusy(true);
    try {
      const result = await apiClient.cancelClassSession(session.id, {
        resolution: 'MAKEUP',
        ...(makeupAt ? { makeup_starts_at: makeupAt.toISOString() } : {}),
      });
      const makeupWhen = result.makeup
        ? formatSessionWhen(result.makeup.starts_at, result.makeup.timezone, language)
        : '';
      toast.success(
        t('courses.live.sessionCancelledMakeup', { time: cancelledWhen, makeup: makeupWhen }),
      );
      setOpen(false);
      await onDone();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Ban className="h-4 w-4" />
          {t('courses.live.cancelSession')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('courses.live.cancelSession')}</DialogTitle>
          <DialogDescription>
            {t('courses.live.cancelMakeupPreview', { time: cancelledWhen })}
          </DialogDescription>
        </DialogHeader>
        <MakeupModePicker
          mode={mode}
          timeValue={timeValue}
          onMode={setMode}
          onTime={setTimeValue}
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={busy}>
            {busy ? t('common.saving') : t('courses.live.confirmCancelMakeup')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
