'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Plus,
  BookOpen,
  Play,
  Layers,
  Music,
  FileText,
  GraduationCap,
  Video,
  FileAudio
} from 'lucide-react';
import CreateCourseDialog from './create-course-dialog';
import CreateLessonDialog from './create-lesson-dialog';
import CreateSeasonDialog from './create-season-dialog';
import UploadAudioDialog from './upload-audio-dialog';
import UploadDocumentDialog from './upload-document-dialog';
import UploadVideoDialog from './upload-video-dialog';
import { Course, Category } from '@/types/api';

interface ContentCreationHubProps {
  onContentCreated?: () => void;
  courses?: Course[];
  categories?: Category[];
}

const contentTypes = [
  {
    id: 'course',
    title: 'Create Course',
    description: 'Set up a new course with lessons and content',
    icon: BookOpen,
    color: 'bg-blue-500',
    dialog: CreateCourseDialog
  },
  {
    id: 'lesson',
    title: 'Create Lesson',
    description: 'Add a new lesson to an existing course',
    icon: Play,
    color: 'bg-green-500',
    dialog: CreateLessonDialog
  },
  {
    id: 'season',
    title: 'Create Season',
    description: 'Organize course content into modules',
    icon: Layers,
    color: 'bg-purple-500',
    dialog: CreateSeasonDialog
  },
  {
    id: 'video',
    title: 'Upload Video',
    description: 'Upload video content for courses and lessons',
    icon: Video,
    color: 'bg-indigo-500',
    dialog: UploadVideoDialog
  },
  {
    id: 'audio',
    title: 'Upload Audio',
    description: 'Upload audio files for lessons and courses',
    icon: Music,
    color: 'bg-orange-500',
    dialog: UploadAudioDialog
  },
  {
    id: 'document',
    title: 'Upload Document',
    description: 'Upload PDFs, presentations, and other documents',
    icon: FileText,
    color: 'bg-red-500',
    dialog: UploadDocumentDialog
  }
];

export default function ContentCreationHub({
  onContentCreated,
  courses,
  categories
}: ContentCreationHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleContentCreated = () => {
    setIsOpen(false);
    setSelectedType(null);
    onContentCreated?.();
  };

  const renderDialog = () => {
    if (!selectedType) return null;

    const contentType = contentTypes.find((type) => type.id === selectedType);
    if (!contentType) return null;

    const DialogComponent = contentType.dialog;

    switch (selectedType) {
      case 'course':
        return (
          <DialogComponent
            onCourseCreated={handleContentCreated}
            categories={categories}
          />
        );
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Content Creation Hub</DialogTitle>
            <DialogDescription>
              Choose what type of content you want to create for your school
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`rounded-lg p-2 ${type.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {type.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedType && (
            <div className="mt-6 border-t pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {contentTypes.find((t) => t.id === selectedType)?.title}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedType(null)}
                >
                  Back to Options
                </Button>
              </div>
              {renderDialog()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
