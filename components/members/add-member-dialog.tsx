'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePersonLookup } from './use-person-lookup';

type AssignableRole = { name: string; label: string; hierarchy_level: number };

interface AddMemberDialogProps {
  /** Refresh the list once the membership exists. */
  onAdded: () => void;
}

/**
 * Add someone to this academy. The phone number identifies the person, not the
 * account: whoever already has an account keeps it and gains a role here, so
 * the same person can be a manager elsewhere and a student with us.
 */
export function AddMemberDialog({ onAdded }: AddMemberDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [roles, setRoles] = useState<AssignableRole[]>([]);
  const [saving, setSaving] = useState(false);
  const { result, isSearching, search, reset } = usePersonLookup();

  useEffect(() => {
    if (!open) return;
    apiClient
      .getAssignableAcademyRoles()
      .then((res) => {
        setRoles(res.roles);
        setRole((current) => current || res.roles[0]?.name || '');
      })
      .catch(() => setRoles([]));
  }, [open]);

  const isKnownPerson = result?.found === true;
  const alreadyMember = !!result?.membership;
  // A brand-new person needs a password to sign in with; an existing account
  // already has one, so setting a new one here is optional.
  const passwordRequired = result !== null && !isKnownPerson;
  const canAdd =
    result !== null &&
    !alreadyMember &&
    role.length > 0 &&
    (!passwordRequired || password.length >= 6) &&
    (isKnownPerson || name.trim().length > 1);

  const clear = () => {
    setPhone('');
    setName('');
    setEmail('');
    setPassword('');
    reset();
  };

  const handleAdd = async () => {
    if (!canAdd || saving) return;
    setSaving(true);
    try {
      await apiClient.addAcademyMember({
        phone_number: phone.trim(),
        role,
        name: isKnownPerson ? undefined : name.trim(),
        email: email.trim() || undefined,
        password: password || undefined
      });
      toast.success(t('members.memberAdded'));
      clear();
      setOpen(false);
      onAdded();
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
        setOpen(next);
        if (!next) clear();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-lg">
          <Plus className="me-1.5 h-4 w-4" />
          {t('members.addMember')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t('members.addMember')}</DialogTitle>
          <DialogDescription>
            {t('members.addMemberDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-phone">{t('members.phone')}</Label>
            <div className="flex gap-2">
              <Input
                id="member-phone"
                inputMode="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  reset();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void search(phone);
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void search(phone)}
                disabled={!phone.trim() || isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('members.phoneHint')}
            </p>
          </div>

          {alreadyMember && (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
              {t('members.alreadyMember')}
            </p>
          )}

          {result !== null && !alreadyMember && (
            <>
              {isKnownPerson ? (
                <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2 text-xs text-emerald-700 dark:text-emerald-400">
                  {t('members.personFound')}
                  {result?.name ? ` — ${result.name}` : ''}
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    {t('members.personNotFound')}
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="member-name">
                      {t('students.studentName')}
                    </Label>
                    <Input
                      id="member-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="member-email">
                      {t('students.studentEmail')}
                    </Label>
                    <Input
                      id="member-email"
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label>{t('members.roleInAcademy')}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-password">
                  {passwordRequired
                    ? t('students.oneTimePassword')
                    : t('members.optionalPassword')}
                </Label>
                <Input
                  id="member-password"
                  type="text"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('members.smsNotice')}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAdd} disabled={!canAdd || saving}>
            {saving && <Loader2 className="me-1.5 h-4 w-4 animate-spin" />}
            {t('members.addMember')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
