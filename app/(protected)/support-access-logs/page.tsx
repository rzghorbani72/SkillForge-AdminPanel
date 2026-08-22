'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useStore } from '@/hooks/useStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type LogRow = {
  id: string;
  actor_user_id: string;
  actor_profile_id: string | null;
  academy_id: string;
  method: string;
  path: string;
  created_at: string;
};

const PAGE_SIZE = 50;

export default function SupportAccessLogsPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuthUser();
  const { academies } = useStore();

  const isAdmin =
    (user as any)?.isAdminProfile || (user as any)?.role === 'ADMIN';

  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [academyId, setAcademyId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Separation of duties: only ADMIN may review the access trail (not SUPPORT,
  // even though it is platform-level).
  useEffect(() => {
    if (!userLoading && !isAdmin) router.replace('/platform');
  }, [userLoading, isAdmin, router]);

  const academyName = useCallback(
    (id: string) => academies.find((a) => String(a.id) === id)?.name ?? id,
    [academies]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getSupportAccessLogs({
        page,
        limit: PAGE_SIZE,
        academy_id: academyId || undefined
      });
      setRows(res.data);
      setTotal(res.total);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, academyId]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const academyOptions = useMemo(
    () => [...academies].sort((a, b) => a.name.localeCompare(b.name)),
    [academies]
  );

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Support Access Logs</h1>
          <p className="text-sm text-muted-foreground">
            Cross-tenant academy access by support staff
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access trail</CardTitle>
          <CardDescription>
            {total} record{total === 1 ? '' : 's'}
          </CardDescription>
          <div className="pt-2">
            <select
              value={academyId}
              onChange={(e) => {
                setPage(1);
                setAcademyId(e.target.value);
              }}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All academies</option>
              {academyOptions.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="py-2 pe-4 text-start font-medium">Time</th>
                  <th className="py-2 pe-4 text-start font-medium">Academy</th>
                  <th className="py-2 pe-4 text-start font-medium">
                    Support agent
                  </th>
                  <th className="py-2 pe-4 text-start font-medium">Method</th>
                  <th className="py-2 text-start font-medium">Path</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No access records
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="whitespace-nowrap py-2 pe-4">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 pe-4">{academyName(r.academy_id)}</td>
                      <td className="py-2 pe-4 font-mono text-xs">
                        {r.actor_user_id}
                      </td>
                      <td className="py-2 pe-4">{r.method}</td>
                      <td className="py-2 font-mono text-xs">{r.path}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
