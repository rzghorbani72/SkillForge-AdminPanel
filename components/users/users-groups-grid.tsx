'use client';

import { Plus, ChevronDown, Users, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { toneToHsl } from './user-avatar';

export type StudentGroup = {
  /** cuid, never numeric — parsing it with Number() yields NaN. */
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  tone?: number;
  _count?: { Members: number; CourseGrants: number };
};

type UsersGroupsGridProps = {
  groups: StudentGroup[];
  onCreate: () => void;
  onOpen: (groupId: string) => void;
};

export function UsersGroupsGrid({ groups, onCreate, onOpen }: UsersGroupsGridProps) {
  const { t } = useTranslation();

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {groups.map((g) => {
        const tone = g.tone ?? 22;
        const colors = toneToHsl(tone);
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => onOpen(g.id)}
            className="overflow-hidden rounded-xl border border-border bg-card text-start transition-colors hover:border-primary/40"
          >
            <div
              style={{
                height: 80,
                background: `linear-gradient(135deg, ${colors.bg}, hsl(var(--card)))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 28, color: colors.text, fontWeight: 700 }}>
                {g.name.slice(0, 1)}
              </span>
            </div>
            <div className="p-4">
              <div className="mb-1 text-[15px] font-semibold">{g.name}</div>
              <div className="mb-4 min-h-[32px] text-[12px] text-muted-foreground">
                {g.description || `${g._count?.CourseGrants ?? 0} ${t('users.courses')}`}
              </div>
              {/* Real counts from the list endpoint — the avatar row that used
                  to sit here rendered four hardcoded placeholders. */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users style={{ width: 13, height: 13 }} />
                    {(g._count?.Members ?? 0).toLocaleString('fa-IR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen style={{ width: 13, height: 13 }} />
                    {(g._count?.CourseGrants ?? 0).toLocaleString('fa-IR')}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[12px] text-primary">
                  {t('common.view')}
                  <ChevronDown
                    style={{
                      width: 12,
                      height: 12,
                      transform: 'rotate(-90deg)',
                    }}
                  />
                </span>
              </div>
            </div>
          </button>
        );
      })}
      <button
        type="button"
        onClick={onCreate}
        className="flex min-h-[200px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Plus style={{ width: 18, height: 18 }} />
        </span>
        <span className="text-[14px] font-semibold text-foreground">{t('users.newGroup')}</span>
        <span className="max-w-[180px] text-center text-[11.5px]">
          {t('users.newGroupDescription')}
        </span>
      </button>
    </div>
  );
}
