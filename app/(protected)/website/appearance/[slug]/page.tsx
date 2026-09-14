import { AppearanceWorkspace } from '../_components/appearance-workspace';

export default async function AppearanceEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AppearanceWorkspace slug={slug} />;
}
