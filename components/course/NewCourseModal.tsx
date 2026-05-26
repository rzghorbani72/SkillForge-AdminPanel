'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useStore } from '@/hooks/useStore';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ──────────────────────────────────────────────────── */
type PricingType = 'ONE_TIME' | 'SUBSCRIPTION' | 'FREE' | 'PAYMENT_PLAN';
type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';

type Lesson = { id: string; title: string; duration: string };
type Section = { id: string; title: string; lessons: Lesson[] };

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  editCourseId?: number;
}

const PRICING_OPTIONS: { type: PricingType; label: string; sub: string }[] = [
  { type: 'ONE_TIME', label: 'پولی', sub: 'یک پرداخت یکجا' },
  { type: 'SUBSCRIPTION', label: 'اشتراکی', sub: 'ماهانه/سالانه' },
  { type: 'FREE', label: 'رایگان', sub: 'بدون پرداخت' },
  { type: 'PAYMENT_PLAN', label: 'اقساطی', sub: '۳ تا ۶ قسط' }
];

const LEVELS = [
  { value: 'BEGINNER', label: 'مقدماتی' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'پیشرفته' }
];

const STEPS = [
  { n: 1, label: 'مشخصات' },
  { n: 2, label: 'محتوا' },
  { n: 3, label: 'قیمت' },
  { n: 4, label: 'انتشار' }
];

function uid() {
  return Math.random().toString(36).slice(2);
}

/* ── Helpers ────────────────────────────────────────────────── */
function extractList(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const r = raw as Record<string, unknown>;
  // Try common envelope shapes
  for (const key of ['categories', 'profiles', 'users', 'data', 'items']) {
    if (Array.isArray(r[key])) return r[key] as unknown[];
  }
  return [];
}

/* ── Step indicator ─────────────────────────────────────────── */
function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 border-b border-border px-6 py-4">
      {STEPS.map((s, idx) => {
        const done = step > s.n;
        const current = step === s.n;
        return (
          <>
            <div key={s.n} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all',
                  done
                    ? 'bg-emerald-500 text-white'
                    : current
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground/40'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s.n}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium',
                  current ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                key={`sep-${s.n}`}
                className={cn(
                  'mb-5 h-px w-12 transition-colors',
                  done ? 'bg-emerald-400' : 'bg-border'
                )}
              />
            )}
          </>
        );
      })}
    </div>
  );
}

