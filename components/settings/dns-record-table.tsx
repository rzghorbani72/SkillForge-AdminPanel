'use client';

import { CopyBtn } from '@/components/affiliates/copy-btn';
import type { DnsRecordRow } from '@/lib/custom-domain-dns';
import type { InterpolationParams } from '@/lib/i18n';

type Translate = (key: string, params?: InterpolationParams) => string;

type DnsRecordTableProps = {
  rows: DnsRecordRow[];
  t: Translate;
  title?: string;
  footnote?: string;
};

function CopyCell({ text }: { text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="truncate font-mono text-xs" dir="ltr" title={text}>
        {text}
      </span>
      <CopyBtn text={text} />
    </div>
  );
}

/**
 * Type / Host / Value table matching Mentoma’s DNS panel fields.
 */
export function DnsRecordTable({
  rows,
  t,
  title,
  footnote
}: DnsRecordTableProps) {
  return (
    <div className="space-y-2">
      {title ? <p className="text-sm font-medium">{title}</p> : null}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="w-24 px-3 py-2 text-start font-medium">
                {t('settings.domainDns.colType')}
              </th>
              <th className="min-w-[9rem] px-3 py-2 text-start font-medium">
                {t('settings.domainDns.colName')}
              </th>
              <th className="px-3 py-2 text-start font-medium">
                {t('settings.domainDns.colValue')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.type}-${row.name}-${row.value}`}
                className="border-t"
              >
                <td className="px-3 py-2 font-mono text-xs">{row.type}</td>
                <td className="px-3 py-2">
                  <CopyCell text={row.name} />
                </td>
                <td className="px-3 py-2">
                  <CopyCell text={row.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote ? (
        <p className="text-xs text-muted-foreground">{footnote}</p>
      ) : null}
    </div>
  );
}
