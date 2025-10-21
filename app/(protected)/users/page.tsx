'use client';

import { useState, useEffect } from 'react';
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

interface User {
  id: number;
  name: string;
  email?: string;
  phone_number: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  created_at: string;
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

export default function UsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<
    'all' | 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED'
  >('all');
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: pageSize
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedRole !== 'all') params.role = selectedRole;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedSchool) params.school_id = selectedSchool;

      const response = await apiClient.getUsers(params);

      if (response && typeof response === 'object' && 'users' in response) {
        setUsers((response as any).users);
        setPagination((response as any).pagination);
      } else if (Array.isArray(response)) {
        setUsers(response);
        setPagination(null);
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
  };

  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    pageSize,
    searchTerm,
    selectedRole,
    selectedStatus,
    selectedSchool
  ]);

  // Handle URL parameters for filtering
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');
    const schoolParam = searchParams.get('school_id');

    if (
      roleParam &&
      ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT', 'USER'].includes(roleParam)
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
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRoleFilter = (role: string) => {
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

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  console.log('Users data state:', {
    users: users,
    pagination: pagination,
    searchTerm: searchTerm,
    selectedRole: selectedRole,
    selectedStatus: selectedStatus,
    currentPage: currentPage,
    pageSize: pageSize
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Users"
        description="Manage users with role-based access control"
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
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No users found"
              description={
                searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
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
              onEdit={(user) => console.log('Edit user', user.id)}
              onView={(user) => console.log('View user', user.id)}
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
