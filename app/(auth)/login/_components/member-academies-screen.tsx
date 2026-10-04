'use client';

import { ExternalLink, GraduationCap } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthSubmit, AuthSecondaryButton, AuthSecondaryLink } from '@/components/auth/auth-fields';
import { PhoneOtpScreen } from '@/components/auth/phone-otp-screen';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from '@/lib/i18n/hooks';
import type { MemberAcademy } from '@/types/auth';
import { useMemberAcademies } from '../use-member-academies';
import { HumanCheck } from '@/components/auth/human-check';
import { useHumanCheck } from '@/hooks/use-human-check';

interface MemberAcademiesScreenProps {
  phoneE164: string;
  registerHref: string;
  onChangeIdentifier: () => void;
}

function AcademyLink({ academy }: { academy: MemberAcademy }) {
  return (
    <a
      href={academy.login_url}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 text-start transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
        <GraduationCap className="h-5 w-5 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">{academy.name}</span>
        <span className="block truncate text-xs text-muted-foreground" dir="ltr">
          {academy.login_url}
        </span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

/**
 * The panel is staff-only, so a student who signs in here is not "unregistered"
 * — they are at the wrong door. This screen verifies the phone with a one-time
 * code and then hands them the sign-in link of every academy they belong to,
 * while still offering the manager signup that creates an academy of their own.
 */
export function MemberAcademiesScreen({
  phoneE164,
  registerHref,
  onChangeIdentifier,
}: MemberAcademiesScreenProps) {
  const { t } = useTranslation();
  const lookup = useMemberAcademies(phoneE164);
  const captcha = useHumanCheck();

  if (lookup.step === 'otp') {
    return (
      <PhoneOtpScreen
        otpPhone={phoneE164}
        otp={lookup.otp}
        setOtp={lookup.setOtp}
        otpError={lookup.error}
        otpLoading={lookup.loading}
        onSubmit={lookup.verifyCode}
        onBack={lookup.backToIntro}
        onResend={lookup.sendCode}
        resending={lookup.loading}
        title={t('auth.memberAcademiesOtpTitle')}
        submitLabel={t('auth.memberAcademiesShowList')}
      />
    );
  }

  if (lookup.step === 'list') {
    return (
      <AuthShell
        activeTab="login"
        title={t('auth.memberAcademiesListTitle')}
        subtitle={t('auth.memberAcademiesListSubtitle')}
      >
        <div className="space-y-2 px-1">
          {lookup.academies.length === 0 ? (
            <Alert>
              <AlertDescription>{t('auth.memberAcademiesEmpty')}</AlertDescription>
            </Alert>
          ) : (
            lookup.academies.map((academy) => <AcademyLink key={academy.id} academy={academy} />)
          )}
        </div>

        <AuthSecondaryLink href={registerHref}>
          {t('auth.memberAcademiesBecomeManager')}
        </AuthSecondaryLink>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      activeTab="login"
      title={t('auth.memberAcademiesTitle')}
      subtitle={t('auth.memberAcademiesSubtitle')}
    >
      <div className="space-y-4 px-1">
        <Alert>
          <AlertDescription>{t('auth.memberAcademiesHint')}</AlertDescription>
        </Alert>

        {lookup.error && (
          <Alert variant="destructive">
            <AlertDescription>{lookup.error}</AlertDescription>
          </Alert>
        )}

        <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />

        <AuthSubmit
          loading={lookup.loading}
          disabled={lookup.loading || !captcha.solved}
          onClick={() => {
            void captcha.run(lookup.sendCode);
          }}
        >
          {t('auth.memberAcademiesSendCode')}
        </AuthSubmit>

        <AuthSecondaryLink href={registerHref}>
          {t('auth.memberAcademiesBecomeManager')}
        </AuthSecondaryLink>

        <AuthSecondaryButton onClick={onChangeIdentifier}>
          {t('auth.useAnotherNumber')}
        </AuthSecondaryButton>
      </div>
    </AuthShell>
  );
}
