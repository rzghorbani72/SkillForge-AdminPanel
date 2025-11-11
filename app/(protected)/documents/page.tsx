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
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Media, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/hooks/useSchool';
import UploadDocumentDialog from '@/components/content/upload-document-dialog';
import { AccessControlBadge } from '@/components/ui/access-control-badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

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
  const { selectedSchool } = useSchool();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(
    null
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  useEffect(() => {
    if (selectedSchool) {
      fetchData();
    }
  }, [selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const [documentsResponse, coursesResponse] = await Promise.all([
        apiClient.getDocuments(),
        apiClient.getCourses({ school_id: selectedSchool.id })
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

  if (!selectedSchool) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No School Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a school from the header to view documents.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage documents and study materials for {selectedSchool.name}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{documents.length}</div>
          <p className="text-xs text-muted-foreground">
            Documents in {selectedSchool.name}
          </p>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredDocuments.map((doc) => (
          <Card
            key={doc.id}
            className="transition-shadow hover:shadow-md sm:min-w-[25rem] "
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {doc.description}
                  </CardDescription>
                </div>
                {/* Ownership Badge */}
                {(doc as any).access_control && (
                  <AccessControlBadge
                    accessControl={(doc as any).access_control}
                    className="ml-2 text-xs"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <File className="mr-1 h-4 w-4" />
                    {formatFileSize(doc.size)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {doc.mime_type || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {doc.mime_type?.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {doc?.title || 'No Title'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDocument(doc)}
                    disabled={!doc.preview_url}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownloadDocument(doc)}
                    disabled={!doc.download_url}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <Badge variant="outline">
                  {previewDocument.mime_type || 'UNKNOWN'}
                </Badge>
                <span>{formatFileSize(previewDocument.size)}</span>
              </div>
              <div className="max-h-[70vh] overflow-hidden rounded-md border bg-muted/30">
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
              <Button variant="outline" onClick={handleClosePreview}>
                Close
              </Button>
              <Button onClick={() => handleDownloadDocument(previewDocument)}>
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
