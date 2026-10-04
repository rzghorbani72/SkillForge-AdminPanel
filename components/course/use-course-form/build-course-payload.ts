import { parseAccessDurationDays, type CourseFormData } from '../schema';
import {
  durationToSeconds,
  prepareCurriculumForSave,
  type LessonDraft,
  type SeasonDraft,
} from '../course-drafts';

export type CourseContentPayload = ReturnType<typeof buildCoursePayload>;

export function buildCoursePayload(
  data: CourseFormData,
  seasonList: SeasonDraft[],
  lessonList: LessonDraft[],
  removedSeasonIds: string[],
  removedLessonIds: string[],
  seasonFallbackTitle: (n: number) => string,
) {
  const curriculum = prepareCurriculumForSave(seasonList, lessonList, removedSeasonIds);
  const coverId = data.cover_id?.trim();
  // Undefined keys are dropped from the JSON body, and every course field
  // on the server is optional — so omitting them leaves them untouched.
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    learning_outcomes: (data.learning_outcomes ?? '').trim(),
    requirements: (data.requirements ?? '').trim(),
    difficulty: data.difficulty,
    is_certificate: data.is_certificate,
    certificate_rule: data.certificate_rule,
    access_duration_days: parseAccessDurationDays(data.access_duration_days),
    meta_title: data.meta_title.trim(),
    meta_description: data.meta_description.trim(),
    keywords: data.keywords,
    primary_price: Number(data.primary_price),
    secondary_price: Number(data.secondary_price) || 0,
    category_id: data.category_id || undefined,
    cover_id: coverId ? coverId : null,
    published: data.published,
    is_featured: data.is_featured,
    base_price_active: data.base_price_active,
    allow_downloads: data.allow_downloads,
    apply_downloads_to_lessons: data.apply_downloads_to_lessons || undefined,
    seasons: curriculum.seasons.map((s, i) => ({
      id: s.id,
      client_key: s.clientKey,
      title: s.title.trim() || seasonFallbackTitle(i + 1),
    })),
    lessons: curriculum.lessons.map((l) => ({
      id: l.id,
      client_key: l.clientKey,
      title: l.title.trim(),
      description: l.description.trim() || undefined,
      duration: durationToSeconds(l.duration),
      lesson_type: l.lesson_type,
      is_free: l.is_free,
      published: l.published,
      video_id: l.video_id,
      audio_id: l.audio_id,
      cover_id: l.cover_id,
      document_id: l.document_id,
      // Omitted unless the manager touched this lesson's switch in this
      // session — see LessonDraft.allowDownloadTouched.
      allow_download: l.allowDownloadTouched ? l.allow_download : undefined,
      season_client_key: l.seasonClientKey,
    })),
    deleted_season_ids:
      curriculum.deletedSeasonIds.length > 0 ? curriculum.deletedSeasonIds : undefined,
    deleted_lesson_ids: removedLessonIds.length > 0 ? removedLessonIds : undefined,
  };
}
