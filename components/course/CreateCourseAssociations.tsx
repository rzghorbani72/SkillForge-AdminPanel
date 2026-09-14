'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Loader2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCategoriesStore, parseCategoryFromApi } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { apiToast } from '@/lib/api-toast';
import { useTranslation } from '@/lib/i18n/hooks';

interface Props {
  categoryId: string | undefined;
  onCategoryChange: (id: string | undefined) => void;
  error?: string;
}

export default function CreateCourseAssociations({ categoryId, onCategoryChange, error }: Props) {
  const { t } = useTranslation();
  const { categories, fetchCategories, addCategory } = useCategoriesStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch('');
      setIsCreating(false);
      setNewName('');
    }
  }, []);

  const courseCategories = categories
    .filter((c) => c.type === 'COURSE' && c.is_active)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const selectedCategory = categories.find((c) => c.id.toString() === categoryId);

  const handleCreateCategory = useCallback(async () => {
    const name = (newName || search).trim();
    if (!name) return;
    setIsSaving(true);
    try {
      const result = await apiClient.createCategory({
        name,
        type: 'COURSE',
        is_active: true,
      });
      const created = parseCategoryFromApi(result);
      if (created) {
        addCategory(created);
        onCategoryChange(created.id.toString());
        apiToast.success(result);
        setOpen(false);
        setSearch('');
        setIsCreating(false);
        setNewName('');
      }
    } catch (err) {
      apiToast.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [newName, search, addCategory, onCategoryChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('courses.category')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Selected category pill */}
          {selectedCategory && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
                {selectedCategory.name}
                <button
                  type="button"
                  onClick={() => onCategoryChange(undefined)}
                  className="ml-0.5 rounded-full p-0.5 hover:text-destructive"
                  aria-label={t('courses.removeCategoryAria', {
                    name: selectedCategory.name,
                  })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Add button + dropdown (hidden when category already selected) */}
          {!selectedCategory && (
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('courses.addCategory')}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </PopoverTrigger>

              <PopoverContent align="start" className="w-64 p-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('courses.searchCategories')}
                  className="mb-2 h-8 text-sm"
                  autoFocus
                />

                <div className="max-h-48 overflow-y-auto">
                  {courseCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="flex w-full items-center rounded px-2 py-1.5 text-sm hover:bg-muted"
                      onClick={() => {
                        onCategoryChange(cat.id.toString());
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {courseCategories.length === 0 && (
                    <p className="px-2 py-2 text-xs text-muted-foreground">
                      {search
                        ? t('courses.noCategoriesMatch', { term: search })
                        : t('courses.noCategoriesYet')}
                    </p>
                  )}
                </div>

                {/* Create new inline */}
                <div className="mt-1.5 border-t pt-1.5">
                  {!isCreating ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-sm text-primary hover:bg-muted"
                      onClick={() => {
                        setIsCreating(true);
                        if (search) setNewName(search);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {search
                        ? t('courses.createCategoryNamed', { name: search })
                        : t('courses.createNewCategory')}
                    </button>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={t('courses.categoryNamePlaceholder')}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateCategory();
                          if (e.key === 'Escape') setIsCreating(false);
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 shrink-0 px-2"
                        onClick={handleCreateCategory}
                        disabled={isSaving || !newName.trim()}
                      >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : t('common.save')}
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {!selectedCategory && !open && (
            <p className="text-xs text-muted-foreground">{t('courses.selectCategoryHint')}</p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
