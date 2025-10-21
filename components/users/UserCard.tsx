import { User } from '@/types/api';
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
  School
} from 'lucide-react';
import { getRoleColor, getStatusColor } from '@/components/shared/utils';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
}

export function UserCard({ user, onEdit, onView }: UserCardProps) {
  return (
    <Card key={user.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <div className="mt-1 flex items-center space-x-2">
                {user.profiles.map((profile) => (
                  <Badge
                    key={profile.id}
                    variant="secondary"
                    className={getRoleColor(profile.role.name)}
                  >
                    {profile.role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {user.status === 'ACTIVE' ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          {user.email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>{user.phone_number}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          {user.profiles.map((profile) => (
            <div key={profile.id} className="flex items-center space-x-2">
              <School className="h-4 w-4" />
              <span>{profile.school.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline" className={getStatusColor(user.status)}>
            {user.status}
          </Badge>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onView(user)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
