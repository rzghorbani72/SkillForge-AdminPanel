import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

interface UploadedImage {
  id: string;
  publicUrl: string | null;
}

/** Opens the file picker and returns the uploaded image, or null if cancelled. */
export function pickAndUploadImage(): Promise<UploadedImage | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const uploaded = (await apiClient.uploadImage(
          file
        )) as UploadedImage | null;
        resolve(uploaded ?? null);
      } catch (error) {
        ErrorHandler.handleApiError(error);
        resolve(null);
      }
    };
    input.click();
  });
}

/** Toolbar hook: uploads an image and hands its URL back to the editor. */
export async function uploadArticleImage(): Promise<string | null> {
  const uploaded = await pickAndUploadImage();
  return uploaded?.publicUrl ?? null;
}
