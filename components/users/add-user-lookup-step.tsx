'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { PhoneInput } from '@/components/ui/phone-input';
import { useTranslation } from '@/lib/i18n/hooks';
import type { PersonLookup } from './use-person-lookup';

interface AddUserLookupStepProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  isSearching: boolean;
  result: PersonLookup | null;
  canContinue: boolean;
  onNext: () => void;
  onCancel: () => void;
}

/**
 * Step one: who is this number? Nothing else is asked until the server answers,
 * so the reader deals with one question at a time.
 */
export function AddUserLookupStep({
  phone,
  onPhoneChange,
  isSearching,
  result,
  canContinue,
  onNext,
  onCancel
}: AddUserLookupStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <PhoneInput
        id="phone"
        label={`${t('auth.phoneNumber')} *`}
        value={phone}
        onChange={onPhoneChange}
      />

      <LookupStatus isSearching={isSearching} result={result} />

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="button" onClick={onNext} disabled={!canContinue}>
          {t('common.next')}
          <ArrowRight className="ms-1.5 h-4 w-4 rtl:rotate-180" />
        </Button>
      </DialogFooter>
    </div>
  );
}

function LookupStatus({
  isSearching,
  result
}: {
  isSearching: boolean;
  result: PersonLookup | null;
}) {
  const { t } = useTranslation();

  if (isSearching) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t('common.loading')}
      </p>
    );
  }
  if (!result) return null;

  if (result.membership) {
    return (
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[12px] text-amber-700 dark:text-amber-400">
        {t('members.alreadyMember')}
      </p>
    );
  }
  if (result.found) {
    return (
      <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-[12px] text-emerald-700 dark:text-emerald-400">
        {t('members.personFound')}
        {result.name ? ` — ${result.name}` : ''}
      </p>
    );
  }
  return (
    <p className="rounded-lg border border-border bg-muted/40 p-2.5 text-[12px] text-muted-foreground">
      {t('members.personNotFound')}
    </p>
  );
}
