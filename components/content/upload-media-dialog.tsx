'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Plus } from 'lucide-react';
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
import { FileUploader } from '@/components/file-uploader';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { MEDIA_KINDS, type MediaKind } from './media-kinds';

const formSchema = z.object({
  file: z.any().refine((files) => files?.length > 0, 'validation.fileRequired'),
  title: z.string().min(3, 'validation.titleMin3'),
  description: z.string().min(10, 'validation.descriptionMin10')
});

type MediaFormData = z.infer<typeof formSchema>;

interface UploadMediaDialogProps {
  kind: MediaKind;
  onUploaded?: () => void;
}

/**
 * One dialog for video/audio/document uploads: the API accepts the same
 * payload (file + title + description) for all three.
 */
export function UploadMediaDialog({
  kind,
  onUploaded
}: UploadMediaDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const config = MEDIA_KINDS[kind];

  const form = useForm<MediaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '' }
  });

  const onSubmit = async (data: MediaFormData) => {
    try {
      setIsUploading(true);
      await config.upload(data.file[0], {
        title: data.title,
        description: data.description
      });
      form.reset();
      setIsOpen(false);
      onUploaded?.();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
          <Plus className="h-4 w-4" />
          {t(config.triggerKey)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader className="text-start">
          <DialogTitle>{t(config.triggerKey)}</DialogTitle>
          <DialogDescription>{t(config.descriptionKey)}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(config.fileLabelKey)}</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={field.value}
                      onValueChange={field.onChange}
                      maxFiles={1}
                      maxSize={config.maxSizeBytes}
                      accept={config.accept}
                    />
                  </FormControl>
                  <FormDescription>{t(config.fileHintKey)}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('media.title')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(config.titlePlaceholderKey)}
                      {...field}
                    />
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
                  <FormLabel>{t('media.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(config.descriptionPlaceholderKey)}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
              >
                {t('media.cancel')}
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? t('media.uploading') : t(config.triggerKey)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
