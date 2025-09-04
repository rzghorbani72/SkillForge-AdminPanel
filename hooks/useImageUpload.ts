import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export interface ImageUploadOptions {
  title?: string;
  description?: string;
  onSuccess?: (imageId: string) => void;
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
  const [uploadAbortController, setUploadAbortController] =
    useState<AbortController | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      }
    },
    []
  );

  // Remove selected file and preview
  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setUploadedImageId(null);
  }, [preview]);

  // Upload the selected image
  const uploadImage = useCallback(async () => {
    if (!selectedFile) {
      toast.error('No image selected');
      return;
    }

    const abortController = new AbortController();
    setUploadAbortController(abortController);
    setIsUploading(true);

    try {
      const uploadResponse = await apiClient.uploadImage(
        selectedFile,
        {
          title: options.title || selectedFile.name,
          description: options.description || 'Uploaded image'
        },
        abortController.signal
      );

      if (uploadResponse && (uploadResponse as any).id) {
        const imageId = (uploadResponse as any).id.toString();
        setUploadedImageId(imageId);
        toast.success('Image uploaded successfully!');
        options.onSuccess?.(imageId);
      } else {
        toast.error('Failed to upload image');
        options.onError?.(new Error('Upload failed'));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.info('Upload cancelled');
        options.onCancel?.();
      } else {
        toast.error('Failed to upload image. Please try again.');
        options.onError?.(error);
      }
    } finally {
      setIsUploading(false);
      setUploadAbortController(null);
    }
  }, [selectedFile, options]);

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
    uploadedImageId,

    // Actions
    handleFileChange,
    removeFile,
    uploadImage,
    cancelUpload,
    reset,

    // Computed
    hasFile: !!selectedFile,
    isUploaded: !!uploadedImageId,
    canUpload: !!selectedFile && !isUploading,
    canCancel: isUploading
  };
};
