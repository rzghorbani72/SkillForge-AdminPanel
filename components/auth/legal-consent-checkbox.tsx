'use client';

import Link from '@/components/ui/link';
import { useTranslation } from '@/lib/i18n/hooks';

interface LegalConsentCheckboxProps {
  /** Opening clause, e.g. "By signing in, you agree to our". */
  lead: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Staff signups (manager/teacher) also consent to the staff terms here, so
   *  the session gate never re-asks for them on the first login. */
  includeStaffTerms?: boolean;
}

export function LegalConsentCheckbox({
  lead,
  checked,
  onChange,
  disabled,
  includeStaffTerms = false,
}: LegalConsentCheckboxProps) {
  const { t } = useTranslation();

  return (
    <label className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="auth-checkbox mt-0.5 h-[18px] w-[18px] shrink-0"
      />
      <span>
        {lead}{' '}
        <Link href="/terms" className="underline hover:text-foreground">
          {t('auth.termsOfService')}
        </Link>{' '}
        {includeStaffTerms ? ', ' : `${t('auth.and')} `}
        <Link href="/privacy" className="underline hover:text-foreground">
          {t('auth.privacyPolicy')}
        </Link>
        {/* {includeStaffTerms && (
          <>
            {' '}
            {t('auth.and')}{' '}
            <Link href="/staff-terms" className="underline hover:text-foreground">
              {t('auth.staffTerms')}
            </Link>
          </>
        )} */}
        {t('auth.agree')}
      </span>
    </label>
  );
}
