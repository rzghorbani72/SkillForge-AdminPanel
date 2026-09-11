'use client';

import Link from '@/components/ui/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatPaymentMethodLabel } from '@/lib/format-payment-method-label';
import type { GatewayConfigData } from '@/lib/api';

type Props = {
  gateways: GatewayConfigData[];
  savingId: string | null;
  onToggle: (gateway: GatewayConfigData, isActive: boolean) => void;
  onRefresh: () => void;
};

export function GatewayTogglesCard({
  gateways,
  savingId,
  onToggle,
  onRefresh
}: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{t('pricing.platform.gatewaysTitle')}</CardTitle>
          <CardDescription>
            {t('pricing.platform.gatewaysDesc')}
          </CardDescription>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="me-2 h-4 w-4" />
            {t('pricing.platform.refresh')}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/settings/payment-gateway">
              {t('pricing.platform.manageGatewayDetails')}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {gateways.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t('pricing.platform.noGateways')}
          </p>
        ) : (
          gateways.map((gw) => {
            const label = formatPaymentMethodLabel(gw.name, t);
            return (
              <div
                key={gw.id}
                className="flex items-center justify-between gap-4 rounded-lg border px-3 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{label}</span>
                    {gw.display_name &&
                      gw.display_name !== gw.name &&
                      gw.display_name !== label && (
                        <Badge
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {gw.display_name}
                        </Badge>
                      )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {!gw.is_active
                      ? t('pricing.platform.gatewayInactive')
                      : gw.config_schema?.token_configured
                        ? gw.is_sandbox
                          ? t('pricing.platform.gatewaySandbox')
                          : t('pricing.platform.gatewayActive')
                        : t('pricing.platform.gatewayNeedsToken')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`gw-${gw.id}`}
                    checked={gw.is_active}
                    disabled={savingId === gw.id}
                    onCheckedChange={(v) => onToggle(gw, v)}
                  />
                  <Label htmlFor={`gw-${gw.id}`} className="sr-only">
                    {label}
                  </Label>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
