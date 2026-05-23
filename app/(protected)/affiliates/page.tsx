'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Network,
  Copy,
  Check,
  MousePointerClick,
  ShoppingCart,
  Wallet,
  Users,
  Search,
  ChevronDown,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Loader2,
  BookOpen,
  Clock,
  CircleCheck,
  XCircle,
  ArrowDownToLine,
  X,
  CalendarDays
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import {
  useCurrentAcademyId,
  useCurrentAcademy
} from '@/hooks/useCurrentAcademy';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

// ─── Types ────────────────────────────────────────────────────────────────────

type Course = { id: number; title: string; price: number };
type Affiliate = {
  id: number;
  code: string;
  affiliate_name: string;
  affiliate_email?: string | null;
  affiliate_phone?: string | null;
  commission_rate: number;
  is_active: boolean;
  clicks: number;
  course_id?: number | null;
  academy_id: number;
  course?: Course | null;
  Usages?: Array<{ commission_amount: number }>;
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  affiliate_name: z.string().min(2, 'Name is required'),
  affiliate_email: z.string().email().optional().or(z.literal('')),
  affiliate_phone: z.string().optional(),
  code: z.string().optional(),
  course_id: z.number().nullable().optional(),
  commission_pct: z.coerce.number().min(1).max(100)
});
type FormValues = z.infer<typeof schema>;

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          color
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

// ─── Live person search picker ───────────────────────────────────────────────
// Calls GET /affiliates/candidates?search=... as user types (debounced).
// Searches ALL registered users, not just the current academy.

type Candidate = {
  id: number;
  display_name: string;
  email: string | null;
  role: string | null;
  academy: string | null;
};

