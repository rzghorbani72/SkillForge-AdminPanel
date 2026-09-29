'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Eye, EyeOff, CheckCircle, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { apiClient, GatewayConfigData, GatewayRegistryStatus } from '@/lib/api';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { tNow } from '@/lib/i18n/t-now';
import { apiErrorMessage } from '@/lib/api-error-message';

interface GatewayState {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  is_sandbox: boolean;
  token_configured: boolean;
  newToken: string;
  terminalId: string;
  merchantId: string;
  callbackUrl: string;
  showToken: boolean;
  isSaving: boolean;
  initialIsActive: boolean;
  initialIsSandbox: boolean;
  initialToken: string;
  initialTerminalId: string;
  initialMerchantId: string;
  initialCallbackUrl: string;
}

export default function PaymentGatewaySettingsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const selectedGateway = (searchParams.get('gateway') || '').toUpperCase();
  const [gateways, setGateways] = useState<GatewayState[]>([]);
  const [registry, setRegistry] = useState<GatewayRegistryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeName = (name: string) => name.replace(/[^a-z0-9]/gi, '').toLowerCase();

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.listGatewayConfigs();
      const list: GatewayConfigData[] = data.gateways;
      const reg: GatewayRegistryStatus[] = data.adapter_availability;

      setRegistry(reg);
      setGateways(
        list.map((g) => ({
          id: g.id,
          name: g.name,
          display_name: g.display_name,
          is_active: g.is_active,
          is_sandbox: g.is_sandbox,
          token_configured: Boolean(g.config_schema?.token_configured),
          newToken: '',
          terminalId: String(g.config_schema?.terminal_id ?? ''),
          merchantId: String(g.config_schema?.merchant_id ?? ''),
          callbackUrl: String(g.config_schema?.callback_url ?? ''),
          showToken: false,
          isSaving: false,
          initialIsActive: g.is_active,
          initialIsSandbox: g.is_sandbox,
          initialToken: '',
          initialTerminalId: String(g.config_schema?.terminal_id ?? ''),
          initialMerchantId: String(g.config_schema?.merchant_id ?? ''),
          initialCallbackUrl: String(g.config_schema?.callback_url ?? ''),
        })),
      );
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, tNow('toasts.gatewayLoadFailed')));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const orderedGateways = useMemo(() => {
    if (!selectedGateway) return gateways;
    return [...gateways].sort((a, b) => {
      const aSelected =
        normalizeName(a.name) === normalizeName(selectedGateway) ||
        normalizeName(a.display_name).includes(normalizeName(selectedGateway));
      const bSelected =
        normalizeName(b.name) === normalizeName(selectedGateway) ||
        normalizeName(b.display_name).includes(normalizeName(selectedGateway));
      return Number(bSelected) - Number(aSelected);
    });
  }, [gateways, selectedGateway]);

  const handleSave = async (gw: GatewayState) => {
    const hasNoChanges =
      gw.is_active === gw.initialIsActive &&
      gw.is_sandbox === gw.initialIsSandbox &&
      gw.newToken.trim() === gw.initialToken &&
      gw.terminalId.trim() === gw.initialTerminalId &&
      gw.merchantId.trim() === gw.initialMerchantId &&
      gw.callbackUrl.trim() === gw.initialCallbackUrl;

    if (hasNoChanges) {
      toast.info(tNow('toasts.noChangesToSave'));
      return;
    }

    setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, isSaving: true } : g)));

    try {
      await apiClient.updateGatewayConfig(gw.id, {
        ...(gw.newToken.trim() ? { token: gw.newToken.trim() } : {}),
        is_active: gw.is_active,
        is_sandbox: gw.is_sandbox,
        extra: {
          ...(gw.terminalId.trim() ? { terminal_id: gw.terminalId.trim() } : {}),
          ...(gw.merchantId.trim() ? { merchant_id: gw.merchantId.trim() } : {}),
          ...(gw.callbackUrl.trim() ? { callback_url: gw.callbackUrl.trim() } : {}),
        },
      });
      toast.success(tNow('toasts.gatewayUpdated', { name: gw.display_name }));
      await load();
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, tNow('toasts.gatewayUpdateFailed')));
      setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, isSaving: false } : g)));
    }
  };

  const updateGateway = (id: string, patch: Partial<GatewayState>) => {
    setGateways((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const getRegistryStatus = (name: string) =>
    registry.find((r) => normalizeName(r.provider) === normalizeName(name));

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('settings.paymentGatewayTitle')}
          </h1>
          <p className="text-muted-foreground">{t('settings.gateway.subtitle')}</p>
        </div>
        <Button
          variant="outline"
          onClick={load}
          disabled={isLoading}
          className="w-full shrink-0 sm:w-auto"
        >
          <RefreshCw className="me-2 h-4 w-4" />
          {t('common.refresh')}
        </Button>
      </div>

      {registry.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.gateway.adapterStatusTitle')}</CardTitle>
            <CardDescription>{t('settings.gateway.adapterStatusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {registry.map((r) => (
                <div
                  key={r.provider}
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                >
                  <span className="font-medium">{r.provider}</span>
                  <Badge variant={r.configured ? 'default' : 'secondary'}>
                    {r.configured
                      ? t('settings.gateway.configured')
                      : t('settings.gateway.notConfigured')}
                  </Badge>
                  <Badge variant={r.implemented ? 'default' : 'outline'}>
                    {r.implemented ? t('settings.gateway.implemented') : t('settings.gateway.stub')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : gateways.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">{t('settings.gateway.noRecords')}</p>
            <Button onClick={load}>{t('settings.gateway.reload')}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderedGateways.map((gw) => {
            const reg = getRegistryStatus(gw.name);
            const isSaman = normalizeName(gw.name).includes('saman');
            return (
              <Card key={gw.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      {gw.display_name}
                      <Badge variant="outline" className="text-xs font-normal">
                        {gw.name}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {reg?.implemented ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {reg?.implemented
                          ? t('settings.gateway.fullyImplemented')
                          : t('settings.gateway.notYetImplemented')}
                      </span>
                    </div>
                  </div>
                  <CardDescription>
                    {t('settings.gateway.supportedCurrencies')} {t('settings.gateway.currencyIrr')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      id={`active-${gw.id}`}
                      checked={gw.is_active}
                      onCheckedChange={(v) => updateGateway(gw.id, { is_active: v })}
                    />
                    <Label htmlFor={`active-${gw.id}`}>
                      {gw.is_active
                        ? t('settings.gateway.activeAccepting')
                        : t('settings.gateway.inactiveDisabled')}
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      id={`sandbox-${gw.id}`}
                      checked={gw.is_sandbox}
                      onCheckedChange={(v) => updateGateway(gw.id, { is_sandbox: v })}
                    />
                    <Label htmlFor={`sandbox-${gw.id}`}>
                      {gw.is_sandbox
                        ? t('settings.gateway.sandboxMode')
                        : t('settings.gateway.productionMode')}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`token-${gw.id}`}>
                      {t('settings.gateway.apiToken')}
                      {gw.token_configured && (
                        <span className="ms-2 text-xs text-green-600 dark:text-green-400">
                          ✓ {t('settings.gateway.tokenIsSet')}
                        </span>
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`token-${gw.id}`}
                        type={gw.showToken ? 'text' : 'password'}
                        placeholder={
                          gw.token_configured
                            ? t('settings.gateway.tokenPlaceholderReplace')
                            : t('settings.gateway.tokenPlaceholderPaste')
                        }
                        value={gw.newToken}
                        onChange={(e) => updateGateway(gw.id, { newToken: e.target.value })}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateGateway(gw.id, { showToken: !gw.showToken })}
                        title={
                          gw.showToken
                            ? t('settings.gateway.hideToken')
                            : t('settings.gateway.showToken')
                        }
                      >
                        {gw.showToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('settings.gateway.tokenHint')}
                    </p>
                  </div>

                  {isSaman && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`terminal-${gw.id}`}>
                          {t('settings.gateway.terminalId')}
                        </Label>
                        <Input
                          id={`terminal-${gw.id}`}
                          placeholder={t('settings.gateway.terminalIdPlaceholder')}
                          value={gw.terminalId}
                          onChange={(e) => updateGateway(gw.id, { terminalId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`merchant-${gw.id}`}>
                          {t('settings.gateway.merchantId')}
                        </Label>
                        <Input
                          id={`merchant-${gw.id}`}
                          placeholder={t('settings.gateway.merchantIdPlaceholder')}
                          value={gw.merchantId}
                          onChange={(e) => updateGateway(gw.id, { merchantId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`callback-${gw.id}`}>
                          {t('settings.gateway.callbackUrl')}
                        </Label>
                        <Input
                          id={`callback-${gw.id}`}
                          placeholder="https://academy.mentoma.ir/payment/callback"
                          value={gw.callbackUrl}
                          onChange={(e) =>
                            updateGateway(gw.id, {
                              callbackUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave(gw)} disabled={gw.isSaving}>
                      <Save className="me-2 h-4 w-4" />
                      {gw.isSaving ? t('common.saving') : t('common.saveChanges')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <h3 className="mb-2 font-semibold text-amber-800 dark:text-amber-300">
            {t('settings.gateway.paypingGuideTitle')}
          </h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-amber-700 dark:text-amber-400">
            <li>{t('settings.gateway.paypingGuide1')}</li>
            <li>{t('settings.gateway.paypingGuide2')}</li>
            <li>{t('settings.gateway.paypingGuide3')}</li>
            <li>{t('settings.gateway.paypingGuide4')}</li>
            <li>{t('settings.gateway.paypingGuide5')}</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">
            {t('settings.gateway.samanNotesTitle')}
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
            <li>
              {t('settings.gateway.samanRequired')} <code>TerminalId</code>, <code>ResNum</code>,{' '}
              <code>RedirectURL</code>.
            </li>
            <li>{t('settings.gateway.samanWhitelist')}</li>
            <li>{t('settings.gateway.samanKeepDisabled')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
