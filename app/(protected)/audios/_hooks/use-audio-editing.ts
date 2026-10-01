'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { AudioItem } from '../_lib/page-helpers';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export function useAudioEditing({ fetchAudios }: { fetchAudios: () => Promise<void> }) {
  const { t } = useTranslation();
  const [editAudio, setEditAudio] = useState<AudioItem | null>(null);

  const [deleteAudio, setDeleteAudio] = useState<AudioItem | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [editTitle, setEditTitle] = useState('');

  const [editDescription, setEditDescription] = useState('');

  const [editIsPublic, setEditIsPublic] = useState(true);

  const handleUpdateAudio = async () => {
    if (!editAudio) return;

    const trimmedTitle = editTitle.trim();
    if (trimmedTitle.length === 0) {
      toast.error(t('errors.required'));
      return;
    }

    try {
      setIsUpdating(true);
      await apiClient.updateAudio(editAudio.id, {
        title: trimmedTitle,
        description: editDescription.trim(),
        is_public: editIsPublic,
      });
      toast.success(t('media.audioUpdated'));
      setEditAudio(null);
      fetchAudios();
    } catch (err) {
      logger.error('Audios', 'UpdatingAudioFailed', errorFields(err));
      ErrorHandler.handleApiError(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAudio = async () => {
    if (!deleteAudio) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteAudio(deleteAudio.id);
      toast.success(t('media.deleteSuccess'));
      setDeleteAudio(null);
      fetchAudios();
    } catch (err) {
      logger.error('Audios', 'DeletingAudioFailed', errorFields(err));
      ErrorHandler.handleApiError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAudio,
    editAudio,
    editDescription,
    editIsPublic,
    editTitle,
    handleDeleteAudio,
    handleUpdateAudio,
    isDeleting,
    isUpdating,
    setDeleteAudio,
    setEditAudio,
    setEditDescription,
    setEditIsPublic,
    setEditTitle,
  };
}
