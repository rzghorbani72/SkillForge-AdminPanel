'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Plus,
  Upload,
  ChevronDown,
  Check,
  X,
  MoreHorizontal,
  BookOpen,
  Mail,
  TrendingUp,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { studentGroupsApi } from '@/lib/api-extra';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { ErrorHandler } from '@/lib/error-handler';
import PageContainer from '@/components/layout/page-container';

const API_BASE = getBrowserApiBaseUrl();

type UserProfile = {
  id: number;
  display_name?: string;
  role?: string;
  phone_number?: string;
  enrolled?: number;
  joined?: string;
  status?: string;
  tone?: number;
  User?: { email?: string; phone_number?: string; created_at?: string };
};

type StudentGroup = {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  tone?: number;
  _count?: { Members: number; CourseGrants: number };
};

type TeacherRequest = {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string;
  expertise: string[];
  status: 'pending' | 'approved' | 'rejected' | 'review';
  submitted: string;
  tone: number;
  sampleCourse: string;
};

type Role = {
  id: string;
  name: string;
  en: string;
  tone: number;
  count: number;
  system: boolean;
  perms: string[];
};

const SYSTEM_ROLES: Role[] = [
  {
    id: 'r-student',
    name: 'دانشجو',
    en: 'Student',
    tone: 240,
    count: 48920,
    system: true,
    perms: ['مشاهده دوره‌های خریداری شده', 'دسترسی به محتوا', 'ارسال سوال']
  },
  {
    id: 'r-teacher',
    name: 'مدرس',
    en: 'Teacher',
    tone: 165,
    count: 142,
    system: true,
    perms: ['افزودن و ویرایش دوره', 'پاسخ به سوالات دانشجو', 'برداشت درآمد']
  },
  {
    id: 'r-manager',
    name: 'مدیر',
    en: 'Manager',
    tone: 22,
    count: 12,
    system: true,
    perms: ['مدیریت کاربران', 'دسترسی به گزارش‌های مالی', 'مدیریت پلن‌ها']
  },
  {
    id: 'r-affiliate',
    name: 'بازاریاب',
    en: 'Affiliate',
    tone: 75,
    count: 142,
    system: true,
    perms: ['مشاهده لینک افیلیت', 'برداشت کمیسیون']
  }
];

const MOCK_REQUESTS: TeacherRequest[] = [
  {
    id: 1,
    name: 'رضا کاظمی',
    email: 'reza.k@gmail.com',
    phone: '۰۹۱۲۳۳۴۴۵۵۶',
    bio: 'برنامه‌نویس با ۸ سال سابقه در توسعه وب و موبایل. تدریس در دانشگاه آزاد تهران، تخصص در React و Node.js.',
    expertise: ['React', 'Node.js', 'TypeScript'],
    status: 'pending',
    submitted: '۳ روز پیش',
    tone: 240,
    sampleCourse: 'React از صفر تا حرفه‌ای'
  },
  {
    id: 2,
    name: 'سمیرا نادری',
    email: 'samira.n@yahoo.com',
    phone: '۰۹۳۵۸۸۷۷۶۶۵',
    bio: 'طراح UI/UX با تجربه ۶ ساله، کار با برندهای بزرگ در حوزه طراحی محصول و تجربه کاربری.',
    expertise: ['Figma', 'UI/UX', 'Product Design'],
    status: 'review',
    submitted: '۵ روز پیش',
    tone: 320,
    sampleCourse: 'طراحی UX برای مبتدیان'
  }
];

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .trim()
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function toneToHsl(tone: number) {
  return {
    bg: `hsl(${tone} 80% 95%)`,
    text: `hsl(${tone} 70% 38%)`,
    dot: `hsl(${tone} 70% 50%)`
  };
}

function Avatar({
  name,
  tone = 22,
  size = 32
}: {
  name?: string;
  tone?: number;
  size?: number;
}) {
  const colors = toneToHsl(tone);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors.bg,
        color: colors.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: size * 0.35,
        flexShrink: 0
      }}
    >
      {getInitials(name)}
    </span>
  );
}

