'use client';

import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  canManage: boolean;
  onCreatePlan: () => void;
  t: (key: string) => string;
}

export function AcademyPlansEmptyState({ canManage, onCreatePlan, t }: Props) {
  return (
    <div className="rounded-2xl border bg-card py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <BookOpen className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t('plans.noAcademyPlans')}</p>
      {canManage && (
        <Button onClick={onCreatePlan} variant="outline" size="sm" className="mt-4">
          <Plus className="me-2 h-4 w-4" />
          {t('plans.createFirstAcademyPlan')}
        </Button>
      )}
    </div>
  );
}
