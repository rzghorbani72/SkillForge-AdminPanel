const INLINE_WRAPS: Readonly<Record<string, string>> = {
  STRONG: '**',
  B: '**',
  EM: '_',
  I: '_',
  S: '~~',
  STRIKE: '~~',
  DEL: '~~'
};

const HEADING_LEVELS: Readonly<Record<string, string>> = {
  H1: '# ',
  H2: '## ',
  H3: '### ',
  H4: '#### '
};

const BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'H1',
  'H2',
  'H3',
  'H4',
  'UL',
  'OL',
  'LI',
  'BLOCKQUOTE',
  'PRE'
]);

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_[\]])/g, '\\$1');
}

function serializeChildren(node: Node): string {
  return Array.from(node.childNodes).map(serializeInline).join('');
}

function serializeInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMarkdown((node.textContent ?? '').replace(/\s+/g, ' '));
  }
  if (!(node instanceof HTMLElement)) return '';

  const tag = node.tagName;
  if (tag === 'BR') return '  \n';

  const wrap = INLINE_WRAPS[tag];
  if (wrap) {
    const inner = serializeChildren(node).trim();
    return inner ? `${wrap}${inner}${wrap}` : '';
  }
  if (tag === 'U') {
    const inner = serializeChildren(node).trim();
    return inner ? `<u>${inner}</u>` : '';
  }
  if (tag === 'A') {
    const href = node.getAttribute('href') ?? '';
    const inner = serializeChildren(node).trim();
    return href ? `[${inner}](${href})` : inner;
  }
  if (tag === 'CODE') {
    const inner = node.textContent ?? '';
    return inner ? `\`${inner}\`` : '';
  }

  return serializeChildren(node);
}

function serializeList(list: HTMLElement, depth: number): string {
  const indent = '  '.repeat(depth);
  const items = Array.from(list.children).filter(
    (child): child is HTMLElement => child.tagName === 'LI'
  );
  return items
    .map((item, index) => {
      const marker = list.tagName === 'OL' ? `${index + 1}. ` : '- ';
      const nested = Array.from(item.children).filter(
        (child): child is HTMLElement =>
          child.tagName === 'UL' || child.tagName === 'OL'
      );
      nested.forEach((child) => child.remove());
      const text = serializeChildren(item).trim();
      const sub = nested.map((child) => serializeList(child, depth + 1));
      return [`${indent}${marker}${text}`, ...sub].join('\n');
    })
    .join('\n');
}

function serializeBlock(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = serializeInline(node).trim();
    return text;
  }
  if (!(node instanceof HTMLElement)) return '';

  const tag = node.tagName;
  if (tag === 'UL' || tag === 'OL') return serializeList(node, 0);
  if (tag === 'PRE') return `\`\`\`\n${node.textContent ?? ''}\n\`\`\``;
  if (tag === 'BLOCKQUOTE') {
    return serializeChildren(node)
      .trim()
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
  }
  if (tag === 'HR') return '---';

  const heading = HEADING_LEVELS[tag];
  if (heading) {
    const text = serializeChildren(node).trim();
    return text ? heading + text : '';
  }

  if (BLOCK_TAGS.has(tag)) {
    const hasBlockChild = Array.from(node.children).some((child) =>
      BLOCK_TAGS.has(child.tagName)
    );
    if (hasBlockChild) {
      return Array.from(node.childNodes)
        .map(serializeBlock)
        .filter(Boolean)
        .join('\n\n');
    }
    return serializeChildren(node).trim();
  }

  return serializeInline(node).trim();
}

/**
 * Turns the editor's HTML back into the Markdown we store, so the visual
 * editor can stay WYSIWYG while the saved value remains plain readable text.
 * Only the tags our renderer can produce are handled; anything else falls
 * back to its text content.
 */
export function htmlToMarkdown(html: string): string {
  if (typeof document === 'undefined') return '';
  const root = document.createElement('div');
  root.innerHTML = html;

  return Array.from(root.childNodes)
    .map(serializeBlock)
    .filter((block) => block.length > 0)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
