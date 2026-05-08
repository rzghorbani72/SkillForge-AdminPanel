'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { apiClient, GatewayConfigData, GatewayRegistryStatus } from '@/lib/api';
import { toast } from 'react-toastify';

interface GatewayState {
  id: number;
  name: string;
  display_name: string;
  is_active: boolean;
  token_configured: boolean;
  newToken: string;
  terminalId: string;
  merchantId: string;
  callbackUrl: string;
  showToken: boolean;
  isSaving: boolean;
  initialIsActive: boolean;
  initialToken: string;
  initialTerminalId: string;
  initialMerchantId: string;
  initialCallbackUrl: string;
}

export default function PaymentGatewaySettingsPage() {
  const searchParams = useSearchParams();
  const selectedGateway = (searchParams.get('gateway') || '').toUpperCase();
  const [gateways, setGateways] = useState<GatewayState[]>([]);
  const [registry, setRegistry] = useState<GatewayRegistryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeName = (name: string) =>
    name.replace(/[^a-z0-9]/gi, '').toLowerCase();

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.listGatewayConfigs();
      const list: GatewayConfigData[] = data?.gateways ?? [];
      const reg: GatewayRegistryStatus[] = data?.registry ?? [];

      setRegistry(reg);
      setGateways(
        list.map((g) => ({
          id: g.id,
          name: g.name,
          display_name: g.display_name,
          is_active: g.is_active,
          token_configured: Boolean(g.config_schema?.token_configured),
          newToken: '',
          terminalId: String(g.config_schema?.terminal_id ?? ''),
          merchantId: String(g.config_schema?.merchant_id ?? ''),
          callbackUrl: String(g.config_schema?.callback_url ?? ''),
          showToken: false,
          isSaving: false,
          initialIsActive: g.is_active,
          initialToken: '',
          initialTerminalId: String(g.config_schema?.terminal_id ?? ''),
          initialMerchantId: String(g.config_schema?.merchant_id ?? ''),
          initialCallbackUrl: String(g.config_schema?.callback_url ?? '')
        }))
      );
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load gateway configs');
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
      gw.newToken.trim() === gw.initialToken &&
      gw.terminalId.trim() === gw.initialTerminalId &&
      gw.merchantId.trim() === gw.initialMerchantId &&
      gw.callbackUrl.trim() === gw.initialCallbackUrl;

    if (hasNoChanges) {
      toast.info('No changes to save');
      return;
    }

    setGateways((prev) =>
      prev.map((g) => (g.id === gw.id ? { ...g, isSaving: true } : g))
    );

    try {
      await apiClient.updateGatewayConfig(gw.id, {
        ...(gw.newToken.trim() ? { token: gw.newToken.trim() } : {}),
        is_active: gw.is_active,
        extra: {
          ...(gw.terminalId.trim()
            ? { terminal_id: gw.terminalId.trim() }
            : {}),
          ...(gw.merchantId.trim()
            ? { merchant_id: gw.merchantId.trim() }
            : {}),
          ...(gw.callbackUrl.trim()
            ? { callback_url: gw.callbackUrl.trim() }
            : {})
        }
      });
      toast.success(`${gw.display_name} updated successfully`);
      // Reload to reflect token_configured status
      await load();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update gateway');
      setGateways((prev) =>
        prev.map((g) => (g.id === gw.id ? { ...g, isSaving: false } : g))
      );
    }
  };

  const updateGateway = (id: number, patch: Partial<GatewayState>) => {
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  };

  const getRegistryStatus = (name: string) =>
    registry.find((r) => normalizeName(r.provider) === normalizeName(name));

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Gateway Settings
          </h1>
          <p className="text-muted-foreground">
            Configure API tokens and manage payment gateway providers
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Registry status banner */}
      {registry.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gateway Adapter Status</CardTitle>
            <CardDescription>
              Configured = token is set in DB or env. Implemented = HTTP flow is
              wired in backend code.
            </CardDescription>
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
                    {r.configured ? 'Configured' : 'Not configured'}
                  </Badge>
                  <Badge variant={r.implemented ? 'default' : 'outline'}>
                    {r.implemented ? 'Implemented' : 'Stub'}
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
            <p className="text-muted-foreground">
              No payment gateway records found in database.
            </p>
            <Button onClick={load}>Reload</Button>
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
                          ? 'Fully implemented'
                          : 'Not yet implemented'}
                      </span>
                    </div>
                  </div>
                  <CardDescription>
                    Supported currencies:{' '}
                    {gw.name === 'PayPing' ? 'IRR (Iranian Rial)' : 'See docs'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      id={`active-${gw.id}`}
                      checked={gw.is_active}
                      onCheckedChange={(v) =>
                        updateGateway(gw.id, { is_active: v })
                      }
                    />
                    <Label htmlFor={`active-${gw.id}`}>
                      {gw.is_active
                        ? 'Active — accepting payments'
                        : 'Inactive — disabled'}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`token-${gw.id}`}>
                      API Token / Secret
                      {gw.token_configured && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                          ✓ Token is set
                        </span>
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`token-${gw.id}`}
                        type={gw.showToken ? 'text' : 'password'}
                        placeholder={
                          gw.token_configured
                            ? 'Enter new token to replace the existing one'
                            : 'Paste gateway token/secret here'
                        }
                        value={gw.newToken}
                        onChange={(e) =>
                          updateGateway(gw.id, { newToken: e.target.value })
                        }
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateGateway(gw.id, { showToken: !gw.showToken })
                        }
                        title={gw.showToken ? 'Hide token' : 'Show token'}
                      >
                        {gw.showToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep the existing token unchanged.
                      Sensitive values are never returned by API responses.
                    </p>
                  </div>

                  {isSaman && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`terminal-${gw.id}`}>Terminal ID</Label>
                        <Input
                          id={`terminal-${gw.id}`}
                          placeholder="e.g. 12345678"
                          value={gw.terminalId}
                          onChange={(e) =>
                            updateGateway(gw.id, { terminalId: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`merchant-${gw.id}`}>Merchant ID</Label>
                        <Input
                          id={`merchant-${gw.id}`}
                          placeholder="e.g. merchant-id"
                          value={gw.merchantId}
                          onChange={(e) =>
                            updateGateway(gw.id, { merchantId: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`callback-${gw.id}`}>
                          Callback URL (optional override)
                        </Label>
                        <Input
                          id={`callback-${gw.id}`}
                          placeholder="https://mentoryaracademy.com/payment/callback"
                          value={gw.callbackUrl}
                          onChange={(e) =>
                            updateGateway(gw.id, {
                              callbackUrl: e.target.value
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave(gw)}
                      disabled={gw.isSaving}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {gw.isSaving ? 'Saving...' : 'Save Changes'}
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
            How to get your PayPing token
          </h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-amber-700 dark:text-amber-400">
            <li>Log in to your PayPing merchant account at payping.ir</li>
            <li>Go to API Settings → Generate Token</li>
            <li>
              Copy the Bearer token (starts with a long alphanumeric string)
            </li>
            <li>Paste it above and click Save Changes</li>
            <li>The system uses PayPing API v3 (api.payping.ir/v3)</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">
            Saman SEP setup notes (based on merchant docs)
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
            <li>
              Required for token flow: <code>TerminalId</code>,{' '}
              <code>ResNum</code>, <code>RedirectURL</code>.
            </li>
            <li>
              Recommended: whitelist your server IP with Saman before
              production.
            </li>
            <li>
              Keep Saman disabled until backend initiate/verify flow is fully
              implemented.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
