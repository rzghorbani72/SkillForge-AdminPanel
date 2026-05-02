import React from 'react';
import Link from 'next/link';
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
import VideoUploadPreview from '@/components/ui/VideoUploadPreview';
import AudioUploadPreview from '@/components/ui/AudioUploadPreview';
import DocumentUploadPreview from '@/components/ui/DocumentUploadPreview';
import LiveSessionEditor from './LiveSessionEditor';
import type { LiveSession } from '@/types/api';

type Props = {
  initialValues: Partial<LessonFormData> & { season_id: string };
  categories: Array<{ id: number; name: string }>;
  isSubmitting: boolean;
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
  liveSessionLessonId?: number;
  serverLessonType?: string;
  liveSessionInitial?: LiveSession | null;
  onLiveSessionSaved?: () => void;
};

const LessonForm = ({
  initialValues,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  liveSessionLessonId,
  serverLessonType,
  liveSessionInitial,
  onLiveSessionSaved
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
      lesson_type:
        (initialValues.lesson_type as LessonFormData['lesson_type']) ?? 'VIDEO'
    }
  });

  const lessonType = form.watch('lesson_type');

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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lesson type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="TEXT">Text (document)</SelectItem>
                      <SelectItem value="QUIZ">Quiz (document)</SelectItem>
                      <SelectItem value="ASSIGNMENT">
                        Assignment (document)
                      </SelectItem>
                      <SelectItem value="LIVE">Live session</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Content fields below follow this type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 border-t pt-6">
              <h3 className="text-sm font-semibold text-foreground">
                Lesson content
              </h3>

              {lessonType === 'VIDEO' ? (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="video_id"
                    render={() => (
                      <FormItem>
                        <FormLabel>Video</FormLabel>
                        <FormControl>
                          <VideoUploadPreview
                            title={form.watch('title') || 'Lesson Video'}
                            description={
                              form.watch('description') ||
                              'Lesson video content'
                            }
                            onSuccess={(video) => {
                              form.setValue('video_id', video.id.toString());
                            }}
                            selectedVideoId={form.watch('video_id')}
                            alt="Lesson video preview"
                            placeholderText="No video selected"
                            placeholderSubtext="Upload a video to preview it here"
                            uploadButtonText="Upload Video"
                            selectButtonText="Select a video first"
                            allowPosterUpload={true}
                            posterImageId={form.watch('cover_id')}
                            onPosterSuccess={(image) => {
                              form.setValue('cover_id', image.id.toString());
                            }}
                            onPosterRemove={() => {
                              form.setValue('cover_id', '');
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Main video for this lesson (optional cover / poster
                          via upload above)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="audio_id"
                      render={() => (
                        <FormItem>
                          <FormLabel>Extra: Audio</FormLabel>
                          <FormControl>
                            <AudioUploadPreview
                              lessonTitle={form.watch('title')}
                              descriptionFallback={
                                form.watch('description') ||
                                'Supplementary audio for this video lesson'
                              }
                              selectedAudioId={form.watch('audio_id')}
                              onSuccess={(audio) =>
                                form.setValue('audio_id', String(audio.id))
                              }
                              onClear={() => form.setValue('audio_id', '')}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional — upload or remove supplementary audio
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="document_id"
                      render={() => (
                        <FormItem>
                          <FormLabel>Extra: Document</FormLabel>
                          <FormControl>
                            <DocumentUploadPreview
                              lessonTitle={form.watch('title')}
                              descriptionFallback={
                                form.watch('description') ||
                                'Optional attachment for this video lesson'
                              }
                              selectedDocumentId={form.watch('document_id')}
                              onSuccess={(doc) =>
                                form.setValue('document_id', String(doc.id))
                              }
                              onClear={() => form.setValue('document_id', '')}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional — attach a document to this video lesson
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ) : null}

              {lessonType === 'AUDIO' ? (
                <FormField
                  control={form.control}
                  name="audio_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>Audio</FormLabel>
                      <FormControl>
                        <AudioUploadPreview
                          lessonTitle={form.watch('title')}
                          descriptionFallback={
                            form.watch('description') || 'Lesson audio'
                          }
                          selectedAudioId={form.watch('audio_id')}
                          onSuccess={(audio) =>
                            form.setValue('audio_id', String(audio.id))
                          }
                          onClear={() => form.setValue('audio_id', '')}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a file to attach it automatically, or manage
                        files in{' '}
                        <Link
                          href="/audios"
                          className="font-medium text-primary underline"
                        >
                          Audios
                        </Link>
                        .
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {lessonType === 'TEXT' ? (
                <FormField
                  control={form.control}
                  name="document_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>Document</FormLabel>
                      <FormControl>
                        <DocumentUploadPreview
                          lessonTitle={form.watch('title')}
                          descriptionFallback={
                            form.watch('description') || 'Text lesson document'
                          }
                          selectedDocumentId={form.watch('document_id')}
                          onSuccess={(doc) =>
                            form.setValue('document_id', String(doc.id))
                          }
                          onClear={() => form.setValue('document_id', '')}
                        />
                      </FormControl>
                      <FormDescription>
                        Main file for this lesson. Manage all files in{' '}
                        <Link
                          href="/documents"
                          className="font-medium text-primary underline"
                        >
                          Documents
                        </Link>
                        .
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {lessonType === 'QUIZ' ? (
                <FormField
                  control={form.control}
                  name="document_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>Document</FormLabel>
                      <FormControl>
                        <DocumentUploadPreview
                          lessonTitle={form.watch('title')}
                          descriptionFallback={
                            form.watch('description') ||
                            'Quiz instructions or question sheet'
                          }
                          selectedDocumentId={form.watch('document_id')}
                          onSuccess={(doc) =>
                            form.setValue('document_id', String(doc.id))
                          }
                          onClear={() => form.setValue('document_id', '')}
                        />
                      </FormControl>
                      <FormDescription>
                        Quiz handout or instructions as a document. Library:{' '}
                        <Link
                          href="/documents"
                          className="font-medium text-primary underline"
                        >
                          Documents
                        </Link>
                        .
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {lessonType === 'ASSIGNMENT' ? (
                <FormField
                  control={form.control}
                  name="document_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>Document</FormLabel>
                      <FormControl>
                        <DocumentUploadPreview
                          lessonTitle={form.watch('title')}
                          descriptionFallback={
                            form.watch('description') ||
                            'Assignment brief or worksheet'
                          }
                          selectedDocumentId={form.watch('document_id')}
                          onSuccess={(doc) =>
                            form.setValue('document_id', String(doc.id))
                          }
                          onClear={() => form.setValue('document_id', '')}
                        />
                      </FormControl>
                      <FormDescription>
                        Assignment learners submit or follow. Library:{' '}
                        <Link
                          href="/documents"
                          className="font-medium text-primary underline"
                        >
                          Documents
                        </Link>
                        .
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {lessonType === 'LIVE' &&
              serverLessonType === 'LIVE' &&
              liveSessionLessonId != null &&
              onLiveSessionSaved != null ? (
                <LiveSessionEditor
                  lessonId={liveSessionLessonId}
                  initial={liveSessionInitial ?? null}
                  onSaved={onLiveSessionSaved}
                />
              ) : lessonType === 'LIVE' && !liveSessionLessonId ? (
                <p className="text-sm text-muted-foreground">
                  Save this lesson once, then open edit again to add the meeting
                  link and schedule (lesson needs an id).
                </p>
              ) : lessonType === 'LIVE' &&
                liveSessionLessonId &&
                serverLessonType !== 'LIVE' ? (
                <p className="text-sm text-muted-foreground">
                  Update the lesson (Save) with type &quot;Live session&quot;
                  first, then you can add the meeting link here.
                </p>
              ) : null}
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
