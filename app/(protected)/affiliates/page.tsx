'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Network,
  Copy,
  Check,
  Eye,
  Phone,
  MessageSquare,
  TrendingUp,
  ArrowUp,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Clock,
  CircleCheck,
  XCircle,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import {
  useCurrentAcademyId,
  useCurrentAcademy
} from '@/hooks/useCurrentAcademy';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

// ─── Types ────────────────────────────────────────────────────────────────────

type Course = { id: number; title: string; price: number };
type Affiliate = {
  id: number;
  code: string;
  affiliate_name: string;
  affiliate_email?: string | null;
  affiliate_phone?: string | null;
  commission_rate: number;
  is_active: boolean;
  clicks: number;
  course_id?: number | null;
  academy_id: number;
  course?: Course | null;
  Usages?: Array<{ commission_amount: number; created_at?: string }>;
  signups?: number;
  sales?: number;
  revenue?: number;
  status?: 'active' | 'top' | 'pending' | 'inactive';
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

const editSchema = z.object({
  commission_pct: z.coerce.number().min(1).max(100)
});
type EditForm = z.infer<typeof editSchema>;

const addAffiliateSchema = z.object({
  affiliate_name: z.string().min(2, 'Name required'),
  phone: z.string().min(7, 'Phone required'),
  code: z.string().optional(),
  password: z.string().min(6, 'Min 6 characters').optional().or(z.literal('')),
  commission_pct: z.coerce.number().min(1).max(100)
});
type AddAffiliateForm = z.infer<typeof addAffiliateSchema>;

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ aff }: { aff: Affiliate }) {
  const apiStatus = aff.status;
  if (!aff.is_active || apiStatus === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        متوقف
      </span>
    );
  }
  if (apiStatus === 'top') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        برتر
      </span>
    );
  }
  if (apiStatus === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
        در انتظار
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      فعال
    </span>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title="کپی"
    >
      {done ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {delta !== undefined && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            <ArrowUp className="h-3 w-3" />
            {delta}٪
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold tracking-tight">
        {value}
      </div>
    </div>
  );
}

// ─── Row actions dropdown ─────────────────────────────────────────────────────

function RowActions({
  aff,
  onEdit,
  onToggle
}: {
  aff: Affiliate;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="عملیات"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute end-0 z-50 mt-1 w-40 rounded-lg border bg-popover py-1 shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            ویرایش
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
            onClick={() => {
              onToggle();
              setOpen(false);
            }}
          >
            {aff.is_active ? (
              <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
            )}
            {aff.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Withdrawal status badge ──────────────────────────────────────────────────

const W_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700'
};

function WBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-3 w-3" />,
    APPROVED: <CircleCheck className="h-3 w-3" />,
    PAID: <CircleCheck className="h-3 w-3" />,
    REJECTED: <XCircle className="h-3 w-3" />
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        W_STYLE[status] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {icons[status]}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Withdrawals section ──────────────────────────────────────────────────────

function WithdrawalsSection({
  formatCurrency
}: {
  formatCurrency: (n: number) => string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAffiliateWithdrawals();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: number, status: string) {
    setProcessing(id);
    try {
      await apiClient.processAffiliateWithdrawal(id, status);
      toast.success(`Marked as ${status.toLowerCase()}`);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    } finally {
      setProcessing(null);
    }
  }

  if (loading || items.length === 0) return null;
  const pending = items.filter((w) => w.status === 'PENDING');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ArrowDownToLine className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">درخواست‌های برداشت</h2>
        {pending.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {pending.length} در انتظار
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr className="text-xs text-muted-foreground">
              <th className="px-4 py-3 text-start font-medium">بازاریاب</th>
              <th className="px-4 py-3 text-start font-medium">مبلغ</th>
              <th className="px-4 py-3 text-start font-medium">
                تاریخ درخواست
              </th>
              <th className="px-4 py-3 text-start font-medium">وضعیت</th>
              <th className="px-4 py-3 text-end font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((w) => (
              <tr key={w.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {w.AffiliateLink?.affiliate_name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {w.AffiliateLink?.code}
                  </p>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {formatCurrency(w.amount)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(w.requested_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <WBadge status={w.status} />
                </td>
                <td className="px-4 py-3">
                  {w.status === 'PENDING' && (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'APPROVED')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        تأیید
                      </button>
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'REJECTED')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        رد
                      </button>
                    </div>
                  )}
                  {w.status === 'APPROVED' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'PAID')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        پرداخت شد
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Affiliate login preview (admin view of affiliate experience) ──────────────

function AffiliateLoginPreview({
  onClose,
  baseUrl,
  formatCurrency
}: {
  onClose: () => void;
  baseUrl: string;
  formatCurrency: (n: number) => string;
}) {
  const [step, setStep] = useState<'phone' | 'otp' | 'dash'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp') otpRefs.current[0]?.focus();
  }, [step]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="بستن"
        onClick={onClose}
        className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex max-h-[92vh] flex-col overflow-hidden rounded-2xl bg-background shadow-2xl transition-all duration-300',
          step === 'dash' ? 'w-[920px]' : 'w-[380px]'
        )}
      >
        {/* Header bar */}
        <div className="flex items-center gap-2.5 border-b px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            M
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">پنل بازاریاب · منتوریار</p>
            <p className="text-xs text-muted-foreground">
              {baseUrl.replace(/^https?:\/\//, '')}/r
            </p>
          </div>
          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            پیش‌نمایش
          </span>
        </div>

        {/* Phone step */}
        {step === 'phone' && (
          <div
            className="flex flex-col items-center px-8 py-10 text-center"
            dir="rtl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Phone className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tight">
              ورود به پنل بازاریاب
            </h2>
            <p className="mb-7 text-sm text-muted-foreground">
              برای ورود، شماره موبایلی که با آن ثبت‌نام کرده‌اید را وارد کنید
            </p>
            <input
              className="h-12 w-full rounded-lg border bg-background px-4 text-center font-mono text-base focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={() => setStep('otp')}
            >
              دریافت کد تأیید
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="mt-5 text-xs text-muted-foreground">
              با ورود، شرایط استفاده و سیاست حریم خصوصی را می‌پذیرید
            </p>
          </div>
        )}

        {/* OTP step */}
        {step === 'otp' && (
          <div
            className="flex flex-col items-center px-8 py-10 text-center"
            dir="rtl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tight">
              کد تأیید را وارد کنید
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              کد ۶ رقمی به{' '}
              <span className="font-mono font-semibold text-foreground">
                {phone || '۰۹۱۲ ۳۴۵ ۶۷۸۹'}
              </span>{' '}
              ارسال شد
            </p>
            <div className="flex justify-center gap-2" dir="rtl">
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  aria-label={`رقم ${i + 1}`}
                  className="h-[52px] w-[44px] rounded-lg border bg-background text-center font-mono text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={1}
                  value={v}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/, '');
                    setOtp((prev) => {
                      const a = [...prev];
                      a[i] = val;
                      return a;
                    });
                    if (val && i < 5) otpRefs.current[i + 1]?.focus();
                  }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              ارسال مجدد در ۰۰:۴۸
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={() => setStep('dash')}
            >
              ورود به پنل
            </button>
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setStep('phone')}
              dir="rtl"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              تغییر شماره
            </button>
          </div>
        )}

        {/* Dashboard step */}
        {step === 'dash' && (
          <AffiliateDashPreview
            formatCurrency={formatCurrency}
            baseUrl={baseUrl}
          />
        )}
      </div>
    </div>
  );
}

function AffiliateDashPreview({
  formatCurrency,
  baseUrl
}: {
  formatCurrency: (n: number) => string;
  baseUrl: string;
}) {
  const bars = [18, 24, 20, 32, 28, 38, 42, 36, 48, 52, 44, 58];
  const max = Math.max(...bars);

  return (
    <div className="overflow-y-auto" dir="rtl">
      <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            ا
          </div>
          <div>
            <p className="text-xs text-muted-foreground">خوش آمدید</p>
            <p className="text-base font-bold">امیر حسینی</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          برداشت موجودی
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 p-5">
        {[
          { l: 'درآمد کل', v: formatCurrency(28400000), accent: true },
          { l: 'موجودی', v: formatCurrency(8200000), accent: false },
          { l: 'کلیک‌ها', v: '۱٬۸۴۲', accent: false },
          { l: 'فروش', v: '۳۸', accent: false }
        ].map((s, i) => (
          <div
            key={i}
            className={cn(
              'rounded-xl border p-3',
              s.accent && 'border-primary bg-primary text-primary-foreground'
            )}
          >
            <p
              className={cn(
                'text-xs',
                s.accent
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground'
              )}
            >
              {s.l}
            </p>
            <p className="mt-1 font-mono text-lg font-bold">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="px-5 pb-4">
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="mb-2 text-xs text-muted-foreground">لینک اختصاصی شما</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border bg-background px-3 py-2 font-mono text-xs">
              {baseUrl}/r/amir2403
            </code>
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              کپی
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                درآمد ۳۰ روز گذشته
              </p>
              <p className="mt-1 font-mono text-xl font-bold">
                {formatCurrency(28400000)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              +۳۲٪
            </span>
          </div>
          <div className="flex h-24 items-end gap-1">
            {bars.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/80 transition-all hover:bg-primary"
                style={{ height: `${(v / max) * 100}%` }}
                role="presentation"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            فروش‌های اخیر
          </p>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
          >
            همه
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-xs">
            <tbody className="divide-y">
              {[
                {
                  user: 'علی محمدی',
                  course: 'ری‌اکت پیشرفته',
                  amount: 2480000,
                  comm: 372000
                },
                {
                  user: 'فاطمه احمدی',
                  course: 'زبان انگلیسی',
                  amount: 980000,
                  comm: 147000
                },
                {
                  user: 'مریم نوری',
                  course: 'فتوشاپ',
                  amount: 1480000,
                  comm: 222000
                },
                {
                  user: 'حسین رضایی',
                  course: 'پایتون',
                  amount: 1980000,
                  comm: 297000
                }
              ].map((s, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {s.user[0]}
                      </div>
                      <span className="font-medium">{s.user}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {s.course}
                  </td>
                  <td className="px-3 py-2.5 font-mono">
                    {formatCurrency(s.amount)}
                  </td>
                  <td className="px-3 py-2.5 font-mono font-semibold text-emerald-600">
                    +{formatCurrency(s.comm)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Add affiliate dialog ─────────────────────────────────────────────────────

function AddAffiliateDialog({
  open,
  onClose,
  onAdded,
  t,
  isRTL,
  baseUrl
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  t: (k: string) => string;
  isRTL: boolean;
  baseUrl: string;
}) {
  const [saving, setSaving] = useState(false);
  const [foundUser, setFoundUser] = useState<{ name: string } | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [customCommission, setCustomCommission] = useState(false);

  const form = useForm<AddAffiliateForm>({
    resolver: zodResolver(addAffiliateSchema),
    defaultValues: {
      affiliate_name: '',
      phone: '',
      code: '',
      password: '',
      commission_pct: 15
    }
  });

  const phoneValue = form.watch('phone');
  const codeValue = form.watch('code') ?? '';
  const commPct = form.watch('commission_pct');

  useEffect(() => {
    const phone = phoneValue?.trim();
    if (!phone || phone.length < 7) {
      setFoundUser(null);
      return;
    }
    const id = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const result = await apiClient.checkAffiliatePhone(phone);
        if (result.exists && result.name) {
          setFoundUser({ name: result.name });
          form.setValue('affiliate_name', result.name);
        } else {
          setFoundUser(null);
        }
      } catch {
        setFoundUser(null);
      } finally {
        setCheckingPhone(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [phoneValue, form]);

  function handleClose() {
    form.reset();
    setFoundUser(null);
    setCustomCommission(false);
    onClose();
  }

  async function submit(values: AddAffiliateForm) {
    if (!foundUser && !values.password) {
      form.setError('password', {
        message: 'Password is required for new accounts'
      });
      return;
    }
    setSaving(true);
    try {
      const result = await apiClient.createAffiliateAccount({
        affiliate_name: values.affiliate_name,
        phone: values.phone,
        ...(values.password ? { password: values.password } : {}),
        commission_rate: values.commission_pct / 100
      });
      const code = (result as any)?.code ?? '';
      toast.success(
        foundUser
          ? `نقش بازاریاب به ${foundUser.name} اضافه شد! کد: ${code}`
          : `بازاریاب ایجاد شد! کد: ${code}`
      );
      form.reset();
      setFoundUser(null);
      setCustomCommission(false);
      onAdded();
      handleClose();
    } catch (e: any) {
      toast.error(e?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  const QUICK_RATES = [10, 15, 20, 25];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-md p-0" dir={'rtl'}>
        <DialogHeader className="border-b px-6 py-4">
          <p className="text-xs font-medium text-muted-foreground">
            بازاریاب جدید
          </p>
          <DialogTitle className="text-lg">اضافه کردن یک بازاریاب</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)}>
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="affiliate_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام و نام خانوادگی</FormLabel>
                      <FormControl>
                        <Input placeholder="مثلاً: امیر حسینی" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تلفن همراه</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="tel"
                            dir="rtl"
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            {...field}
                          />
                          {checkingPhone && (
                            <Loader2 className="absolute end-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </FormControl>
                      {foundUser && (
                        <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
                          <CircleCheck className="h-3.5 w-3.5 shrink-0" />
                          یافت شد: <strong>{foundUser.name}</strong>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد اختصاصی</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="AMIR2403"
                          dir="rtl"
                          className="pe-40 font-mono"
                          {...field}
                        />
                        <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                          /r/<strong>{codeValue || 'AMIR2403'}</strong>
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <p className="mb-2 text-sm font-medium">درصد کمیسیون</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_RATES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={cn(
                        'rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
                        !customCommission && commPct === r
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                      onClick={() => {
                        form.setValue('commission_pct', r);
                        setCustomCommission(false);
                      }}
                    >
                      {r}٪
                    </button>
                  ))}
                  <button
                    type="button"
                    className={cn(
                      'rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
                      customCommission
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => setCustomCommission(true)}
                  >
                    سفارشی
                  </button>
                </div>
                {customCommission && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      aria-label="درصد کمیسیون سفارشی"
                      min={1}
                      max={50}
                      step={1}
                      value={commPct}
                      onChange={(e) =>
                        form.setValue('commission_pct', Number(e.target.value))
                      }
                      className="flex-1 accent-primary"
                    />
                    <span className="w-12 text-center font-mono text-sm font-semibold">
                      {commPct}٪
                    </span>
                  </div>
                )}
              </div>

              {!foundUser && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رمز عبور</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="حداقل ۶ کاراکتر"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        این رمز را به بازاریاب اطلاع دهید.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    ارسال پیامک با اطلاعات ورود
                  </p>
                  <p className="text-xs text-muted-foreground">
                    بازاریاب با شماره موبایل وارد می‌شود
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="ارسال پیامک"
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors focus:outline-none"
                  role="switch"
                  aria-checked="true"
                >
                  <span className="pointer-events-none inline-block h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm ring-0 transition-transform" />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <Button type="button" variant="ghost" onClick={handleClose}>
                انصراف
              </Button>
              <Button type="submit" disabled={saving || checkingPhone}>
                {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                ایجاد بازاریاب
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AffiliatesPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const formatCurrency = useFormatCurrency();
  const academyId = useCurrentAcademyId();
  const academy = useCurrentAcademy();

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Affiliate | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { commission_pct: 20 }
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAffiliates();
      setAffiliates(
        Array.isArray(data) ? data : (data?.affiliates ?? data?.data ?? [])
      );
    } catch {
      toast.error('Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = affiliates.filter((a) => a.is_active).length;
  const totalClicks = affiliates.reduce((s, a) => s + (a.clicks ?? 0), 0);
  const totalSales = affiliates.reduce(
    (s, a) => s + ((a as any).sales ?? a.Usages?.length ?? 0),
    0
  );
  const totalCommission = affiliates.reduce(
    (s, a) => s + (a.Usages?.reduce((x, u) => x + u.commission_amount, 0) ?? 0),
    0
  );

  function openEdit(aff: Affiliate) {
    setEditTarget(aff);
    editForm.reset({
      commission_pct: Math.round((aff.commission_rate ?? 0.2) * 100)
    });
  }

  async function onEditSubmit(values: EditForm) {
    if (!editTarget) return;
    setSaving(true);
    try {
      await apiClient.updateAffiliate(editTarget.id, {
        commission_rate: values.commission_pct / 100
      });
      toast.success(t('common.success'));
      setEditTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(aff: Affiliate) {
    try {
      await apiClient.updateAffiliate(aff.id, { is_active: !aff.is_active });
      load();
    } catch {
      toast.error(t('common.error'));
    }
  }

  const baseUrl = academy
    ? (academy as any).domain?.public_address
      ? `https://${(academy as any).domain.public_address}`
      : `https://${(academy as any).slug}.mentoryar.ir`
    : 'https://mentoryar.ir';

  return (
    <div className="flex-1 space-y-6 p-6" dir={'rtl'}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            بازاریابی
          </p>
          <h1 className="text-2xl font-bold tracking-tight">برنامه افیلیت</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            لینک‌های اختصاصی هر بازاریاب، کمیسیون‌ها و گزارش‌های فروش
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="me-2 h-4 w-4" />
            پیش‌نمایش ورود افیلیت
          </Button>
          {academyId && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              افزودن بازاریاب
            </Button>
          )}
        </div>
      </div>

      {!academyId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          برای مدیریت برنامه افیلیت یک آکادمی را انتخاب کنید.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="بازاریاب‌های فعال"
          value={activeCount.toLocaleString('fa-IR')}
          delta={18}
        />
        <StatCard
          label="کل کلیک‌ها"
          value={totalClicks.toLocaleString('fa-IR')}
          delta={24}
        />
        <StatCard
          label="فروش (این ماه)"
          value={totalSales.toLocaleString('fa-IR')}
          delta={32}
        />
        <StatCard
          label="کمیسیون پرداختی"
          value={formatCurrency(totalCommission)}
          delta={12}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl border bg-muted"
            />
          ))}
        </div>
      ) : affiliates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Network className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">
            {t('affiliates.noAffiliates')}
          </h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('affiliates.noAffiliatesDesc')}
          </p>
          {academyId && (
            <Button className="mt-6" onClick={() => setAddOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              {t('affiliates.newAffiliate')}
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr className="text-xs text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">بازاریاب</th>
                <th className="px-4 py-3 text-start font-medium">
                  لینک اختصاصی
                </th>
                <th className="px-4 py-3 text-end font-medium">کلیک</th>
                <th className="px-4 py-3 text-end font-medium">ثبت‌نام</th>
                <th className="px-4 py-3 text-end font-medium">فروش</th>
                <th className="px-4 py-3 text-end font-medium">درآمد</th>
                <th className="px-4 py-3 text-end font-medium">کمیسیون</th>
                <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {affiliates.map((aff) => {
                const commission =
                  aff.Usages?.reduce((s, u) => s + u.commission_amount, 0) ?? 0;
                const sales = (aff as any).sales ?? aff.Usages?.length ?? 0;
                const signups = (aff as any).signups ?? aff.Usages?.length ?? 0;
                const revenue = (aff as any).revenue ?? 0;
                const refUrl = `${baseUrl}?ref=${aff.code}`;

                return (
                  <tr
                    key={aff.id}
                    className={cn(
                      'hover:bg-muted/20',
                      !aff.is_active && 'opacity-60'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {(aff.affiliate_name?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight">
                            {aff.affiliate_name}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {aff.code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {refUrl.replace(/^https?:\/\//, '')}
                        </code>
                        <CopyBtn text={refUrl} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end font-mono">
                      {aff.clicks.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-4 py-3 text-end font-mono">
                      {signups.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-4 py-3 text-end font-mono">
                      {sales.toLocaleString('fa-IR')}
                    </td>
                    <td className="px-4 py-3 text-end font-mono text-sm">
                      {revenue > 0 ? (
                        formatCurrency(revenue)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end font-mono text-sm font-semibold text-emerald-600">
                      {commission > 0 ? (
                        formatCurrency(commission)
                      ) : (
                        <span className="font-normal text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge aff={aff} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        aff={aff}
                        onEdit={() => openEdit(aff)}
                        onToggle={() => toggleActive(aff)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdrawals */}
      {academyId && <WithdrawalsSection formatCurrency={formatCurrency} />}

      {/* Edit commission dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null);
        }}
      >
        <DialogContent className="max-w-sm" dir={'rtl'}>
          <DialogHeader>
            <DialogTitle>{t('affiliates.editAffiliate')}</DialogTitle>
            <DialogDescription>{editTarget?.affiliate_name}</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="commission_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('affiliates.commissionPercent')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={50}
                          step={1}
                          aria-label={t('affiliates.commissionPercent')}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="flex-1 accent-primary"
                        />
                        <div className="flex w-20 items-center overflow-hidden rounded-md border">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            {...field}
                            className="border-0 pe-0 text-center focus-visible:ring-0"
                          />
                          <span className="pe-2 text-sm text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditTarget(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t('affiliates.saveAffiliate')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AddAffiliateDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={load}
        t={t}
        isRTL={isRTL}
        baseUrl={baseUrl}
      />

      {showPreview && (
        <AffiliateLoginPreview
          onClose={() => setShowPreview(false)}
          baseUrl={baseUrl}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
