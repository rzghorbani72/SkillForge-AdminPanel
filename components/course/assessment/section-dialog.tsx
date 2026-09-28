'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SectionDialogProps {
  triggerLabel: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Opens a lesson/season/course tool without leaving the curriculum. Question
 * lists have no natural size, so only the body scrolls, never the dialog.
 */
export function SectionDialog({
  triggerLabel,
  Icon,
  title,
  description,
  children,
}: SectionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Icon className="me-1 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pe-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
