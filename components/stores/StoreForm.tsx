'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/hooks';

interface StoreFormData {
  name: string;
  private_domain: string;
  public_domain: string;
  description: string;
  is_active: boolean;
}

interface StoreFormProps {
  formData: StoreFormData;
  onFormDataChange: (data: StoreFormData) => void;
  domainValidation: {
    isValid: boolean;
    message: string;
  };
  domainAvailability: {
    isChecking: boolean;
    isAvailable: boolean;
    message: string;
  };
  isEdit?: boolean;
}

export function StoreForm({
  formData,
  onFormDataChange,
  domainValidation,
  domainAvailability,
  isEdit = false
}: StoreFormProps) {
  const { t } = useTranslation();
  const updateFormData = (field: keyof StoreFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-name' : 'name'}>
          {t('stores.storeName')} *
        </Label>
        <Input
          id={isEdit ? 'edit-name' : 'name'}
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder={t('stores.enterStoreName')}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-domain' : 'domain'}>
          {t('stores.domainName')} * ({t('stores.mustBeUnique')})
        </Label>
        <Input
          id={isEdit ? 'edit-domain' : 'domain'}
          value={formData.private_domain}
          onChange={(e) => updateFormData('private_domain', e.target.value)}
          placeholder={t('stores.enterDomainName')}
          className={
            domainValidation.message
              ? domainValidation.isValid
                ? 'border-green-500'
                : 'border-red-500'
              : ''
          }
        />
        {domainValidation.message && (
          <p
            className={`text-xs ${
              domainValidation.isValid ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {domainValidation.message}
          </p>
        )}
        {domainAvailability.message && (
          <p
            className={`text-xs ${
              domainAvailability.isAvailable ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {domainAvailability.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('stores.storeUrlWillBe')}{' '}
          {formData.private_domain
            ? `${formData.private_domain}.skillforge.com`
            : 'your-domain.skillforge.com'}
        </p>
        {!isEdit && (
          <p className="text-xs font-medium text-orange-600">
            ⚠️ {t('stores.uniqueDomainRequired')}
          </p>
        )}
      </div>
      {isEdit && (
        <div className="grid gap-2">
          <Label htmlFor="edit-public-domain">
            {t('stores.publicDomain')} ({t('common.optional')})
          </Label>
          <Input
            id="edit-public-domain"
            value={formData.public_domain}
            onChange={(e) => updateFormData('public_domain', e.target.value)}
            placeholder={t('stores.enterPublicDomain')}
          />
          <p className="text-xs text-muted-foreground">
            {t('stores.optionalCustomDomain')}
          </p>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-description' : 'description'}>
          {t('common.description')}
        </Label>
        <Textarea
          id={isEdit ? 'edit-description' : 'description'}
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder={t('stores.describeStore')}
          rows={3}
        />
      </div>
      {isEdit && (
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="space-y-0.5">
            <Label>{t('common.status')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('stores.toggleStatusDescription')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {formData.is_active ? t('common.active') : t('common.inactive')}
            </span>
            <Switch
              checked={!!formData.is_active}
              onCheckedChange={(checked) =>
                updateFormData('is_active', checked)
              }
              aria-label={t('stores.toggleActiveStatus')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
