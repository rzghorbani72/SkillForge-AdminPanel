'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/i18n/hooks';
import { VoucherFormDialog } from '@/components/vouchers/VoucherFormDialog';
import {
  DiscountCode,
  VoucherFormData,
  DEFAULT_VOUCHER_FORM
} from '@/components/vouchers/voucher-types';

export default function VouchersPage() {
  const { t } = useTranslation();
  const [vouchers, setVouchers] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<DiscountCode | null>(
    null
  );
  const [formData, setFormData] =
    useState<VoucherFormData>(DEFAULT_VOUCHER_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchVouchers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getDiscounts({ search: searchTerm });
      if (response?.data?.discounts) {
        setVouchers(response.data.discounts);
      } else if (response?.discounts) {
        setVouchers(response.discounts);
      } else if (Array.isArray(response?.data)) {
        setVouchers(response.data);
      } else if (Array.isArray(response)) {
        setVouchers(response);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error('Failed to fetch vouchers');
      setVouchers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (!formData.discount_value || formData.discount_value <= 0)
      newErrors.discount_value =
        'Discount value is required and must be greater than 0';
    if (formData.discount_type === 'PERCENT' && formData.discount_value > 100)
      newErrors.discount_value = 'Percent discount cannot exceed 100';
    if (
      formData.usage_type === 'LIMITED' &&
      (!formData.usage_limit || formData.usage_limit < 1)
    )
      newErrors.usage_limit = 'Usage limit is required and must be at least 1';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) <= new Date(formData.start_date)
    )
      newErrors.end_date = 'End date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(DEFAULT_VOUCHER_FORM);
    setErrors({});
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const response = await apiClient.createDiscount({
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      });
      toast.success(response?.message || 'Voucher created successfully');
      setIsCreateOpen(false);
      resetForm();
      fetchVouchers();
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to create voucher');
    }
  };

  const handleUpdate = async () => {
    if (!editingVoucher) return;
    const updateErrors: Record<string, string> = {};
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) <= new Date(formData.start_date)
    )
      updateErrors.end_date = 'End date must be after start date';
    if (Object.keys(updateErrors).length > 0) {
      setErrors(updateErrors);
      toast.error('Please fix the validation errors');
      return;
    }
    try {
      const response = await apiClient.updateDiscount(editingVoucher.id, {
        ...formData,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : undefined,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : undefined
      });
      toast.success(response?.message || 'Voucher updated successfully');
      setEditingVoucher(null);
      resetForm();
      fetchVouchers();
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to update voucher');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('vouchers.confirmDelete'))) return;
    try {
      const response = await apiClient.deleteDiscount(id);
      toast.success(response?.message || 'Voucher deleted successfully');
      fetchVouchers();
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Failed to delete voucher');
    }
  };

  const openEditDialog = (voucher: DiscountCode) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description || '',
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      usage_limit: voucher.usage_limit,
      usage_type: voucher.usage_type,
      start_date: format(new Date(voucher.start_date), "yyyy-MM-dd'T'HH:mm"),
      end_date: format(new Date(voucher.end_date), "yyyy-MM-dd'T'HH:mm"),
      is_active: voucher.is_active,
      min_purchase_amount: voucher.min_purchase_amount,
      max_discount_amount: voucher.max_discount_amount
    });
  };

  const handleFormChange = (patch: Partial<VoucherFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));
  const handleErrorChange = (patch: Record<string, string>) =>
    setErrors((prev) => ({ ...prev, ...patch }));

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isActive = (voucher: DiscountCode) =>
    voucher.is_active && !isExpired(voucher.end_date);

  return (
    <div className="flex-1 space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('vouchers.title')}</h1>
          <p className="text-muted-foreground">{t('vouchers.description')}</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t('vouchers.createVoucher')}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('vouchers.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t('vouchers.loadingVouchers')}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('vouchers.code')}</TableHead>
                <TableHead>{t('vouchers.type')}</TableHead>
                <TableHead>{t('vouchers.value')}</TableHead>
                <TableHead>{t('vouchers.usage')}</TableHead>
                <TableHead>{t('vouchers.startDate')}</TableHead>
                <TableHead>{t('vouchers.endDate')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    {t('vouchers.noVouchersFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-mono font-semibold">
                      {voucher.code}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          voucher.discount_type === 'PERCENT'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {voucher.discount_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {voucher.discount_type === 'PERCENT'
                        ? `${voucher.discount_value}%`
                        : voucher.discount_value}
                    </TableCell>
                    <TableCell>
                      {voucher.usage_limit
                        ? `${voucher.used_count}/${voucher.usage_limit}`
                        : `${voucher.used_count} (${voucher.usage_type})`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(voucher.start_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(voucher.end_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isActive(voucher) ? 'default' : 'destructive'}
                      >
                        {isActive(voucher)
                          ? t('common.active')
                          : isExpired(voucher.end_date)
                            ? t('vouchers.expired')
                            : t('common.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(voucher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(voucher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <VoucherFormDialog
        open={isCreateOpen}
        isEditing={false}
        form={formData}
        errors={errors}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        onChange={handleFormChange}
        onErrorChange={handleErrorChange}
        onSave={handleCreate}
        t={t}
      />

      <VoucherFormDialog
        open={!!editingVoucher}
        isEditing={true}
        form={formData}
        errors={errors}
        onClose={() => {
          setEditingVoucher(null);
          resetForm();
        }}
        onChange={handleFormChange}
        onErrorChange={handleErrorChange}
        onSave={handleUpdate}
        t={t}
      />
    </div>
  );
}
