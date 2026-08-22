'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useImageUpload } from '@/hooks/use-image-upload';
import { toSlug } from '@/lib/slug';
import { resolveMediaUrl } from '@/lib/media-url';
import {
  isSlugBlocking,
  useSlugAvailability
} from '@/hooks/use-slug-availability';
import { DEFAULT_BRAND_COLOR } from '@/components/academies/brand-color-picker';
import type { Academy } from '@/types/api';
import type { AcademyEditPayload } from './academy-edit-types';

function currentSlugOf(academy: Academy): string {
  return (
    academy.domain?.private_address ??
    academy.Domain?.private_address ??
    academy.private_address ??
    academy.slug ??
    ''
  );
}

export function useAcademyEditState(academy: Academy) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownSlug, setOwnSlug] = useState('');
  const [publicAddress, setPublicAddress] = useState('');
  const [description, setDescription] = useState('');
  const {
    status: slugStatus,
    check: checkSlug,
    reset: resetSlug
  } = useSlugAvailability({ ownSlug });
  const logo = useImageUpload();
  const favicon = useImageUpload();
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_BRAND_COLOR);

  useEffect(() => {
    setStep(0);
    setName(academy.name ?? '');
    const currentSlug = currentSlugOf(academy);
    setSlug(currentSlug);
    setOwnSlug(currentSlug);
    resetSlug();
    setPublicAddress(
      academy.domain?.public_address ?? academy.Domain?.public_address ?? ''
    );
    setDescription(academy.description ?? '');
    logo.reset(resolveMediaUrl(academy.logo?.publicUrl));
    favicon.reset(resolveMediaUrl(academy.favicon?.publicUrl));
    setPrimaryColor(DEFAULT_BRAND_COLOR);

    void apiClient
      .getCurrentThemeConfig()
      .then((themeConfig) => {
        const saved = (themeConfig as { primary_color?: string })
          ?.primary_color;
        if (saved) setPrimaryColor(saved);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate only when academy id changes
  }, [academy.id, resetSlug]);

  const handleSlugChange = useCallback(
    (value: string) => {
      const normalized = toSlug(value);
      setSlug(normalized);
      checkSlug(normalized);
    },
    [checkSlug]
  );

  const buildPayload = useCallback((): AcademyEditPayload | null => {
    if (!name.trim() || !slug.trim()) return null;
    if (isSlugBlocking(slugStatus)) return null;
    return {
      name,
      slug,
      publicAddress,
      description,
      logoId: logo.id ?? undefined,
      faviconId: favicon.id ?? undefined,
      primaryColor
    };
  }, [
    name,
    slug,
    publicAddress,
    description,
    logo.id,
    favicon.id,
    primaryColor,
    slugStatus
  ]);

  const canSave =
    !saving &&
    Boolean(name.trim()) &&
    Boolean(slug.trim()) &&
    !isSlugBlocking(slugStatus);

  return {
    step,
    setStep,
    saving,
    setSaving,
    name,
    setName,
    slug,
    publicAddress,
    setPublicAddress,
    description,
    setDescription,
    slugStatus,
    handleSlugChange,
    logo,
    favicon,
    primaryColor,
    setPrimaryColor,
    buildPayload,
    canSave
  };
}
