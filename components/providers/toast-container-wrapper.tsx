'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useI18n } from '@/lib/i18n/provider';

const TOAST_WIDTH = 420;

export function ToastContainerWrapper() {
  const { isRTL } = useI18n();

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={isRTL}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{
        bottom: '24px',
        right: '24px',
        width: `min(${TOAST_WIDTH}px, calc(100vw - 32px))`,
        zIndex: 9999
      }}
      toastStyle={{
        fontSize: '15px',
        lineHeight: '1.7',
        minHeight: '72px',
        padding: '14px 16px',
        borderRadius: '12px'
      }}
    />
  );
}
