'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Download, File, Files, HardDrive } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Media } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { UploadMediaDialog } from '@/components/content/upload-media-dialog';
import { AccessControlBadge, type AccessControl } from '@/components/ui/access-control-badge';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StatsCard } from '@/components/shared/stats-card';
import { formatFileSize } from '@/components/shared/utils';
import { formatNumber } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';

interface DocumentItem extends Media {
  download_url?: string;
  preview_url?: string;
  access_control?: AccessControl;
}

const buildDocumentUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getBrowserApiBaseUrl()}${normalized}`;
};

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedAcademy) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getDocuments();
      const list: DocumentItem[] = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setDocuments(list);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademy]);

  useEffect(() => {
    if (selectedAcademy) fetchData();
  }, [selectedAcademy, fetchData]);

  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(term) ||
        (doc.description ?? '').toLowerCase().includes(term),
    );
  }, [documents, searchTerm]);

  const totalSize = useMemo(
    () => documents.reduce((total, doc) => total + (doc.size ?? 0), 0),
    [documents],
  );

  const handleViewDocument = (doc: DocumentItem) => {
    const previewUrl = buildDocumentUrl(doc.preview_url);
    if (!previewUrl) {
      toast.error(t('toasts.documentPreviewUnavailable'));
      return;
    }
    setPreviewDocument(doc);
  };

  const handleDownloadDocument = (doc: DocumentItem) => {
    const downloadUrl = buildDocumentUrl(doc.download_url);
    if (!downloadUrl) {
      toast.error(t('toasts.documentDownloadUnavailable'));
      return;
    }

    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = '';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleClosePreview = () => {
    setPreviewDocument(null);
    setIsPreviewLoading(false);
  };

  const canPreviewInline = (doc: DocumentItem) => {
    const mime = doc.mime_type?.toLowerCase() ?? '';
    return (
      mime === 'application/pdf' ||
      mime.startsWith('image/') ||
      mime.startsWith('text/') ||
      mime === 'application/json'
    );
  };

  useEffect(() => {
    if (!previewDocument) {
      setIsPreviewLoading(false);
      return;
    }
    if (canPreviewInline(previewDocument)) {
      setIsPreviewLoading(true);
    } else {
      setIsPreviewLoading(false);
    }
  }, [previewDocument]);

  if (!selectedAcademy) {
    return (
      <div className="page-wrapper flex-1 p-4 sm:p-6">
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title={t('media.noStoreSelected')}
          description={t('media.selectStoreToView')}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message={t('media.loadingDocuments')} />;
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-4 sm:p-6">
      <PageHeader
        icon={<Files className="h-5 w-5" />}
        title={t('media.documents')}
        description={`${t('media.manageDocuments')} — ${selectedAcademy.name}`}
        badge={`${formatNumber(documents.length)} ${t('media.files')}`}
      >
        <UploadMediaDialog kind="document" onUploaded={fetchData} />
      </PageHeader>

      {/* Stats */}
      <div
        className="fade-in-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        style={{ animationDelay: '0.1s' }}
      >
        <StatsCard
          icon={FileText}
          title={t('media.totalDocuments')}
          value={formatNumber(documents.length)}
          description={`${t('media.documentsIn')} ${selectedAcademy.name}`}
        />
        <StatsCard
          icon={HardDrive}
          title={t('media.totalSize')}
          value={formatFileSize(totalSize)}
          description={t('media.storageUsedByDocuments')}
          iconColor="text-amber-600"
        />
      </div>

      {/* Search */}
      <div className="fade-in-up" style={{ animationDelay: '0.15s' }}>
        <SearchBar
          placeholder={t('media.searchDocuments')}
          value={searchTerm}
          onChange={setSearchTerm}
          className="max-w-md"
        />
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          className="fade-in-up"
          icon={<FileText className="h-10 w-10" />}
          title={t('media.noDocumentsFound')}
          description={searchTerm ? t('media.noDocumentsMatch') : t('media.uploadFirstDocument')}
        />
      ) : (
        <div className="stagger-children grid gap-5 sm:grid-cols-2">
          {filteredDocuments.map((doc, index) => (
            <Card
              key={doc.id}
              className={cn(
                'group overflow-hidden border-border/50 transition-all duration-300',
                'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5',
              )}
              style={{ animationDelay: `${0.05 * (index + 1)}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1 text-base transition-colors group-hover:text-primary">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2 text-xs">
                      {doc.description}
                    </CardDescription>
                  </div>
                  {doc.access_control && (
                    <AccessControlBadge
                      accessControl={doc.access_control}
                      className="ms-2 text-[10px]"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <File className="h-3.5 w-3.5" />
                    {formatFileSize(doc.size)}
                  </span>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2 py-0 text-[10px] font-semibold"
                  >
                    {doc.mime_type?.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => handleViewDocument(doc)}
                    disabled={!doc.preview_url}
                  >
                    <Eye className="me-1.5 h-3.5 w-3.5" />
                    {t('media.view')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => handleDownloadDocument(doc)}
                    disabled={!doc.download_url}
                  >
                    <Download className="me-1.5 h-3.5 w-3.5" />
                    {t('media.download')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <Dialog open onOpenChange={(open) => (!open ? handleClosePreview() : null)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader className="text-start">
              <DialogTitle>{previewDocument.title}</DialogTitle>
              <DialogDescription>
                {previewDocument.description || t('media.documentPreviewFallback')}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="outline" className="rounded-full">
                  {previewDocument.mime_type || 'UNKNOWN'}
                </Badge>
                <span>{formatFileSize(previewDocument.size)}</span>
              </div>
              <div className="max-h-[70vh] overflow-hidden rounded-xl border bg-muted/30">
                {canPreviewInline(previewDocument) ? (
                  <iframe
                    src={buildDocumentUrl(previewDocument.preview_url)}
                    className="h-[70vh] w-full"
                    onLoad={() => setIsPreviewLoading(false)}
                    title={previewDocument.title}
                  />
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center space-y-3 p-4 text-center text-sm text-muted-foreground sm:p-6">
                    <File className="h-12 w-12" />
                    <p className="max-w-sm">{t('media.previewNotAvailable')}</p>
                    <Button
                      onClick={() => handleDownloadDocument(previewDocument)}
                      className="rounded-xl"
                    >
                      <Download className="me-2 h-4 w-4" />
                      {t('media.download')}
                    </Button>
                  </div>
                )}
                {isPreviewLoading && canPreviewInline(previewDocument) && (
                  <div className="flex h-[70vh] items-center justify-center bg-background/80 text-sm text-muted-foreground">
                    {t('media.loadingPreview')}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4 flex items-center justify-between">
              <Button variant="outline" onClick={handleClosePreview} className="rounded-xl">
                {t('media.close')}
              </Button>
              <Button
                onClick={() => handleDownloadDocument(previewDocument)}
                className="rounded-xl"
              >
                <Download className="me-2 h-4 w-4" />
                {t('media.download')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
