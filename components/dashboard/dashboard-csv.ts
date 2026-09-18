const BOM = '\uFEFF';

export type CsvValue = string | number | boolean | null | undefined;

function escapeCell(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(rows: ReadonlyArray<Record<string, CsvValue>>): string {
  if (rows.length === 0) return '';
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCell(row[header])).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}

export type CsvSection = {
  name: string;
  rows: ReadonlyArray<Record<string, CsvValue>>;
};

/** One CSV with `## section` markers and a UTF-8 BOM so Excel keeps Persian text. */
export function toBundleCsv(sections: CsvSection[]): string {
  const parts = sections.map((section) => {
    const body = toCsv(section.rows);
    return `## ${section.name}\r\n${body || '\r\n'}`;
  });
  return BOM + parts.join('\r\n');
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
