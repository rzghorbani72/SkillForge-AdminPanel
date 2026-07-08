const PERSIAN_SECTION = /^#\s*فارسی/m;
const ENGLISH_SECTION = /^#\s*English\b/im;

/** Strip drafting metadata / mirror sections so each locale shows one language only. */
export function prepareLegalMarkdown(body: string, locale: string): string {
  let markdown = body.replace(/\{\{LEGAL_ENTITY_NAME\}\}/g, 'منتوما');
  markdown = normalizeLegalLinks(markdown);

  if (locale === 'fa' || locale === 'ar') {
    const persianStart = markdown.search(PERSIAN_SECTION);
    if (persianStart >= 0) {
      markdown = markdown.slice(persianStart);
      const englishStart = markdown.search(ENGLISH_SECTION);
      if (englishStart >= 0) {
        markdown = markdown.slice(0, englishStart);
      }
      markdown = markdown.replace(/^#\s*فارسی[^\n]*\n+/, '');
    } else {
      markdown = markdown
        .replace(/^#\s*Privacy Policy[^\n]*\n+/i, '')
        .replace(/^#\s*Terms of Service[^\n]*\n+/i, '')
        .replace(/^>\s.*(?:\n>\s.*)*\n+/m, '')
        .replace(/^---+\s*\n+/m, '');
      const englishStart = markdown.search(ENGLISH_SECTION);
      if (englishStart >= 0) {
        markdown = markdown.slice(0, englishStart);
      }
    }

    markdown = markdown.replace(/\n---+\s*(?=\n|$)/g, '\n').trim();
    return markdown;
  }

  if (locale === 'en') {
    const englishStart = markdown.search(ENGLISH_SECTION);
    if (englishStart >= 0) {
      markdown = markdown
        .slice(englishStart)
        .replace(ENGLISH_SECTION, '# ')
        .trim();
    }
  }

  return markdown.trim();
}

function normalizeLegalLinks(markdown: string): string {
  return markdown.replace(
    /\[([^\]]+)\]\((?:\.\/)?([^)]+\.md)\)/g,
    (_match, label: string, file: string) => {
      if (file.includes('privacy-policy')) {
        return `[${label}](/privacy)`;
      }
      if (file.includes('terms-of-service')) {
        return `[${label}](/terms)`;
      }
      return label;
    }
  );
}
