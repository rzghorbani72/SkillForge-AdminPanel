import { User, UserStatus } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Edit,
  Eye,
  EyeOff,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  School,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { getRoleColor, getStatusColor } from '@/components/shared/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
}

export function UserCard({ user, onEdit, onView }: UserCardProps) {
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine user status - use status field if available, otherwise derive from is_active
  const userStatus: UserStatus =
    user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE');

  // Get profiles safely
  const profiles = user.profiles || [];

  // Get first profile avatar if available
  const avatarUrl = profiles[0]?.avatar?.url;

  return (
    <Card className="relative transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-primary/10 font-medium text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                {user.name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                {profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <Badge
                      key={profile.id}
                      variant="secondary"
                      className={`text-xs ${getRoleColor(profile.role.name)}`}
                    >
                      {profile.role.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">
                    No Role
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  {userStatus === 'ACTIVE' ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : userStatus === 'SUSPENDED' ? (
                    <EyeOff className="h-4 w-4 text-yellow-500" />
                  ) : userStatus === 'BANNED' ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userStatus}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5 text-sm text-muted-foreground">
          {user.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.email}</span>
              {user.email_confirmed && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{user.phone_number}</span>
            {user.phone_confirmed && (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          {profiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <School className="h-4 w-4 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {profiles.map((profile) => (
                  <span
                    key={profile.id}
                    className="rounded bg-muted px-2 py-0.5 text-xs"
                  >
                    {profile.store.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge
            variant="outline"
            className={`${getStatusColor(userStatus)} font-medium`}
          >
            {userStatus}
          </Badge>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit User</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(user)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
