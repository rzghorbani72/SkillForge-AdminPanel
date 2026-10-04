'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseAccessSection } from '@/components/access/course-access-section';
import type { AssignAccessSelection } from '@/components/access/assign-access-form';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import CourseSeoCard from '../CourseSeoCard';
import type { CourseFormData } from '../schema';

type StepAccessProps = {
  courseId: string;
  form: UseFormReturn<CourseFormData>;
  /**
   * Publishing is a decision, not a side effect: the choice is held here and
   * written into the course only by the final save.
   */
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  accessVersion: number;
  onPendingAccessChange: (selection: AssignAccessSelection | null) => void;
};

const VISIBILITY = [
  {
    published: true,
    icon: Globe,
    titleKey: 'courses.wizard.visibilityPublicTitle',
    hintKey: 'courses.wizard.visibilityPublicHint',
  },
  {
    published: false,
    icon: Lock,
    titleKey: 'courses.wizard.visibilityPrivateTitle',
    hintKey: 'courses.wizard.visibilityPrivateHint',
  },
] as const;

/**
 * Step 3 — who may open this course: everyone on the public site, or only the
 * students and groups handed access below. The choice is written with the rest
 * of the course on the final save, never silently on click.
 */
export function StepAccess({
  courseId,
  form,
  isPublic,
  onVisibilityChange,
  accessVersion,
  onPendingAccessChange,
}: StepAccessProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('courses.wizard.visibilityTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {VISIBILITY.map(({ published, icon: Icon, titleKey, hintKey }) => (
            <button
              key={titleKey}
              type="button"
              aria-pressed={isPublic === published}
              onClick={() => onVisibilityChange(published)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-start transition-colors',
                isPublic === published
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:bg-accent',
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-medium">{t(titleKey)}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{t(hintKey)}</span>
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <CourseAccessSection
        key={accessVersion}
        courseId={courseId}
        onPendingChange={onPendingAccessChange}
      />

      {isPublic && <CourseSeoCard form={form} />}
    </div>
  );
}
