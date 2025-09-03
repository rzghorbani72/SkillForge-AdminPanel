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
  Music,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Play,
  FileText,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Media, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import UploadAudioDialog from '@/components/content/upload-audio-dialog';

export default function AudiosPage() {
  const { selectedSchool } = useSchool();
  const [audios, setAudios] = useState<Media[]>([]);
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
        const schoolAudios = mediaResponse.data.filter(
          (item: Media) =>
            item.school_id === selectedSchool.id && item.type === 'audio'
        );
        setAudios(schoolAudios);
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

  const handleAudioUploaded = () => {
    setIsCreateDialogOpen(false);
    fetchData();
  };

  const filteredAudios = audios.filter(
    (audio) =>
      audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audio.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
              Please select a school from the header to view audios.
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
          <h1 className="text-3xl font-bold tracking-tight">Audio Files</h1>
          <p className="text-muted-foreground">
            Manage audio content for {selectedSchool.name}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Audio
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Audio Files
          </CardTitle>
          <Music className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{audios.length}</div>
          <p className="text-xs text-muted-foreground">
            Audio files in {selectedSchool.name}
          </p>
        </CardContent>
      </Card>

      {/* Audios Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAudios.map((audio) => (
          <Card key={audio.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{audio.title}</CardTitle>
              <CardDescription className="text-sm">
                {audio.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <FileText className="mr-1 h-4 w-4" />
                    {audio.file_size || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {audio.duration || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{audio.format || 'Audio'}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {audio.lesson?.title || 'No Lesson'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="mr-1 h-4 w-4" />
                    Play
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

      {/* Upload Audio Dialog */}
      {isCreateDialogOpen && (
        <UploadAudioDialog
          onAudioUploaded={handleAudioUploaded}
          courses={courses}
          schoolId={selectedSchool.id}
        />
      )}
    </div>
  );
}
