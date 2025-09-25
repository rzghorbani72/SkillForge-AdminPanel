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
import { FileUploader } from '@/components/file-uploader';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

const audioFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  audio_file: z
    .any()
    .refine((files) => files?.length > 0, 'Audio file is required'),
  course_id: z.string().optional(),
  tags: z.string().optional()
});

type AudioFormData = z.infer<typeof audioFormSchema>;

interface UploadAudioDialogProps {
  onAudioUploaded?: () => void;
  courses?: Course[];
}

export default function UploadAudioDialog({
  onAudioUploaded,
  courses
}: UploadAudioDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AudioFormData>({
    resolver: zodResolver(audioFormSchema),
    defaultValues: {
      title: '',
      description: '',
      course_id: '',
      tags: ''
    }
  });

  const onSubmit = async (data: AudioFormData) => {
    try {
      setIsLoading(true);

      // Upload audio file
      const file = data.audio_file[0];
      await apiClient.uploadAudio(file, {
        title: data.title,
        description: data.description
      });

      // If course is selected, you might want to associate the audio with the course
      // This would depend on your backend API structure
      if (data.course_id) {
        // You might need to create an endpoint to associate audio with courses
        console.log('Audio uploaded, course association would be handled here');
      }

      form.reset();
      setIsOpen(false);
      onAudioUploaded?.();
    } catch (error) {
      console.error('Error uploading audio:', error);
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
          Upload Audio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Audio File</DialogTitle>
          <DialogDescription>
            Upload audio content for your courses and lessons
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="audio_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio File *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={1}
                        maxSize={50 * 1024 * 1024} // 50MB
                        accept={{
                          'audio/*': [
                            '.mp3',
                            '.wav',
                            '.aac',
                            '.ogg',
                            '.m4a',
                            '.flac'
                          ]
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload audio files (MP3, WAV, AAC, OGG, M4A, FLAC) - max
                    50MB
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
                  <FormLabel>Audio Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter audio title" {...field} />
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
                      placeholder="Describe the audio content and its purpose"
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
                      Optionally associate this audio with a specific course
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
                        placeholder="e.g., lecture, podcast, music"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags to help organize your audio files
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isLoading ? 'Uploading...' : 'Upload Audio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
