import { toast } from 'react-toastify';

type OtpSendResponse = { data?: { otp?: string } } | null | undefined;

/**
 * TODO: Remove the debug code display when the real SMS provider is integrated.
 * The backend only returns `otp` outside production.
 */
export function notifyOtpSent(
  response: OtpSendResponse,
  message: string,
  toastId?: string
): void {
  const code = response?.data?.otp;
  if (code) {
    toast.info(`${message}\n\n🔐 Code: ${code}`, {
      toastId,
      autoClose: 8000,
      style: { whiteSpace: 'pre-wrap' }
    });
    return;
  }
  toast.success(message, { toastId });
}
