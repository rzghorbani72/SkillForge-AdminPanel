'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { Loader2 } from 'lucide-react';
import { User } from '@/types/api';

interface ChangeUserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  currentRole: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER' | null;
  onSuccess?: () => void;
}

export function ChangeUserRoleDialog({
  open,
  onOpenChange,
  user,
  currentRole,
  onSuccess
}: ChangeUserRoleDialogProps) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'MANAGER'>(
    'TEACHER'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      await apiClient.changeUserRole(user.id, selectedRole);
      ErrorHandler.showSuccess(
        t('changeUserRole.userRoleChangedSuccess', { role: selectedRole })
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const userProfile = user.profiles?.[0];
  const isStudent = userProfile?.role?.name === 'STUDENT';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('changeUserRole.title')}</DialogTitle>
          <DialogDescription>
            {isStudent
              ? t('changeUserRole.description')
              : t('changeUserRole.onlyStudentsCanChange')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('changeUserRole.currentRole')}</Label>
            <div className="text-sm text-muted-foreground">
              {userProfile?.role?.name || t('changeUserRole.noRole')}
            </div>
          </div>

          {isStudent && (
            <div className="space-y-2">
              <Label htmlFor="role">{t('changeUserRole.newRole')} *</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as 'TEACHER' | 'MANAGER')
                }
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">
                    {t('changeUserRole.teacher')}
                  </SelectItem>
                  <SelectItem value="MANAGER">
                    {t('changeUserRole.manager')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isStudent && (
            <div className="text-sm text-muted-foreground">
              {t('changeUserRole.onlyStudentsCanChange')}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !isStudent}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('changeUserRole.changeRole')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
