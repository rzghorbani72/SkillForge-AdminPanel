'use client';

import { useLogin } from './use-login';
import { LoginForm } from './_components/login-form';
import { AcademyPicker } from './_components/academy-picker';
import { PhoneOtpScreen } from './_components/phone-otp-screen';

export default function LoginPage() {
  const login = useLogin();

  if (login.otpRequired) {
    return (
      <PhoneOtpScreen
        otpPhone={login.otpPhone}
        otp={login.otp}
        setOtp={login.setOtp}
        otpError={login.otpError}
        otpLoading={login.otpLoading}
        onSubmit={login.handleOtpSubmit}
        onBack={login.resetOtp}
      />
    );
  }

  if (login.academyPickerOpen) {
    return (
      <AcademyPicker
        academies={login.availableAcademies}
        loading={login.pickingAcademy}
        onSelect={login.handleAcademySelect}
        onBack={login.closeAcademyPicker}
      />
    );
  }

  return (
    <LoginForm
      phone={login.phone}
      password={login.password}
      showPassword={login.showPassword}
      isLoading={login.isLoading}
      errors={login.errors}
      unauthorizedError={login.unauthorizedError}
      onPhoneChange={(v) => {
        login.setPhone(v);
        if (login.errors.phone) login.setErrors((p) => ({ ...p, phone: '' }));
      }}
      onPasswordChange={(v) => {
        login.setPassword(v);
        if (login.errors.password)
          login.setErrors((p) => ({ ...p, password: '' }));
      }}
      onTogglePassword={login.toggleShowPassword}
      onSubmit={login.handleSubmit}
    />
  );
}
