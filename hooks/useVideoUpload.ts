import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { apiErrorMessage } from '@/lib/api-error-message';
import { formatFileSize } from '@/constants/video-constraints';
import { isVideoFileAcceptable } from '@/lib/validate-video-upload';

export interface VideoUploadOptions {
  title?: string;
  description?: string;
  onSuccess?: (videoId: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export interface VideoUploadState {
  selectedFile: File | null;
  selectedPosterFile: File | null;
  preview: string | null;
  posterPreview: string | null;
  isUploading: boolean;
  uploadAbortController: AbortController | null;
  uploadedVideoId: string | null;
  uploadProgress: number;
}

export const useVideoUpload = (options: VideoUploadOptions = {}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPosterFile, setSelectedPosterFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Accept a picked file only when it passes size/format and duration limits
  const acceptVideoFile = useCallback(async (file: File): Promise<boolean> => {
    if (!(await isVideoFileAcceptable(file))) return false;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    toast.success(tNow('toasts.videoSelected', { size: formatFileSize(file.size) }));
    return true;
  }, []);

  // Handle poster file selection
  const handlePosterFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error(tNow('toasts.posterInvalidFormat'));
        return;
      }

      setSelectedPosterFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
    }
  }, []);

  // Remove selected files and previews
  const removeFiles = useCallback(() => {
    setSelectedFile(null);
    setSelectedPosterFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
      setPosterPreview(null);
    }
    setUploadedVideoId(null);
  }, [preview, posterPreview]);

  // Upload the given video, or the previously selected one
  const uploadVideo = useCallback(
    async (fileOverride?: File) => {
      const file = fileOverride ?? selectedFile;
      if (!file) {
        toast.error(tNow('toasts.videoNoneSelected'));
        return;
      }

      const abortController = new AbortController();
      setUploadAbortController(abortController);
      setIsUploading(true);
      setUploadProgress(0);
      // Fallback progress simulation in case XMLHttpRequest progress events don't work
      let progressSimulation: NodeJS.Timeout | null = null;
      let simulatedProgress = 0;

      const startProgressSimulation = () => {
        progressSimulation = setInterval(() => {
          if (simulatedProgress < 90) {
            simulatedProgress += Math.random() * 10;
            setUploadProgress(Math.min(simulatedProgress, 90));
          }
        }, 500);
      };

      const stopProgressSimulation = () => {
        if (progressSimulation) {
          clearInterval(progressSimulation);
          progressSimulation = null;
        }
      };

      try {
        // Start fallback progress simulation
        startProgressSimulation();

        const uploadResponse = await apiClient.uploadVideoWithProgress(
          file,
          {
            title: options.title || file.name,
            description: options.description || 'Uploaded video',
          },
          selectedPosterFile || undefined,
          (progress) => {
            // Stop simulation when real progress is received
            stopProgressSimulation();
            // Use requestAnimationFrame to ensure smooth UI updates
            requestAnimationFrame(() => {
              setUploadProgress(progress);
            });
          },
          abortController,
        );

        if (uploadResponse && (uploadResponse as any).id) {
          const videoId = (uploadResponse as any).id.toString();
          setUploadedVideoId(videoId);
          // Ensure progress is at 100% for successful upload
          setUploadProgress(100);
          toast.success(tNow('toasts.videoUploaded'));
          options.onSuccess?.(videoId);

          // Small delay to show 100% progress before completing
          setTimeout(() => {
            setIsUploading(false);
          }, 500);
        } else {
          toast.error(tNow('toasts.videoUploadFailed'));
          options.onError?.(new Error('Upload failed'));
          setIsUploading(false);
        }
      } catch (error: any) {
        if (error.message === 'Upload cancelled') {
          toast.info(tNow('toasts.uploadCancelled'));
          options.onCancel?.();
        } else {
          toast.error(apiErrorMessage(error, tNow('toasts.videoUploadFailed')));
          setSelectedFile(null);
          setSelectedPosterFile(null);
          setPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          setPosterPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          setUploadedVideoId(null);
          setUploadProgress(0);
          options.onError?.(error);
        }
        setIsUploading(false);
      } finally {
        // Stop progress simulation
        stopProgressSimulation();
        setUploadAbortController(null);
        // Reset progress after a delay (only if not already handled in success case)
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [selectedFile, selectedPosterFile, options],
  );

  // Pick a file and upload it immediately (click-to-browse / drag-drop)
  const selectAndUpload = useCallback(
    async (file: File) => {
      if (await acceptVideoFile(file)) await uploadVideo(file);
    },
    [acceptVideoFile, uploadVideo],
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
    removeFiles();
    setIsUploading(false);
    setUploadProgress(0);
    if (uploadAbortController) {
      uploadAbortController.abort();
      setUploadAbortController(null);
    }
  }, [removeFiles, uploadAbortController]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview);
      }
      if (uploadAbortController) {
        uploadAbortController.abort();
      }
    };
  }, [preview, posterPreview, uploadAbortController]);

  return {
    // State
    selectedFile,
    selectedPosterFile,
    preview,
    posterPreview,
    isUploading,
    uploadedVideoId,
    uploadProgress,

    // Actions
    selectAndUpload,
    handlePosterFileChange,
    removeFiles,
    uploadVideo,
    cancelUpload,
    reset,

    // Computed
    hasVideoFile: !!selectedFile,
    hasPosterFile: !!selectedPosterFile,
    hasFiles: !!selectedFile || !!selectedPosterFile,
    isUploaded: !!uploadedVideoId,
    canUpload: !!selectedFile && !isUploading,
    canCancel: isUploading,
  };
};
