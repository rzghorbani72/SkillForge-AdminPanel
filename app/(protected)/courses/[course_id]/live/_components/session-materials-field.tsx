'use client';

import { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import MediaDropzone from '@/components/ui/media-dropzone';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SessionMaterial } from '@/types/learning-operations';

interface SessionMaterialsFieldProps {
  sessionId: string;
  materials: SessionMaterial[];
  onChanged: (materials: SessionMaterial[]) => void;
}

/**
 * The handouts a meeting leaves behind. The file goes through the normal
 * document upload first, so storage quota and academy scoping are applied
 * before the id is attached to the session.
 */
export default function SessionMaterialsField({
  sessionId,
  materials,
  onChanged
}: SessionMaterialsFieldProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    try {
      const added = await apiClient.addSessionMaterialFile(
        sessionId,
        file,
        setProgress
      );
      onChanged([...materials, added]);
      toast.success(t('courses.live.materialAdded'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const remove = async (materialId: string) => {
    try {
      await apiClient.removeSessionMaterial(sessionId, materialId);
      onChanged(materials.filter((material) => material.id !== materialId));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  };

  return (
    <div className="space-y-2">
      {materials.length > 0 && (
        <ul className="space-y-1">
          {materials.map((material) => (
            <li
              key={material.id}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{material.title}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                aria-label={t('common.delete')}
                onClick={() => remove(material.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <MediaDropzone
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
        icon={<FileText className="h-5 w-5 text-muted-foreground" />}
        placeholderText={t('courses.live.uploadMaterial')}
        placeholderSubtext={t('courses.live.uploadMaterialHint')}
        isUploading={isUploading}
        uploadProgress={progress}
        onFile={upload}
      />
    </div>
  );
}
