'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Play,
  Layers,
  Music,
  FileText,
  Video,
  Plus
} from 'lucide-react';
import { Course, Category } from '@/types/api';
import { useSchool } from '@/contexts/SchoolContext';

// Import dialogs
import CreateLessonDialog from './create-lesson-dialog';
import CreateSeasonDialog from './create-season-dialog';
import UploadAudioDialog from './upload-audio-dialog';
import UploadDocumentDialog from './upload-document-dialog';
import UploadVideoDialog from './upload-video-dialog';

interface ContentCreationHubProps {
  onContentCreated: () => void;
  courses: Course[];
}

const contentTypes = [
  {
    id: 'course',
    title: 'Course',
    description: 'Create a new course with lessons and content',
    icon: BookOpen,
    dialog: null, // Will navigate to page instead
    color: 'bg-blue-500'
  },
  {
    id: 'lesson',
    title: 'Lesson',
    description: 'Add a new lesson to an existing course',
    icon: Play,
    dialog: CreateLessonDialog,
    color: 'bg-green-500'
  },
  {
    id: 'season',
    title: 'Season',
    description: 'Create a new season/module for a course',
    icon: Layers,
    dialog: CreateSeasonDialog,
    color: 'bg-purple-500'
  },
  {
    id: 'audio',
    title: 'Audio',
    description: 'Upload audio files for lessons and courses',
    icon: Music,
    dialog: UploadAudioDialog,
    color: 'bg-orange-500'
  },
  {
    id: 'document',
    title: 'Document',
    description: 'Upload documents and study materials',
    icon: FileText,
    dialog: UploadDocumentDialog,
    color: 'bg-gray-500'
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Upload video content for lessons',
    icon: Video,
    dialog: UploadVideoDialog,
    color: 'bg-red-500'
  }
];

export default function ContentCreationHub({
  onContentCreated,
  courses
}: ContentCreationHubProps) {
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleContentCreated = () => {
    setIsDialogOpen(false);
    setSelectedType(null);
    onContentCreated();
  };

  const handleTypeSelect = (typeId: string) => {
    if (typeId === 'course') {
      // Navigate to course creation page
      router.push('/courses/create');
      return;
    }
    setSelectedType(typeId);
    setIsDialogOpen(true);
  };

  const renderDialog = () => {
    if (!selectedType || !selectedSchool) return null;

    const contentType = contentTypes.find((type) => type.id === selectedType);
    if (!contentType || !contentType.dialog) return null;

    const DialogComponent = contentType.dialog;

    switch (selectedType) {
      case 'lesson':
        return (
          <DialogComponent
            onLessonCreated={handleContentCreated}
            courses={courses}
          />
        );
      case 'season':
        return (
          <DialogComponent
            onSeasonCreated={handleContentCreated}
            courses={courses}
          />
        );
      case 'audio':
        return (
          <DialogComponent
            onAudioUploaded={handleContentCreated}
            courses={courses}
          />
        );
      case 'video':
        return (
          <DialogComponent
            onVideoUploaded={handleContentCreated}
            courses={courses}
          />
        );
      case 'document':
        return (
          <DialogComponent
            onDocumentUploaded={handleContentCreated}
            courses={courses}
          />
        );
      default:
        return null;
    }
  };

  if (!selectedSchool) {
    return (
      <Button disabled>
        <Plus className="mr-2 h-4 w-4" />
        Select School First
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Content
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((type) => (
              <Card
                key={type.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleTypeSelect(type.id)}
              >
                <CardHeader className="text-center">
                  <div
                    className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${type.color} text-white`}
                  >
                    <type.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {selectedSchool.name}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-4">{renderDialog()}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
