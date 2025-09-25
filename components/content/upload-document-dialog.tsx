'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FileUploader } from '@/components/file-uploader';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

const documentFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  document_file: z
    .any()
    .refine((files) => files?.length > 0, 'Document file is required'),
  course_id: z.string().optional(),
  document_type: z.enum([
    'PDF',
    'DOCUMENT',
    'PRESENTATION',
    'SPREADSHEET',
    'OTHER'
  ]),
  tags: z.string().optional()
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

interface UploadDocumentDialogProps {
  onDocumentUploaded?: () => void;
  courses?: Course[];
}

export default function UploadDocumentDialog({
  onDocumentUploaded,
  courses
}: UploadDocumentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      course_id: '',
      document_type: 'DOCUMENT',
      tags: ''
    }
  });

  const onSubmit = async (data: DocumentFormData) => {
    try {
      setIsLoading(true);

      // Upload document file
      const file = data.document_file[0];
      await apiClient.uploadDocument(file, {
        title: data.title,
        description: data.description
      });

      // If course is selected, you might want to associate the document with the course
      if (data.course_id) {
        // You might need to create an endpoint to associate documents with courses
        console.log(
          'Document uploaded, course association would be handled here'
        );
      }

      form.reset();
      setIsOpen(false);
      onDocumentUploaded?.();
    } catch (error) {
      console.error('Error uploading document:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload documents, PDFs, presentations, and other files for your
            courses
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="document_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document File *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={1}
                        maxSize={20 * 1024 * 1024} // 20MB
                        accept={{
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            ['.docx'],
                          'application/vnd.ms-powerpoint': ['.ppt'],
                          'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                            ['.pptx'],
                          'application/vnd.ms-excel': ['.xls'],
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                            ['.xlsx'],
                          'text/plain': ['.txt'],
                          'text/markdown': ['.md']
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload documents (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT,
                    MD) - max 20MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the document content and its purpose"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PDF">PDF Document</SelectItem>
                        <SelectItem value="DOCUMENT">Word Document</SelectItem>
                        <SelectItem value="PRESENTATION">
                          Presentation
                        </SelectItem>
                        <SelectItem value="SPREADSHEET">Spreadsheet</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optionally associate this document with a specific course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., syllabus, notes, assignment, reference"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to help organize your documents
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
