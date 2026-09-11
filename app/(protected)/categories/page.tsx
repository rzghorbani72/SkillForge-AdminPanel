'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';
import { useCategoriesStore } from '@/lib/store';
import { toast } from 'react-toastify';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { SearchAndFilters } from '@/components/category/SearchAndFilters';
import { ErrorDisplay } from '@/components/category/ErrorDisplay';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategoryDialog } from '@/components/category/CategoryDialog';
import { CategoryType, FilterType } from '@/components/category/category-utils';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiErrorMessage } from '@/lib/api-error-message';

export default function CategoriesPage() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const { categories, isLoading, error, clearError, fetchCategories } =
    useCategoriesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FilterType>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'COURSE' as CategoryType,
    is_active: true
  });

  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch if categories are not already loaded (from dashboard initialization)
    if (!hasFetched.current && categories.length === 0 && !isLoading) {
      hasFetched.current = true;
      fetchCategories();
    }
  }, [categories.length, isLoading, fetchCategories]);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (
      typeParam === 'COURSE' ||
      typeParam === 'ARTICLE' ||
      typeParam === 'BLOG' ||
      typeParam === 'NEWS'
    ) {
      setSelectedType(typeParam as CategoryType);
    }
  }, [searchParams]);

  const safeCategories = (Array.isArray(categories) ? categories : []).filter(
    (category) => category?.name
  );

  const filteredCategories = safeCategories.filter((category) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      category.name.toLowerCase().includes(query) ||
      (category.description?.toLowerCase().includes(query) ?? false);
    const matchesType =
      selectedType === 'all' || category.type === selectedType;

    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'COURSE' as CategoryType,
      is_active: true
    });
  };

  const handleCreateCategoryHandler = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error(t('categories.nameRequired'));
        return;
      }

      const response = await apiClient.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type
      });

      const payload = response?.data as
        | { status?: string; data?: unknown; message?: string }
        | undefined;

      if (payload?.status === 'fail') {
        const message =
          typeof payload.data === 'string'
            ? payload.data
            : payload.message || t('categories.createFailed');
        toast.error(message);
        return;
      }

      await fetchCategories({ force: true });
      toast.success(t('categories.createSuccess'));
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(apiErrorMessage(error, t('categories.createFailed')));
    }
  };

  const handleEditCategoryHandler = async () => {
    try {
      if (!editingCategory || !formData.name.trim()) {
        toast.error(t('categories.nameRequired'));
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        is_active: formData.is_active
      };

      await apiClient.updateCategory(editingCategory.id, updateData);
      await fetchCategories({ force: true });
      toast.success(t('categories.updateSuccess'));
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      toast.error(apiErrorMessage(error, t('categories.updateFailed')));
    }
  };

  const handleCreateCategory = useDebouncedCallback(
    handleCreateCategoryHandler,
    500
  );
  const handleEditCategory = useDebouncedCallback(
    handleEditCategoryHandler,
    500
  );

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm(t('categories.deleteConfirm'))) {
      return;
    }

    try {
      await apiClient.deleteCategory(categoryId);
      await fetchCategories({ force: true });
      toast.success(t('categories.deleteSuccess'));
    } catch (error) {
      toast.error(apiErrorMessage(error, t('categories.deleteFailed')));
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type as CategoryType,
      is_active: category.is_active
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner message={t('media.loadingCategories')} />;
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-4 sm:p-6" dir={'rtl'}>
      <CategoryHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => {
            clearError();
            fetchCategories({ force: true });
          }}
        />
      )}

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {filteredCategories.length === 0 ? (
        <div
          className="fade-in-up flex flex-1 items-center justify-center p-4 sm:p-6"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="text-center">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-2xl" />
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm">
                <Folder className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              {t('media.noCategoriesFound')}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {searchTerm || selectedType !== 'all'
                ? t('media.noCategoriesMatch')
                : t('media.createFirstCategory')}
            </p>
            {!searchTerm && selectedType === 'all' && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-6 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25"
              >
                <Plus className="h-4 w-4" />
                {t('media.createCategory')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              style={{ animationDelay: `${0.05 * (index + 1)}s` }}
            >
              <CategoryCard
                category={category}
                onEdit={openEditDialog}
                onDelete={handleDeleteCategory}
              />
            </div>
          ))}
        </div>
      )}

      <CategoryDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        isEdit={false}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreateCategory}
        onCancel={() => {
          setIsCreateDialogOpen(false);
          resetForm();
        }}
      />

      <CategoryDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isEdit={true}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleEditCategory}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setEditingCategory(null);
          resetForm();
        }}
      />
    </div>
  );
}
