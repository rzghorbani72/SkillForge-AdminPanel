import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LessonForm from './LessonForm';
import { LessonFormData } from './schema';

type Props = {
  initialValues: LessonFormData;
  categories: Array<{ id: number; name: string }>;
  isSubmitting: boolean;
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
  season: any;
  course: any;
  isEdit: boolean;
};

const LessonFormPage = ({
  initialValues,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
  season,
  course,
  isEdit
}: Props) => {
  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <button
          onClick={() => window.history.back()}
          className="transition-colors hover:text-foreground"
        >
          Courses
        </button>
        <span>/</span>
        <button
          onClick={() => window.history.back()}
          className="transition-colors hover:text-foreground"
        >
          {course?.title}
        </button>
        <span>/</span>
        <button
          onClick={() => window.history.back()}
          className="transition-colors hover:text-foreground"
        >
          Seasons
        </button>
        <span>/</span>
        <button
          onClick={() => window.history.back()}
          className="transition-colors hover:text-foreground"
        >
          {season?.title}
        </button>
        <span>/</span>
        <button
          onClick={() => window.history.back()}
          className="transition-colors hover:text-foreground"
        >
          Lessons
        </button>
        <span>/</span>
        <span className="font-medium text-foreground">
          {isEdit ? 'Edit' : 'Create'}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Edit Lesson' : 'Create New Lesson'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update lesson' : 'Add a new lesson'} in "
              {season?.title}" for "{course?.title}"
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LessonForm
            initialValues={initialValues}
            categories={categories}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitLabel={isEdit ? 'Update Lesson' : 'Create Lesson'}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course & Season Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course & Season</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Course
                </label>
                <p className="text-sm font-semibold">{course?.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Season
                </label>
                <p className="text-sm font-semibold">{season?.title}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Use clear, descriptive titles for your lessons</p>
              <p>
                • Add media IDs to associate videos, audio, images, or documents
              </p>
              <p>• Choose appropriate lesson types based on your content</p>
              <p>
                • Set lessons as free to make them accessible to all students
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonFormPage;
