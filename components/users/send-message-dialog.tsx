'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { academyMessagesApi, type MessageChannel } from '@/lib/api-extra';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

const CHANNELS: { value: MessageChannel; labelKey: string }[] = [
  { value: 'SMS', labelKey: 'messages.channelSms' },
  { value: 'IN_APP', labelKey: 'messages.channelInApp' },
  { value: 'EMAIL', labelKey: 'messages.channelEmail' },
  { value: 'TELEGRAM', labelKey: 'messages.channelTelegram' },
  { value: 'BALE', labelKey: 'messages.channelBale' },
];

type SendMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Message a whole group. */
  groupId?: string;
  /** Or message specific students. */
  profileIds?: string[];
  /** Shown so the sender knows who this reaches. */
  recipientCount?: number;
};

export function SendMessageDialog({
  open,
  onOpenChange,
  groupId,
  profileIds,
  recipientCount,
}: SendMessageDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [channels, setChannels] = useState<Set<MessageChannel>>(
    new Set<MessageChannel>(['SMS', 'IN_APP']),
  );
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) return;
    setTitle('');
    setBody('');
    setChannels(new Set<MessageChannel>(['SMS', 'IN_APP']));
  }, [open]);

  function toggleChannel(channel: MessageChannel) {
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) {
        next.delete(channel);
      } else {
        next.add(channel);
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim() || channels.size === 0) return;

    setIsSending(true);
    try {
      const response = await academyMessagesApi.send({
        group_id: groupId,
        profile_ids: profileIds,
        title: title.trim(),
        body: body.trim(),
        channels: Array.from(channels),
      });

      // Report what actually happened — skipped recipients are not failures,
      // but they are not deliveries either.
      const { sent, skipped } = response.data;
      ErrorHandler.showSuccess(
        skipped > 0
          ? t('messages.sentWithSkipped', { sent, skipped })
          : t('messages.sentCount', { sent }),
      );
      onOpenChange(false);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('messages.sendMessage')}</DialogTitle>
          <DialogDescription>
            {recipientCount != null
              ? t('messages.recipientCount', { count: recipientCount })
              : t('messages.sendMessageDescription')}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="message-title">{t('messages.title')}</Label>
            <Input
              id="message-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={255}
              disabled={isSending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-body">{t('messages.body')}</Label>
            <Textarea
              id="message-body"
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={2000}
              disabled={isSending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t('messages.channels')}</Label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((channel) => {
                const isOn = channels.has(channel.value);
                return (
                  <button
                    key={channel.value}
                    type="button"
                    onClick={() => toggleChannel(channel.value)}
                    disabled={isSending}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                      isOn
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {t(channel.labelKey)}
                  </button>
                );
              })}
            </div>
            <p className="text-[11.5px] text-muted-foreground">{t('messages.messengerHint')}</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSending || !title.trim() || !body.trim() || channels.size === 0}
            >
              {isSending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('messages.send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
