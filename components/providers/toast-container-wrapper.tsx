'use client';

import { ToastContainer } from 'react-toastify';
import { useI18n } from '@/lib/i18n/provider';

export function ToastContainerWrapper() {
  const { isRTL } = useI18n();

  return (
    <ToastContainer
      position={isRTL ? 'top-left' : 'top-right'}
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={isRTL}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{
        top: '20px',
        [isRTL ? 'left' : 'right']: '20px',
        zIndex: 9999
      }}
    />
  );
}
