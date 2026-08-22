'use client';

import { useNumberFormat } from '@/lib/i18n/use-number-format';

export type UsersTab = 'all' | 'groups' | 'requests' | 'enrollments';

export interface UsersTabItem {
  value: UsersTab;
  label: string;
  count?: number;
  /** Draws attention to work waiting on the manager, e.g. pending requests. */
  urgent?: boolean;
}

interface UsersTabBarProps {
  tabs: readonly UsersTabItem[];
  value: UsersTab;
  onChange: (tab: UsersTab) => void;
}

export function UsersTabBar({ tabs, value, onChange }: UsersTabBarProps) {
  const formatNumber = useNumberFormat();

  return (
    <div className="inline-flex flex-wrap gap-0.5 rounded-full bg-muted/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all ${
            value === tab.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
          {tab.count != null && (
            <span
              className={`ms-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                tab.urgent && tab.count > 0
                  ? 'bg-amber-500 text-white'
                  : 'opacity-50'
              }`}
            >
              {formatNumber(tab.count)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
