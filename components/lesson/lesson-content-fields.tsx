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
  const lessonType = form.watch('lesson_type');
  const title = form.watch('title');
  const description = form.watch('description');

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
      <div className="space-y-6">
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
                  onSuccess={(video) =>
                    form.setValue('video_id', video.id.toString())
                  }
                  selectedVideoId={form.watch('video_id')}
                  alt={t('courses.lessonVideoTitle')}
                  allowPosterUpload
                  posterImageId={form.watch('cover_id')}
                  onPosterSuccess={(image) =>
                    form.setValue('cover_id', image.id.toString())
                  }
                  onPosterRemove={() => form.setValue('cover_id', '')}
                />
              </FormControl>
              <FormDescription>
                {t('courses.lessonForm.videoHint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {audioField(
            t('courses.lessonForm.extraAudio'),
            t('courses.lessonForm.extraAudioHint')
          )}
          {documentFieldNode(
            t('courses.lessonForm.extraDocument'),
            t('courses.lessonForm.extraDocumentHint')
          )}
        </div>
      </div>
    );
  }

  if (lessonType === 'AUDIO') {
    return audioField(
      t('courses.lessonAudio'),
      libraryHint(
        'courses.lessonForm.audioMainHint',
        '/audios',
        t('courses.manageAudios')
      )
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
