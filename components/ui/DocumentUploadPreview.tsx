'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, X, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { ErrorHandler } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

type DocMeta = {
  id?: number;
  title?: string | null;
  mime_type?: string | null;
};

const ACCEPT =
  '.pdf,.epub,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.zip,.rar,.tar,.gz,.7z';

function previewUrlForDocumentId(id: number): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    `${typeof window !== 'undefined' ? window.location.origin : ''}/api`;
  return `${apiBase}/files/preview/${id}`;
}

function parseDocumentFromUploadResponse(res: unknown): DocMeta | null {
  const body = (res as { data?: { status?: string; data?: DocMeta } })?.data;
  if (!body) return null;
  const row = body.data;
  if (row && typeof row === 'object' && 'id' in row) {
    return row as DocMeta;
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
  descriptionFallback = 'Lesson document',
  selectedDocumentId,
  onSuccess,
  onClear,
  disabled = false,
  className = ''
}) => {
  const [file, setFile] = useState<File | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    toast.success(`Selected: ${f.name}`);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Choose a document file first');
      return;
    }
    setIsUploading(true);
    try {
      const res = await apiClient.uploadDocument(file, {
        title: lessonTitle?.trim() || file.name,
        description: descriptionFallback
      });
      const doc = parseDocumentFromUploadResponse(res);
      const id = doc?.id;
      if (!id) {
        toast.error('Upload succeeded but no document id was returned');
        return;
      }
      onSuccess({ id });
      setMeta({
        id,
        title: doc?.title ?? file.name,
        mime_type: doc?.mime_type
      });
      setFile(null);
      toast.success('Document uploaded and linked to this lesson');
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setMeta(null);
    onClear?.();
  };

  const idNum =
    selectedDocumentId && String(selectedDocumentId).trim() !== ''
      ? parseInt(String(selectedDocumentId), 10)
      : NaN;
  const hasDoc = !Number.isNaN(idNum) && idNum > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Input
          type="file"
          accept={ACCEPT}
          onChange={handleFileChange}
          className="cursor-pointer"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          PDF, Office, EPUB, archives — same rules as Documents (max 5MB on
          server)
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleUpload()}
          disabled={!file || isUploading || disabled}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & attach
            </>
          )}
        </Button>
        {hasDoc ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            disabled={disabled || isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Remove document
          </Button>
        ) : null}
      </div>

      {hasDoc ? (
        <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {meta?.title ?? `Document #${idNum}`}
            </span>
          </div>
          <Link
            href={previewUrlForDocumentId(idNum)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-primary underline"
          >
            Open / preview
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default DocumentUploadPreview;
