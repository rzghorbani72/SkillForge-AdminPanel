import { redirect } from 'next/navigation';

/** Old workspace URL — learning now lives on the user details page. */
export default async function StudentLearningRedirect({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/user/${id}`);
}