/* ── Step 1: مشخصات ─────────────────────────────────────────── */
function Step1({
  title,
  setTitle,
  categoryId,
  setCategoryId,
  level,
  setLevel,
  teacherId,
  setTeacherId,
  description,
  setDescription,
  coverPreview,
  uploading,
  onCoverClick,
  onRemoveCover,
  fileRef,
  handleFileChange,
  categories,
  teachers,
  showNewCategory,
  newCategoryName,
  setNewCategoryName,
  onToggleNewCategory,
  onCreateCategory,
  onCancelCategory,
  creatingCategory
}: {
  title: string;
  setTitle: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  teacherId: string;
  setTeacherId: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  coverPreview: string | null;
  uploading: boolean;
  onCoverClick: () => void;
  onRemoveCover: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categories: { id: number; name: string }[];
  teachers: { id: number; display_name: string }[];
  showNewCategory: boolean;
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
  onToggleNewCategory: () => void;
  onCreateCategory: () => void;
  onCancelCategory: () => void;
  creatingCategory: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold">عنوان دوره</label>
        <input
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
          placeholder="مثلاً: ری‌اکت پیشرفته و Next.js"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold">دسته‌بندی</label>
        <div className="flex items-center gap-1.5">
          <select
            aria-label="دسته‌بندی"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">انتخاب...</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleNewCategory}
            title="ایجاد دسته‌بندی جدید"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
              showNewCategory
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showNewCategory && (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              className="flex-1 rounded-lg border border-primary/50 bg-background px-3 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="نام دسته‌بندی جدید"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCreateCategory();
                if (e.key === 'Escape') onCancelCategory();
              }}
            />
            <button
              type="button"
              onClick={onCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim()}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
            >
              {creatingCategory ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'ایجاد'
              )}
            </button>
            <button
              type="button"
              aria-label="لغو"
              onClick={onCancelCategory}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Level + Teacher row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold">سطح</label>
          <select
            aria-label="سطح"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold">
            مدرس{' '}
            <span className="font-normal text-muted-foreground">(اختیاری)</span>
          </label>
          <select
            aria-label="مدرس"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          >
            <option value="">انتخاب...</option>
            {teachers.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Short description */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold">توضیحات کوتاه</label>
        <textarea
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
          placeholder="در ۲ تا ۳ جمله توضیح دهید دانشجو در پایان چه یاد می‌گیرد"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Cover image */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold">تصویر کاور</label>
        {coverPreview ? (
          <div className="relative overflow-hidden rounded-lg border border-border">
            <img
              src={coverPreview}
              alt="cover"
              className="aspect-video w-full object-cover"
            />
            <button
              type="button"
              aria-label="حذف تصویر"
              onClick={onRemoveCover}
              className="absolute start-2 top-2 rounded-full bg-background/90 p-1.5 shadow hover:bg-background"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onCoverClick}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/30 py-8 text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <Upload className="h-6 w-6 opacity-60" />
            <span className="text-[13px]">
              {uploading ? 'در حال آپلود...' : 'برای آپلود کلیک کنید یا بکشید'}
            </span>
            <span className="text-[11px] text-muted-foreground/60">
              PNG یا JPG · حداکثر ۲ مگابایت
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          aria-label="آپلود تصویر کاور"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

/* ── Step 2: محتوا ──────────────────────────────────────────── */
function Step2({
  sections,
  setSections
}: {
  sections: Section[];
  setSections: (s: Section[]) => void;
}) {
  function addSection() {
    setSections([
      ...sections,
      { id: uid(), title: `فصل ${sections.length + 1}: عنوان فصل`, lessons: [] }
    ]);
  }

  function removeSection(id: string) {
    setSections(sections.filter((s) => s.id !== id));
  }

  function updateSectionTitle(id: string, title: string) {
    setSections(sections.map((s) => (s.id === id ? { ...s, title } : s)));
  }

  function addLesson(sectionId: string) {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                { id: uid(), title: 'درس جدید', duration: '۱۲:۳۰' }
              ]
            }
          : s
      )
    );
  }

  function removeLesson(sectionId: string, lessonId: string) {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s
      )
    );
  }

  function updateLesson(
    sectionId: string,
    lessonId: string,
    field: keyof Lesson,
    value: string
  ) {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lessonId ? { ...l, [field]: value } : l
              )
            }
          : s
      )
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-[12.5px] text-primary">
        <Zap className="h-3.5 w-3.5 shrink-0" />
        محتوای دوره را به فصل و درس تقسیم کنید. می‌توانید بعداً ویرایش کنید.
      </div>

      {sections.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/60 py-10 text-center text-[13px] text-muted-foreground">
          هنوز فصلی اضافه نشده
        </div>
      )}

      {sections.map((section) => (
        <div
          key={section.id}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-2 px-4 py-3">
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50" />
            <input
              aria-label="عنوان فصل"
              className="flex-1 bg-transparent text-[13.5px] font-semibold outline-none"
              value={section.title}
              onChange={(e) => updateSectionTitle(section.id, e.target.value)}
            />
            <button
              type="button"
              aria-label="حذف فصل"
              onClick={() => removeSection(section.id)}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="border-t border-border/50">
            {section.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-2 border-b border-border/30 px-4 py-2.5 last:border-0"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/40" />
                <Play className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                <input
                  aria-label="عنوان درس"
                  className="flex-1 bg-transparent text-[12.5px] outline-none"
                  value={lesson.title}
                  onChange={(e) =>
                    updateLesson(section.id, lesson.id, 'title', e.target.value)
                  }
                />
                <input
                  aria-label="مدت درس"
                  className="w-16 rounded border border-border/60 bg-background px-2 py-0.5 text-center text-[11.5px] outline-none"
                  value={lesson.duration}
                  onChange={(e) =>
                    updateLesson(
                      section.id,
                      lesson.id,
                      'duration',
                      e.target.value
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="حذف درس"
                  onClick={() => removeLesson(section.id, lesson.id)}
                  className="rounded p-0.5 text-muted-foreground/50 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addLesson(section.id)}
              className="flex w-full items-center gap-1.5 px-4 py-2.5 text-[12.5px] text-primary/70 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              افزودن درس
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 py-3 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        افزودن فصل
      </button>
    </div>
  );
}

/* ── Step 3: قیمت ───────────────────────────────────────────── */
function Step3({
  pricingType,
  setPricingType,
  price,
  setPrice,
  discount,
  setDiscount,
  affiliateEnabled,
  setAffiliateEnabled,
  commission,
  setCommission,
  cookieDays,
  setCookieDays
}: {
  pricingType: PricingType;
  setPricingType: (t: PricingType) => void;
  price: string;
  setPrice: (v: string) => void;
  discount: string;
  setDiscount: (v: string) => void;
  affiliateEnabled: boolean;
  setAffiliateEnabled: (v: boolean) => void;
  commission: string;
  setCommission: (v: string) => void;
  cookieDays: string;
  setCookieDays: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {PRICING_OPTIONS.map((opt) => {
          const selected = pricingType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => setPricingType(opt.type)}
              className={cn(
                'flex flex-col items-start gap-0.5 rounded-xl border p-3 text-right transition-all',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'hover:border-primary/30 hover:bg-muted/30'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-[13px] font-semibold">{opt.label}</span>
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2',
                    selected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  )}
                />
              </div>
              <span className="w-full text-start text-[10.5px] text-muted-foreground">
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>

      {pricingType !== 'FREE' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold">قیمت (تومان)</label>
            <input
              type="number"
              min="0"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              placeholder="مثلاً ۱,۴۸۰,۰۰۰"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold">تخفیف %</label>
            <input
              type="number"
              min="0"
              max="100"
              aria-label="درصد تخفیف"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13.5px] font-semibold">فعال‌سازی پنل افیلیت</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              به بازاریاب‌ها اجازه دهید این دوره را تبلیغ کنند
            </p>
          </div>
          <button
            type="button"
            aria-label="فعال‌سازی افیلیت"
            onClick={() => setAffiliateEnabled(!affiliateEnabled)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              affiliateEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
            )}
          >
            <span
              className={cn(
                'absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                affiliateEnabled
                  ? 'translate-x-5 rtl:-translate-x-5'
                  : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {affiliateEnabled && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium">درصد کمیسیون</label>
              <input
                type="number"
                min="0"
                max="100"
                aria-label="درصد کمیسیون"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium">
                مدت کوکی (روز)
              </label>
              <input
                type="number"
                min="1"
                aria-label="مدت کوکی"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                value={cookieDays}
                onChange={(e) => setCookieDays(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 4: انتشار ─────────────────────────────────────────── */
function Step4({
  title,
  hasCover,
  sections,
  publishStatus,
  setPublishStatus
}: {
  title: string;
  hasCover: boolean;
  sections: Section[];
  pricingType: PricingType;
  publishStatus: PublishStatus;
  setPublishStatus: (s: PublishStatus) => void;
}) {
  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const checks = [
    { label: 'مشخصات اصلی', ok: title.length >= 5 },
    { label: 'تصویر کاور', ok: hasCover },
    { label: 'حداقل ۱ فصل', ok: sections.length >= 1 },
    { label: 'حداقل ۳ درس', ok: totalLessons >= 3 },
    { label: 'قیمت‌گذاری', ok: true }
  ];
  const optional = [{ label: 'پیش‌نمایش یک درس', optional: true }];

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="space-y-2">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          مرور نهایی
        </p>
        {[...checks, ...optional].map((item) => {
          const isOptional = 'optional' in item;
          const ok = isOptional ? false : (item as { ok: boolean }).ok;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[13px]">{item.label}</span>
              {isOptional ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                  اختیاری
                </span>
              ) : ok ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                  آماده
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  ناقص
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          وضعیت انتشار
        </p>
        {(
          [
            { value: 'DRAFT', label: 'پیش‌نویس', sub: 'فقط شما می‌بینید' },
            {
              value: 'PUBLISHED',
              label: 'منتشر شده',
              sub: 'برای همه قابل خرید'
            },
            {
              value: 'SCHEDULED',
              label: 'زمان‌بندی شده',
              sub: 'در زمان مشخص منتشر می‌شود'
            }
          ] as { value: PublishStatus; label: string; sub: string }[]
        ).map((opt) => {
          const selected = publishStatus === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPublishStatus(opt.value)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border p-3 text-start transition-all',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'hover:border-primary/30 hover:bg-muted/20'
              )}
            >
              <div>
                <p className="text-[13px] font-semibold">{opt.label}</p>
                <p className="text-[11px] text-muted-foreground">{opt.sub}</p>
              </div>
              <div
                className={cn(
                  'h-3.5 w-3.5 rounded-full border-2',
                  selected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/40'
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Modal ─────────────────────────────────────────────── */
export default function NewCourseModal({
  open,
  onClose,
  onCreated,
  editCourseId
}: Props) {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { user } = useAuthUser();
  const fileRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editCourseId;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [teachers, setTeachers] = useState<
    { id: number; display_name: string }[]
  >([]);

  // Inline category creation
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Step 1 state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [teacherId, setTeacherId] = useState('');
  const [description, setDescription] = useState('');
  const [coverId, setCoverId] = useState<string | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Step 2 state
  const [sections, setSections] = useState<Section[]>([]);

  // Step 3 state
  const [pricingType, setPricingType] = useState<PricingType>('ONE_TIME');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [commission, setCommission] = useState('15');
  const [cookieDays, setCookieDays] = useState('30');

  // Step 4 state
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('DRAFT');

  // Load categories and teachers when modal opens
  useEffect(() => {
    if (!open) return;
    async function load() {
      try {
        const [catsRaw, teachersRaw] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getTeacherUsers({ limit: 100 })
        ]);

        const catList = extractList(catsRaw).map((c) => ({
          id: (c as Record<string, unknown>).id as number,
          name: (c as Record<string, unknown>).name as string
        }));
        setCategories(catList);

        const teacherList = extractList(teachersRaw).map((t) => ({
          id: (t as Record<string, unknown>).id as number,
          display_name:
            ((t as Record<string, unknown>).display_name as string) ??
            ((t as Record<string, unknown>).name as string) ??
            `کاربر ${(t as Record<string, unknown>).id}`
        }));

        // In create mode: if user is MANAGER, inject them as default teacher
        if (!isEditMode && user?.role === 'MANAGER') {
          const managerEntry = {
            id: user.id,
            display_name: user.profile?.display_name ?? 'مدیر'
          };
          const alreadyIn = teacherList.some((t) => t.id === user.id);
          setTeachers(alreadyIn ? teacherList : [managerEntry, ...teacherList]);
          setTeacherId(String(user.id));
        } else {
          setTeachers(teacherList);
        }
      } catch {
        /* non-critical — dropdowns stay empty */
      }
    }
    load();
  }, [open, isEditMode, user]);

  // Load course data when in edit mode
  useEffect(() => {
    if (!open || !editCourseId) return;
    async function loadCourse() {
      setLoadingEdit(true);
      try {
        const raw = await apiClient.getCourse(editCourseId!);
        const c = (raw as Record<string, unknown>)?.data
          ? ((raw as Record<string, unknown>).data as Record<string, unknown>)
          : (raw as Record<string, unknown>);

        setTitle((c.title as string) ?? '');
        setCategoryId(c.category_id ? String(c.category_id) : '');
        setLevel((c.level as string) ?? 'BEGINNER');
        setTeacherId(c.teacher_id ? String(c.teacher_id) : '');
        setDescription((c.description as string) ?? '');
        const coverUrl =
          ((c.cover as Record<string, unknown>)?.url as string) ??
          ((c.cover as Record<string, unknown>)?.file_path as string) ??
          null;
        if (c.cover_id) setCoverId(String(c.cover_id));
        if (coverUrl) setCoverPreview(coverUrl);
        setPricingType((c.pricing_type as PricingType) ?? 'ONE_TIME');
        setPrice(c.primary_price ? String(c.primary_price) : '');
        setPublishStatus(c.published ? 'PUBLISHED' : 'DRAFT');
      } catch {
        toast.error('خطا در بارگذاری دوره');
      } finally {
        setLoadingEdit(false);
      }
    }
    loadCourse();
  }, [open, editCourseId]);

  function reset() {
    setStep(1);
    setTitle('');
    setCategoryId('');
    setLevel('BEGINNER');
    setTeacherId('');
    setDescription('');
    setCoverId(undefined);
    setCoverPreview(null);
    setSections([]);
    setPricingType('ONE_TIME');
    setPrice('');
    setDiscount('0');
    setAffiliateEnabled(false);
    setCommission('15');
    setCookieDays('30');
    setPublishStatus('DRAFT');
    setShowNewCategory(false);
    setNewCategoryName('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const res = await apiClient.createCategory({
        name: newCategoryName.trim(),
        type: 'COURSE'
      });
      const raw = res as unknown as Record<string, unknown>;
      const cat = (raw?.data as Record<string, unknown>) ?? raw;
      const newCat = { id: cat.id as number, name: cat.name as string };
      setCategories((prev) => [...prev, newCat]);
      setCategoryId(String(newCat.id));
      setNewCategoryName('');
      setShowNewCategory(false);
      toast.success('دسته‌بندی ایجاد شد');
    } catch {
      toast.error('خطا در ایجاد دسته‌بندی');
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiClient.uploadImage(file, {
        title: title || 'Cover'
      });
      const rawResult = result as unknown as Record<string, unknown>;
      const id =
        rawResult?.id ?? (rawResult?.data as Record<string, unknown>)?.id;
      if (id) {
        setCoverId(String(id));
        const reader = new FileReader();
        reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    } catch {
      toast.error('خطا در آپلود تصویر');
    } finally {
      setUploading(false);
    }
  }

  function validateStep(): boolean {
    if (step === 1 && title.trim().length < 5) {
      toast.error('عنوان دوره باید حداقل ۵ کاراکتر باشد');
      return false;
    }
    return true;
  }

  function buildPayload(published: boolean) {
    const priceNum = pricingType === 'FREE' ? 0 : Number(price) || 0;
    const seasonsPayload = sections.map((sec) => ({
      title: sec.title,
      lessons: sec.lessons.map((l) => ({ title: l.title }))
    }));
    return {
      title: title.trim(),
      description: description.trim() || '—',
      primary_price: priceNum,
      secondary_price: 0,
      pricing_type: pricingType,
      published,
      category_id: categoryId ? Number(categoryId) : undefined,
      cover_id: coverId ? Number(coverId) : undefined,
      teacher_id: teacherId ? Number(teacherId) : undefined,
      seasons: seasonsPayload.length > 0 ? seasonsPayload : undefined
    };
  }

  async function handleSaveDraft() {
    if (!selectedAcademy) return;
    if (!title.trim()) {
      toast.error('عنوان دوره را وارد کنید');
      return;
    }
    setSaving(true);
    try {
      if (isEditMode) {
        await apiClient.updateCourse(
          editCourseId!,
          buildPayload(false) as Parameters<typeof apiClient.updateCourse>[1]
        );
        toast.success('دوره به‌روزرسانی شد');
      } else {
        const res = await apiClient.createCourse(
          buildPayload(false) as Parameters<typeof apiClient.createCourse>[0]
        );
        const rawRes = res as unknown as Record<string, unknown>;
        const id = rawRes?.data
          ? (rawRes.data as Record<string, unknown>).id
          : rawRes?.id;
        toast.success('پیش‌نویس ذخیره شد');
        handleClose();
        onCreated?.();
        if (id) router.push(`/courses/${id}`);
        return;
      }
      handleClose();
      onCreated?.();
    } catch {
      toast.error('خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!selectedAcademy) return;
    if (!title.trim()) {
      toast.error('عنوان دوره را وارد کنید');
      return;
    }
    setSaving(true);
    try {
      const published = publishStatus === 'PUBLISHED';
      if (isEditMode) {
        await apiClient.updateCourse(
          editCourseId!,
          buildPayload(published) as Parameters<
            typeof apiClient.updateCourse
          >[1]
        );
        toast.success('دوره به‌روزرسانی شد');
      } else {
        const res = await apiClient.createCourse(
          buildPayload(published) as Parameters<
            typeof apiClient.createCourse
          >[0]
        );
        const rawRes = res as unknown as Record<string, unknown>;
        const id = rawRes?.data
          ? (rawRes.data as Record<string, unknown>).id
          : rawRes?.id;
        toast.success(published ? 'دوره منتشر شد' : 'دوره ذخیره شد');
        handleClose();
        onCreated?.();
        if (id) router.push(`/courses/${id}`);
        return;
      }
      handleClose();
      onCreated?.();
    } catch {
      toast.error('خطا در ذخیره دوره');
    } finally {
      setSaving(false);
    }
  }

  const isLastStep = step === 4;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="flex max-h-[92vh] max-w-[680px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-6 pb-0 pt-5">
          <div className="flex items-center justify-between">
            <div className="text-start">
              <p className="text-[11px] text-muted-foreground">
                {isEditMode ? 'ویرایش دوره' : 'دوره جدید'}
              </p>
              <DialogTitle className="text-[17px] font-bold">
                {isEditMode ? 'ویرایش اطلاعات دوره' : 'یک دوره جدید بسازید'}
              </DialogTitle>
            </div>
            <button
              type="button"
              aria-label="بستن"
              onClick={handleClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <StepIndicator step={step} />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loadingEdit ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {step === 1 && (
                <Step1
                  title={title}
                  setTitle={setTitle}
                  categoryId={categoryId}
                  setCategoryId={setCategoryId}
                  level={level}
                  setLevel={setLevel}
                  teacherId={teacherId}
                  setTeacherId={setTeacherId}
                  description={description}
                  setDescription={setDescription}
                  coverPreview={coverPreview}
                  uploading={uploading}
                  onCoverClick={() => fileRef.current?.click()}
                  onRemoveCover={() => {
                    setCoverId(undefined);
                    setCoverPreview(null);
                  }}
                  fileRef={fileRef}
                  handleFileChange={handleCoverChange}
                  categories={categories}
                  teachers={teachers}
                  showNewCategory={showNewCategory}
                  newCategoryName={newCategoryName}
                  setNewCategoryName={setNewCategoryName}
                  onToggleNewCategory={() => setShowNewCategory((v) => !v)}
                  onCreateCategory={handleCreateCategory}
                  onCancelCategory={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  creatingCategory={creatingCategory}
                />
              )}
              {step === 2 && (
                <Step2 sections={sections} setSections={setSections} />
              )}
              {step === 3 && (
                <Step3
                  pricingType={pricingType}
                  setPricingType={setPricingType}
                  price={price}
                  setPrice={setPrice}
                  discount={discount}
                  setDiscount={setDiscount}
                  affiliateEnabled={affiliateEnabled}
                  setAffiliateEnabled={setAffiliateEnabled}
                  commission={commission}
                  setCommission={setCommission}
                  cookieDays={cookieDays}
                  setCookieDays={setCookieDays}
                />
              )}
              {step === 4 && (
                <Step4
                  title={title}
                  hasCover={!!coverId}
                  sections={sections}
                  pricingType={pricingType}
                  publishStatus={publishStatus}
                  setPublishStatus={setPublishStatus}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted/40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                مرحله قبل
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
              >
                انصراف
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
            >
              {isEditMode ? 'ذخیره' : 'ذخیره پیش‌نویس'}
            </button>
            {isLastStep ? (
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving
                  ? 'در حال ارسال...'
                  : isEditMode
                    ? 'به‌روزرسانی'
                    : 'انتشار دوره'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (validateStep()) setStep((s) => s + 1);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                مرحله بعد
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