function PersonLivePicker({
  value,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  noPerson
}: {
  value: number | null;
  selected: Candidate | null;
  onChange: (candidate: Candidate | null) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  noPerson: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiClient.searchAffiliateCandidates(query);
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query, open]);

  return (
    <div className="relative space-y-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40',
          open && 'ring-2 ring-primary'
        )}
      >
        {selected ? (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {selected.display_name[0]?.toUpperCase()}
            </div>
            <span className="truncate font-medium">
              {selected.display_name}
            </span>
            {selected.email && (
              <span className="truncate text-xs text-muted-foreground">
                {selected.email}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {searching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {!searching && results.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {query ? noPerson : emptyText}
              </p>
            )}
            {results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent',
                  value === c.id && 'bg-primary/5'
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {c.display_name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.display_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.email ?? c.role ?? ''}
                    {c.academy ? ` · ${c.academy}` : ''}
                  </p>
                </div>
                {value === c.id && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Static course picker ────────────────────────────────────────────────────

function CoursePicker({
  items,
  value,
  onChange,
  allLabel,
  placeholder,
  emptyText
}: {
  items: Array<{ id: number; label: string }>;
  value: number | null;
  onChange: (id: number | null) => void;
  allLabel: string;
  placeholder: string;
  emptyText: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const all = { id: -1, label: allLabel };
  const list = [all, ...items];
  const selected =
    value === null ? all : (list.find((i) => i.id === value) ?? all);
  const filtered = query
    ? list.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : list;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40',
          open && 'ring-2 ring-primary'
        )}
      >
        <span className={selected.id === -1 ? 'text-muted-foreground' : ''}>
          {selected.label}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id === -1 ? null : item.id);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent',
                    value === item.id && 'bg-primary/5'
                  )}
                >
                  {(value === item.id ||
                    (item.id === -1 && value === null)) && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                  {!(
                    value === item.id ||
                    (item.id === -1 && value === null)
                  ) && <div className="h-3.5 w-3.5 shrink-0" />}
                  <span
                    className={item.id === -1 ? 'text-muted-foreground' : ''}
                  >
                    {item.label}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      title={label}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? 'Copied' : label}
    </button>
  );
}

// ─── Affiliate card ───────────────────────────────────────────────────────────

function AffiliateCard({
  aff,
  onEdit,
  onToggle,
  baseUrl,
  formatCurrency,
  t,
  dateFrom,
  dateTo
}: {
  aff: Affiliate;
  onEdit: () => void;
  onToggle: () => void;
  baseUrl: string;
  formatCurrency: (n: number) => string;
  t: (k: string) => string;
  dateFrom: string;
  dateTo: string;
}) {
  const allUsages = aff.Usages ?? [];
  const filteredUsages = allUsages.filter((u: any) => {
    if (!u.created_at) return true;
    const d = new Date(u.created_at);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const periodEarned = filteredUsages.reduce(
    (s: number, u: any) => s + u.commission_amount,
    0
  );
  const totalEarned = allUsages.reduce(
    (s: number, u: any) => s + u.commission_amount,
    0
  );
  const conversions = filteredUsages.length;
  const commPct = Math.round((aff.commission_rate ?? 0) * 100);
  const refUrl = `${baseUrl}?ref=${aff.code}`;
  const isPeriodFiltered = !!(dateFrom || dateTo);

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
        !aff.is_active && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {(aff.affiliate_name?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{aff.affiliate_name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {aff.affiliate_email ?? aff.affiliate_phone ?? ''}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={t('affiliates.editAffiliate')}
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={
              aff.is_active ? t('affiliates.inactive') : t('affiliates.active')
            }
            onClick={onToggle}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent"
          >
            {aff.is_active ? (
              <ToggleRight className="h-5 w-5 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Code + scope */}
      <div className="mx-4 mb-3 flex flex-wrap items-center gap-2">
        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-medium">
          {aff.code}
        </code>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            commPct >= 30
              ? 'border-emerald-300 text-emerald-700'
              : commPct >= 15
                ? 'border-amber-300 text-amber-700'
                : 'border-muted-foreground/30 text-muted-foreground'
          )}
        >
          {commPct}%
        </Badge>
        {aff.course ? (
          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
            <BookOpen className="h-3 w-3" />
            {aff.course.title}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {t('affiliates.allCoursesOption')}
          </span>
        )}
      </div>

      {/* Referral link */}
      <div className="mx-4 mb-3 flex items-center justify-between rounded-md border bg-muted/30 px-2 py-1.5">
        <span className="truncate font-mono text-xs text-muted-foreground">
          {refUrl}
        </span>
        <CopyButton text={refUrl} label={t('affiliates.copyLink')} />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{aff.clicks}</span>
            <span className="text-xs">{t('affiliates.clicks')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{conversions}</span>
            <span className="text-xs">{t('affiliates.conversions')}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {isPeriodFiltered ? (
            <>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {formatCurrency(periodEarned)}
                <span className="ms-1 text-emerald-500">period</span>
              </span>
              {totalEarned !== periodEarned && (
                <span className="mt-0.5 text-xs text-muted-foreground">
                  {formatCurrency(totalEarned)} total
                </span>
              )}
            </>
          ) : totalEarned > 0 ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {formatCurrency(totalEarned)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Withdrawal status badge ──────────────────────────────────────────────────

const W_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700'
};

function WBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-3 w-3" />,
    APPROVED: <CircleCheck className="h-3 w-3" />,
    PAID: <CircleCheck className="h-3 w-3" />,
    REJECTED: <XCircle className="h-3 w-3" />
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        W_STYLE[status] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {icons[status]}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Withdrawals section (admin view) ─────────────────────────────────────────

function WithdrawalsSection({
  formatCurrency
}: {
  formatCurrency: (n: number) => string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAffiliateWithdrawals();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function act(id: number, status: string) {
    setProcessing(id);
    try {
      await apiClient.processAffiliateWithdrawal(id, status);
      toast.success(`Marked as ${status.toLowerCase()}`);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    } finally {
      setProcessing(null);
    }
  }

  if (loading) return null;
  if (items.length === 0) return null;

  const pending = items.filter((w) => w.status === 'PENDING');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ArrowDownToLine className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Withdrawal Requests</h2>
        {pending.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {pending.length} pending
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Affiliate</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Requested</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((w) => (
              <tr key={w.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {w.AffiliateLink?.affiliate_name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {w.AffiliateLink?.code}
                  </p>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {formatCurrency(w.amount)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(w.requested_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <WBadge status={w.status} />
                </td>
                <td className="px-4 py-3">
                  {w.status === 'PENDING' && (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'APPROVED')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'REJECTED')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {w.status === 'APPROVED' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={processing === w.id}
                        onClick={() => act(w.id, 'PAID')}
                        className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        Mark Paid
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Add Affiliate dialog (single form: name + phone + password + commission) ─

const addAffiliateSchema = z.object({
  affiliate_name: z.string().min(2, 'Name required'),
  phone: z.string().min(7, 'Phone required'),
  password: z.string().min(6, 'Min 6 characters').optional().or(z.literal('')),
  commission_pct: z.coerce.number().min(1).max(100)
});
type AddAffiliateForm = z.infer<typeof addAffiliateSchema>;

function AddAffiliateDialog({
  open,
  onClose,
  onAdded,
  t,
  isRTL
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  t: (k: string) => string;
  isRTL: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [foundUser, setFoundUser] = useState<{ name: string } | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const form = useForm<AddAffiliateForm>({
    resolver: zodResolver(addAffiliateSchema),
    defaultValues: {
      affiliate_name: '',
      phone: '',
      password: '',
      commission_pct: 20
    }
  });

  // Debounced phone lookup
  const phoneValue = form.watch('phone');
  useEffect(() => {
    const phone = phoneValue?.trim();
    if (!phone || phone.length < 7) {
      setFoundUser(null);
      return;
    }
    const id = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const result = await apiClient.checkAffiliatePhone(phone);
        if (result.exists && result.name) {
          setFoundUser({ name: result.name });
          form.setValue('affiliate_name', result.name);
        } else {
          setFoundUser(null);
        }
      } catch {
        setFoundUser(null);
      } finally {
        setCheckingPhone(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [phoneValue]);

  function handleClose() {
    form.reset();
    setFoundUser(null);
    onClose();
  }

  async function submit(values: AddAffiliateForm) {
    if (!foundUser && !values.password) {
      form.setError('password', {
        message: 'Password is required for new accounts'
      });
      return;
    }
    setSaving(true);
    try {
      const result = await apiClient.createAffiliateAccount({
        affiliate_name: values.affiliate_name,
        phone: values.phone,
        ...(values.password ? { password: values.password } : {}),
        commission_rate: values.commission_pct / 100
      });
      const code = (result as any)?.code ?? '';
      toast.success(
        foundUser
          ? `Affiliate role added to ${foundUser.name}! Ref code: ${code}.`
          : `Affiliate created! Ref code: ${code}. Share phone + password with them.`
      );
      form.reset();
      setFoundUser(null);
      onAdded();
      handleClose();
    } catch (e: any) {
      toast.error(e?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('affiliates.newAffiliate')}</DialogTitle>
          <DialogDescription>
            {foundUser
              ? `Existing user found — will add affiliate role to them.`
              : `Creates a new platform account. A unique referral code is auto-generated.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="tel"
                        dir="ltr"
                        placeholder="+98912..."
                        {...field}
                      />
                      {checkingPhone && (
                        <Loader2 className="absolute end-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  {foundUser && (
                    <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                      <CircleCheck className="h-4 w-4 shrink-0" />
                      <span>
                        Found: <strong>{foundUser.name}</strong> — will add
                        affiliate role
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="affiliate_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ali Rezaei" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!foundUser && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Min 6 characters"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      You set this and share it with them.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="commission_pct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('affiliates.commissionPercent')}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={50}
                        step={1}
                        aria-label={t('affiliates.commissionPercent')}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <div className="flex w-20 items-center overflow-hidden rounded-md border">
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                          className="border-0 pe-0 text-center focus-visible:ring-0"
                        />
                        <span className="pe-2 text-sm text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {t('affiliates.commissionHelp')}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saving || checkingPhone}>
                {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {foundUser
                  ? 'Add Affiliate Role'
                  : t('affiliates.newAffiliate')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AffiliatesPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const formatCurrency = useFormatCurrency();
  const academyId = useCurrentAcademyId();
  const academy = useCurrentAcademy();

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addAffiliateOpen, setAddAffiliateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Affiliate | null>(null);
  const [saving, setSaving] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      affiliate_name: '',
      affiliate_email: '',
      affiliate_phone: '',
      code: '',
      course_id: null,
      commission_pct: 20
    }
  });

  // ── Data loaders ──────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAffiliates();
      setAffiliates(
        Array.isArray(data) ? data : (data?.affiliates ?? data?.data ?? [])
      );
    } catch {
      toast.error('Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  }, []); // stable — no deps that change on render

  useEffect(() => {
    load();
  }, []); // run once on mount

  useEffect(() => {
    if (!academyId) return;
    let cancelled = false;
    apiClient
      .getCourses({ limit: 200 })
      .then((d: any) => {
        if (!cancelled) {
          const list = Array.isArray(d) ? d : (d?.courses ?? d?.data ?? []);
          setCourses(list);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [academyId]);

  // ── Computed overview stats ───────────────────────────────────────────────

  const stats = useMemo(
    () => ({
      total: affiliates.length,
      clicks: affiliates.reduce((s, a) => s + (a.clicks ?? 0), 0),
      conversions: affiliates.reduce((s, a) => s + (a.Usages?.length ?? 0), 0),
      earned: affiliates.reduce(
        (s, a) =>
          s + (a.Usages?.reduce((x, u) => x + u.commission_amount, 0) ?? 0),
        0
      )
    }),
    [affiliates]
  );

  // ── Dialog helpers ────────────────────────────────────────────────────────

  function openEdit(aff: Affiliate) {
    setEditTarget(aff);
    form.reset({
      affiliate_name: aff.affiliate_name,
      affiliate_email: aff.affiliate_email ?? '',
      affiliate_phone: aff.affiliate_phone ?? '',
      code: aff.code,
      course_id: aff.course_id ?? null,
      commission_pct: Math.round((aff.commission_rate ?? 0.2) * 100)
    });
  }

  async function onSubmit(values: FormValues) {
    if (!editTarget) return;
    setSaving(true);
    try {
      await apiClient.updateAffiliate(editTarget.id, {
        affiliate_name: values.affiliate_name,
        affiliate_email: values.affiliate_email || undefined,
        affiliate_phone: values.affiliate_phone || undefined,
        commission_rate: values.commission_pct / 100
      });
      toast.success(t('common.success'));
      setEditTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(aff: Affiliate) {
    try {
      await apiClient.updateAffiliate(aff.id, { is_active: !aff.is_active });
      load();
    } catch {
      toast.error(t('common.error'));
    }
  }

  const baseUrl = academy
    ? (academy as any).domain?.public_address
      ? `https://${(academy as any).domain.public_address}`
      : `https://${(academy as any).slug}.skillforge.com`
    : 'https://skillforge.com';

  return (
    <div className="flex-1 space-y-8 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('affiliates.title')}
          </h1>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            {t('affiliates.description')}
          </p>
        </div>
        {academyId && (
          <Button
            onClick={() => setAddAffiliateOpen(true)}
            className="shrink-0"
          >
            <Plus className="me-2 h-4 w-4" />
            {t('affiliates.newAffiliate')}
          </Button>
        )}
      </div>

      {/* No academy */}
      {!academyId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Select an academy to manage its affiliate program.
        </div>
      )}

      {/* Overview stats */}
      {affiliates.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5 text-violet-600" />}
            label={t('affiliates.totalAffiliates')}
            value={stats.total}
            color="bg-violet-100"
          />
          <StatCard
            icon={<MousePointerClick className="h-5 w-5 text-blue-600" />}
            label={t('affiliates.totalClicks')}
            value={stats.clicks}
            color="bg-blue-100"
          />
          <StatCard
            icon={<ShoppingCart className="h-5 w-5 text-amber-600" />}
            label={t('affiliates.totalConversions')}
            value={stats.conversions}
            color="bg-amber-100"
          />
          <StatCard
            icon={<Wallet className="h-5 w-5 text-emerald-600" />}
            label={t('affiliates.totalEarned')}
            value={formatCurrency(stats.earned)}
            color="bg-emerald-100"
          />
        </div>
      )}

      {/* Date range filter */}
      {affiliates.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Earnings period:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="From date"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="To date"
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border bg-muted"
            />
          ))}
        </div>
      ) : affiliates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Network className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">
            {t('affiliates.noAffiliates')}
          </h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('affiliates.noAffiliatesDesc')}
          </p>
          {academyId && (
            <Button className="mt-6" onClick={() => setAddAffiliateOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              {t('affiliates.newAffiliate')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {affiliates.map((aff) => (
            <AffiliateCard
              key={aff.id}
              aff={aff}
              onEdit={() => openEdit(aff)}
              onToggle={() => toggleActive(aff)}
              baseUrl={baseUrl}
              formatCurrency={formatCurrency}
              t={t}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          ))}
        </div>
      )}

      {/* Withdrawal requests */}
      {academyId && <WithdrawalsSection formatCurrency={formatCurrency} />}

      {/* Edit commission dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null);
        }}
      >
        <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('affiliates.editAffiliate')}</DialogTitle>
            <DialogDescription>{editTarget?.affiliate_name}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="commission_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('affiliates.commissionPercent')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={50}
                          step={1}
                          aria-label={t('affiliates.commissionPercent')}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="flex-1 accent-primary"
                        />
                        <div className="flex w-20 items-center overflow-hidden rounded-md border">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            {...field}
                            className="border-0 pe-0 text-center focus-visible:ring-0"
                          />
                          <span className="pe-2 text-sm text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditTarget(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t('affiliates.saveAffiliate')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AddAffiliateDialog
        open={addAffiliateOpen}
        onClose={() => setAddAffiliateOpen(false)}
        onAdded={load}
        t={t}
        isRTL={isRTL}
      />
    </div>
  );
}
