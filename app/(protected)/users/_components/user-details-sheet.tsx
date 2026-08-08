'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { apiClient } from '@/lib/api';
import type { User } from '@/types/api';
import { UserSupportActions } from './user-support-actions';

interface UserDetails {
  profile?: {
    id?: number;
    uuid?: string;
    full_name?: string;
    display_name?: string;
    role_name?: string;
  };
  roles_across_academies?: {
    profile_id: number;
    academy_name?: string;
    role: string;
  }[];
  purchase_history?: {
    id: number;
    status: string;
    amount: number;
    Course?: { title?: string };
  }[];
}

interface UserDetailsSheetProps {
  user: User | null;
  canManage: boolean;
  onClose: () => void;
}

export function UserDetailsSheet({
  user,
  canManage,
  onClose
}: UserDetailsSheetProps) {
  const { t } = useTranslation();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      try {
        const response = await apiClient.getUserDetails(userId);
        setDetails(response as unknown as UserDetails);
      } catch {
        toast.error(t('users.loadUserDetailsFailed'));
        setDetails(null);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!user) {
      setDetails(null);
      return;
    }
    load(user.id);
  }, [user, load]);

  return (
    <Sheet open={!!user} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{user?.display_name || user?.name}</SheetTitle>
          <SheetDescription>
            {t('users.detailSheetDescription')}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <p className="py-8 text-sm text-muted-foreground">
            {t('users.loadingDetails')}
          </p>
        ) : details ? (
          <div className="space-y-6 py-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <DetailItem
                label={t('users.id')}
                value={details.profile?.id?.toString()}
              />
              <DetailItem
                label={t('users.colUuid')}
                value={details.profile?.uuid}
              />
              <DetailItem
                label={t('users.detailName')}
                value={
                  details.profile?.full_name ?? details.profile?.display_name
                }
              />
              <DetailItem
                label={t('users.colRole')}
                value={
                  details.profile?.role_name
                    ? getRoleLabel(details.profile.role_name, t)
                    : undefined
                }
              />
            </dl>

            {canManage && user && <UserSupportActions userId={user.id} />}

            <Section title={t('users.rolesInAcademies')}>
              {(details.roles_across_academies ?? []).map((item) => (
                <div
                  key={item.profile_id}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
                >
                  <span>
                    {item.academy_name || t('users.platformFallback')}
                  </span>
                  <span className="text-muted-foreground">
                    {getRoleLabel(item.role, t)}
                  </span>
                </div>
              ))}
            </Section>

            <Section title={t('users.purchaseHistory')}>
              {(details.purchase_history ?? []).slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
                >
                  <span className="truncate">{item.Course?.title ?? '—'}</span>
                  <span className="text-muted-foreground">
                    {item.status} · {item.amount}
                  </span>
                </div>
              ))}
            </Section>
          </div>
        ) : (
          <p className="py-8 text-sm text-muted-foreground">
            {t('users.noDetailData')}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}
