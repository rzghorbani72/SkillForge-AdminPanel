'use client';

import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

interface StepIndicatorProps {
  current: 'verification' | 'form';
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div className="flex justify-center border-b p-4">
      <div
        className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div
          className={`flex items-center gap-2 ${current === 'verification' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${current === 'verification' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            1
          </div>
          <span className="font-medium">{t('auth.stepVerification')}</span>
        </div>
        <div className="h-0.5 w-8 bg-gray-300"></div>
        <div
          className={`flex items-center gap-2 ${current === 'form' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${current === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            2
          </div>
          <span className="font-medium">{t('auth.stepBaseData')}</span>
        </div>
      </div>
    </div>
  );
}
