import { toast } from 'sonner';

export class ApiResponseError extends Error {
  messageEn: string;
  messageFa: string;

  constructor(messageFa: string, messageEn: string) {
    super(messageEn || messageFa);
    this.messageFa = messageFa;
    this.messageEn = messageEn || messageFa;
  }
}

function preferredLang(): string {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('preferred_language') || 'en';
}

function pickMessage(fa: string, en: string): string {
  return preferredLang() === 'fa' ? fa || en : en || fa;
}

function extractMessages(raw: unknown): { fa: string; en: string } {
  const obj = raw as Record<string, unknown> | null;
  const fa = String(obj?.message || obj?.messageFa || '');
  const en = String(obj?.message_en || obj?.messageEn || obj?.message || '');
  return { fa, en };
}

export const apiToast = {
  success(response: unknown, fallback?: string) {
    const { fa, en } = extractMessages(response);
    const msg = pickMessage(fa, en) || fallback || 'Done';
    toast.success(msg);
  },

  error(err: unknown, fallback?: string) {
    if (err instanceof ApiResponseError) {
      toast.error(pickMessage(err.messageFa, err.messageEn));
      return;
    }
    const msg = err instanceof Error ? err.message : String(err || '');
    toast.error(msg || fallback || 'Something went wrong');
  }
};
