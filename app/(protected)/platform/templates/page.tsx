'use client';

import { useEffect, useState } from 'react';
import {
  LayoutTemplate,
  Pencil,
  Trash2,
  Globe,
  Lock,
  Plus,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { TemplatePreset } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from '@/components/ui/link';

export default function TemplatesGalleryPage() {
  const [templates, setTemplates] = useState<TemplatePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.getAvailableTemplatePresets();
        setTemplates(data as TemplatePreset[]);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleToggleVisibility = async (template: TemplatePreset) => {
    const next =
      template.visibility === 'PUBLIC' || !template.visibility
        ? 'DEDICATED'
        : 'PUBLIC';
    setTogglingId(template.id);
    try {
      await apiClient.setTemplateVisibility(template.id, next);
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, visibility: next } : t))
      );
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (template: TemplatePreset) => {
    if (!window.confirm(`Delete template "${template.name}"?`)) return;
    setDeletingId(template.id);
    try {
      await apiClient.deleteDedicatedTemplate(template.id);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-full p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Templates Gallery
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage and publish public site templates available to all academies.
          </p>
        </div>
        <Link href="/settings/ui-template">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <LayoutTemplate className="mb-3 h-12 w-12 opacity-25" />
          <p className="text-sm">No templates found.</p>
          <Link href="/settings/ui-template" className="mt-4">
            <Button variant="outline" size="sm">
              Create your first template
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isToggling={togglingId === template.id}
              isDeleting={deletingId === template.id}
              onToggleVisibility={handleToggleVisibility}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isToggling,
  isDeleting,
  onToggleVisibility,
  onDelete
}: {
  template: TemplatePreset;
  isToggling: boolean;
  isDeleting: boolean;
  onToggleVisibility: (t: TemplatePreset) => void;
  onDelete: (t: TemplatePreset) => void;
}) {
  const isPublic =
    template.visibility === 'PUBLIC' || template.visibility === undefined;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Cover */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
        {template.preview ? (
          <img
            src={template.preview}
            alt={template.name}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <LayoutTemplate className="h-10 w-10 text-muted-foreground/25" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge
            variant={isPublic ? 'default' : 'secondary'}
            className="gap-1 text-[11px]"
          >
            {isPublic ? (
              <>
                <Globe className="h-3 w-3" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Private
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 px-4 py-3">
        <h3 className="truncate text-sm font-semibold">{template.name}</h3>
        {template.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {template.description}
          </p>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          {template.blocks.length} section
          {template.blocks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <Link href="/settings/ui-template" className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </Link>

        <Button
          variant={isPublic ? 'outline' : 'default'}
          size="sm"
          disabled={isToggling}
          onClick={() => onToggleVisibility(template)}
          title={isPublic ? 'Unpublish' : 'Publish'}
          className="gap-1"
        >
          {isToggling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPublic ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => onDelete(template)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
