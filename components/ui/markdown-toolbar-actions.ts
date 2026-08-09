export type MarkdownAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'heading'
  | 'bulletList'
  | 'numberedList'
  | 'link';

type Wrap = { readonly before: string; readonly after: string };
type LinePrefix = { readonly prefix: string | ((index: number) => string) };

const WRAPS: Partial<Record<MarkdownAction, Wrap>> = {
  bold: { before: '**', after: '**' },
  italic: { before: '_', after: '_' },
  underline: { before: '<u>', after: '</u>' },
  strike: { before: '~~', after: '~~' },
  link: { before: '[', after: '](https://)' }
};

const LINE_PREFIXES: Partial<Record<MarkdownAction, LinePrefix>> = {
  heading: { prefix: '## ' },
  bulletList: { prefix: '- ' },
  numberedList: { prefix: (index) => `${index + 1}. ` }
};

export type ApplyResult = {
  readonly value: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
};

/**
 * Pure text transform behind the formatting buttons: it takes the current text
 * plus the selection and returns the new text plus where the caret should land,
 * so the editor component stays free of string surgery.
 */
export function applyMarkdownAction(
  action: MarkdownAction,
  value: string,
  start: number,
  end: number
): ApplyResult {
  const wrap = WRAPS[action];
  if (wrap) {
    const selected = value.slice(start, end);
    const next =
      value.slice(0, start) +
      wrap.before +
      selected +
      wrap.after +
      value.slice(end);
    return {
      value: next,
      selectionStart: start + wrap.before.length,
      selectionEnd: start + wrap.before.length + selected.length
    };
  }

  const linePrefix = LINE_PREFIXES[action];
  if (!linePrefix) {
    return { value, selectionStart: start, selectionEnd: end };
  }

  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEndIndex = value.indexOf('\n', end);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const block = value.slice(lineStart, lineEnd);
  const prefixed = block
    .split('\n')
    .map((line, index) =>
      typeof linePrefix.prefix === 'string'
        ? linePrefix.prefix + line
        : linePrefix.prefix(index) + line
    )
    .join('\n');

  const next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  const added = prefixed.length - block.length;
  return {
    value: next,
    selectionStart: start + added,
    selectionEnd: end + added
  };
}
