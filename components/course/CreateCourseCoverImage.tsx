import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { CourseCreateFormData } from './useCourseCreate';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';

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

const CreateCourseCoverImage = ({ form }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploadPreview
          title={form.watch('title') || 'Course Cover'}
          description={form.watch('description') || 'Course cover image'}
          onSuccess={(image) => {
            console.log(
              'CreateCourseCoverImage - Image selected, setting image_id to:',
              image.id
            );
            form.setValue('image_id', image.id.toString());
            console.log(
              'CreateCourseCoverImage - Form image_id is now:',
              form.getValues('image_id')
            );
          }}
          selectedImageId={form.watch('image_id')}
          alt="Course cover preview"
          className="aspect-[5/4] w-full max-w-md"
          placeholderText="No cover image selected"
          placeholderSubtext="Upload an image to preview it here"
          uploadButtonText="Upload Cover Image"
          selectButtonText="Select an image first"
        />
      </CardContent>
    </Card>
  );
};

export default CreateCourseCoverImage;
