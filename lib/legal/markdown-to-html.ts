function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text: string): string {
  let safe = escapeHtml(text);
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
  safe = safe.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" rel="noopener noreferrer">$1</a>'
  );
  return safe;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;

  const closeLists = () => {
    if (inUl) {
      html.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      html.push('</ol>');
      inOl = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      html.push('</blockquote>');
      inBlockquote = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed === '') {
      closeLists();
      closeBlockquote();
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      closeLists();
      closeBlockquote();
      html.push('<hr />');
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeLists();
      closeBlockquote();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      closeLists();
      if (!inBlockquote) {
        html.push('<blockquote>');
        inBlockquote = true;
      }
      html.push(`<p>${inlineMarkdown(trimmed.replace(/^>\s?/, ''))}</p>`);
      continue;
    }

    const ulItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulItem) {
      closeBlockquote();
      if (!inUl) {
        closeLists();
        html.push('<ul>');
        inUl = true;
      }
      html.push(`<li>${inlineMarkdown(ulItem[1])}</li>`);
      continue;
    }

    const olItem = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olItem) {
      closeBlockquote();
      if (!inOl) {
        closeLists();
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${inlineMarkdown(olItem[1])}</li>`);
      continue;
    }

    closeLists();
    closeBlockquote();
    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }

  closeLists();
  closeBlockquote();
  return html.join('\n');
}
