import { LogOut, Save, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { User } from '@/types/api';
import { useAvatarUpload } from '../_hooks/use-avatar-upload';
import { useProfileForm } from '../_hooks/use-profile-form';
import { AvatarUploader } from './avatar-uploader';
import { ContactFields } from './contact-fields';

function initialsOf(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
}

interface ProfileInfoCardProps {
  user: User | null;
  refreshUser: () => void;
  refreshAll: () => void;
}

export function ProfileInfoCard({ user, refreshUser, refreshAll }: ProfileInfoCardProps) {
  const { t } = useTranslation();
  const profile = useProfileForm(user, refreshUser, refreshAll);
  const { form, setForm } = profile;
  const avatar = useAvatarUpload(user?.avatar?.url ?? null, refreshAll);
  const displayName = user?.full_name ?? user?.display_name ?? '';
  const roleName = user?.role_name ?? user?.profiles?.[0]?.role?.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="h-4 w-4" />
          </span>
          {t('settings.profileInformation')}
        </CardTitle>
        <CardDescription>{t('settings.profileInformationDescription')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <AvatarUploader
          avatarUrl={avatar.avatarUrl}
          initials={initialsOf(displayName)}
          displayName={displayName}
          roleLabel={roleName ? getRoleLabel(roleName, t) : undefined}
          isUploading={avatar.isUploading}
          progress={avatar.progress}
          onFile={avatar.upload}
        />

        <Separator />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">{t('settings.fullName')}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('settings.fullNamePlaceholder')}
              className="md:max-w-sm"
            />
          </div>

          <ContactFields
            form={form}
            setForm={setForm}
            user={user}
            phoneOtp={profile.phoneOtp}
            emailOtp={profile.emailOtp}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <Button
            variant="ghost"
            onClick={profile.handleLogout}
            disabled={profile.isLoggingOut}
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {profile.isLoggingOut ? t('settings.saving') : t('auth.logout')}
          </Button>
          <Button
            onClick={profile.handleSave}
            disabled={profile.isSaving || !user}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {profile.isSaving ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
