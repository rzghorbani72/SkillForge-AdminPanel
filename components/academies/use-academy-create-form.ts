'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_BRAND_COLOR } from '@/components/academies/brand-color-picker';
import { useImageUpload } from '@/hooks/use-image-upload';
import { isSlugBlocking, useSlugAvailability } from '@/hooks/use-slug-availability';
import { toSlug } from '@/lib/slug';
import type { AcademyCreateInput } from '@/lib/academy-create';
import { FAVICON_MAX_KB, LOGO_MAX_KB } from '@/lib/upload-limits';
import { clearStoredDraft, readDraft, saveDraft } from './academy-create-draft';

export function useAcademyCreateForm(onSubmit: (data: AcademyCreateInput) => Promise<void>) {
  const [initial] = useState(readDraft);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [primaryColor, setPrimaryColor] = useState(initial?.primaryColor ?? DEFAULT_BRAND_COLOR);
  const logo = useImageUpload(LOGO_MAX_KB * 1024);
  const favicon = useImageUpload(FAVICON_MAX_KB * 1024);
  const { status: slugStatus, check: checkSlug, reset: resetSlug } = useSlugAvailability();

  // Survives an accidental outside-click close; only cancel or submit clears it.
  useEffect(() => {
    saveDraft({ name, slug, description, category, primaryColor });
  }, [name, slug, description, category, primaryColor]);

  const canSubmit =
    name.trim().length >= 2 &&
    slug.trim().length >= 2 &&
    !isSlugBlocking(slugStatus) &&
    !logo.uploading &&
    !favicon.uploading &&
    !saving;

  function changeSlug(value: string) {
    const normalized = toSlug(value);
    setSlug(normalized);
    checkSlug(normalized);
  }

  function changeName(value: string) {
    setName(value);
    changeSlug(value);
  }

  function clear() {
    resetSlug();
    setName('');
    setSlug('');
    setDescription('');
    setCategory('');
    logo.reset();
    favicon.reset();
    setPrimaryColor(DEFAULT_BRAND_COLOR);
    clearStoredDraft();
  }

  async function submit(): Promise<boolean> {
    if (!canSubmit) return false;
    setSaving(true);
    try {
      await onSubmit({
        name,
        slug,
        description,
        category,
        logoId: logo.id ?? undefined,
        faviconId: favicon.id ?? undefined,
        primaryColor,
      });
      clear();
      return true;
    } finally {
      setSaving(false);
    }
  }

  return {
    name,
    slug,
    slugStatus,
    description,
    category,
    primaryColor,
    logo,
    favicon,
    saving,
    canSubmit,
    changeName,
    changeSlug,
    setDescription,
    setCategory,
    setPrimaryColor,
    clear,
    submit,
  };
}

export type AcademyCreateForm = ReturnType<typeof useAcademyCreateForm>;
