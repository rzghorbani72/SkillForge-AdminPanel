'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  SellerIdentity,
  SellerIdentityField,
  UpdateSellerIdentityPayload
} from '@/types/seller-identity';

type SellerIdentityFormProps = {
  identity: SellerIdentity | null;
  saving: boolean;
  highlightMissing?: readonly SellerIdentityField[];
  onSubmit: (payload: UpdateSellerIdentityPayload) => Promise<void>;
};

export function SellerIdentityForm({
  identity,
  saving,
  highlightMissing = [],
  onSubmit
}: SellerIdentityFormProps) {
  const { t } = useTranslation();
  const [legalEntityName, setLegalEntityName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [economicCode, setEconomicCode] = useState('');
  const [vatRegistrationNo, setVatRegistrationNo] = useState('');
  const [permitDeclared, setPermitDeclared] = useState(false);

  useEffect(() => {
    if (!identity) return;
    setLegalEntityName(identity.legal_entity_name ?? '');
    setNationalId(identity.national_id ?? '');
    setContactAddress(identity.contact_address ?? '');
    setEconomicCode(identity.economic_code ?? '');
    setVatRegistrationNo(identity.vat_registration_no ?? '');
    setPermitDeclared(identity.permit_declared_at !== null);
  }, [identity]);

  const missingSet = new Set(highlightMissing);
  const fieldClass = (field: SellerIdentityField) =>
    missingSet.has(field) ? 'border-destructive' : undefined;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      legal_entity_name: legalEntityName.trim(),
      national_id: nationalId.trim(),
      contact_address: contactAddress.trim(),
      economic_code: economicCode.trim() || undefined,
      vat_registration_no: vatRegistrationNo.trim() || undefined,
      permit_declared: permitDeclared
    });
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="seller-legal-name">
          {t('compliance.sellerIdentity.legalEntityName')}
        </Label>
        <Input
          id="seller-legal-name"
          value={legalEntityName}
          onChange={(event) => setLegalEntityName(event.target.value)}
          className={fieldClass('legal_entity_name')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seller-national-id">
          {t('compliance.sellerIdentity.nationalId')}
        </Label>
        <Input
          id="seller-national-id"
          value={nationalId}
          onChange={(event) => setNationalId(event.target.value)}
          className={fieldClass('national_id')}
          inputMode="numeric"
          required
        />
        <p className="text-xs text-muted-foreground">
          {t('compliance.sellerIdentity.nationalIdHelp')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seller-contact-address">
          {t('compliance.sellerIdentity.contactAddress')}
        </Label>
        <Textarea
          id="seller-contact-address"
          value={contactAddress}
          onChange={(event) => setContactAddress(event.target.value)}
          className={fieldClass('contact_address')}
          rows={3}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="seller-economic-code">
            {t('compliance.sellerIdentity.economicCode')}
          </Label>
          <Input
            id="seller-economic-code"
            value={economicCode}
            onChange={(event) => setEconomicCode(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seller-vat-no">
            {t('compliance.sellerIdentity.vatRegistrationNo')}
          </Label>
          <Input
            id="seller-vat-no"
            value={vatRegistrationNo}
            onChange={(event) => setVatRegistrationNo(event.target.value)}
          />
        </div>
      </div>

      <div
        className={`flex items-start gap-3 rounded-md border p-3 ${
          missingSet.has('permit_declared') ? 'border-destructive' : ''
        }`}
      >
        <Checkbox
          id="seller-permit-declared"
          checked={permitDeclared}
          onCheckedChange={(checked) => setPermitDeclared(checked === true)}
        />
        <div className="space-y-1">
          <Label htmlFor="seller-permit-declared" className="leading-snug">
            {t('compliance.sellerIdentity.permitLabel')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('compliance.sellerIdentity.permitHelp')}
          </p>
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? t('common.saving') : t('compliance.sellerIdentity.save')}
      </Button>
    </form>
  );
}
