'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Dispatch, SetStateAction, JSX } from 'react';
import { ModelField } from '../_lib/page-helpers';

export function DatabaseOverview({
  fields,
  formatValue,
  handleCreate,
  handleDelete,
  handleUpdate,
  isCreateDialogOpen,
  isEditDialogOpen,
  isViewDialogOpen,
  loading,
  openEditDialog,
  openViewDialog,
  page,
  records,
  renderFieldInput,
  selectedModel,
  selectedRecord,
  setFormData,
  setIsCreateDialogOpen,
  setIsEditDialogOpen,
  setIsViewDialogOpen,
  setPage,
  total,
  totalPages,
}: {
  fields: ModelField[];
  formatValue: (value: any) => string;
  handleCreate: () => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleUpdate: () => Promise<void>;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  loading: boolean;
  openEditDialog: (record: any) => Promise<void>;
  openViewDialog: (record: any) => Promise<void>;
  page: number;
  records: any[];
  renderFieldInput: (field: ModelField) => JSX.Element;
  selectedModel: string;
  selectedRecord: any;
  setFormData: Dispatch<SetStateAction<Record<string, any>>>;
  setIsCreateDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsViewDialogOpen: Dispatch<SetStateAction<boolean>>;
  setPage: Dispatch<SetStateAction<number>>;
  total: number;
  totalPages: number;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{selectedModel}</h2>
          <p className="text-sm text-muted-foreground">{total} total records</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})}>
              <Plus className="mr-2 h-4 w-4" />
              Create Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Record</DialogTitle>
              <DialogDescription>
                Fill in the fields to create a new record in {selectedModel}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid max-h-[55vh] gap-4 overflow-y-auto sm:grid-cols-2">
                {fields
                  .filter(
                    (f) => f.name !== 'id' && f.name !== 'created_at' && f.name !== 'updated_at',
                  )
                  .map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.name}
                        {!field.nullable && <span className="ml-1 text-red-500">*</span>}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {field.type}
                        </Badge>
                      </Label>
                      {renderFieldInput(field)}
                    </div>
                  ))}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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
          <div className="table-h-scroll">
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
                    <TableCell colSpan={fields.length + 1} className="py-8 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={fields.length + 1} className="py-8 text-center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      {fields.slice(0, 8).map((field) => (
                        <TableCell key={field.name} className="max-w-[200px] truncate">
                          {formatValue(record[field.name])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openViewDialog(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>Update the record in {selectedModel}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="grid max-h-[55vh] gap-4 overflow-y-auto sm:grid-cols-2">
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
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Record</DialogTitle>
            <DialogDescription>Full details of the record from {selectedModel}</DialogDescription>
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
  );
}
