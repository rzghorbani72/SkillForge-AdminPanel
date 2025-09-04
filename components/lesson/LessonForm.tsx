import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LessonFormData, lessonFormSchema } from './schema';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';

type Props = {
  initialValues: Partial<LessonFormData> & { season_id: string };
  categories: Array<{ id: number; name: string }>;
  isSubmitting: boolean;
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
};

const LessonForm = ({
  initialValues,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
  submitLabel = 'Save'
}: Props) => {
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: initialValues.title ?? '',
      description: initialValues.description ?? '',
      season_id: initialValues.season_id,
      audio_id: initialValues.audio_id ?? '',
      video_id: initialValues.video_id ?? '',
      cover_id: initialValues.cover_id ?? '',
      document_id: initialValues.document_id ?? '',
      category_id: initialValues.category_id ?? '',
      published: initialValues.published ?? false,
      is_free: initialValues.is_free ?? false,
      lesson_type: (initialValues.lesson_type as any) ?? 'VIDEO'
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          Lesson Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lesson title" {...field} />
                  </FormControl>
                  <FormDescription>
                    The title of your lesson (5-80 characters)
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter lesson description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your lesson (max 400 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lesson_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lesson type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of content for this lesson
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="video_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter video ID"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ID of the associated video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="audio_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audio ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter audio ID"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ID of the associated audio
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Image Upload Section */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="cover_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <ImageUploadPreview
                          title={form.watch('title') || 'Lesson Cover'}
                          description={
                            form.watch('description') || 'Lesson cover image'
                          }
                          onSuccess={(image) => {
                            console.log(
                              'LessonForm - Image selected, setting cover_id to:',
                              image.id
                            );
                            form.setValue('cover_id', image.id.toString());
                            console.log(
                              'LessonForm - Form cover_id is now:',
                              form.getValues('cover_id')
                            );
                          }}
                          selectedImageId={form.watch('cover_id')}
                          alt="Lesson cover preview"
                          placeholderText="No cover image selected"
                          placeholderSubtext="Upload an image to preview it here"
                          uploadButtonText="Upload Cover Image"
                          selectButtonText="Select an image first"
                        />
                        {/* Hidden input to store the image ID */}
                        <input type="hidden" {...field} />
                      </FormControl>
                      <FormDescription>
                        Upload a cover image for this lesson
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="document_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter document ID"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ID of the associated document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a category for this lesson
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published</FormLabel>
                      <FormDescription>
                        Make this lesson visible to students
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
              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Lesson</FormLabel>
                      <FormDescription>
                        Make this lesson free for all students
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
            </div>

            <div className="flex items-center space-x-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? submitLabel + '...' : submitLabel}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LessonForm;
