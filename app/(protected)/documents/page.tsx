'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  File,
  Clock,
  X,
  SlidersHorizontal,
  Sparkles,
  Files
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Media, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import UploadDocumentDialog from '@/components/content/upload-document-dialog';
import { AccessControlBadge } from '@/components/ui/access-control-badge';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

interface DocumentItem extends Media {
  download_url?: string;
  preview_url?: string;
}

const formatFileSize = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const buildDocumentUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    `${process.env.NEXT_PUBLIC_HOST || ''}/api`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${normalized}`;
};

export default function DocumentsPage() {
  const { t, language } = useTranslation();
  const { selectedStore } = useStore();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(
    null
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (selectedStore) {
      fetchData();
    }
  }, [selectedStore]);

  const fetchData = async () => {
    if (!selectedStore) return;

    try {
      setIsLoading(true);
      const [documentsResponse, coursesResponse] = await Promise.all([
        apiClient.getDocuments(),
        apiClient.getCourses({ store_id: selectedStore.id })
      ]);

      if (documentsResponse?.data && Array.isArray(documentsResponse.data)) {
        setDocuments(documentsResponse.data as DocumentItem[]);
      } else if (Array.isArray(documentsResponse)) {
        setDocuments(documentsResponse as DocumentItem[]);
      } else {
        setDocuments([]);
      }

      if (coursesResponse?.courses) {
        setCourses(coursesResponse.courses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUploaded = () => {
    setIsCreateDialogOpen(false);
    fetchData();
  };

  const filteredDocuments = useMemo(
    () =>
      documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [documents, searchTerm]
  );

  const handleViewDocument = (doc: DocumentItem) => {
    const previewUrl = buildDocumentUrl(doc.preview_url);
    if (!previewUrl) {
      toast.error('Preview not available for this document.');
      return;
    }
    setPreviewDocument(doc);
  };

  const handleDownloadDocument = (doc: DocumentItem) => {
    const downloadUrl = buildDocumentUrl(doc.download_url);
    if (!downloadUrl) {
      toast.error('Download not available for this document.');
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

  if (!selectedStore) {
    return (
      <div className="page-wrapper flex-1 p-6">
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
    <div
      className="page-wrapper flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="icon-container-info">
            <Files className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t('media.documents')}
              </h1>
              <Badge
                variant="secondary"
                className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:flex"
              >
                <Sparkles className="me-1 h-3 w-3" />
                {documents.length} {t('media.files')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t('media.manageDocuments')} - {selectedStore.name}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
        >
          <Plus className="h-4 w-4" />
          {t('media.uploadDocument')}
        </Button>
      </div>

      {/* Search */}
      <div
        className="fade-in-up flex items-center gap-3"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="relative max-w-md flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('media.searchDocuments')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 rounded-xl border-border/50 bg-background/50 pe-10 ps-10 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl border-border/50"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Card */}
      <Card
        className="fade-in-up stat-card"
        style={{ animationDelay: '0.15s' }}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('media.totalDocuments')}
              </p>
              <p className="text-2xl font-bold">{documents.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('media.documentsIn')} {selectedStore.name}
              </p>
            </div>
            <div className="icon-container-primary">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div
          className="fade-in-up flex flex-1 items-center justify-center p-6"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="text-center">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent blur-2xl" />
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm">
                <FileText className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              {t('media.noDocumentsFound')}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {searchTerm
                ? t('media.noDocumentsMatch')
                : t('media.uploadFirstDocument')}
            </p>
          </div>
        </div>
      ) : (
        <div className="stagger-children grid gap-5 sm:grid-cols-2">
          {filteredDocuments.map((doc, index) => (
            <Card
              key={doc.id}
              className={cn(
                'group overflow-hidden border-border/50 transition-all duration-300',
                'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
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
                  {(doc as any).access_control && (
                    <AccessControlBadge
                      accessControl={(doc as any).access_control}
                      className="ml-2 text-[10px]"
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
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => handleDownloadDocument(doc)}
                    disabled={!doc.download_url}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-lg border-border/50 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Document Dialog */}
      {isCreateDialogOpen && (
        <UploadDocumentDialog
          onDocumentUploaded={handleDocumentUploaded}
          courses={courses}
        />
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <Dialog
          open
          onOpenChange={(open) => (!open ? handleClosePreview() : null)}
        >
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{previewDocument.title}</DialogTitle>
              <DialogDescription>
                {previewDocument.description || 'Document preview'}
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
                  <div className="flex h-64 flex-col items-center justify-center space-y-3 p-6 text-center text-sm text-muted-foreground">
                    <File className="h-12 w-12" />
                    <p>
                      Preview is not available for this document type. Please
                      download to view the contents.
                    </p>
                    <Button
                      onClick={() => handleDownloadDocument(previewDocument)}
                      className="rounded-xl"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                )}
                {isPreviewLoading && canPreviewInline(previewDocument) && (
                  <div className="flex h-[70vh] items-center justify-center bg-background/80 text-sm text-muted-foreground">
                    Loading preview...
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleClosePreview}
                className="rounded-xl"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDownloadDocument(previewDocument)}
                className="rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
