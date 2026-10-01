'use client';

import { useTranslation } from '@/lib/i18n/hooks';

export function SizeRow<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { labelKey: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-zinc-600">{title}</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded py-1.5 text-[11px] font-medium transition-colors ${
              value === o.value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {t(o.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
