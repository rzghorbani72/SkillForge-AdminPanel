'use client';

import { useState, useEffect } from 'react';
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
import { useSchool } from '@/contexts/SchoolContext';
import UploadDocumentDialog from '@/components/content/upload-document-dialog';

export default function DocumentsPage() {
  const { selectedSchool } = useSchool();
  const [documents, setDocuments] = useState<Media[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedSchool) {
      fetchData();
    }
  }, [selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const [mediaResponse, coursesResponse] = await Promise.all([
        apiClient.getMedia(),
        apiClient.getCourses()
      ]);

      if (mediaResponse.status === 'ok' && mediaResponse.data) {
        const schoolDocuments = mediaResponse.data.filter(
          (item: Media) =>
            item.school_id === selectedSchool.id && item.type === 'document'
        );
        setDocuments(schoolDocuments);
      }

      if (coursesResponse.status === 'ok' && coursesResponse.data) {
        const schoolCourses = coursesResponse.data.filter(
          (course: Course) => course.school_id === selectedSchool.id
        );
        setCourses(schoolCourses);
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

  const filteredDocuments = documents.filter(
    (document) =>
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{document.title}</CardTitle>
              <CardDescription className="text-sm">
                {document.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <File className="mr-1 h-4 w-4" />
                    {document.file_size || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {document.format || 'PDF'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{document.type || 'Document'}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {document.lesson?.title || 'No Lesson'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
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
          schoolId={selectedSchool.id}
        />
      )}
    </div>
  );
}
