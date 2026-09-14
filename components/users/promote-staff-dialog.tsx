'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPlatformOwner } from '@/lib/roles';
import { useAuthUser } from '@/hooks/useAuthUser';
import { COMPLETE_PHONE } from '@/components/users/add-user-form';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import type { PlatformStaffLookup } from '@/types/api';

type StaffRole = 'ADMIN' | 'FINANCE' | 'SUPPORT';

type PromoteStaffDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function PromoteStaffDialog({ open, onOpenChange, onSuccess }: PromoteStaffDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const canAssignAdmin = isPlatformOwner(user);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>(canAssignAdmin ? 'ADMIN' : 'SUPPORT');
  const [lookup, setLookup] = useState<PlatformStaffLookup | null>(null);
  const [saving, setSaving] = useState(false);
  const debouncedPhone = useDebouncedValue(phone, 400);

  useEffect(() => {
    if (!open) return;
    if (!COMPLETE_PHONE.test(debouncedPhone)) {
      setLookup(null);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const data = await apiClient.lookupPlatformStaffCandidate(debouncedPhone);
        if (active) {
          setLookup(data);
          if (data.found && data.full_name) setName(data.full_name);
        }
      } catch {
        if (active) setLookup({ found: false });
      }
    })();
    return () => {
      active = false;
    };
  }, [debouncedPhone, open]);

  const reset = () => {
    setPhone('');
    setName('');
    setPassword('');
    setRole(canAssignAdmin ? 'ADMIN' : 'SUPPORT');
    setLookup(null);
  };

  const canSubmit =
    COMPLETE_PHONE.test(phone) &&
    lookup?.found === true &&
    !lookup.already_staff &&
    password.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await apiClient.promotePlatformStaff({
        phone_number: phone,
        platform_role: role,
        password,
        name: name.trim() || undefined,
      });
      ErrorHandler.showSuccess(t('platformUsers.promoted'));
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('platformUsers.promoteTitle')}</DialogTitle>
          <DialogDescription>{t('platformUsers.promoteDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <PhoneInput
            id="promote-phone"
            label={`${t('auth.phoneNumber')} *`}
            value={phone}
            onChange={setPhone}
          />
          {lookup && !lookup.found && (
            <p className="text-xs text-destructive">{t('platformUsers.notRegistered')}</p>
          )}
          {lookup?.already_staff && (
            <p className="text-xs text-destructive">{t('platformUsers.alreadyStaff')}</p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="promote-name">{t('admins.name')}</Label>
            <Input id="promote-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('admins.platformRole')}</Label>
            <Select value={role} onValueChange={(value) => setRole(value as StaffRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {canAssignAdmin && (
                  <SelectItem value="ADMIN">{t('admins.platformStaff.ADMIN')}</SelectItem>
                )}
                <SelectItem value="FINANCE">{t('admins.platformStaff.FINANCE')}</SelectItem>
                <SelectItem value="SUPPORT">{t('admins.platformStaff.SUPPORT')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="promote-password">{t('auth.password')}</Label>
            <Input
              id="promote-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
            {saving && <Loader2 className="me-1.5 h-4 w-4 animate-spin" />}
            {t('platformUsers.promote')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
