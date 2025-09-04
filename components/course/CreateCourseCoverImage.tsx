import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Upload, Loader2, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { CourseCreateFormData } from './useCourseCreate';

type Props = {
  form: UseFormReturn<CourseCreateFormData>;
  coverImage: File | null;
  coverPreview: string | null;
  isUploading: boolean;
  onCoverImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCoverImage: () => void;
  onUploadCoverImage: () => void;
  onCancelUpload: () => void;
};

const CreateCourseCoverImage = ({
  form,
  coverImage,
  coverPreview,
  isUploading,
  onCoverImageChange,
  onRemoveCoverImage,
  onUploadCoverImage,
  onCancelUpload
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          onChange={onCoverImageChange}
          className="cursor-pointer"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onUploadCoverImage}
            disabled={!coverImage || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : coverImage ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Cover Image
              </>
            ) : (
              'Select an image first'
            )}
          </Button>

          {isUploading && (
            <Button
              type="button"
              variant="destructive"
              onClick={onCancelUpload}
              className="px-4"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>

        {coverPreview && (
          <div className="space-y-3">
            <div className="relative">
              <div className="aspect-[5/4] w-full max-w-md overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={coverPreview}
                  alt="Course cover preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemoveCoverImage}
                className="absolute right-2 top-2"
              >
                ×
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Cover image selected: {coverImage?.name}
              </p>
              {form.watch('image_id') && (
                <p className="text-xs text-green-600">
                  ✓ Image uploaded successfully (ID: {form.watch('image_id')})
                </p>
              )}
              <p className="text-xs text-gray-500">
                Current Image ID: {form.watch('image_id') || 'None'}
              </p>
            </div>
          </div>
        )}

        {!coverPreview && (
          <div className="flex aspect-[5/4] w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
            <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">No cover image selected</p>
            <p className="mt-1 text-xs text-gray-500">
              Upload an image to preview it here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateCourseCoverImage;
