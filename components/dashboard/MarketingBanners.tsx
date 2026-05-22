'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Megaphone,
  Plus,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

interface Banner {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  color: string;
  isActive: boolean;
}

const ACCENT_COLORS = [
  {
    label: 'Purple',
    value: 'from-violet-500/20 via-purple-500/10 to-transparent',
    preview: 'bg-violet-500'
  },
  {
    label: 'Amber',
    value: 'from-amber-500/20 via-orange-500/10 to-transparent',
    preview: 'bg-amber-500'
  },
  {
    label: 'Green',
    value: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    preview: 'bg-emerald-500'
  },
  {
    label: 'Blue',
    value: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    preview: 'bg-cyan-500'
  },
  {
    label: 'Rose',
    value: 'from-rose-500/20 via-pink-500/10 to-transparent',
    preview: 'bg-rose-500'
  }
];

interface MarketingBannersProps {
  editable?: boolean;
}

export default function MarketingBanners({
  editable = true
}: MarketingBannersProps) {
  const { t } = useTranslation();

  const DEFAULT_BANNERS: Banner[] = [
    {
      id: '1',
      title: t('dashboard.launchCourseTitle'),
      description: t('dashboard.launchCourseDesc'),
      ctaLabel: t('dashboard.launchCourseCta'),
      ctaUrl: '/courses/new',
      color: 'from-violet-500/20 via-purple-500/10 to-transparent',
      isActive: true
    },
    {
      id: '2',
      title: t('dashboard.upgradePlanTitle'),
      description: t('dashboard.upgradePlanDesc'),
      ctaLabel: t('dashboard.upgradePlanCta'),
      ctaUrl: '/plans',
      color: 'from-amber-500/20 via-orange-500/10 to-transparent',
      isActive: true
    },
    {
      id: '3',
      title: t('dashboard.inviteTeamTitle'),
      description: t('dashboard.inviteTeamDesc'),
      ctaLabel: t('dashboard.inviteTeamCta'),
      ctaUrl: '/users',
      color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      isActive: true
    }
  ];

  const DEFAULT_FORM: Omit<Banner, 'id'> = {
    title: '',
    description: '',
    ctaLabel: '',
    ctaUrl: '',
    color: ACCENT_COLORS[0].value,
    isActive: true
  };

  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<Omit<Banner, 'id'>>(DEFAULT_FORM);

  const activeBanners = banners.filter((b) => b.isActive);

  function prev() {
    setCurrentIndex((i) => (i === 0 ? activeBanners.length - 1 : i - 1));
  }
  function next() {
    setCurrentIndex((i) => (i === activeBanners.length - 1 ? 0 : i + 1));
  }

  function openCreate() {
    setEditingBanner(null);
    setForm(DEFAULT_FORM);
    setIsEditing(true);
  }

  function openEdit(banner: Banner) {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      description: banner.description,
      ctaLabel: banner.ctaLabel,
      ctaUrl: banner.ctaUrl,
      color: banner.color,
      isActive: banner.isActive
    });
    setIsEditing(true);
  }

  function deleteBanner(id: string) {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  function saveBanner() {
    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) => (b.id === editingBanner.id ? { ...b, ...form } : b))
      );
    } else {
      setBanners((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setIsEditing(false);
    setCurrentIndex(0);
  }

  if (activeBanners.length === 0 && !editable) return null;

  const current =
    activeBanners[currentIndex % Math.max(activeBanners.length, 1)];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            {t('dashboard.announcements')}
          </span>
          {activeBanners.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeBanners.length}
            </Badge>
          )}
        </div>
        {editable && (
          <Button variant="ghost" size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {t('dashboard.addBanner')}
          </Button>
        )}
      </div>

      {activeBanners.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-8">
            <Megaphone className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {t('common.noData')}
            </p>
            {editable && (
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t('dashboard.addBanner')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="relative overflow-hidden rounded-xl border">
          <div
            className={cn(
              'bg-gradient-to-r p-6 transition-all duration-500',
              current.color
            )}
          >
            <div className="flex items-start justify-between">
              <div className="max-w-lg space-y-2">
                <h3 className="text-lg font-bold">{current.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {current.description}
                </p>
                {current.ctaUrl && (
                  <a
                    href={current.ctaUrl}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {current.ctaLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              {editable && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label={t('common.edit')}
                    onClick={() => openEdit(current)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    aria-label={t('common.delete')}
                    onClick={() => deleteBanner(current.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {activeBanners.length > 1 && (
            <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
              <div className="flex gap-1">
                {activeBanners.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`${t('common.view')} ${i + 1}`}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === currentIndex % activeBanners.length
                        ? 'w-4 bg-primary'
                        : 'w-1.5 bg-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={t('common.previous')}
                  onClick={prev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {(currentIndex % activeBanners.length) + 1}/
                  {activeBanners.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={t('common.next')}
                  onClick={next}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBanner
                ? t('dashboard.editBanner')
                : t('dashboard.addBanner')}
            </DialogTitle>
            <DialogDescription>
              {t('dashboard.announcements')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t('dashboard.bannerTitle')}</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder={t('dashboard.launchCourseTitle')}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('dashboard.bannerDesc')}</Label>
              <textarea
                className="min-h-[70px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                aria-label={t('dashboard.bannerDesc')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t('dashboard.bannerCtaLabel')}</Label>
                <Input
                  value={form.ctaLabel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ctaLabel: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('dashboard.bannerCtaUrl')}</Label>
                <Input
                  value={form.ctaUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ctaUrl: e.target.value }))
                  }
                  placeholder="/plans"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('dashboard.bannerColor')}</Label>
              <div className="flex gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                    className={cn(
                      'h-7 w-7 rounded-full ring-offset-background transition-all',
                      c.preview,
                      form.color === c.value
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                aria-label={t('dashboard.bannerActive')}
              />
              <p className="text-sm font-medium">
                {t('dashboard.bannerActive')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={saveBanner} disabled={!form.title}>
              {editingBanner ? t('common.save') : t('dashboard.addBanner')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
