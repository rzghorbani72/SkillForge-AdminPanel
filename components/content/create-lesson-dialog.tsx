'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FileUploader } from '@/components/file-uploader';
import { Plus, Clock, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course, Season } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

const lessonFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().optional(),
  duration: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: 'Duration must be a positive number'
    }),
  course_id: z.string().min(1, 'Course is required'),
  season_id: z.string().optional(),
  media_file: z.any().optional()
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

interface CreateLessonDialogProps {
  onLessonCreated?: () => void;
  courses?: Course[];
}

export default function CreateLessonDialog({
  onLessonCreated,
  courses
}: CreateLessonDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      duration: '30',
      course_id: '',
      season_id: ''
    }
  });

  const watchedCourseId = form.watch('course_id');

  // Fetch seasons when course changes
  useEffect(() => {
    if (watchedCourseId && watchedCourseId !== selectedCourseId) {
      setSelectedCourseId(watchedCourseId);
      fetchSeasons(parseInt(watchedCourseId));
    }
  }, [watchedCourseId, selectedCourseId]);

  const fetchSeasons = async (courseId: number) => {
    try {
      const response = await apiClient.getSeasons(courseId);
      setSeasons(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      setSeasons([]);
    }
  };

  const onSubmit = async (data: LessonFormData) => {
    try {
      setIsLoading(true);

      let mediaId: number | undefined;

      // Upload media file if provided
      let mediaType: string | null = null;
      if (data.media_file && data.media_file.length > 0) {
        const file = data.media_file[0];
        let uploadResponse;

        if (file.type.startsWith('video/')) {
          mediaType = 'video';
          uploadResponse = await apiClient.uploadVideo(file, {
            title: `Lesson Media: ${data.title}`,
            description: `Media file for lesson: ${data.title}`
          });
        } else if (file.type.startsWith('audio/')) {
          mediaType = 'audio';
          uploadResponse = await apiClient.uploadAudio(file, {
            title: `Lesson Audio: ${data.title}`,
            description: `Audio file for lesson: ${data.title}`
          });
        } else {
          mediaType = 'document';
          uploadResponse = await apiClient.uploadDocument(file, {
            title: `Lesson Document: ${data.title}`,
            description: `Document for lesson: ${data.title}`
          });
        }

        mediaId = (uploadResponse as any).data.id;
      }

      // Create lesson
      const lessonData: any = {
        title: data.title,
        description: data.description,
        season_id: parseInt(data.season_id || '0')
      };

      if (mediaId && mediaType) {
        if (mediaType === 'video') {
          lessonData.video_id = mediaId;
        } else if (mediaType === 'audio') {
          lessonData.audio_id = mediaId;
        } else if (mediaType === 'document') {
          lessonData.document_id = mediaId;
        }
      }

      await apiClient.createLesson(lessonData);

      form.reset();
      setIsOpen(false);
      setSeasons([]);
      setSelectedCourseId('');
      onLessonCreated?.();
    } catch (error) {
      console.error('Error creating lesson:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Create Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
          <DialogDescription>
            Add a new lesson to your course with content and media
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lesson title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of what this lesson covers"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed lesson content, instructions, or notes"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add detailed content, instructions, or notes for this lesson
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {seasons.length > 0 && (
              <FormField
                control={form.control}
                name="season_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a season" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {seasons.map((season) => (
                          <SelectItem
                            key={season.id}
                            value={season.id.toString()}
                          >
                            {season.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Organize lessons into seasons for better structure
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="media_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media File</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={1}
                        maxSize={100 * 1024 * 1024} // 100MB
                        accept={{
                          'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
                          'audio/*': ['.mp3', '.wav', '.aac', '.ogg'],
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            ['.docx']
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload video, audio, or document files (max 100MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
