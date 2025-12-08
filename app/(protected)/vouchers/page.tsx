'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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

interface DiscountCode {
  id: number;
  code: string;
  description?: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  store_id?: number;
  usage_limit?: number;
  used_count: number;
  usage_type: 'ONE_TIME' | 'LIMITED' | 'UNLIMITED' | 'USER_SPECIFIC';
  start_date: string;
  end_date: string;
  is_active: boolean;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  created_at: string;
  updated_at: string;
}

export default function VouchersPage() {
  const { t, language } = useTranslation();
  const [vouchers, setVouchers] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<DiscountCode | null>(
    null
  );
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENT' as 'PERCENT' | 'FIXED',
    discount_value: 0,
    usage_limit: undefined as number | undefined,
    usage_type: 'UNLIMITED' as
      | 'ONE_TIME'
      | 'LIMITED'
      | 'UNLIMITED'
      | 'USER_SPECIFIC',
    start_date: '',
    end_date: '',
    is_active: true,
    min_purchase_amount: undefined as number | undefined,
    max_discount_amount: undefined as number | undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchVouchers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getDiscounts({ search: searchTerm });

      // Handle different response structures
      if (response?.data?.discounts) {
        // Response from backend: { message, status, data: { discounts, pagination } }
        setVouchers(response.data.discounts);
      } else if (response?.discounts) {
        // Direct discounts array in response
        setVouchers(response.discounts);
      } else if (Array.isArray(response?.data)) {
        // Array directly in data
        setVouchers(response.data);
      } else if (Array.isArray(response)) {
        // Response is directly an array
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
      setIsCreateDialogOpen(false);
      resetForm();
      fetchVouchers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create voucher');
    }
  };

  const handleUpdate = async () => {
    if (!editingVoucher) return;

    const updateErrors: Record<string, string> = {};
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        updateErrors.end_date = 'End date must be after start date';
      }
    }

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
      setIsEditDialogOpen(false);
      setEditingVoucher(null);
      resetForm();
      fetchVouchers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update voucher');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('vouchers.confirmDelete'))) return;
    try {
      const response = await apiClient.deleteDiscount(id);
      toast.success(response?.message || 'Voucher deleted successfully');
      fetchVouchers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete voucher');
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
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'PERCENT',
      discount_value: 0,
      usage_limit: undefined,
      usage_type: 'UNLIMITED',
      start_date: '',
      end_date: '',
      is_active: true,
      min_purchase_amount: undefined,
      max_discount_amount: undefined
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (!formData.discount_value || formData.discount_value <= 0) {
      newErrors.discount_value =
        'Discount value is required and must be greater than 0';
    }

    if (formData.discount_type === 'PERCENT' && formData.discount_value > 100) {
      newErrors.discount_value = 'Percent discount cannot exceed 100';
    }

    if (
      formData.usage_type === 'LIMITED' &&
      (!formData.usage_limit || formData.usage_limit < 1)
    ) {
      newErrors.usage_limit = 'Usage limit is required and must be at least 1';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isActive = (voucher: DiscountCode) =>
    voucher.is_active && !isExpired(voucher.end_date);

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('vouchers.title')}</h1>
          <p className="text-muted-foreground">{t('vouchers.description')}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
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
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('vouchers.createDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('vouchers.createDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase()
                  })
                }
                placeholder="SUMMER2024"
                required
                className="uppercase placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Summer sale discount"
                className="placeholder:text-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type *</Label>
                <select
                  value={formData.discount_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_type: e.target.value as 'PERCENT' | 'FIXED'
                    })
                  }
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="PERCENT">Percent</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  value={formData.discount_value || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_value: Number(e.target.value) || 0
                    })
                  }
                  placeholder={
                    formData.discount_type === 'PERCENT' ? '20' : '1000'
                  }
                  required
                  min={formData.discount_type === 'PERCENT' ? 0 : 0}
                  max={formData.discount_type === 'PERCENT' ? 100 : undefined}
                  className="placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <Label>Usage Type *</Label>
              <select
                value={formData.usage_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_type: e.target.value as
                      | 'ONE_TIME'
                      | 'LIMITED'
                      | 'UNLIMITED'
                      | 'USER_SPECIFIC'
                  })
                }
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="UNLIMITED">Unlimited</option>
                <option value="ONE_TIME">One Time Per User</option>
                <option value="LIMITED">Limited Times</option>
              </select>
            </div>
            {formData.usage_type === 'LIMITED' && (
              <div>
                <Label>Usage Limit *</Label>
                <Input
                  type="number"
                  value={formData.usage_limit ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usage_limit: e.target.value
                        ? Number(e.target.value)
                        : undefined
                    })
                  }
                  placeholder="100"
                  required
                  min={1}
                  className="placeholder:text-gray-400"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setFormData({ ...formData, start_date: newStartDate });
                    if (errors.start_date) {
                      setErrors({ ...errors, start_date: '' });
                    }
                    // If end date is before new start date, show error
                    if (
                      formData.end_date &&
                      newStartDate &&
                      new Date(formData.end_date) <= new Date(newStartDate)
                    ) {
                      setErrors({
                        ...errors,
                        end_date: 'End date must be after start date'
                      });
                    } else if (
                      errors.end_date &&
                      formData.end_date &&
                      new Date(formData.end_date) > new Date(newStartDate)
                    ) {
                      setErrors({ ...errors, end_date: '' });
                    }
                  }}
                  required
                  max={formData.end_date || undefined}
                  className={`placeholder:text-gray-400 ${errors.start_date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.start_date}
                  </p>
                )}
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  min={formData.start_date || undefined}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    setFormData({ ...formData, end_date: newEndDate });
                    if (errors.end_date) {
                      setErrors({ ...errors, end_date: '' });
                    }
                    // Validate end date is after start date
                    if (
                      formData.start_date &&
                      newEndDate &&
                      new Date(newEndDate) <= new Date(formData.start_date)
                    ) {
                      setErrors({
                        ...errors,
                        end_date: 'End date must be after start date'
                      });
                    }
                  }}
                  required
                  className={`placeholder:text-gray-400 ${errors.end_date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Purchase Amount (optional)</Label>
                <Input
                  type="number"
                  value={formData.min_purchase_amount ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_purchase_amount: e.target.value
                        ? Number(e.target.value)
                        : undefined
                    })
                  }
                  placeholder="0"
                  min={0}
                  className="placeholder:text-gray-400"
                />
              </div>
              {formData.discount_type === 'PERCENT' && (
                <div>
                  <Label>Max Discount Amount (optional)</Label>
                  <Input
                    type="number"
                    value={formData.max_discount_amount ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_discount_amount: e.target.value
                          ? Number(e.target.value)
                          : undefined
                      })
                    }
                    placeholder="0"
                    min={0}
                    className="placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('vouchers.editDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('vouchers.editDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input value={formData.code} disabled className="font-mono" />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="placeholder:text-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type *</Label>
                <select
                  value={formData.discount_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_type: e.target.value as 'PERCENT' | 'FIXED'
                    })
                  }
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="PERCENT">Percent</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  value={formData.discount_value || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_value: Number(e.target.value) || 0
                    })
                  }
                  required
                  min={formData.discount_type === 'PERCENT' ? 0 : 0}
                  max={formData.discount_type === 'PERCENT' ? 100 : undefined}
                  className="placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <Label>Usage Type *</Label>
              <select
                value={formData.usage_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_type: e.target.value as
                      | 'ONE_TIME'
                      | 'LIMITED'
                      | 'UNLIMITED'
                      | 'USER_SPECIFIC'
                  })
                }
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="UNLIMITED">Unlimited</option>
                <option value="ONE_TIME">One Time Per User</option>
                <option value="LIMITED">Limited Times</option>
              </select>
            </div>
            {formData.usage_type === 'LIMITED' && (
              <div>
                <Label>Usage Limit *</Label>
                <Input
                  type="number"
                  value={formData.usage_limit ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usage_limit: e.target.value
                        ? Number(e.target.value)
                        : undefined
                    })
                  }
                  required
                  min={1}
                  className="placeholder:text-gray-400"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setFormData({ ...formData, start_date: newStartDate });
                    if (errors.start_date) {
                      setErrors({ ...errors, start_date: '' });
                    }
                    // If end date is before new start date, show error
                    if (
                      formData.end_date &&
                      newStartDate &&
                      new Date(formData.end_date) <= new Date(newStartDate)
                    ) {
                      setErrors({
                        ...errors,
                        end_date: 'End date must be after start date'
                      });
                    } else if (
                      errors.end_date &&
                      formData.end_date &&
                      new Date(formData.end_date) > new Date(newStartDate)
                    ) {
                      setErrors({ ...errors, end_date: '' });
                    }
                  }}
                  required
                  max={formData.end_date || undefined}
                  className={`placeholder:text-gray-400 ${errors.start_date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.start_date}
                  </p>
                )}
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  min={formData.start_date || undefined}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    setFormData({ ...formData, end_date: newEndDate });
                    if (errors.end_date) {
                      setErrors({ ...errors, end_date: '' });
                    }
                    // Validate end date is after start date
                    if (
                      formData.start_date &&
                      newEndDate &&
                      new Date(newEndDate) <= new Date(formData.start_date)
                    ) {
                      setErrors({
                        ...errors,
                        end_date: 'End date must be after start date'
                      });
                    }
                  }}
                  required
                  className={`placeholder:text-gray-400 ${errors.end_date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Purchase Amount (optional)</Label>
                <Input
                  type="number"
                  value={formData.min_purchase_amount ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_purchase_amount: e.target.value
                        ? Number(e.target.value)
                        : undefined
                    })
                  }
                  placeholder="0"
                  min={0}
                  className="placeholder:text-gray-400"
                />
              </div>
              {formData.discount_type === 'PERCENT' && (
                <div>
                  <Label>Max Discount Amount (optional)</Label>
                  <Input
                    type="number"
                    value={formData.max_discount_amount ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_discount_amount: e.target.value
                          ? Number(e.target.value)
                          : undefined
                      })
                    }
                    placeholder="0"
                    min={0}
                    className="placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_active_edit">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingVoucher(null);
                resetForm();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdate}>{t('common.update')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
