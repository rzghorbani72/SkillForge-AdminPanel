'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Database,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModelField {
  name: string;
  type: string;
  nullable: boolean;
}

export default function DatabasePage() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [fields, setFields] = useState<ModelField[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
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
      toast.error(error.message || 'Failed to load models');
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
      toast.error(error.message || 'Failed to load model fields');
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
        limit
      });
      setRecords(result.data || []);
      setTotal(result.total || 0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load records');
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
      toast.success('Record created successfully');
      setIsCreateDialogOpen(false);
      setFormData({});
      loadRecords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedModel || !selectedRecord) return;
    try {
      setLoading(true);
      await apiClient.updateModelRecord(
        selectedModel,
        selectedRecord.id,
        formData
      );
      toast.success('Record updated successfully');
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      setFormData({});
      loadRecords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update record');
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
      toast.success('Record deleted successfully');
      loadRecords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete record');
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
      const fullRecord = await apiClient.getModelRecord(
        selectedModel,
        record.id
      );
      setSelectedRecord(fullRecord);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load record');
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
          onValueChange={(val) =>
            setFormData({ ...formData, [field.name]: val === 'true' })
          }
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
        <Input
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
        />
      );
    }

    if (fieldType === 'int' || fieldType === 'float') {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name]:
                fieldType === 'int'
                  ? parseInt(e.target.value) || 0
                  : parseFloat(e.target.value) || 0
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
          onChange={(e) =>
            setFormData({ ...formData, [field.name]: e.target.value })
          }
          rows={4}
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) =>
          setFormData({ ...formData, [field.name]: e.target.value })
        }
      />
    );
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (
      value instanceof Date ||
      (typeof value === 'string' && value.includes('T'))
    ) {
      return new Date(value).toLocaleString();
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Database className="h-8 w-8" />
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
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{selectedModel}</h2>
              <p className="text-sm text-muted-foreground">
                {total} total records
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setFormData({})}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Record</DialogTitle>
                  <DialogDescription>
                    Fill in the fields to create a new record in {selectedModel}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {fields
                    .filter(
                      (f) =>
                        f.name !== 'id' &&
                        f.name !== 'created_at' &&
                        f.name !== 'updated_at'
                    )
                    .map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.name}
                          {!field.nullable && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {field.type}
                          </Badge>
                        </Label>
                        {renderFieldInput(field)}
                      </div>
                    ))}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={loading}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {fields.slice(0, 8).map((field) => (
                        <TableHead key={field.name}>{field.name}</TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={fields.length + 1}
                          className="py-8 text-center"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : records.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={fields.length + 1}
                          className="py-8 text-center"
                        >
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map((record) => (
                        <TableRow key={record.id}>
                          {fields.slice(0, 8).map((field) => (
                            <TableCell
                              key={field.name}
                              className="max-w-[200px] truncate"
                            >
                              {formatValue(record[field.name])}
                            </TableCell>
                          ))}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewDialog(record)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(record)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Record</DialogTitle>
                <DialogDescription>
                  Update the record in {selectedModel}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                {fields
                  .filter((f) => f.name !== 'id' && f.name !== 'created_at')
                  .map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {field.type}
                        </Badge>
                      </Label>
                      {renderFieldInput(field)}
                    </div>
                  ))}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={loading}>
                    Update
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>View Record</DialogTitle>
                <DialogDescription>
                  Full details of the record from {selectedModel}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                {selectedRecord &&
                  fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label className="font-semibold">{field.name}</Label>
                      <div className="rounded-md bg-muted p-3">
                        <pre className="whitespace-pre-wrap text-sm">
                          {formatValue(selectedRecord[field.name])}
                        </pre>
                      </div>
                    </div>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
