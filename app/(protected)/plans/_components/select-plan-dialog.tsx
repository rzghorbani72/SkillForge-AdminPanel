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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { AcademyUpgradeQuote } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import {
  SubscriptionPlanData,
  PERIOD_OPTIONS,
  formatPrice,
  periodPrice,
  vatAmount,
} from '@/components/plans/plan-types';
import type { PaymentGatewayProvider } from '@/types/api';
import { UpgradeSummary } from './upgrade-summary';
import type { Dispatch, SetStateAction } from 'react';

export function SelectPlanDialog({
  appliedVoucher,
  availableGateways,
  currentSub,
  handleApplyVoucher,
  handleChangePlan,
  handleRemoveVoucher,
  includeStorageAddon,
  isChanging,
  isQuoteLoading,
  isValidatingVoucher,
  needsGatewaySelection,
  selectedGateway,
  selectedMonths,
  selectingPlan,
  setAppliedVoucher,
  setIncludeStorageAddon,
  setSelectedGateway,
  setSelectedMonths,
  setSelectingPlan,
  setVoucherCode,
  upgradeQuote,
  voucherCode,
}: {
  appliedVoucher: {
    code: string;
    discountAmount: number;
    finalAmount: number;
    couponType: string;
  } | null;
  availableGateways: { provider: string; display_name: string }[];
  currentSub: any;
  handleApplyVoucher: () => Promise<void>;
  handleChangePlan: () => Promise<void>;
  handleRemoveVoucher: () => void;
  includeStorageAddon: boolean;
  isChanging: boolean;
  isQuoteLoading: boolean;
  isValidatingVoucher: boolean;
  needsGatewaySelection: boolean;
  selectedGateway: PaymentGatewayProvider | null;
  selectedMonths: number;
  selectingPlan: SubscriptionPlanData;
  setAppliedVoucher: Dispatch<
    SetStateAction<{
      code: string;
      discountAmount: number;
      finalAmount: number;
      couponType: string;
    } | null>
  >;
  setIncludeStorageAddon: Dispatch<SetStateAction<boolean>>;
  setSelectedGateway: Dispatch<SetStateAction<PaymentGatewayProvider | null>>;
  setSelectedMonths: Dispatch<SetStateAction<number>>;
  setSelectingPlan: Dispatch<SetStateAction<SubscriptionPlanData | null>>;
  setVoucherCode: Dispatch<SetStateAction<string>>;
  upgradeQuote: AcademyUpgradeQuote | null;
  voucherCode: string;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open onOpenChange={(o) => !o && setSelectingPlan(null)}>
      <DialogContent className="gap-0 sm:max-w-md" dir="rtl">
        <DialogHeader className="space-y-1 pb-3">
          <DialogTitle>{t('plans.confirmChangePlan')}</DialogTitle>
          {!upgradeQuote && !isQuoteLoading && (
            <DialogDescription className="text-xs">
              {t('plans.confirmChangePlanDesc')}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{t('plans.choosePlan')}</p>
              <p className="truncate font-bold">{selectingPlan.name}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">
              {formatPrice(selectingPlan.price_monthly)}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                {t('plans.pricePerMonth')}
              </span>
            </p>
          </div>

          {isQuoteLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : upgradeQuote ? (
            <UpgradeSummary quote={upgradeQuote} appliedVoucher={appliedVoucher} t={t} />
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('plans.subscriptionPeriod')}</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PERIOD_OPTIONS.map(({ months, key }) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => {
                        setSelectedMonths(months);
                        setAppliedVoucher(null);
                      }}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-sm font-medium transition-all duration-150',
                        selectedMonths === months
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-card text-foreground hover:border-primary/40',
                      )}
                    >
                      {t(`plans.${key}` as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>
              </div>
              {currentSub?.storage?.addon_gb != null && (
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-xs">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={includeStorageAddon}
                    onChange={(e) => {
                      setIncludeStorageAddon(e.target.checked);
                      setAppliedVoucher(null);
                    }}
                  />
                  <span>
                    {t('plans.includeStorageAddon', {
                      gb: currentSub.storage.addon_gb,
                    })}
                    {currentSub.storage.addon_price_toman != null && (
                      <span className="text-muted-foreground">
                        {' '}
                        ({formatPrice(currentSub.storage.addon_price_toman)} {t('plans.toman')})
                      </span>
                    )}
                  </span>
                </label>
              )}
              {(() => {
                const subtotal =
                  periodPrice(selectingPlan, selectedMonths === 3 ? 'quarterly' : 'monthly') +
                  (includeStorageAddon ? (currentSub?.storage?.addon_price_toman ?? 0) : 0);
                const hasDiscount = !!appliedVoucher && appliedVoucher.discountAmount > 0;
                const discountedSubtotal = hasDiscount ? appliedVoucher!.finalAmount : subtotal;
                const vatRate = selectingPlan.vat_rate ?? 0;
                const vat = vatAmount(discountedSubtotal, vatRate);
                const grandTotal = discountedSubtotal + vat;
                return (
                  <div className="space-y-1 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t('plans.totalPrice')}</span>
                      <span
                        className={cn(
                          'font-bold tabular-nums',
                          hasDiscount && 'text-sm font-normal text-muted-foreground line-through',
                        )}
                      >
                        {formatPrice(subtotal)} {t('plans.toman')}
                      </span>
                    </div>
                    {hasDiscount && (
                      <div className="flex items-center justify-between text-success">
                        <span>{t('plans.voucherDiscount')}</span>
                        <span className="tabular-nums">
                          − {formatPrice(appliedVoucher!.discountAmount)} {t('plans.toman')}
                        </span>
                      </div>
                    )}
                    {vat > 0 && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>
                          {t('plans.vatIncluded', {
                            percent: Math.round(vatRate * 100),
                          })}
                        </span>
                        <span className="tabular-nums">
                          + {formatPrice(vat)} {t('plans.toman')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border/50 pt-1 font-bold text-primary">
                      <span>{t('plans.finalPayableAmount')}</span>
                      <span className="tabular-nums">
                        {formatPrice(grandTotal)} {t('plans.toman')}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
          {(needsGatewaySelection || availableGateways.length > 1) && (
            <div className="space-y-2">
              <Label>{t('plans.selectGateway')}</Label>
              <div className="grid gap-2">
                {availableGateways.map((gw) => {
                  const provider = gw.provider as PaymentGatewayProvider;
                  return (
                    <button
                      key={gw.provider}
                      type="button"
                      onClick={() => setSelectedGateway(provider)}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-start text-sm font-medium transition-all duration-150',
                        selectedGateway === provider
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-card text-foreground hover:border-primary/40',
                      )}
                    >
                      <span className="truncate">{gw.display_name}</span>
                      {selectedGateway === provider && (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="plan-voucher-code" className="text-xs">
              {t('plans.voucherCode')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="plan-voucher-code"
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value);
                  if (appliedVoucher) setAppliedVoucher(null);
                }}
                placeholder={t('plans.voucherCodePlaceholder')}
                autoComplete="off"
                disabled={isChanging || isValidatingVoucher}
                className="font-mono uppercase"
              />
              {appliedVoucher ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveVoucher}
                  disabled={isChanging || isValidatingVoucher}
                  className="shrink-0 whitespace-nowrap"
                >
                  {t('plans.removeVoucher')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleApplyVoucher}
                  disabled={!voucherCode.trim() || isChanging || isValidatingVoucher}
                  className="min-w-[6.5rem] shrink-0 whitespace-nowrap px-4"
                >
                  {isValidatingVoucher ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('plans.applyVoucher')
                  )}
                </Button>
              )}
            </div>
            {appliedVoucher ? (
              <p className="text-[11px] font-medium text-success">
                {t('plans.voucherApplied')}: {appliedVoucher.code} (−
                {formatPrice(appliedVoucher.discountAmount)} {t('plans.toman')})
              </p>
            ) : (
              <p className="text-[11px] leading-snug text-muted-foreground">
                {t('plans.voucherCodeHint')}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="pt-3">
          <Button variant="outline" onClick={() => setSelectingPlan(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleChangePlan}
            disabled={
              isChanging ||
              isQuoteLoading ||
              (needsGatewaySelection && availableGateways.length > 1 && !selectedGateway)
            }
          >
            {isChanging && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {upgradeQuote ? t('plans.confirmUpgrade') : t('plans.confirmChange')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
