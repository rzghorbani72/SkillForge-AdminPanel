'use client';

import { X, Plus, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { LEVEL_KEYS } from './course-modal-types';

interface Step1Props {
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
}

export function Step1Details({
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
}: Step1Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold">
          {t('courses.courseTitle')}
        </label>
        <input
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
          placeholder={t('courses.titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold">
          {t('courses.category')}
        </label>
        <div className="flex items-center gap-1.5">
          <select
            aria-label={t('courses.category')}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{t('courses.selectOption')}</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleNewCategory}
            title={t('courses.createNewCategory')}
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
              placeholder={t('courses.newCategoryName')}
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
                t('common.create')
              )}
            </button>
            <button
              type="button"
              aria-label={t('common.cancel')}
              onClick={onCancelCategory}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold">
            {t('courses.level')}
          </label>
          <select
            aria-label={t('courses.level')}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {LEVEL_KEYS.map((l) => (
              <option key={l.value} value={l.value}>
                {t(l.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold">
            {t('courses.instructor')}{' '}
            <span className="font-normal text-muted-foreground">
              ({t('common.optional')})
            </span>
          </label>
          <select
            aria-label={t('courses.instructor')}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          >
            <option value="">{t('courses.selectOption')}</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={String(teacher.id)}>
                {teacher.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold">
          {t('courses.shortDescription')}
        </label>
        <textarea
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
          placeholder={t('courses.descriptionPlaceholder')}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold">
          {t('courses.coverImage')}
        </label>
        {coverPreview ? (
          <div className="relative overflow-hidden rounded-lg border border-border">
            <img
              src={coverPreview}
              alt="cover"
              className="aspect-video w-full object-cover"
            />
            <button
              type="button"
              aria-label={t('courses.removeImage')}
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
              {uploading
                ? t('courses.uploading')
                : t('courses.uploadClickOrDrag')}
            </span>
            <span className="text-[11px] text-muted-foreground/60">
              {t('courses.uploadFileTypes')}
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          aria-label={t('courses.uploadCoverImage')}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
