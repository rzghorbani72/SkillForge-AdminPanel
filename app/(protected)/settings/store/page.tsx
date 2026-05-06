'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Building2, Globe, Info } from 'lucide-react';
import { useSettingsData } from '../_hooks/use-settings-data';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { extractDomainPart, formatDomain } from '@/lib/store-utils';
import { useTranslation } from '@/lib/i18n/hooks';

interface StoreFormState {
  name: string;
  description: string;
  domain: string;
}

interface SubscriptionInvoice {
  id: number;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  starts_at: string;
  ends_at: string;
  paid_at?: string;
  note?: string;
}

interface SubscriptionState {
  academy?: {
    id: number;
    name: string;
    subscription_plan?: string | null;
    subscription_expires?: string | null;
  };
  status?: 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'INACTIVE';
  days_remaining?: number | null;
  grace_until?: string | null;
  invoices?: SubscriptionInvoice[];
}

const DEFAULT_FORM: StoreFormState = {
  name: '',
  description: '',
  domain: ''
};

export default function StoreSettingsPage() {
  const { t } = useTranslation();
  const { academy, isLoading } = useSettingsData();
  const [form, setForm] = useState<StoreFormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(
    null
  );
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewPlan, setRenewPlan] = useState('builder');
  const [renewMonths, setRenewMonths] = useState('1');
  const [renewAmount, setRenewAmount] = useState('');
  const [renewNote, setRenewNote] = useState('');

  useEffect(() => {
    if (!academy) {
      setForm(DEFAULT_FORM);
      return;
    }

    setForm({
      name: academy.name ?? '',
      description: academy.description ?? '',
      domain: academy.private_address ?? ''
    });
  }, [academy]);

  const fetchSubscription = async () => {
    try {
      setIsLoadingSubscription(true);
      const data = await apiClient.getCurrentAcademySubscription();
      setSubscription(data || null);
    } catch (error) {
      console.error('Error fetching subscription', error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updateData: {
        name?: string;
        description?: string;
        private_domain?: string;
      } = {};

      if (form.name) updateData.name = form.name;
      if (form.description !== undefined)
        updateData.description = form.description;

      if (form.domain && form.domain.trim()) {
        const domainPart = extractDomainPart(form.domain);
        const formattedDomain = formatDomain(domainPart);
        if (formattedDomain) {
          updateData.private_domain = formattedDomain;
        }
      }

      await apiClient.updateAcademy(updateData);
      ErrorHandler.showSuccess(t('settings.storeSettingsUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating store settings', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenew = async () => {
    try {
      setIsRenewing(true);
      await apiClient.renewCurrentAcademySubscription({
        plan_name: renewPlan,
        months: Number(renewMonths),
        amount: Number(renewAmount || 0),
        note: renewNote || undefined
      });
      ErrorHandler.showSuccess('Subscription renewed successfully');
      setRenewNote('');
      fetchSubscription();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const blob =
        await apiClient.downloadCurrentAcademySubscriptionInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscription-invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('settings.storeSettingsTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.storeSettingsSubtitle')}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.generalInformation')}</CardTitle>
            <CardDescription>
              {t('settings.generalInformationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storeName">{t('settings.storeName')}</Label>
                <Input
                  id="storeName"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder={t('settings.storeNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">{t('settings.customDomain')}</Label>
                <Input
                  id="domain"
                  value={form.domain}
                  onChange={(event) =>
                    setForm({ ...form, domain: event.target.value })
                  }
                  placeholder={t('settings.customDomainPlaceholder')}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">{t('settings.description')}</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder={t('settings.descriptionPlaceholder')}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? t('settings.saving') : t('settings.saveChanges')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Building2 className="h-4 w-4" />{' '}
                {t('settings.currentOverview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>{t('settings.students')}</span>
                <span className="font-medium text-foreground">
                  {academy?.students_count ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('settings.teachers')}</span>
                <span className="font-medium text-foreground">
                  {academy?.teachers_count ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('settings.managers')}</span>
                <span className="font-medium text-foreground">
                  {academy?.managers_count ?? '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {isLoadingSubscription ? (
                <p>Loading subscription...</p>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Plan</span>
                    <span className="font-medium text-foreground">
                      {subscription?.academy?.subscription_plan || 'none'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="font-medium text-foreground">
                      {subscription?.status || 'INACTIVE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires</span>
                    <span className="font-medium text-foreground">
                      {subscription?.academy?.subscription_expires
                        ? new Date(
                            subscription.academy.subscription_expires
                          ).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                  <div className="space-y-2 rounded-md border p-3">
                    <Label>Renew Plan</Label>
                    <Input
                      value={renewPlan}
                      onChange={(e) => setRenewPlan(e.target.value)}
                      placeholder="starter | builder | growth"
                    />
                    <Label>Months</Label>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={renewMonths}
                      onChange={(e) => setRenewMonths(e.target.value)}
                    />
                    <Label>Amount (IRR)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={renewAmount}
                      onChange={(e) => setRenewAmount(e.target.value)}
                    />
                    <Label>Note</Label>
                    <Input
                      value={renewNote}
                      onChange={(e) => setRenewNote(e.target.value)}
                      placeholder="transfer ref, invoice no, etc."
                    />
                    <Button
                      onClick={handleRenew}
                      disabled={isRenewing || !renewPlan || !renewMonths}
                      className="w-full"
                    >
                      {isRenewing ? 'Renewing...' : 'Renew Subscription'}
                    </Button>
                  </div>

                  {subscription?.invoices?.length ? (
                    <div className="rounded-md border p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Recent Invoices
                      </p>
                      <div className="space-y-2">
                        {subscription.invoices.slice(0, 5).map((invoice) => (
                          <div
                            key={invoice.id}
                            className="flex items-center justify-between rounded border px-2 py-1.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-foreground">
                                #{invoice.id} - {invoice.plan_name}
                              </p>
                              <p className="text-xs">
                                {invoice.amount.toLocaleString()}{' '}
                                {invoice.currency}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              PDF
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Globe className="h-4 w-4" /> {t('settings.domainTips')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t('settings.domainTipsText1')}</p>
              <p>{t('settings.domainTipsText2')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Info className="h-4 w-4" /> {t('settings.needHelp')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t('settings.needHelpText')}</p>
              <Button variant="outline" size="sm">
                {t('settings.openDocumentation')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
