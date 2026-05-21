'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Loader2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCategoriesStore, parseCategoryFromApi } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

interface Props {
  categoryId: string | undefined;
  onCategoryChange: (id: string | undefined) => void;
  error?: string;
}

export default function CreateCourseAssociations({
  categoryId,
  onCategoryChange,
  error
}: Props) {
  const { categories, fetchCategories, addCategory } = useCategoriesStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch('');
        setIsCreating(false);
        setNewName('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const courseCategories = categories
    .filter((c) => c.type === 'COURSE' && c.is_active)
    .filter(
      (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
    );

  const selectedCategory = categories.find(
    (c) => c.id.toString() === categoryId
  );

  const handleCreateCategory = useCallback(async () => {
    const name = (newName || search).trim();
    if (!name) return;
    setIsSaving(true);
    try {
      const result = await apiClient.createCategory({
        name,
        type: 'COURSE',
        is_active: true
      });
      const created = parseCategoryFromApi(result);
      if (created) {
        addCategory(created);
        onCategoryChange(created.id.toString());
        setOpen(false);
        setSearch('');
        setIsCreating(false);
        setNewName('');
      }
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  }, [newName, search, addCategory, onCategoryChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Selected category pill */}
          {selectedCategory && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
              >
                {selectedCategory.name}
                <button
                  type="button"
                  onClick={() => onCategoryChange(undefined)}
                  className="ml-0.5 rounded-full p-0.5 hover:text-destructive"
                  aria-label={`Remove ${selectedCategory.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Add button + dropdown (hidden when category already selected) */}
          {!selectedCategory && (
            <div className="relative" ref={dropdownRef}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Category
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>

              {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-md border bg-popover p-2 shadow-md">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search categories..."
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
                          ? `No categories match "${search}"`
                          : 'No categories yet'}
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
                        {search ? `Create "${search}"` : 'Create new category'}
                      </button>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Category name"
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
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Save'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedCategory && !open && (
            <p className="text-xs text-muted-foreground">
              Select a category to help students find your course
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
