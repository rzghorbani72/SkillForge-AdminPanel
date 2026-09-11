import { redirect } from 'next/navigation';

/** Moved into the Website area, where every public-site control now lives. */
export default function UiTemplateRedirect() {
  redirect('/website/appearance/list');
}
