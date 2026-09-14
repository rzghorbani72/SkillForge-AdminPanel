'use client';

import { CopyableValue } from '@/components/shared/copyable-value';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, CreditCard, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SettlementSummary } from '@/lib/api-settlement';
import { BankAccountDialog } from './bank-account-dialog';

interface SettlementBankAccountCardProps {
  academyId: string;
  bankAccount: SettlementSummary['bank_account'];
  onSaved: () => void;
}

const STATUS_STYLE = {
  APPROVED: { icon: CheckCircle2, variant: 'default' as const },
  PENDING: { icon: Clock, variant: 'secondary' as const },
  REJECTED: { icon: AlertTriangle, variant: 'destructive' as const },
};

/** The Sheba is the gate: no verified account, no settlement request. */
export function SettlementBankAccountCard({
  academyId,
  bankAccount,
  onSaved,
}: SettlementBankAccountCardProps) {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const status = bankAccount?.status;
  const StatusIcon = status ? STATUS_STYLE[status].icon : CreditCard;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('settlement.bank.title')}
        </CardTitle>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          {bankAccount ? t('settlement.bank.change') : t('settlement.bank.add')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {!bankAccount ? (
          <p className="text-sm text-muted-foreground">{t('settlement.bank.emptyHint')}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <CopyableValue
                value={bankAccount.sheba_number}
                className="font-mono text-lg tracking-wider"
              />
              <Badge variant={STATUS_STYLE[bankAccount.status].variant} className="gap-1">
                <StatusIcon className="h-3.5 w-3.5" />
                {t(`settlement.bank.status.${bankAccount.status}`)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('settlement.bank.holder')}: {bankAccount.account_holder_name}
            </p>
            {bankAccount.review_note ? (
              <p className="rounded-md bg-muted p-3 text-sm">{bankAccount.review_note}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">{t('settlement.bank.holderRule')}</p>
          </>
        )}
      </CardContent>

      <BankAccountDialog
        academyId={academyId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSaved={onSaved}
      />
    </Card>
  );
}
