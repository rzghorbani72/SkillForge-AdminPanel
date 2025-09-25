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
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

const seasonFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  order: z
    .string()
    .min(1, 'Order is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }, 'Order must be a positive integer'),
  course_id: z.string().min(1, 'Course is required')
});

type SeasonFormData = z.infer<typeof seasonFormSchema>;

interface CreateSeasonDialogProps {
  onSeasonCreated?: () => void;
  courses?: Course[];
  courseId?: number; // Pre-select a specific course
}

export default function CreateSeasonDialog({
  onSeasonCreated,
  courses,
  courseId
}: CreateSeasonDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SeasonFormData>({
    resolver: zodResolver(seasonFormSchema),
    defaultValues: {
      title: '',
      description: '',
      order: '1',
      course_id: courseId ? courseId.toString() : ''
    }
  });

  const onSubmit = async (data: SeasonFormData) => {
    try {
      setIsLoading(true);

      // Create season
      await apiClient.createSeason({
        title: data.title,
        description: data.description || '',
        order: parseInt(data.order),
        course_id: parseInt(data.course_id)
      });

      form.reset();
      setIsOpen(false);
      onSeasonCreated?.();
    } catch (error) {
      console.error('Error creating season:', error);

      // Handle specific database constraint errors
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Unique constraint failed')
      ) {
        ErrorHandler.handleApiError(
          new Error(
            'Unable to create season due to ordering conflict. Please try again.'
          )
        );
      } else {
        ErrorHandler.handleApiError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Create Season
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Season</DialogTitle>
          <DialogDescription>
            Organize your course content into logical modules or seasons
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!courseId && (
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
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Season Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Module 1: Introduction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The sequence order of this season within the course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this season covers and its learning objectives"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain what students will learn in this season
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
                {isLoading ? 'Creating...' : 'Create Season'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
