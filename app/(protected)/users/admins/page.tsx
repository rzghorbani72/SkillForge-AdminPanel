'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Shield,
  MoreVertical,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api';
import { User } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { CreateAdminUserDialog } from '../_components/create-admin-user-dialog';
import { useAuthUser } from '@/hooks/useAuthUser';
import { toast } from 'react-toastify';

type UserStatus = 'all' | 'ACTIVE' | 'INACTIVE';

export default function AdminsPage() {
  const { t, language } = useTranslation();
  const { user: currentUser } = useAuthUser();
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    id: number;
    created_at: string;
    role: string;
  } | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const STATUS_OPTIONS: Array<{ label: string; value: UserStatus }> = [
    { label: t('admins.allStatuses'), value: 'all' },
    { label: t('common.active'), value: 'ACTIVE' },
    { label: t('common.inactive'), value: 'INACTIVE' }
  ];

  // Fetch current user profile to get created_at for permission checks
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        const userData = await apiClient.getCurrentUser();
        if (userData && (userData as any)?.data?.id) {
          // Fetch full profile to get created_at
          const profileResponse = await apiClient.getUsers({
            role: 'ADMIN',
            filter: 'none'
          });
          const profiles = (profileResponse as any)?.profiles || [];
          const currentProfile = profiles.find(
            (p: any) => p.id === (userData as any).data.id
          );
          if (currentProfile) {
            setCurrentUserProfile({
              id: currentProfile.id,
              created_at: currentProfile.created_at,
              role: currentProfile.role?.name || 'ADMIN'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
    };

    if (currentUser?.role === 'ADMIN') {
      fetchCurrentUserProfile();
    }
  }, [currentUser]);

  // Check if current admin can modify target admin based on creation timestamp
  const canModifyAdmin = (targetAdmin: User): boolean => {
    if (!currentUserProfile || currentUserProfile.role !== 'ADMIN') {
      return false;
    }

    // Cannot modify self
    if (targetAdmin.id === currentUserProfile.id) {
      return false;
    }

    // Can modify if current admin was created before target admin
    const currentCreatedAt = new Date(currentUserProfile.created_at);
    const targetCreatedAt = new Date(targetAdmin.created_at);
    return currentCreatedAt < targetCreatedAt;
  };

  const handleStatusChange = async (adminId: number, newStatus: boolean) => {
    try {
      setUpdatingStatus(adminId);
      await apiClient.updateUser(adminId, { is_active: newStatus });
      toast.success(
        newStatus
          ? t('admins.statusUpdatedToActive')
          : t('admins.statusUpdatedToInactive')
      );
      await fetchAdmins();
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('admins.failedToUpdateStatus');
      toast.error(errorMessage);
      ErrorHandler.handleApiError(error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const fetchAdmins = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await apiClient.getUsers({
        role: 'ADMIN',
        search: searchTerm || undefined,
        is_active:
          statusFilter !== 'all' ? statusFilter === 'ACTIVE' : undefined,
        filter: 'none',
        page: pagination.page,
        limit: pagination.limit
      });

      const payload = response as any;

      if (payload?.profiles) {
        // Transform profiles to user format
        const transformedUsers = payload.profiles.map((profile: any) => ({
          id: profile.id,
          display_name: profile.display_name,
          email: profile.email,
          phone_number: profile.phone_number,
          email_confirmed: profile.email_confirmed,
          phone_confirmed: profile.phone_confirmed,
          is_active: profile.is_active,
          status: profile.is_active ? 'ACTIVE' : 'INACTIVE',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          profiles: [
            {
              id: profile.id,
              display_name: profile.display_name,
              role: profile.role,
              store: profile.store
            }
          ]
        }));

        setAdmins(transformedUsers);
        setPagination((prev) => ({
          ...prev,
          total: payload.pagination?.total || 0,
          totalPages: payload.pagination?.totalPages || 0,
          hasNextPage: payload.pagination?.hasNextPage || false,
          hasPreviousPage: payload.pagination?.hasPreviousPage || false
        }));
      } else if (Array.isArray(payload)) {
        setAdmins(payload);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  };

  if (isLoading && admins.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Shield className="h-8 w-8" />
            {t('admins.title')}
          </h1>
          <p className="text-muted-foreground">{t('admins.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateAdminDialog(true)}>
            <Plus className="me-2 h-4 w-4" />
            {t('admins.addAdminUser')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('admins.searchAdminsPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="ps-8"
            autoComplete="off"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as UserStatus);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('common.filter')} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admins.administrators')}</CardTitle>
          <CardDescription>
            {pagination.total === 1
              ? t('admins.adminFound', { count: pagination.total })
              : t('admins.adminsFound', { count: pagination.total })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">
                {t('admins.noAdminsFound')}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? t('admins.tryAdjustingFilters')
                  : t('admins.getStartedByAdding')}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">
                      {t('admins.name')}
                    </TableHead>
                    <TableHead className="text-center">
                      {t('admins.email')}
                    </TableHead>
                    <TableHead className="text-center">
                      {t('admins.phone')}
                    </TableHead>
                    <TableHead className="text-center">
                      {t('admins.status')}
                    </TableHead>
                    <TableHead className="text-center">
                      {t('admins.created')}
                    </TableHead>
                    {currentUserProfile?.role === 'ADMIN' && (
                      <TableHead className="text-center">
                        {t('common.actions')}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => {
                    const canModify = canModifyAdmin(admin);
                    return (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center justify-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(admin.display_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {admin.display_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {admin.email ? (
                              <>
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{admin.email}</span>
                                {admin.email_confirmed ? (
                                  <span title={t('admins.emailVerified')}>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </span>
                                ) : (
                                  <span title={t('admins.emailNotVerified')}>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                -
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm" dir="ltr">
                              {admin.phone_number}
                            </span>
                            {admin.phone_confirmed ? (
                              <span title={t('admins.phoneVerified')}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </span>
                            ) : (
                              <span title={t('admins.phoneNotVerified')}>
                                <XCircle className="h-4 w-4 text-red-600" />
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Badge
                              variant={
                                admin.is_active ? 'default' : 'destructive'
                              }
                            >
                              {admin.is_active
                                ? t('common.active')
                                : t('common.inactive')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-muted-foreground">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        {currentUserProfile?.role === 'ADMIN' && (
                          <TableCell className="text-center">
                            {canModify ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={updatingStatus === admin.id}
                                  >
                                    {updatingStatus === admin.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MoreVertical className="h-4 w-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(admin.id, true)
                                    }
                                    disabled={
                                      admin.is_active ||
                                      updatingStatus === admin.id
                                    }
                                  >
                                    <CheckCircle className="me-2 h-4 w-4" />
                                    {t('common.activate')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(admin.id, false)
                                    }
                                    disabled={
                                      !admin.is_active ||
                                      updatingStatus === admin.id
                                    }
                                  >
                                    <XCircle className="me-2 h-4 w-4" />
                                    {t('common.deactivate')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {admin.id === currentUserProfile.id
                                  ? t('admins.cannotModifyYourself')
                                  : t('admins.cannotModifyOlderAdmin')}
                              </span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('admins.page')} {pagination.page} {t('admins.of')}{' '}
                {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  {t('admins.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  {t('admins.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAdminUserDialog
        open={showCreateAdminDialog}
        onOpenChange={setShowCreateAdminDialog}
        onSuccess={() => {
          fetchAdmins();
        }}
      />
    </div>
  );
}
