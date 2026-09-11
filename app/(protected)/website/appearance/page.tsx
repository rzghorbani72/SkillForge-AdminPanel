import { redirect } from 'next/navigation';

/** Old entry: `?template=<id>` deep links land on the editor route, the rest on the list. */
export default async function AppearanceRedirect({
  searchParams
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  redirect(
    template
      ? `/website/appearance/${encodeURIComponent(template)}`
      : '/website/appearance/list'
  );
}
