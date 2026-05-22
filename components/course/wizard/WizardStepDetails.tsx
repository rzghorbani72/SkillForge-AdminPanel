'use client';

import { UseFormReturn } from 'react-hook-form';
import { WizardValues } from './wizard-schema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/hooks';

interface Props {
  form: UseFormReturn<WizardValues>;
  categories: { id: number; name: string }[];
}

export default function WizardStepDetails({ form, categories }: Props) {
  const { t } = useTranslation();
  const title = form.watch('title') ?? '';
  const description = form.watch('description') ?? '';
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiClient.uploadImage(file, {
        title: title || 'Cover'
      });
      const id = result?.id ?? result?.data?.id;
      if (id) {
        form.setValue('cover_id', String(id));
        const reader = new FileReader();
        reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
        toast.success(t('courses.uploadCoverImage'));
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setUploading(false);
    }
  }

  function removeCover() {
    form.setValue('cover_id', undefined);
    setCoverPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              {t('wizard.courseTitle')}{' '}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('wizard.courseTitlePlaceholder')}
                className="text-base"
                {...field}
              />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span
                className={`ml-auto text-xs ${title.length >= 70 ? 'text-orange-500' : 'text-muted-foreground'}`}
              >
                {title.length}/80
              </span>
            </div>
          </FormItem>
        )}
      />

      {/* Subtitle */}
      <FormField
        control={form.control}
        name="subtitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              {t('wizard.subtitle')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('wizard.subtitlePlaceholder')}
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>{t('wizard.subtitleHint')}</FormDescription>
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">
              {t('wizard.description')}{' '}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('wizard.descriptionPlaceholder')}
                rows={5}
                {...field}
              />
            </FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span
                className={`ml-auto text-xs ${description.length >= 1800 ? 'text-orange-500' : 'text-muted-foreground'}`}
              >
                {description.length}/2000
              </span>
            </div>
          </FormItem>
        )}
      />

      {/* Category */}
      {categories.length > 0 && (
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">
                {t('wizard.category')}
              </FormLabel>
              <FormControl>
                <select
                  aria-label={t('wizard.category')}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                >
                  <option value="">{t('wizard.selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {/* Cover image */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">
          {t('wizard.coverImage')}
        </label>
        {coverPreview ? (
          <div className="relative w-full max-w-xs overflow-hidden rounded-lg border">
            <img
              src={coverPreview}
              alt={t('wizard.coverImage')}
              className="aspect-video w-full object-cover"
            />
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={removeCover}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full max-w-xs flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 py-8 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <ImagePlus className="h-8 w-8" />
            <span>
              {uploading ? t('wizard.uploading') : t('wizard.uploadCover')}
            </span>
            <span className="text-xs">{t('wizard.uploadCoverHint')}</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label={t('wizard.coverImage')}
          onChange={handleCoverChange}
        />
      </div>
    </div>
  );
}
