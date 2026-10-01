'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { apiErrorMessage } from '@/lib/api-error-message';

import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { DatabaseOverview } from './_components/database-overview';
import { ModelField } from './_lib/page-helpers';

export default function DatabasePage() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [fields, setFields] = useState<ModelField[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadModelFields();
      loadRecords();
    }
  }, [selectedModel, page, limit]);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDatabaseModels();
      setModels(data);
    } catch (error: any) {
      toast.error(apiErrorMessage(error, tNow('toasts.modelsLoadFailed')));
    } finally {
      setLoading(false);
    }
  };

  const loadModelFields = async () => {
    if (!selectedModel) return;
    try {
      setLoading(true);
      const data = await apiClient.getModelFields(selectedModel);
      setFields(data.fields || []);
    } catch (error: any) {
      toast.error(apiErrorMessage(error, tNow('toasts.modelFieldsLoadFailed')));
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    if (!selectedModel) return;
    try {
      setLoading(true);
      const result = await apiClient.getModelRecords(selectedModel, {
        page,
        limit,
      });
      setRecords(result.data || []);
      setTotal(result.total || 0);
    } catch (error: any) {
      toast.error(apiErrorMessage(error, tNow('toasts.recordsLoadFailed')));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedModel) return;
    try {
      setLoading(true);
      await apiClient.createModelRecord(selectedModel, formData);
      toast.success(tNow('toasts.recordCreated'));
      setIsCreateDialogOpen(false);
      setFormData({});
      loadRecords();
    } catch (error: any) {
      toast.error(apiErrorMessage(error, tNow('toasts.recordCreateFailed')));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedModel || !selectedRecord) return;
    try {
      setLoading(true);
      await apiClient.updateModelRecord(selectedModel, selectedRecord.id, formData);
      toast.success(tNow('toasts.recordUpdated'));
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      setFormData({});
      loadRecords();
    } catch (error: any) {
      toast.error(apiErrorMessage(error, tNow('toasts.recordUpdateFailed')));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedModel) return;
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      setLoading(true);
      await apiClient.deleteModelRecord(selectedModel, id);
      toast.success(tNow('toasts.recordDeleted'));
      loadRecords();
    } catch (error: any) {
      toast.error(apiErrorMessage(error, tNow('toasts.recordDeleteFailed')));
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = async (record: any) => {
    setSelectedRecord(record);
    setFormData({ ...record });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = async (record: any) => {
    if (!selectedModel) return;
    try {
      setLoading(true);
      const fullRecord = await apiClient.getModelRecord(selectedModel, record.id);
      setSelectedRecord(fullRecord);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      toast.error(apiErrorMessage(error, tNow('toasts.recordLoadFailed')));
    } finally {
      setLoading(false);
    }
  };

  const renderFieldInput = (field: ModelField) => {
    const value = formData[field.name] ?? '';
    const fieldType = field.type.toLowerCase();

    if (fieldType === 'boolean') {
      return (
        <Select
          value={value === '' ? '' : String(value)}
          onValueChange={(val) => setFormData({ ...formData, [field.name]: val === 'true' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (fieldType === 'datetime') {
      return (
        <DatePicker
          value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          onChange={(pickedValue: string) =>
            setFormData({ ...formData, [field.name]: pickedValue })
          }
          withTime
        />
      );
    }

    if (fieldType === 'int' || fieldType === 'float') {
      return (
        <NumberInput
          allowDecimal={fieldType === 'float'}
          value={value}
          onChange={(raw) =>
            setFormData({
              ...formData,
              [field.name]:
                raw === '' ? 0 : fieldType === 'int' ? parseInt(raw) || 0 : parseFloat(raw) || 0,
            })
          }
        />
      );
    }

    if (
      field.name.includes('description') ||
      field.name.includes('content') ||
      field.name.includes('notes')
    ) {
      return (
        <Textarea
          value={value}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          rows={4}
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
      />
    );
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
      return new Date(value).toLocaleString();
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Database className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            Database Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your PostgreSQL database tables without writing queries
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Table</CardTitle>
          <CardDescription>Choose a database table to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedModel || ''} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a table" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedModel && (
        <DatabaseOverview
          fields={fields}
          formatValue={formatValue}
          handleCreate={handleCreate}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          isViewDialogOpen={isViewDialogOpen}
          loading={loading}
          openEditDialog={openEditDialog}
          openViewDialog={openViewDialog}
          page={page}
          records={records}
          renderFieldInput={renderFieldInput}
          selectedModel={selectedModel}
          selectedRecord={selectedRecord}
          setFormData={setFormData}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          setIsViewDialogOpen={setIsViewDialogOpen}
          setPage={setPage}
          total={total}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
