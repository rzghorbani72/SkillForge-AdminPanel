import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface SchoolFormData {
  name: string;
  private_domain: string;
  public_domain: string;
  description: string;
  is_active: boolean;
}

interface SchoolFormProps {
  formData: SchoolFormData;
  onFormDataChange: (data: SchoolFormData) => void;
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

export function SchoolForm({
  formData,
  onFormDataChange,
  domainValidation,
  domainAvailability,
  isEdit = false
}: SchoolFormProps) {
  const updateFormData = (field: keyof SchoolFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-name' : 'name'}>School Name *</Label>
        <Input
          id={isEdit ? 'edit-name' : 'name'}
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter school name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-domain' : 'domain'}>
          Domain Name * (Must be unique)
        </Label>
        <Input
          id={isEdit ? 'edit-domain' : 'domain'}
          value={formData.private_domain}
          onChange={(e) => updateFormData('private_domain', e.target.value)}
          placeholder="Enter domain name (auto-formatted to lowercase, kebab-case)"
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
          This will be your school&apos;s URL:{' '}
          {formData.private_domain
            ? `${formData.private_domain}.skillforge.com`
            : 'your-domain.skillforge.com'}
        </p>
        {!isEdit && (
          <p className="text-xs font-medium text-orange-600">
            ⚠️ Each school must have a unique domain name
          </p>
        )}
      </div>
      {isEdit && (
        <div className="grid gap-2">
          <Label htmlFor="edit-public-domain">Public Domain (Optional)</Label>
          <Input
            id="edit-public-domain"
            value={formData.public_domain}
            onChange={(e) => updateFormData('public_domain', e.target.value)}
            placeholder="Enter public domain (e.g., www.myschool.com)"
          />
          <p className="text-xs text-muted-foreground">
            Optional custom domain for your school
          </p>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-description' : 'description'}>
          Description
        </Label>
        <Textarea
          id={isEdit ? 'edit-description' : 'description'}
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe your school"
          rows={3}
        />
      </div>
      {isEdit && (
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="space-y-0.5">
            <Label>Status</Label>
            <p className="text-xs text-muted-foreground">
              Toggle to activate or deactivate this school
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {formData.is_active ? 'Active' : 'Inactive'}
            </span>
            <Switch
              checked={!!formData.is_active}
              onCheckedChange={(checked) =>
                updateFormData('is_active', checked)
              }
              aria-label="Toggle active status"
            />
          </div>
        </div>
      )}
    </div>
  );
}
