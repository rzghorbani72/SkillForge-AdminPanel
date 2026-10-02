import { useState } from 'react';
import { toE164Iran } from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { LoginMethod } from '@/components/auth/login-method-toggle';
import { collectErrors, validatePassword, validatePhone } from '@/lib/auth-validation';

export function useLoginForm() {
  const { t } = useTranslation();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const found = collectErrors(
      {
        phone: validatePhone(phone),
        ...(loginMethod === 'password' ? { password: validatePassword(password) } : {}),
      },
      t,
    );
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  return {
    loginMethod,
    changeMethod: (method: LoginMethod) => {
      setLoginMethod(method);
      setErrors({});
    },
    phone,
    setPhone,
    phoneE164: phone.trim() ? toE164Iran(phone) : '',
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    errors,
    setErrors,
    validate,
  };
}
