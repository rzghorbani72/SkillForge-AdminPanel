import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { CourseCreateFormData } from './useCourseCreate';
import CreateCourseBasicInfo from './CreateCourseBasicInfo';
import CreateCourseCoverImage from './CreateCourseCoverImage';
import CreateCoursePricing from './CreateCoursePricing';
import CreateCourseAssociations from './CreateCourseAssociations';
import CreateCoursePublishSettings from './CreateCoursePublishSettings';

type Props = {
  form: UseFormReturn<CourseCreateFormData>;
  isLoading: boolean;
  coverImage: File | null;
  coverPreview: string | null;
  isUploading: boolean;
  onCoverImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCoverImage: () => void;
  onUploadCoverImage: () => void;
  onCancelUpload: () => void;
  onSubmit: (data: CourseCreateFormData) => void;
  onBack: () => void;
};

const CreateCourseForm = ({
  form,
  isLoading,
  coverImage,
  coverPreview,
  isUploading,
  onCoverImageChange,
  onRemoveCoverImage,
  onUploadCoverImage,
  onCancelUpload,
  onSubmit,
  onBack
}: Props) => {
  return (
    <div className="max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CreateCourseBasicInfo form={form} />

          <CreateCourseCoverImage
            form={form}
            coverImage={coverImage}
            coverPreview={coverPreview}
            isUploading={isUploading}
            onCoverImageChange={onCoverImageChange}
            onRemoveCoverImage={onRemoveCoverImage}
            onUploadCoverImage={onUploadCoverImage}
            onCancelUpload={onCancelUpload}
          />

          <CreateCoursePricing form={form} />

          <CreateCourseAssociations form={form} />

          <CreateCoursePublishSettings form={form} />

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateCourseForm;
