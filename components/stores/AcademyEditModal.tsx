'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Academy } from '@/types/api';

type AcademyEditModalProps = {
  academy: Academy | null;
  onClose: () => void;
  onSubmit: (
    id: number,
    data: {
      name: string;
      slug: string;
      publicAddress: string;
      description: string;
    }
  ) => Promise<void>;
  t: (k: string) => string;
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

export function AcademyEditModal({
  academy,
  onClose,
  onSubmit,
  t
}: AcademyEditModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [publicAddress, setPublicAddress] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!academy) return;
    setName(academy.name ?? '');
    setSlug(
      academy.domain?.private_address ??
        academy.Domain?.private_address ??
        academy.slug ??
        ''
    );
    setPublicAddress(
      academy.domain?.public_address ?? academy.Domain?.public_address ?? ''
    );
    setDescription(academy.description ?? '');
  }, [academy]);

  async function handleSave() {
    if (!academy || !name.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      await onSubmit(academy.id, { name, slug, publicAddress, description });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!academy} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]" dir="rtl">
        <DialogHeader className="text-right">
          <p className="text-xs text-muted-foreground">
            {t('stores.editAcademy')}
          </p>
          <DialogTitle className="text-xl">
            {t('stores.editModalHeading')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('stores.academyName')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('stores.academyNamePlaceholder')}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('stores.subdomain')}
            </label>
            <div className="flex items-center overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring">
              <input
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                placeholder="my-academy"
                dir="ltr"
              />
              <span className="shrink-0 border-r bg-muted px-3 py-2 text-xs text-muted-foreground">
                mentoryar.ir
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('stores.publicDomainOptional')}
            </label>
            <Input
              value={publicAddress}
              onChange={(e) => setPublicAddress(e.target.value)}
              placeholder={t('stores.publicDomainPlaceholder')}
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('stores.shortDescription')}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('stores.shortDescriptionPlaceholder')}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            {t('stores.cancel')}
          </button>

          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !slug.trim()}
          >
            {saving && <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />}
            {t('stores.saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
