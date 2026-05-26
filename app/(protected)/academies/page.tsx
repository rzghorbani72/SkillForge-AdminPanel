'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Users,
  GraduationCap,
  Plus,
  Globe,
  Lock,
  Loader2,
  CheckCircle2,
  Pencil,
  X,
  Save,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { clearAcademyData } from '@/lib/store-utils';
import { toast } from 'react-toastify';

// ─── Avatar ──────────────────────────────────────────────────────────────────

const COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-pink-500'
];

function AcademyAvatar({ name, id }: { name: string; id: number }) {
  const color = COLORS[id % COLORS.length];
  return (
    <div
      className={cn(
        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm',
        color
      )}
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  TEACHER: 'bg-emerald-100 text-emerald-700',
  STUDENT: 'bg-amber-100 text-amber-700'
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        ROLE_STYLE[role] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {role.toLowerCase()}
    </span>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function Stat({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="text-muted-foreground/70">{icon}</span>
      <span className="font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

type AcademyCardProps = {
  academy: any;
  isCurrent: boolean;
  canEdit: boolean;
  onSwitch: (id: number) => void;
  switching: number | null;
  t: (k: string) => string;
  isRTL: boolean;
};

function AcademyCard({
  academy,
  isCurrent,
  canEdit,
  onSwitch,
  switching,
  t,
  isRTL
}: AcademyCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: academy.name,
    slug: academy.slug,
    public_address: academy.domain?.public_address ?? ''
  });
  const [saving, setSaving] = useState(false);

  const slug = academy.slug ?? academy.domain?.private_address ?? '';
  const publicDomain = academy.domain?.public_address;
  const isSwitch = switching === academy.id;
  const managerRole = academy.profiles?.find(
    (p: any) => p.Role?.name === 'MANAGER' || p.Role?.name === 'ADMIN'
  )?.Role?.name;

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/academies/${academy.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          slug: draft.slug,
          public_address: draft.public_address || null
        })
      }).then(async (r) => {
        if (!r.ok)
          throw new Error((await r.json())?.message ?? 'Update failed');
      });
      toast.success(t('stores.storeUpdated'));
      setEditing(false);
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        isCurrent && 'ring-2 ring-primary'
      )}
      dir={'rtl'}
    >
      {/* Current badge */}
      {isCurrent && (
        <span className="absolute end-4 top-4 flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          <CheckCircle2 className="h-3 w-3" />
          {t('stores.currentAcademy')}
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <AcademyAvatar name={academy.name} id={academy.id} />
        <div className="min-w-0 flex-1 pt-0.5">
          {editing ? (
            <Input
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              className="h-8 text-base font-semibold"
              autoFocus
            />
          ) : (
            <h3 className="truncate text-base font-semibold leading-tight">
              {academy.name}
            </h3>
          )}
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
            {slug}
          </p>
        </div>
      </div>

      {/* Edit fields */}
      {editing && (
        <div className="mt-3 space-y-2">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              {t('stores.privateSlug')}
            </p>
            <Input
              value={draft.slug}
              onChange={(e) =>
                setDraft((d) => ({ ...d, slug: e.target.value }))
              }
              className="h-8 font-mono text-sm"
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              {t('stores.publicDomainLabel')}
            </p>
            <Input
              value={draft.public_address}
              onChange={(e) =>
                setDraft((d) => ({ ...d, public_address: e.target.value }))
              }
              className="h-8 font-mono text-sm"
              placeholder="academy.example.com"
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="my-4 border-t" />

      {/* Stats */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        <Stat
          icon={<BookOpen className="h-3.5 w-3.5" />}
          value={academy.course_count ?? 0}
          label={t('stores.courses')}
        />
        <Stat
          icon={<Users className="h-3.5 w-3.5" />}
          value={academy.student_count ?? 0}
          label={t('stores.students')}
        />
        <Stat
          icon={<GraduationCap className="h-3.5 w-3.5" />}
          value={academy.mentor_count ?? 0}
          label={t('stores.teachers')}
        />
      </div>

      {/* Domain */}
      <div className="mt-3 flex flex-wrap gap-3">
        {publicDomain ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            {publicDomain}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
            <Lock className="h-3.5 w-3.5" />
            {t('stores.notSet')}
          </span>
        )}
        {managerRole && <RoleBadge role={managerRole} />}
        {academy.is_active === false && (
          <Badge variant="secondary" className="text-xs">
            {t('stores.inactive')}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {editing ? (
          <>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="me-1.5 h-3.5 w-3.5" />
              )}
              {t('stores.saveChanges')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            {!isCurrent && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onSwitch(academy.id)}
                disabled={isSwitch}
              >
                {isSwitch ? (
                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="me-1.5 h-3.5 w-3.5" />
                )}
                {t('stores.switchToAcademy')}
              </Button>
            )}
            {isCurrent && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => window.location.assign('/dashboard')}
              >
                <ExternalLink className="me-1.5 h-3.5 w-3.5" />
                {t('stores.manageAcademy')}
              </Button>
            )}
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AcademiesPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const router = useRouter();
  const { academies, isLoading } = useStore();
  const { user } = useAuthUser();
  const [switching, setSwitching] = useState<number | null>(null);

  const currentAcademyId =
    user?.academyId ?? (user as any)?.profile?.academy_id ?? null;
  const isAdmin = user?.role === 'ADMIN' || user?.isAdminProfile;
  const canEdit = isAdmin || user?.role === 'MANAGER';

  async function handleSwitch(academyId: number) {
    setSwitching(academyId);
    try {
      await apiClient.switchAcademy(academyId);
      clearAcademyData();
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message ?? 'Switch failed');
      setSwitching(null);
    }
  }

  return (
    <div className="flex-1 space-y-8 p-6" dir={'rtl'}>
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('stores.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('stores.manageStoresDescription')}
          </p>
        </div>
        {(isAdmin || user?.role === 'MANAGER') && (
          <Button onClick={() => router.push('/onboarding/create-academy')}>
            <Plus className="me-2 h-4 w-4" />
            {t('stores.createNew')}
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : academies.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t('stores.emptyTitle')}</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('stores.emptyDesc')}
          </p>
          {(isAdmin || user?.role === 'MANAGER') && (
            <Button
              className="mt-6"
              onClick={() => router.push('/onboarding/create-academy')}
            >
              <Plus className="me-2 h-4 w-4" />
              {t('stores.createNew')}
            </Button>
          )}
        </div>
      ) : (
        /* Grid */
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {academies.map((academy: any) => (
            <AcademyCard
              key={academy.id}
              academy={academy}
              isCurrent={academy.id === currentAcademyId}
              canEdit={canEdit}
              onSwitch={handleSwitch}
              switching={switching}
              t={t}
              isRTL={isRTL}
            />
          ))}
        </div>
      )}
    </div>
  );
}
