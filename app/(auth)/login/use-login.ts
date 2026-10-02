import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDelayedRedirect } from '@/hooks/use-delayed-redirect';
import { checkoutQueryFromSearch } from '@/lib/auth-routing';
import { useHumanCheck } from '@/hooks/use-human-check';
import { buildRegisterHref } from './_lib/build-register-href';
import { useLoginOtp } from './use-login/use-login-otp';
import { useLoginForm } from './use-login/use-login-form';
import { useLoginSubmit } from './use-login/use-login-submit';
import { useAcademySelect } from './use-login/use-academy-select';
import { useFinishLogin } from './use-login/use-finish-login';
import { useUnauthorizedNotice } from './use-login/use-unauthorized-notice';

export function useLogin() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const periodParam = searchParams.get('period');
  const planQuery = checkoutQueryFromSearch(planParam, periodParam);
  const { pending: redirectPending, scheduleRedirect } = useDelayedRedirect();

  const captcha = useHumanCheck();
  const form = useLoginForm();
  const unauthorizedError = useUnauthorizedNotice();
  const [registrationRequired, setRegistrationRequired] = useState(false);
  // The phone has a membership but no panel role — a student who came to the
  // wrong door. They are routed to their academy, not to signup.
  const [memberElsewhere, setMemberElsewhere] = useState(false);

  const academy = useAcademySelect({ scheduleRedirect, planQuery });
  const finishLogin = useFinishLogin({
    scheduleRedirect,
    planQuery,
    academy,
    beforeAcademyPicker: () => {
      otpFlow.setOtpRequired(false);
    },
  });
  const otpFlow = useLoginOtp({ finishLogin, scheduleRedirect, setRegistrationRequired });
  const { isLoading, handleSubmit } = useLoginSubmit({
    form,
    captcha,
    otpFlow,
    finishLogin,
    setRegistrationRequired,
    setMemberElsewhere,
  });

  return {
    ...form,
    ...academy,
    ...otpFlow,
    captcha,
    registerHref: buildRegisterHref(form.phone, planParam, periodParam),
    isLoading,
    unauthorizedError,
    handleSubmit,
    redirectPending,
    memberElsewhere,
    registrationRequired,
    clearRegistrationHint: () => {
      setRegistrationRequired(false);
      setMemberElsewhere(false);
      form.setErrors((prev) => ({ ...prev, phone: '' }));
    },
    changeIdentifier: () => {
      form.setPassword('');
      form.setErrors({});
      setMemberElsewhere(false);
    },
  };
}
