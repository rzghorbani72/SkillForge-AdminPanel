'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Phone,
  MessageSquare,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

function AffiliateDashPreview({
  formatCurrency,
  baseUrl
}: {
  formatCurrency: (n: number) => string;
  baseUrl: string;
}) {
  const { t } = useTranslation();
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
            <p className="text-xs text-muted-foreground">
              {t('affiliates.previewWelcome')}
            </p>
            <p className="text-base font-bold">امیر حسینی</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          {t('affiliates.previewWithdraw')}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 p-5">
        {[
          {
            l: t('affiliates.previewStatTotal'),
            v: formatCurrency(28400000),
            accent: true
          },
          {
            l: t('affiliates.previewStatBalance'),
            v: formatCurrency(8200000),
            accent: false
          },
          { l: t('affiliates.previewStatClicks'), v: '۱٬۸۴۲', accent: false },
          { l: t('affiliates.previewStatSales'), v: '۳۸', accent: false }
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
          <p className="mb-2 text-xs text-muted-foreground">
            {t('affiliates.previewLinkTitle')}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border bg-background px-3 py-2 font-mono text-xs">
              {baseUrl}/r/amir2403
            </code>
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              {t('affiliates.previewCopy')}
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {t('affiliates.previewChartTitle')}
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
                style={{
                  ['--bar-h' as string]: `${(v / max) * 100}%`,
                  height: 'var(--bar-h)'
                }}
                role="presentation"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            {t('affiliates.previewRecentSales')}
          </p>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
          >
            {t('affiliates.previewViewAll')}
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

export function AffiliateLoginPreview({
  onClose,
  baseUrl,
  formatCurrency
}: {
  onClose: () => void;
  baseUrl: string;
  formatCurrency: (n: number) => string;
}) {
  const { t } = useTranslation();
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
        aria-label={t('common.close')}
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
        <div className="flex items-center gap-2.5 border-b px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            M
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {t('affiliates.previewPanelTitle')}
            </p>
            <p className="text-xs text-muted-foreground">
              {baseUrl.replace(/^https?:\/\//, '')}/r
            </p>
          </div>
          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            {t('affiliates.previewBadge')}
          </span>
        </div>

        {step === 'phone' && (
          <div
            className="flex flex-col items-center px-8 py-10 text-center"
            dir="rtl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Phone className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tight">
              {t('affiliates.previewPhoneTitle')}
            </h2>
            <p className="mb-7 text-sm text-muted-foreground">
              {t('affiliates.previewPhoneDesc')}
            </p>
            <input
              className="h-12 w-full rounded-lg border bg-background px-4 text-center font-mono text-base focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('affiliates.previewPhonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={() => setStep('otp')}
            >
              {t('affiliates.previewSendOtp')}
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="mt-5 text-xs text-muted-foreground">
              {t('affiliates.previewTerms')}
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div
            className="flex flex-col items-center px-8 py-10 text-center"
            dir="rtl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tight">
              {t('affiliates.previewOtpTitle')}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {t('affiliates.previewOtpSent', {
                phone: phone || t('affiliates.previewPhonePlaceholder')
              })}
            </p>
            <div className="flex justify-center gap-2" dir="rtl">
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  aria-label={`${i + 1}`}
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
              {t('affiliates.previewResend')}
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={() => setStep('dash')}
            >
              {t('affiliates.previewLogin')}
            </button>
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setStep('phone')}
              dir="rtl"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              {t('affiliates.previewChangePhone')}
            </button>
          </div>
        )}

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
