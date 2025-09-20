'use client';

import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { FileUploader } from '@/components/file-uploader';
import { Plus, Video, Play, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

const videoFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  video_file: z
    .any()
    .refine((files) => files?.length > 0, 'Video file is required'),
  course_id: z.string().optional(),
  lesson_type: z.enum(['WELCOME', 'LESSON', 'INTRO', 'CONCLUSION']),
  is_welcome_video: z.boolean(),
  duration: z.string().optional(),
  tags: z.string().optional()
});

type VideoFormData = z.infer<typeof videoFormSchema>;

interface UploadVideoDialogProps {
  onVideoUploaded?: () => void;
  courses?: Course[];
}

export default function UploadVideoDialog({
  onVideoUploaded,
  courses
}: UploadVideoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      course_id: '',
      lesson_type: 'LESSON',
      is_welcome_video: false,
      duration: '',
      tags: ''
    }
  });

  const isWelcomeVideo = form.watch('is_welcome_video');

  const onSubmit = async (data: VideoFormData) => {
    try {
      setIsLoading(true);

      // Upload video file
      const file = data.video_file[0];
      const uploadResponse = await apiClient.uploadVideo(file, {
        title: data.title,
        description: data.description
      });

      // If course is selected, associate the video with the course
      if (data.course_id) {
        // You might need to create an endpoint to associate videos with courses
        console.log('Video uploaded, course association would be handled here');

        // For now, we'll log the association details
        console.log('Video Details:', {
          id: (uploadResponse as any).data.id,
          title: data.title,
          course_id: data.course_id,
          lesson_type: data.lesson_type,
          is_welcome_video: data.is_welcome_video,
          duration: data.duration,
          tags: data.tags
        });
      }

      form.reset();
      setIsOpen(false);
      onVideoUploaded?.();
    } catch (error) {
      console.error('Error uploading video:', error);
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
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload video content for your courses and lessons
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="video_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video File *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={1}
                        maxSize={500 * 1024 * 1024} // 500MB
                        accept={{
                          'video/*': [
                            '.mp4',
                            '.avi',
                            '.mov',
                            '.wmv',
                            '.flv',
                            '.webm',
                            '.mkv'
                          ]
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload video files (MP4, AVI, MOV, WMV, FLV, WebM, MKV) -
                    max 500MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter video title" {...field} />
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
                      placeholder="Describe the video content and its purpose"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="lesson_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lesson type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WELCOME">Welcome Video</SelectItem>
                        <SelectItem value="LESSON">Lesson Content</SelectItem>
                        <SelectItem value="INTRO">Introduction</SelectItem>
                        <SelectItem value="CONCLUSION">Conclusion</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course (optional)" />
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
                    <FormDescription>
                      Optionally associate this video with a specific course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_welcome_video"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Welcome Video</FormLabel>
                    <FormDescription>
                      Set this as the default welcome video for the course
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 15"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated duration in minutes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., introduction, tutorial, overview"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags to help organize your videos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isWelcomeVideo && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">
                    Welcome Video Settings
                  </p>
                </div>
                <p className="mt-1 text-sm text-blue-700">
                  This video will be set as the default welcome video for the
                  course. It will automatically play when students first access
                  the course.
                </p>
              </div>
            )}

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
                {isLoading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
