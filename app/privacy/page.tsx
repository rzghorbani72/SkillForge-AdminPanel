import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { LegalDocumentPage } from '@/components/legal/legal-document-page';
import { fetchLegalDocument } from '@/lib/legal/fetch-legal-document';
import { markdownToHtml } from '@/lib/legal/markdown-to-html';
import { getAdminLanguage } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const locale = getAdminLanguage(
    cookieStore.get('preferred_language')?.value,
    null
  );
  const document = await fetchLegalDocument('PRIVACY', locale);

  if (!document) {
    notFound();
  }

  return (
    <LegalDocumentPage
      document={document}
      html={markdownToHtml(document.body)}
    />
  );
}