function StatusPill({ status }: { status?: string }) {
  const s = (status || '').toLowerCase();
  if (s === 'active')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        فعال
      </span>
    );
  if (s === 'inactive')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        غیرفعال
      </span>
    );
  if (s === 'pending')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        در انتظار
      </span>
    );
  if (s === 'approved')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        تأیید شد
      </span>
    );
  if (s === 'rejected')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
        رد شد
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {status}
    </span>
  );
}

function RoleBadge({
  role,
  tone = 22,
  onClick
}: {
  role?: string;
  tone?: number;
  onClick?: () => void;
}) {
  const colors = toneToHsl(tone);
  return (
    <button
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-opacity hover:opacity-80"
      style={{ background: colors.bg, color: colors.text }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: colors.dot
        }}
      />
      {role}
      {onClick && (
        <ChevronDown style={{ width: 11, height: 11, opacity: 0.7 }} />
      )}
    </button>
  );
}

type RoleMenuProps = {
  user: UserProfile;
  roles: Role[];
  onClose: () => void;
  onChange: (userId: number, newRole: string) => void;
};

function RoleMenu({ user, roles, onClose, onChange }: RoleMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute start-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-border bg-card p-1.5 shadow-lg"
    >
      <div className="mb-1 px-2 py-1 text-[10.5px] uppercase tracking-widest text-muted-foreground/70">
        تغییر نقش
      </div>
      {roles.map((r) => {
        const isCurrent = r.name === user.role;
        const colors = toneToHsl(r.tone);
        return (
          <button
            key={r.id}
            onClick={() => {
              onChange(user.id, r.name);
              onClose();
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors hover:bg-muted/60"
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colors.dot
              }}
            />
            <span className="flex-1 text-start">{r.name}</span>
            {isCurrent && (
              <Check
                style={{ width: 14, height: 14, color: 'hsl(var(--primary))' }}
              />
            )}
          </button>
        );
      })}
      <div className="my-1 border-t border-border" />
      <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-destructive transition-colors hover:bg-destructive/10">
        <X style={{ width: 13, height: 13 }} />
        <span className="flex-1 text-start">تعلیق دسترسی</span>
      </button>
    </div>
  );
}

function UserRow({
  user,
  roles,
  onRoleChange,
  onCourseAccess
}: {
  user: UserProfile;
  roles: Role[];
  onRoleChange: (id: number, role: string) => void;
  onCourseAccess: (user: UserProfile) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const userRole = roles.find((r) => r.name === user.role);
  const tone = userRole?.tone ?? 22;

  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <input type="checkbox" className="rounded border-border" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={user.display_name} tone={tone} size={32} />
          <div>
            <div className="text-[13.5px] font-semibold leading-tight">
              {user.display_name || `کاربر #${user.id}`}
            </div>
            <div className="text-[11.5px] text-muted-foreground">
              {user.User?.email || '—'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="relative inline-block">
          <RoleBadge
            role={user.role || 'دانشجو'}
            tone={tone}
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <RoleMenu
              user={user}
              roles={roles}
              onClose={() => setMenuOpen(false)}
              onChange={onRoleChange}
            />
          )}
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
        {user.User?.phone_number || user.phone_number || '—'}
      </td>
      <td className="px-4 py-3 font-mono text-[13px]">
        {(user.enrolled ?? 0).toLocaleString('fa-IR')}
      </td>
      <td className="px-4 py-3 font-mono text-[11.5px] text-muted-foreground">
        {user.User?.created_at
          ? new Date(user.User.created_at).toLocaleDateString('fa-IR')
          : '—'}
      </td>
      <td className="px-4 py-3">
        <StatusPill status={user.status || 'active'} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60"
            title="دوره‌ها"
            onClick={() => onCourseAccess(user)}
          >
            <BookOpen style={{ width: 14, height: 14 }} />
          </button>
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60"
            title="ارسال پیام"
          >
            <Mail style={{ width: 13, height: 13 }} />
          </button>
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60">
            <MoreHorizontal style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function UsersTable({
  users,
  roles,
  onRoleChange,
  onCourseAccess,
  totalCount
}: {
  users: UserProfile[];
  roles: Role[];
  onRoleChange: (id: number, role: string) => void;
  onCourseAccess: (user: UserProfile) => void;
  totalCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-8 px-4 py-3 text-start">
              <input type="checkbox" className="rounded border-border" />
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              نام
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              نقش
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              تلفن
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              دوره‌ها
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              تاریخ عضویت
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              وضعیت
            </th>
            <th className="w-24 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="py-12 text-center text-sm text-muted-foreground"
              >
                هیچ کاربری یافت نشد
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                roles={roles}
                onRoleChange={onRoleChange}
                onCourseAccess={onCourseAccess}
              />
            ))
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-[12px] text-muted-foreground">
        <span>
          نمایش {users.length.toLocaleString('fa-IR')} از{' '}
          {totalCount.toLocaleString('fa-IR')}
        </span>
        <div className="flex items-center gap-1">
          <button className="rounded-md px-2.5 py-1.5 font-mono transition-colors hover:bg-muted/60">
            ‹
          </button>
          <button className="rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground">
            ۱
          </button>
          <button className="rounded-md px-2.5 py-1.5 text-[11px] transition-colors hover:bg-muted/60">
            ۲
          </button>
          <button className="rounded-md px-2.5 py-1.5 text-[11px] transition-colors hover:bg-muted/60">
            ۳
          </button>
          <span className="px-1 text-muted-foreground/50">…</span>
          <button className="rounded-md px-2.5 py-1.5 font-mono transition-colors hover:bg-muted/60">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupsGrid({ groups }: { groups: StudentGroup[] }) {
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
                {g.description || `${g._count?.CourseGrants ?? 0} دوره`}
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
                      <Avatar
                        name={`کاربر ${i + 1}`}
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
                  مشاهده{' '}
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
          گروه جدید
        </span>
        <span className="max-w-[180px] text-center text-[11.5px]">
          یک گروه سفارشی برای مدیریت دسترسی دوره‌ها بسازید
        </span>
      </button>
    </div>
  );
}

