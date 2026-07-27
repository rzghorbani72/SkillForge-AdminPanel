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

const TABLE_ROW = /^\|?(.+)\|.*\|?$/;
const TABLE_SEPARATOR = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/;

function splitTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

type OpenKind = 'p' | 'li-ul' | 'li-ol' | null;

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;

  // The source .md files soft-wrap a single paragraph or list item across several
  // lines (no blank line between them) for editor readability. Plain-text lines
  // that don't start a new block must be glued onto the currently open
  // paragraph/list item — one line per <p>/<li> would shatter every sentence.
  let openKind: OpenKind = null;
  let openText = '';

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

  const flushOpen = () => {
    if (openKind === 'p') {
      html.push(`<p>${inlineMarkdown(openText)}</p>`);
    } else if (openKind === 'li-ul' || openKind === 'li-ol') {
      html.push(`<li>${inlineMarkdown(openText)}</li>`);
    }
    openKind = null;
    openText = '';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const trimmed = line.trim();

    if (trimmed === '') {
      flushOpen();
      closeLists();
      closeBlockquote();
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushOpen();
      closeLists();
      closeBlockquote();
      html.push('<hr />');
      continue;
    }

    if (
      TABLE_ROW.test(trimmed) &&
      TABLE_SEPARATOR.test((lines[i + 1] ?? '').trim())
    ) {
      flushOpen();
      closeLists();
      closeBlockquote();
      const headerCells = splitTableCells(trimmed);
      html.push(
        '<table><thead><tr>' +
          headerCells
            .map((cell) => `<th>${inlineMarkdown(cell)}</th>`)
            .join('') +
          '</tr></thead><tbody>'
      );
      i += 1; // skip the separator row

      while (i + 1 < lines.length && TABLE_ROW.test(lines[i + 1].trim())) {
        i += 1;
        const rowCells = splitTableCells(lines[i].trim());
        html.push(
          '<tr>' +
            rowCells
              .map((cell) => `<td>${inlineMarkdown(cell)}</td>`)
              .join('') +
            '</tr>'
        );
      }

      html.push('</tbody></table>');
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushOpen();
      closeLists();
      closeBlockquote();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flushOpen();
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
      flushOpen();
      closeBlockquote();
      if (!inUl) {
        closeLists();
        html.push('<ul>');
        inUl = true;
      }
      openKind = 'li-ul';
      openText = ulItem[1];
      continue;
    }

    const olItem = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olItem) {
      flushOpen();
      closeBlockquote();
      if (!inOl) {
        closeLists();
        html.push('<ol>');
        inOl = true;
      }
      openKind = 'li-ol';
      openText = olItem[1];
      continue;
    }

    if (openKind) {
      openText += ` ${trimmed}`;
    } else {
      closeLists();
      closeBlockquote();
      openKind = 'p';
      openText = trimmed;
    }
  }

  flushOpen();
  closeLists();
  closeBlockquote();
  return html.join('\n');
}
