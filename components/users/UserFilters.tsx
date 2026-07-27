'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT', 'USER'];
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'];

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  roleDisabled?: boolean;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  roleDisabled = false
}: UserFiltersProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('users.searchUsersPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 rounded-lg bg-card ps-8 text-sm"
        />
      </div>
      <Select
        value={selectedRole}
        onValueChange={onRoleChange}
        disabled={roleDisabled}
      >
        <SelectTrigger className="h-8 w-[140px] rounded-lg bg-card text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('users.allRoles')}</SelectItem>
          {ROLE_OPTIONS.map((role) => (
            <SelectItem key={role} value={role}>
              {t(`common.roles.${role}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="h-8 w-[140px] rounded-lg bg-card text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('users.allStatuses')}</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`users.status.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
