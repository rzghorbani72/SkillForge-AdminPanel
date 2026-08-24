import { toast } from 'react-toastify';

/**
 * "Code sent" feedback. The code itself only ever reaches the user by SMS —
 * it is never returned by the API, so there is nothing to render here.
 */
export function notifyOtpSent(message: string, toastId?: string): void {
  toast.success(message, { toastId });
}
