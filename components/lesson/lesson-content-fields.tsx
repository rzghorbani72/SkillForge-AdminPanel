'use client';

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import Link from '@/components/ui/link';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import VideoUploadPreview from '@/components/ui/VideoUploadPreview';
import AudioUploadPreview from '@/components/ui/AudioUploadPreview';
import DocumentUploadPreview from '@/components/ui/DocumentUploadPreview';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';
import { useVideoCover } from '@/hooks/use-video-cover';
import { imageByIdSrc } from '@/lib/image-src';
import { useTranslation } from '@/lib/i18n/hooks';
import LiveSessionEditor from './LiveSessionEditor';
import { LessonFormData } from './schema';
import type { LiveSession } from '@/types/api';

type Props = {
  form: UseFormReturn<LessonFormData>;
  liveSessionLessonId?: string;
  serverLessonType?: string;
  liveSessionInitial?: LiveSession | null;
  onLiveSessionSaved?: () => void;
};

const DOCUMENT_HINT_KEY: Record<string, string> = {
  TEXT: 'courses.lessonForm.documentMainHint',
  QUIZ: 'courses.lessonForm.quizDocumentHint',
  ASSIGNMENT: 'courses.lessonForm.assignmentDocumentHint'
};

const LessonContentFields = ({
  form,
  liveSessionLessonId,
  serverLessonType,
  liveSessionInitial,
  onLiveSessionSaved
}: Props) => {
  const { t } = useTranslation();
  const { onCoverPicked, onVideoAttached } = useVideoCover();
  const lessonType = form.watch('lesson_type');
  const title = form.watch('title');
  const description = form.watch('description');

  const coverField = (
    <FormField
      control={form.control}
      name="cover_id"
      render={() => (
        <FormItem>
          <FormLabel>{t('courses.lessonCover')}</FormLabel>
          <FormControl>
            <ImageUploadPreview
              title={title || t('courses.lessonCover')}
              description={description || t('courses.lessonCover')}
              alt={t('courses.lessonCover')}
              className="max-w-none"
              placeholderText={t('media.noPosterSelected')}
              placeholderSubtext={t('media.dropImageHint')}
              selectedImageId={form.watch('cover_id') || null}
              onFileSelected={(file) =>
                onCoverPicked(file, form.watch('video_id'))
              }
              onSuccess={(image) => form.setValue('cover_id', image.id)}
            />
          </FormControl>
          <FormDescription>{t('courses.lessonCoverHint')}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const audioField = (label: string, hint: React.ReactNode) => (
    <FormField
      control={form.control}
      name="audio_id"
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <AudioUploadPreview
              lessonTitle={title}
              descriptionFallback={description || t('courses.lessonAudio')}
              selectedAudioId={form.watch('audio_id')}
              onSuccess={(audio) => form.setValue('audio_id', String(audio.id))}
              onClear={() => form.setValue('audio_id', '')}
            />
          </FormControl>
          <FormDescription>{hint}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const documentFieldNode = (label: string, hint: React.ReactNode) => (
    <FormField
      control={form.control}
      name="document_id"
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DocumentUploadPreview
              lessonTitle={title}
              descriptionFallback={description || t('courses.lessonDocument')}
              selectedDocumentId={form.watch('document_id')}
              onSuccess={(doc) => form.setValue('document_id', String(doc.id))}
              onClear={() => form.setValue('document_id', '')}
            />
          </FormControl>
          <FormDescription>{hint}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const libraryHint = (hintKey: string, href: string, linkLabel: string) => (
    <>
      {t(hintKey)}{' '}
      <Link href={href} className="font-medium text-primary underline">
        {linkLabel}
      </Link>
    </>
  );

  if (lessonType === 'VIDEO') {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="video_id"
          render={() => (
            <FormItem>
              <FormLabel>{t('courses.lessonVideo')}</FormLabel>
              <FormControl>
                <VideoUploadPreview
                  title={title || t('courses.lessonVideoTitle')}
                  description={description || t('courses.lessonVideoTitle')}
                  onSuccess={(video) => {
                    form.setValue('video_id', video.id.toString());
                    if (video.id) onVideoAttached(video.id.toString());
                  }}
                  selectedVideoId={form.watch('video_id')}
                  posterUrl={
                    form.watch('cover_id')
                      ? imageByIdSrc(form.watch('cover_id') as string)
                      : null
                  }
                />
              </FormControl>
              <FormDescription>
                {t('courses.lessonForm.videoHint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {coverField}
      </div>
    );
  }

  if (lessonType === 'AUDIO') {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {audioField(
          t('courses.lessonAudio'),
          libraryHint(
            'courses.lessonForm.audioMainHint',
            '/audios',
            t('courses.manageAudios')
          )
        )}
        {coverField}
      </div>
    );
  }

  if (lessonType in DOCUMENT_HINT_KEY) {
    return documentFieldNode(
      t('courses.lessonDocument'),
      libraryHint(
        DOCUMENT_HINT_KEY[lessonType],
        '/documents',
        t('courses.manageDocuments')
      )
    );
  }

  if (lessonType === 'LIVE') {
    if (!liveSessionLessonId) {
      return (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {t('courses.lessonForm.liveNeedsSave')}
        </p>
      );
    }
    if (serverLessonType !== 'LIVE' || onLiveSessionSaved == null) {
      return (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {t('courses.lessonForm.liveNeedsType')}
        </p>
      );
    }
    return (
      <LiveSessionEditor
        lessonId={liveSessionLessonId}
        initial={liveSessionInitial ?? null}
        onSaved={onLiveSessionSaved}
      />
    );
  }

  return null;
};

export default LessonContentFields;
