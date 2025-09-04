import { Course, Season } from '@/types/api';

const LessonNavigation = ({
  courseId,
  course,
  seasonId,
  season,
  router
}: {
  courseId: string;
  course: Course;
  seasonId: string;
  season: Season;
  router: any;
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <button
        onClick={() => router.push('/courses')}
        className="transition-colors hover:text-foreground"
      >
        Courses
      </button>
      <span>/</span>
      <button
        onClick={() => router.push(`/courses/${courseId}`)}
        className="transition-colors hover:text-foreground"
      >
        {course.title}
      </button>
      <span>/</span>
      <button
        onClick={() => router.push(`/courses/${courseId}/seasons`)}
        className="transition-colors hover:text-foreground"
      >
        Seasons
      </button>
      <span>/</span>
      <button
        onClick={() => router.push(`/courses/${courseId}/seasons/${seasonId}`)}
        className="transition-colors hover:text-foreground"
      >
        {season.title}
      </button>
      <span>/</span>
      <span className="font-medium text-foreground">Lessons</span>
    </div>
  );
};

export default LessonNavigation;
