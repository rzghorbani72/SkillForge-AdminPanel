import { redirect } from 'next/navigation';

type LivePageProps = {
  params: Promise<{ course_id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Old classes page: classes are now added and managed in the course steps. */
export default async function LiveCoursePage({ params, searchParams }: LivePageProps) {
  const { course_id: courseId } = await params;
  const query = new URLSearchParams({ step: 'schedule' });
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') query.set(key, value);
  }
  redirect(`/courses/${courseId}/edit?${query.toString()}`);
}
