import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { apiErrorMessage } from '@/lib/api-error-message';

export interface ImageUploadOptions {
  title?: string;
  description?: string;
  onSuccess?: (image: { id: string; url: string }) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export interface ImageUploadState {
  selectedFile: File | null;
  preview: string | null;
  isUploading: boolean;
  uploadAbortController: AbortController | null;
  uploadedImageId: string | null;
}

export const useImageUpload = (options: ImageUploadOptions = {}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  }, []);

  // Remove selected file and preview
  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setUploadedImageId(null);
  }, [preview]);

  // Upload the given file, or the previously selected one
  const uploadImage = useCallback(
    async (fileOverride?: File) => {
      const file = fileOverride ?? selectedFile;
      if (!file) {
        toast.error(tNow('toasts.imageNoneSelected'));
        return;
      }

      const abortController = new AbortController();
      setUploadAbortController(abortController);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const uploadResponse = await apiClient.uploadImage(
          file,
          {
            title: options.title || file.name,
            description: options.description || 'Uploaded image',
          },
          setUploadProgress,
          abortController,
        );
        // Handle response structure: { message, status, data: { id, url, ... } }
        // or direct image object: { id, url, ... }
        const imageData = (uploadResponse as any)?.data || uploadResponse;

        if (imageData && imageData.id) {
          const imageId = imageData.id.toString();
          const imageUrl = imageData.publicUrl || '';
          // Construct full URL if it's a relative path
          const fullUrl = imageUrl.startsWith('http')
            ? imageUrl
            : imageUrl.startsWith('/')
              ? `${process.env.NEXT_PUBLIC_HOST || ''}${imageUrl}`
              : imageUrl;
          setUploadedImageId(imageId);
          toast.success(tNow('toasts.imageUploaded'));
          options.onSuccess?.({ id: imageId, url: fullUrl });
        } else {
          console.error('Upload response structure:', uploadResponse);
          toast.error(tNow('toasts.imageBadResponse'));
          options.onError?.(new Error('Upload failed: Invalid response structure'));
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          toast.info(tNow('toasts.uploadCancelled'));
          options.onCancel?.();
        } else {
          toast.error(apiErrorMessage(error, tNow('toasts.imageUploadFailed')));
          setSelectedFile(null);
          setPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          setUploadedImageId(null);
          options.onError?.(error);
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadAbortController(null);
      }
    },
    [selectedFile, options],
  );

  // Select a file and upload it immediately (click-to-browse / drag-drop)
  const selectAndUpload = useCallback(
    (file: File) => {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      uploadImage(file);
    },
    [uploadImage],
  );

  // Cancel ongoing upload
  const cancelUpload = useCallback(() => {
    if (uploadAbortController) {
      uploadAbortController.abort();
      setUploadAbortController(null);
      setIsUploading(false);
    }
  }, [uploadAbortController]);

  // Reset all state
  const reset = useCallback(() => {
    removeFile();
    setIsUploading(false);
    if (uploadAbortController) {
      uploadAbortController.abort();
      setUploadAbortController(null);
    }
  }, [removeFile, uploadAbortController]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (uploadAbortController) {
        uploadAbortController.abort();
      }
    };
  }, [preview, uploadAbortController]);

  return {
    // State
    selectedFile,
    preview,
    isUploading,
    uploadProgress,
    uploadedImageId,

    // Actions
    handleFileChange,
    selectAndUpload,
    removeFile,
    uploadImage,
    cancelUpload,
    reset,

    // Computed
    hasFile: !!selectedFile,
    isUploaded: !!uploadedImageId,
    canUpload: !!selectedFile && !isUploading,
    canCancel: isUploading,
  };
};