function RequestsView({
  requests,
  onDecide
}: {
  requests: TeacherRequest[];
  onDecide: (id: number, decision: 'approved' | 'rejected') => void;
}) {
  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
          هیچ درخواستی در انتظار بررسی نیست
        </div>
      ) : (
        requests.map((r) => {
          const colors = toneToHsl(r.tone);
          return (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start gap-4">
                <Avatar name={r.name} tone={r.tone} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2.5">
                    <span className="text-[15px] font-semibold">{r.name}</span>
                    <StatusPill status={r.status} />
                    <span className="ms-auto text-[11px] text-muted-foreground">
                      {r.submitted}
                    </span>
                  </div>
                  <div className="mb-3 text-[12px] text-muted-foreground">
                    {r.email} · {r.phone}
                  </div>
                  <div className="mb-3 text-[13px] leading-relaxed text-muted-foreground/80">
                    {r.bio}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {r.expertise.map((e) => (
                      <span
                        key={e}
                        className="rounded-full px-2.5 py-0.5 text-[11.5px] font-medium"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/40 p-3">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      <BookOpen style={{ width: 13, height: 13 }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold">
                        دوره نمونه: {r.sampleCourse}
                      </div>
                    </div>
                  </div>
                </div>
                {r.status === 'pending' && (
                  <div className="flex w-36 flex-col gap-2">
                    <button
                      onClick={() => onDecide(r.id, 'approved')}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Check style={{ width: 13, height: 13 }} /> تأیید مدرسی
                    </button>
                    <button className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-[12.5px] font-medium transition-colors hover:bg-muted/50">
                      مشاهده کامل
                    </button>
                    <button
                      onClick={() => onDecide(r.id, 'rejected')}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      رد درخواست
                    </button>
                  </div>
                )}
                {(r.status === 'approved' || r.status === 'rejected') && (
                  <StatusPill status={r.status} />
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function RolesGrid({
  roles,
  onAdd,
  onDelete
}: {
  roles: Role[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {roles.map((r) => {
        const colors = toneToHsl(r.tone);
        return (
          <div
            key={r.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: colors.bg,
                    color: colors.text,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  {r.name.slice(0, 1)}
                </span>
                <div>
                  <div className="text-[14px] font-semibold">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.en}
                  </div>
                </div>
              </div>
              {r.system ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Shield style={{ width: 10, height: 10 }} /> سیستمی
                </span>
              ) : (
                <button
                  onClick={() => onDelete(r.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <MoreHorizontal style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
            <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                کاربران
              </span>
              <span className="font-mono text-[16px] font-bold">
                {r.count.toLocaleString('fa-IR')}
              </span>
            </div>
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                دسترسی‌ها
              </div>
              <div className="space-y-1.5">
                {r.perms.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <Check
                      style={{
                        width: 12,
                        height: 12,
                        color: 'hsl(142 71% 40%)'
                      }}
                    />
                    <span className="text-muted-foreground/80">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <button
        onClick={onAdd}
        className="flex min-h-[200px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Plus style={{ width: 18, height: 18 }} />
        </span>
        <span className="text-[14px] font-semibold text-foreground">
          نقش جدید
        </span>
        <span className="max-w-[200px] text-center text-[11.5px]">
          یک نقش سفارشی با دسترسی‌های دلخواه بسازید
        </span>
      </button>
    </div>
  );
}

async function fetchUsers(
  role: 'STUDENT' | 'TEACHER' | 'MANAGER' | 'ALL'
): Promise<UserProfile[]> {
  const path =
    role === 'ALL'
      ? '/users?limit=50'
      : role === 'STUDENT'
        ? '/users/students?limit=50'
        : role === 'TEACHER'
          ? '/users/teachers?limit=50'
          : '/users?limit=50';
  try {
    const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
    if (!res.ok) return [];
    const body = await res.json();
    const list = body?.data?.data ?? body?.data?.profiles ?? body?.data ?? [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

type TabType =
  | 'all'
  | 'students'
  | 'teachers'
  | 'managers'
  | 'affiliates'
  | 'requests'
  | 'roles'
  | 'groups';

export default function UsersPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabType>('all');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [requests, setRequests] = useState<TeacherRequest[]>(MOCK_REQUESTS);
  const [roles, setRoles] = useState<Role[]>(SYSTEM_ROLES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createUserOpen, setCreateUserOpen] = useState(false);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allUsers, grps] = await Promise.all([
        fetchUsers('ALL'),
        studentGroupsApi.list()
      ]);
      const raw = grps?.data ?? [];
      setUsers(
        allUsers.map((u, i) => ({
          ...u,
          enrolled: u.enrolled ?? 0,
          status: u.status ?? 'active',
          tone: (22 + i * 47) % 360
        }))
      );
      setGroups(
        (raw as StudentGroup[]).map((g, i) => ({
          ...g,
          tone: (22 + i * 80) % 360
        }))
      );
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = users.filter((u) => {
    const roleMatch =
      tab === 'all'
        ? true
        : tab === 'students'
          ? (u.role || '').toLowerCase() === 'student' ||
            u.role === 'دانشجو' ||
            u.role === 'STUDENT'
          : tab === 'teachers'
            ? (u.role || '').toLowerCase() === 'teacher' ||
              u.role === 'مدرس' ||
              u.role === 'TEACHER'
            : tab === 'managers'
              ? (u.role || '').toLowerCase() === 'manager' ||
                u.role === 'مدیر' ||
                u.role === 'MANAGER'
              : tab === 'affiliates'
                ? u.role === 'AFFILIATE' || u.role === 'بازاریاب'
                : true;
    const searchMatch =
      !search ||
      u.display_name?.includes(search) ||
      u.User?.email?.includes(search);
    return roleMatch && searchMatch;
  });

  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleDecideRequest = (
    id: number,
    decision: 'approved' | 'rejected'
  ) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: decision } : r))
    );
    if (decision === 'approved') {
      ErrorHandler.showSuccess('درخواست تأیید شد — کاربر به مدرس ارتقا یافت');
    }
  };

  const stats = [
    {
      label: 'کل کاربران',
      value: users.length.toLocaleString('fa-IR') || '۰',
      delta: 12
    },
    {
      label: 'فعال این هفته',
      value: Math.round(users.length * 0.7).toLocaleString('fa-IR'),
      delta: 8
    },
    {
      label: 'مدرسان',
      value: users
        .filter((u) => u.role === 'مدرس' || u.role === 'TEACHER')
        .length.toLocaleString('fa-IR'),
      delta: 22
    },
    {
      label: 'در انتظار تأیید',
      value: pendingCount.toLocaleString('fa-IR'),
      delta: -4
    }
  ];

  const tabs: { v: TabType; label: string; count?: number }[] = [
    { v: 'all', label: 'همه', count: users.length },
    { v: 'students', label: 'دانشجویان' },
    { v: 'teachers', label: 'مدرسان' },
    { v: 'managers', label: 'مدیران' },
    { v: 'affiliates', label: 'بازاریاب‌ها' },
    { v: 'groups', label: 'گروه‌ها', count: groups.length },
    { v: 'requests', label: 'درخواست‌ها', count: pendingCount },
    { v: 'roles', label: 'نقش‌ها', count: roles.length }
  ];

  return (
    <PageContainer>
      {/* Section header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            افراد
          </div>
          <h1 className="text-[24px] font-bold leading-none tracking-tight">
            کاربران
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            مدیریت همه‌ی کاربران، نقش‌ها و درخواست‌ها
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Upload style={{ width: 14, height: 14 }} /> ورود فایل
          </Button>
          {tab === 'roles' ? (
            <Button size="sm" className="gap-1.5">
              <Plus style={{ width: 14, height: 14 }} /> نقش جدید
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateUserOpen(true)}
            >
              <Plus style={{ width: 14, height: 14 }} /> افزودن کاربر
            </Button>
          )}
        </div>
      </div>

      {/* Pending requests banner */}
      {pendingCount > 0 && tab !== 'requests' && (
        <div
          className="mb-4 flex items-center gap-3.5 rounded-xl border p-4"
          style={{
            background: 'hsl(38 92% 95%)',
            borderColor: 'hsl(38 92% 85%)'
          }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'hsl(38 92% 50%)', color: 'white' }}
          >
            <AlertTriangle style={{ width: 18, height: 18 }} />
          </span>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold">
              {pendingCount.toLocaleString('fa-IR')} درخواست تأیید مدرسی در
              انتظار بررسی
            </div>
            <div className="text-[12px] text-muted-foreground">
              این درخواست‌ها از طرف دانشجویان ثبت شده‌اند و نیاز به تأیید مدیر
              دارند
            </div>
          </div>
          <button
            onClick={() => setTab('requests')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-muted/50"
          >
            بررسی{' '}
            <ChevronDown
              style={{ width: 12, height: 12, transform: 'rotate(-90deg)' }}
            />
          </button>
        </div>
      )}

      {/* Stats */}
      {tab !== 'roles' && tab !== 'requests' && tab !== 'groups' && (
        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${s.delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}
                >
                  <TrendingUp style={{ width: 10, height: 10 }} />
                  {Math.abs(s.delta).toLocaleString('fa-IR')}٪
                </span>
              </div>
              <div className="font-mono text-[26px] font-bold tracking-tight">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-0.5 rounded-full bg-muted/60 p-1">
          {tabs.map(({ v, label, count }) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all ${tab === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {label}
              {count != null && (
                <span
                  className={`ms-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${v === 'requests' && pendingCount > 0 ? 'bg-amber-500 text-white' : 'opacity-50'}`}
                >
                  {count.toLocaleString('fa-IR')}
                </span>
              )}
            </button>
          ))}
        </div>
        {tab !== 'roles' && tab !== 'requests' && tab !== 'groups' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                style={{
                  position: 'absolute',
                  insetInlineStart: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14,
                  height: 14,
                  color: 'hsl(var(--muted-foreground))',
                  pointerEvents: 'none'
                }}
              />
              <input
                className="h-9 w-56 rounded-lg border border-border bg-card pe-3 ps-8 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                placeholder="جستجوی کاربر…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12.5px] transition-colors hover:bg-muted/40">
              فیلتر
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {(tab === 'all' ||
            tab === 'students' ||
            tab === 'teachers' ||
            tab === 'managers' ||
            tab === 'affiliates') && (
            <UsersTable
              users={filteredUsers}
              roles={roles}
              onRoleChange={handleRoleChange}
              onCourseAccess={() => {}}
              totalCount={users.length}
            />
          )}
          {tab === 'groups' && <GroupsGrid groups={groups} />}
          {tab === 'requests' && (
            <RequestsView requests={requests} onDecide={handleDecideRequest} />
          )}
          {tab === 'roles' && (
            <RolesGrid
              roles={roles}
              onAdd={() => {}}
              onDelete={(id) =>
                setRoles((prev) => prev.filter((r) => r.id !== id))
              }
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
