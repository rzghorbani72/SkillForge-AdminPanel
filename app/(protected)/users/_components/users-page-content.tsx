'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Filter, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { UserCard } from '@/components/users/UserCard';
import { UserFilters } from '@/components/users/UserFilters';

type UserCategory = 'all' | 'students' | 'teachers' | 'managers';

interface User {
  id: number;
  name: string;
  email?: string;
  phone_number: string;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  is_active: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  created_at: string;
  updated_at: string;
  profiles: Array<{
    id: number;
    display_name: string;
    school: {
      id: number;
      name: string;
      private_domain: string;
    };
    role: {
      id: number;
      name: string;
      description: string;
    };
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const CATEGORY_CONFIG: Record<
  UserCategory,
  {
    title: string;
    description: string;
    defaultRole: 'all' | 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    roleLocked: boolean;
    fetcher: (params: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      school_id?: number | null;
    }) => Promise<any>;
  }
> = {
  all: {
    title: 'Users',
    description: 'Manage users with role-based access control',
    defaultRole: 'all',
    roleLocked: false,
    fetcher: (params) =>
      apiClient.getUsers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as any,
        school_id: params.school_id ?? undefined
      })
  },
  students: {
    title: 'Students',
    description: 'Browse all student accounts across your schools',
    defaultRole: 'STUDENT',
    roleLocked: true,
    fetcher: (params) =>
      apiClient.getStudentUsers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as any,
        school_id: params.school_id ?? undefined
      })
  },
  teachers: {
    title: 'Teachers',
    description: 'Manage teachers and their profiles',
    defaultRole: 'TEACHER',
    roleLocked: true,
    fetcher: (params) =>
      apiClient.getTeacherUsers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as any,
        school_id: params.school_id ?? undefined
      })
  },
  managers: {
    title: 'Managers',
    description: 'Review manager accounts and permissions',
    defaultRole: 'MANAGER',
    roleLocked: true,
    fetcher: (params) =>
      apiClient.getManagerUsers({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as any,
        school_id: params.school_id ?? undefined
      })
  }
};

interface UsersPageContentProps {
  category: UserCategory;
}

export function UsersPageContent({ category }: UsersPageContentProps) {
  const searchParams = useSearchParams();
  const categoryConfig = CATEGORY_CONFIG[category];

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<
    'all' | 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER'
  >(categoryConfig.defaultRole);
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED'
  >('all');
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        school_id?: number | null;
      } = {
        page: currentPage,
        limit: pageSize,
        school_id: selectedSchool
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      let data;

      if (!categoryConfig.roleLocked && selectedRole !== 'all') {
        data = await apiClient.getUsers({
          page: params.page,
          limit: params.limit,
          search: params.search,
          status: params.status as any,
          school_id: params.school_id ?? undefined,
          role: selectedRole
        });
      } else {
        data = await categoryConfig.fetcher(params);
      }

      if (data && typeof data === 'object') {
        if ('users' in data) {
          setUsers((data as any).users || []);
          setPagination((data as any).pagination || null);
        } else if (Array.isArray(data)) {
          setUsers(data as any);
          setPagination(null);
        } else {
          setUsers([]);
          setPagination(null);
        }
      } else {
        setUsers([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    categoryConfig,
    currentPage,
    pageSize,
    searchTerm,
    selectedRole,
    selectedStatus,
    selectedSchool
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');
    const schoolParam = searchParams.get('school_id');

    if (
      roleParam &&
      ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT', 'USER'].includes(roleParam) &&
      !categoryConfig.roleLocked
    ) {
      setSelectedRole(roleParam as any);
    }
    if (
      statusParam &&
      ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'].includes(statusParam)
    ) {
      setSelectedStatus(statusParam as any);
    }
    if (schoolParam) {
      setSelectedSchool(parseInt(schoolParam));
    }
  }, [categoryConfig.roleLocked, searchParams]);

  useEffect(() => {
    if (categoryConfig.roleLocked) {
      setSelectedRole(categoryConfig.defaultRole);
    }
  }, [categoryConfig.defaultRole, categoryConfig.roleLocked]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    if (categoryConfig.roleLocked) return;
    setSelectedRole(role as any);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status as any);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title={categoryConfig.title}
        description={categoryConfig.description}
      >
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </PageHeader>

      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedRole={selectedRole}
        onRoleChange={handleRoleFilter}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusFilter}
        roleDisabled={categoryConfig.roleLocked}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {users.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No users found"
              description={
                searchTerm ||
                selectedStatus !== 'all' ||
                (!categoryConfig.roleLocked && selectedRole !== 'all')
                  ? 'Try adjusting your filters.'
                  : 'Get started by adding a new user.'
              }
            />
          </div>
        ) : (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={(item) => console.log('Edit user', item.id)}
              onView={(item) => console.log('View user', item.id)}
            />
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}
    </div>
  );
}
