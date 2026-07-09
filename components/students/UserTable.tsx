'use client';

import {
  CheckCircle,
  ExternalLink,
  Mail,
  Phone,
  Users,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { User } from '@/types/api';

interface Props {
  users: User[];
  emptyMessage: string;
  t: (key: string) => string;
  showWorkspace?: boolean;
}

export function UserTable({ users, emptyMessage, t, showWorkspace }: Props) {
  if (users.length === 0) {
    return (
      <div className="py-8 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">
          {t('students.noUsersFound')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">
              {t('students.studentName')}
            </TableHead>
            <TableHead className="text-center">{t('students.email')}</TableHead>
            <TableHead className="text-center">{t('students.phone')}</TableHead>
            <TableHead className="text-center">{t('common.status')}</TableHead>
            {showWorkspace && (
              <TableHead className="text-center">
                {t('learningOperations.workspace')}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {user.email ? (
                    <>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                      {user.email_confirmed ? (
                        <span title="Email verified">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </span>
                      ) : (
                        <span title="Email not verified">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm" dir="rtl">
                    {user.phone_number}
                  </span>
                  {user.phone_confirmed ? (
                    <span title="Phone verified">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </span>
                  ) : (
                    <span title="Phone not verified">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>
              </TableCell>
              {showWorkspace && (
                <TableCell className="text-center">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/students/${user.id}`}>
                      {t('learningOperations.openWorkspace')}
                      <ExternalLink className="ms-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
