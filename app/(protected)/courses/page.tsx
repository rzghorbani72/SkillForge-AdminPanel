'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import {
  Plus,
  Search,
  Download,
  LayoutGrid,
  List,
  Clock,
  Users,
  BookOpen,
  MoreHorizontal,
  Star,
  X
} from 'lucide-react';
import useCourses, { CourseWithRevenue } from '@/components/course/useCourses';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import PageContainer from '@/components/layout/page-container';

/* ── tiny helpers ─────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<number, { h: number }> = {
  0: { h: 22 },
  1: { h: 240 },
  2: { h: 165 },
  3: { h: 75 },
  4: { h: 320 },
  5: { h: 200 },
  6: { h: 280 },
  7: { h: 50 }
};

function courseHue(id: number) {
  return CATEGORY_COLORS[id % 8].h;
}

function formatNumber(n: number, lang = 'fa-IR') {
  return n.toLocaleString(lang);
}

type PricingType =
  | 'ALL'
  | 'FREE'
  | 'ONE_TIME'
  | 'PAYMENT_PLAN'
  | 'SUBSCRIPTION';

type StatusKey = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'REVIEW' | string;

function StatusPill({ status }: { status: StatusKey }) {
  const s = (status || '').toUpperCase();
  if (s === 'PUBLISHED')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        منتشر شده
      </span>
    );
  if (s === 'DRAFT')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        پیش‌نویس
      </span>
    );
  if (s === 'REVIEW')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        در بررسی
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {status}
    </span>
  );
}

/* ── Course card (grid view) ──────────────────────────────────── */
function CourseCard({
  course,
  onOpen
}: {
  course: CourseWithRevenue;
  onOpen: () => void;
}) {
  const hue = courseHue(course.id);
  const priceVal = (course as any).primary_price ?? 0;
  const pricingType = (course as any).pricing_type ?? 'ONE_TIME';
  const studentsCount = course.enrollments_count ?? 0;
  const coverUrl =
    (course as any).cover?.url || (course as any).cover?.file_path || null;
  const teacher =
    (course as any).teacher_name ??
    (course as any).Teacher?.display_name ??
    '—';
  const rating = (course as any).rating ?? 0;

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80"
    >
      {/* cover */}
      <div
        className="relative aspect-video overflow-hidden"
        style={{
          background: coverUrl
            ? undefined
            : `linear-gradient(135deg, hsl(${hue} 80% 82%), hsl(${hue} 60% 92%))`
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen
              className="h-10 w-10 opacity-40"
              style={{ color: `hsl(${hue} 60% 40%)` }}
            />
          </div>
        )}
        {/* badges */}
        <div className="absolute start-3 top-3 flex gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm"
            style={{
              background: 'rgba(255,255,255,0.85)',
              color: 'hsl(var(--foreground))'
            }}
          >
            {(course as any).category ?? pricingType}
          </span>
        </div>
        <div className="absolute end-3 top-3">
          <StatusPill status={(course as any).status ?? 'DRAFT'} />
        </div>
        <div
          className="absolute bottom-3 start-3 flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <Clock className="h-2.5 w-2.5" />
          {(course as any).duration ?? '—'}
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <div className="mb-2 text-[14.5px] font-semibold leading-snug">
          {course.title}
        </div>
        <div className="mb-3 flex items-center gap-1.5">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              background: `hsl(${hue} 80% 90%)`,
              color: `hsl(${hue} 60% 38%)`
            }}
          >
            {teacher.charAt(0)}
          </span>
          <span className="text-[12px] text-muted-foreground">{teacher}</span>
          {rating > 0 && (
            <span className="ms-auto flex items-center gap-0.5 text-[11.5px] text-amber-600">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div>
            <div className="mb-0.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
              دانشجو
            </div>
            <div className="font-mono text-[13px] font-semibold">
              {formatNumber(studentsCount)}
            </div>
          </div>
          <div className="text-end">
            <div className="mb-0.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
              قیمت
            </div>
            <div className="font-mono text-[13px] font-semibold text-primary">
              {pricingType === 'FREE'
                ? 'رایگان'
                : priceVal > 0
                  ? formatNumber(priceVal)
                  : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Row (list view) ─────────────────────────────────────────── */
function CourseRow({
  course,
  onOpen,
  onEdit,
  onDelete
}: {
  course: CourseWithRevenue;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hue = courseHue(course.id);
  const priceVal = (course as any).primary_price ?? 0;
  const pricingType = (course as any).pricing_type ?? 'ONE_TIME';
  const studentsCount = course.enrollments_count ?? 0;
  const teacher =
    (course as any).teacher_name ??
    (course as any).Teacher?.display_name ??
    '—';

  return (
    <tr
      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30"
      onClick={onOpen}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-14 flex-shrink-0 overflow-hidden rounded-md"
            style={{
              background: `linear-gradient(135deg, hsl(${hue} 80% 82%), hsl(${hue} 60% 92%))`
            }}
          />
          <div>
            <div className="text-[13.5px] font-semibold">{course.title}</div>
            <div className="text-[11.5px] text-muted-foreground">
              {(course as any).seasons_count ?? 0} فصل ·{' '}
              {(course as any).lessons_count ?? 0} درس
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              background: `hsl(${hue} 80% 90%)`,
              color: `hsl(${hue} 60% 38%)`
            }}
          >
            {teacher.charAt(0)}
          </span>
          <span className="text-[13px]">{teacher}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-[13px]">
        {formatNumber(studentsCount)}
      </td>
      <td className="px-4 py-3 font-mono text-[13px] text-primary">
        {pricingType === 'FREE'
          ? 'رایگان'
          : priceVal > 0
            ? formatNumber(priceVal)
            : '—'}
      </td>
      <td className="px-4 py-3 text-[12px] text-muted-foreground">
        {(course as any).updated_at
          ? new Date((course as any).updated_at).toLocaleDateString('fa-IR')
          : '—'}
      </td>
      <td className="px-4 py-3">
        <StatusPill status={(course as any).status ?? 'DRAFT'} />
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────── */
function GridSkeleton() {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="aspect-video bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="mt-3 h-px bg-border" />
            <div className="flex justify-between pt-1">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-14 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function CoursesPage() {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [category, setCategory] = useState<string>('all');
  const [selected, setSelected] = useState<CourseWithRevenue | null>(null);

  const {
    courses,
    totalCourses,
    isLoading,
    searchTerm,
    setSearchTerm,
    pricingFilter,
    setPricingFilter,
    handleViewCourse,
    handleEditCourse,
    handleDeleteCourse
  } = useCourses();

  /* derive categories from real data */
  const categories = (() => {
    const raw: string[] = [];
    courses.forEach((c) => {
      const cat = (c as any).category ?? (c as any).pricing_type ?? '';
      if (cat && !raw.includes(cat)) raw.push(cat);
    });
    return raw;
  })();

  const filteredCourses = courses.filter((c) => {
    const catOk =
      category === 'all' ||
      (c as any).category === category ||
      (c as any).pricing_type === category;
    const pricingOk =
      pricingFilter === 'ALL' || (c as any).pricing_type === pricingFilter;
    return catOk && pricingOk;
  });

  if (!selectedAcademy) {
    return (
      <PageContainer>
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title={t('common.noStoreSelected')}
          description={t('common.selectStoreToView')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Section header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            محتوا
          </div>
          <h1 className="text-[24px] font-bold leading-none tracking-tight">
            دوره‌ها
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            مدیریت تمام دوره‌های آکادمی، فصل‌ها و درس‌ها
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> خروجی
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => router.push('/courses/create')}
          >
            <Plus className="h-3.5 w-3.5" /> دوره جدید
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {/* Category pill tabs */}
        <div className="inline-flex flex-wrap gap-0.5 rounded-full bg-muted/60 p-1">
          {['all', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all ${category === cat ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {cat === 'all' ? 'همه' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-9 w-56 rounded-lg border border-border bg-card pe-3 ps-8 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              placeholder="جستجو در دوره‌ها…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* View toggle */}
          <div className="inline-flex gap-0.5 rounded-lg bg-muted/60 p-1">
            <button
              onClick={() => setView('grid')}
              className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded-md p-1.5 transition-colors ${view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="List"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <GridSkeleton />
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">هیچ دوره‌ای یافت نشد</p>
          <Button
            size="sm"
            className="mt-4 gap-1.5"
            onClick={() => router.push('/courses/create')}
          >
            <Plus className="h-3.5 w-3.5" /> دوره جدید
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
          }}
        >
          {filteredCourses.map((c) => (
            <CourseCard key={c.id} course={c} onOpen={() => setSelected(c)} />
          ))}
          {/* Add card */}
          <button
            onClick={() => router.push('/courses/create')}
            className="flex min-h-[260px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-[14px] font-semibold text-foreground">
              دوره جدید
            </span>
          </button>
        </div>
      ) : (
        /* List view */
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  دوره
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  مدرس
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  دانشجو
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  قیمت
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  به‌روزرسانی
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  وضعیت
                </th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c) => (
                <CourseRow
                  key={c.id}
                  course={c}
                  onOpen={() => setSelected(c)}
                  onEdit={() => handleEditCourse(c)}
                  onDelete={() => handleDeleteCourse(c)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Course detail side drawer */}
      {selected && (
        <div className="fixed inset-0 z-40" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/35" />
          <div
            className="absolute bottom-0 end-0 top-0 flex w-[min(520px,92vw)] flex-col border-s border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex-shrink-0 border-b border-border px-6 py-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {(selected as any).category ?? 'دوره'}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mb-2 text-[18px] font-bold leading-snug">
                {selected.title}
              </h2>
              <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  {formatNumber(selected.enrollments_count ?? 0)} دانشجو
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3" />
                  {(selected as any).lessons_count ?? 0} درس
                </span>
                <span>·</span>
                <StatusPill status={(selected as any).status ?? 'DRAFT'} />
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    handleViewCourse(selected);
                    setSelected(null);
                  }}
                >
                  <BookOpen className="h-4 w-4" /> مشاهده دوره
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    handleEditCourse(selected);
                    setSelected(null);
                  }}
                >
                  ویرایش دوره
                </Button>
                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <div className="font-mono text-[22px] font-bold">
                      {formatNumber(selected.enrollments_count ?? 0)}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      دانشجو
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <div className="font-mono text-[22px] font-bold text-primary">
                      {(selected as any).primary_price > 0
                        ? formatNumber((selected as any).primary_price)
                        : 'رایگان'}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      قیمت
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <div className="font-mono text-[22px] font-bold">
                      {formatNumber(selected.revenue ?? 0)}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      درآمد
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
