import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { validateVideoDuration, validateVideoFile } from '@/constants/video-constraints';

export async function isVideoFileAcceptable(file: File): Promise<boolean> {
  const fileValidation = validateVideoFile(file);
  if (!fileValidation.valid) {
    toast.error(tNow(fileValidation.errorKey, fileValidation.params));
    return false;
  }

  return new Promise<boolean>((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const durationValidation = validateVideoDuration(video.duration);
      if (!durationValidation.valid) {
        toast.error(tNow(durationValidation.errorKey, durationValidation.params));
        resolve(false);
      } else {
        resolve(true);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      toast.error(tNow('toasts.videoUnreadable'));
      resolve(false);
    };

    video.src = URL.createObjectURL(file);
  });
}
