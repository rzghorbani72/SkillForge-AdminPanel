'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuthUser } from '@/components/providers/user-provider';
import { signOut } from '@/lib/sign-out';
import {
  Banknote,
  Building2,
  ChevronDown,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatIdentifierDisplay } from '@/lib/phone-utils';

const SETTLEMENT_ROLES = ['PLATFORM_OWNER', 'ADMIN', 'MANAGER'];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatLastLogin(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function UserNav() {
  const { user } = useAuthUser();
  const router = useRouter();
  const { t, language } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const email = user?.email ?? '';
  const phone = user?.phone ?? '';
  const roleName = user?.role ?? '';
  const canSeeSettlement = SETTLEMENT_ROLES.includes(roleName);
  const roleLabel = roleName ? t(`userNav.roles.${roleName}`) || roleName : '';
  const lastLogin = user?.lastLogin ?? null;
  const currentAcademy = user?.currentAcademy ?? null;
  const headingName = user?.displayName ?? '';
  const initials = headingName
    ? getInitials(headingName)
    : (roleName?.[0]?.toUpperCase() ?? 'U');

  async function handleLogout() {
    setIsLoggingOut(true);
    await signOut();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-xl px-2 py-1.5',
            'text-sm transition-colors hover:bg-muted',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
          )}
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name + role — hidden on mobile */}
          <div className="hidden flex-col items-start sm:flex">
            <span className="font-medium leading-tight text-foreground">
              {headingName}
            </span>
          </div>

          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      {/* Narrow enough to sit flush under the trigger instead of overhanging
          it — the trigger already shows the avatar, so it is not repeated. */}
      <DropdownMenuContent
        className="w-44 bg-popover p-2"
        align="start"
        sideOffset={8}
        forceMount
      >
        {/* User info header */}
        <DropdownMenuLabel className="p-3 font-normal">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="truncate text-sm font-semibold leading-none text-foreground">
              {headingName || roleLabel}
            </p>
            <p className="truncate text-start text-xs leading-none text-muted-foreground">
              {email || formatIdentifierDisplay(phone, language)}
            </p>
            {roleLabel && (
              <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium leading-none text-primary">
                {roleLabel}
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2.5 py-2"
          onClick={() => router.push('/settings/profile')}
        >
          <User className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{t('userNav.profile')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2.5 py-2"
          onClick={() => router.push('/settings')}
        >
          <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{t('userNav.settings')}</span>
        </DropdownMenuItem>

        {canSeeSettlement && (
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 py-2"
            onClick={() => router.push('/financial/academy/settlement')}
          >
            <Banknote className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{t('userNav.settlement')}</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2.5 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>
            {isLoggingOut ? t('userNav.loggingOut') : t('userNav.logout')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
