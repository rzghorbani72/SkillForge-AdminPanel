'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from '@/components/ui/link';
import { FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { useTranslation } from '@/lib/i18n/hooks';
import { ErrorHandler } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import MediaDropzone from './media-dropzone';

type DocMeta = {
  id?: number;
  title?: string | null;
  mime_type?: string | null;
};

const DOCUMENT_ACCEPT = '.pdf,.epub,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.zip,.rar,.tar,.gz,.7z';

function previewUrlForDocumentId(id: number): string {
  return `${getBrowserApiBaseUrl()}/files/preview/${id}`;
}

function parseDocumentFromUploadResponse(res: unknown): DocMeta | null {
  const body = (res as { data?: { status?: string; data?: DocMeta } })?.data;
  const row = body?.data;
  if (row && typeof row === 'object' && 'id' in row) {
    return row;
  }
  return null;
}

export interface DocumentUploadPreviewProps {
  lessonTitle?: string;
  descriptionFallback?: string;
  selectedDocumentId?: string | null;
  onSuccess: (doc: { id: number }) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

const DocumentUploadPreview: React.FC<DocumentUploadPreviewProps> = ({
  lessonTitle,
  descriptionFallback,
  selectedDocumentId,
  onSuccess,
  onClear,
  disabled = false,
  className,
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [meta, setMeta] = useState<DocMeta | null>(null);

  const loadExisting = useCallback(async (id: string) => {
    const n = parseInt(id, 10);
    if (Number.isNaN(n) || n <= 0) {
      setMeta(null);
      return;
    }
    try {
      const data = await apiClient.getDocument(n);
      setMeta((data as DocMeta) || null);
    } catch {
      setMeta(null);
    }
  }, []);

  useEffect(() => {
    if (selectedDocumentId && String(selectedDocumentId).trim() !== '') {
      void loadExisting(String(selectedDocumentId));
    } else {
      setMeta(null);
    }
  }, [selectedDocumentId, loadExisting]);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await apiClient.uploadDocument(file, {
        title: lessonTitle?.trim() || file.name,
        description: descriptionFallback ?? file.name,
      });
      const doc = parseDocumentFromUploadResponse(res);
      const id = doc?.id;
      if (!id) {
        toast.error(tNow('toasts.documentBadResponse'));
        return;
      }
      onSuccess({ id });
      setMeta({
        id,
        title: doc?.title ?? file.name,
        mime_type: doc?.mime_type,
      });
      toast.success(tNow('toasts.documentUploaded'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setMeta(null);
    onClear?.();
  };

  const idNum =
    selectedDocumentId && String(selectedDocumentId).trim() !== ''
      ? parseInt(String(selectedDocumentId), 10)
      : NaN;
  const hasDoc = !Number.isNaN(idNum) && idNum > 0;

  return (
    <MediaDropzone
      className={cn(className)}
      accept={DOCUMENT_ACCEPT}
      icon={<FileText className="h-8 w-8 text-muted-foreground" />}
      placeholderText={t('media.noDocumentSelected')}
      placeholderSubtext={t('media.dropDocumentHint')}
      isUploading={isUploading}
      disabled={disabled}
      onFile={(file) => void handleFile(file)}
      onRemove={handleRemove}
      filled={
        hasDoc ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{meta?.title ?? t('media.documentPreviewFallback')}</span>
            </div>
            <Link
              href={previewUrlForDocumentId(idNum)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-primary underline"
              onClick={(e) => e.stopPropagation()}
            >
              {t('media.openPreview')}
            </Link>
            <p className="text-xs text-muted-foreground">{t('media.documentFileHint')}</p>
          </div>
        ) : null
      }
    />
  );
};

export default DocumentUploadPreview;
