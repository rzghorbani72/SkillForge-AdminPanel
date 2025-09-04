'use client';

import { useParams, useRouter } from 'next/navigation';
import LessonHeader from '@/components/lesson/header';
import LessonNavigation from '@/components/lesson/navigation';
import SearchAndStats from '@/components/lesson/search-and-stats';
import NotFound from '@/components/lesson/not-found';
import LessonIndex from '@/components/lesson/index';
import Loading from '@/components/lesson/loading';
import SeasonNotFound from '@/components/lesson/season-not-found';
import useLesson from '@/components/lesson/useLesson';

export default function SeasonLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;
  const {
    lessons,
    season,
    course,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleDeleteLesson
  } = useLesson();

  if (isLoading) {
    return <Loading />;
  }

  if (!season || !course) {
    return <SeasonNotFound router={router} courseId={courseId} />;
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <LessonNavigation
        courseId={courseId}
        course={course}
        seasonId={seasonId}
        season={season}
        router={router}
      />
      <LessonHeader
        courseId={courseId}
        seasonId={seasonId}
        season={season}
        course={course}
        router={router}
      />
      <SearchAndStats
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        lessons={lessons}
      />
      {lessons.length === 0 ? (
        <NotFound
          searchTerm={searchTerm}
          router={router}
          courseId={courseId}
          seasonId={seasonId}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonIndex
              key={lesson.id}
              lesson={lesson}
              router={router}
              courseId={courseId}
              seasonId={seasonId}
              handleDeleteLesson={handleDeleteLesson}
            />
          ))}
        </div>
      )}
    </div>
  );
}
