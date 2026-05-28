'use client';

import { Plus, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { UserAvatar, toneToHsl } from './user-avatar';

export type StudentGroup = {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  tone?: number;
  _count?: { Members: number; CourseGrants: number };
};

export function UsersGroupsGrid({ groups }: { groups: StudentGroup[] }) {
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
          <div
            key={g.id}
            className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-border/80"
          >
            <div
              style={{
                height: 80,
                background: `linear-gradient(135deg, ${colors.bg}, hsl(var(--card)))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <span
                style={{ fontSize: 28, color: colors.text, fontWeight: 700 }}
              >
                {g.name.slice(0, 1)}
              </span>
              <button className="absolute end-2 top-2 rounded-md bg-white/70 p-1.5 transition-colors hover:bg-white/90">
                <MoreHorizontal style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-1 text-[15px] font-semibold">{g.name}</div>
              <div className="mb-4 min-h-[32px] text-[12px] text-muted-foreground">
                {g.description ||
                  `${g._count?.CourseGrants ?? 0} ${t('users.courses')}`}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      style={{
                        marginInlineStart: i === 0 ? 0 : -8,
                        border: '2px solid hsl(var(--card))',
                        borderRadius: '50%'
                      }}
                    >
                      <UserAvatar
                        name={`${i + 1}`}
                        tone={(tone + i * 40) % 360}
                        size={24}
                      />
                    </span>
                  ))}
                  <span className="ms-2 font-mono text-[12px] text-muted-foreground">
                    +{(g._count?.Members ?? 0).toLocaleString('fa-IR')}
                  </span>
                </div>
                <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted/60">
                  {t('common.view')}{' '}
                  <ChevronDown
                    style={{
                      width: 12,
                      height: 12,
                      transform: 'rotate(-90deg)'
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <button className="flex min-h-[200px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Plus style={{ width: 18, height: 18 }} />
        </span>
        <span className="text-[14px] font-semibold text-foreground">
          {t('users.newGroup')}
        </span>
        <span className="max-w-[180px] text-center text-[11.5px]">
          {t('users.newGroupDescription')}
        </span>
      </button>
    </div>
  );
}
