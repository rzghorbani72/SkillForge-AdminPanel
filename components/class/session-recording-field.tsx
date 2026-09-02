'use client';

import { useState } from 'react';
import { Video } from 'lucide-react';
import { toast } from 'react-toastify';

import MediaDropzone from '@/components/ui/media-dropzone';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

interface SessionRecordingFieldProps {
  sessionId: string;
  videoId: string | null;
  allowDownload: boolean;
  title: string;
  onChanged: (videoId: string | null, allowDownload: boolean) => void;
}

/**
 * The recording a meeting leaves behind. The upload goes through the normal
 * video pipeline, so storage quota and academy scoping are already applied by
 * the time the id is attached to the session.
 */
export function SessionRecordingField({
  sessionId,
  videoId,
  allowDownload,
  title,
  onChanged
}: SessionRecordingFieldProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    try {
      const video = await apiClient.uploadVideo(
        file,
        { title: title || file.name },
        undefined,
        setProgress
      );
      await apiClient.setSessionRecording(sessionId, {
        video_id: video.id,
        allow_download: allowDownload
      });
      onChanged(video.id, allowDownload);
      toast.success(t('courses.live.recordingSaved'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const detach = async () => {
    try {
      await apiClient.setSessionRecording(sessionId, { video_id: null });
      onChanged(null, allowDownload);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  };

  const toggleDownload = async (next: boolean) => {
    onChanged(videoId, next);
    if (!videoId) return;
    try {
      await apiClient.setSessionRecording(sessionId, {
        video_id: videoId,
        allow_download: next
      });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  };

  return (
    <div className="space-y-2">
      <MediaDropzone
        accept="video/*"
        icon={<Video className="h-5 w-5 text-muted-foreground" />}
        placeholderText={t('courses.live.uploadRecording')}
        placeholderSubtext={t('courses.live.uploadRecordingHint')}
        isUploading={isUploading}
        uploadProgress={progress}
        filled={
          videoId ? (
            <div className="flex items-center gap-2 p-3 text-sm">
              <Video className="h-4 w-4" />
              {t('courses.live.hasRecording')}
            </div>
          ) : undefined
        }
        onFile={upload}
        onRemove={videoId ? detach : undefined}
      />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Switch checked={allowDownload} onCheckedChange={toggleDownload} />
        {t('courses.live.allowRecordingDownload')}
      </label>
    </div>
  );
}
