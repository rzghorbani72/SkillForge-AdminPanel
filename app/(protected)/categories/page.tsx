'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';
import { useCategoriesStore } from '@/lib/store';
import { toast } from 'sonner';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { SearchAndFilters } from '@/components/category/SearchAndFilters';
import { ErrorDisplay } from '@/components/category/ErrorDisplay';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategoryDialog } from '@/components/category/CategoryDialog';
import { CategoryType, FilterType } from '@/components/category/category-utils';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const {
    categories,
    isLoading,
    error,
    setCategories,
    setLoading,
    setError,
    clearError
  } = useCategoriesStore();
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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const response = await apiClient.getCategories();

      let categoriesData: Category[] = [];

      if (
        response &&
        typeof response === 'object' &&
        Array.isArray(response.data)
      ) {
        categoriesData = response.data as Category[];
      } else {
        categoriesData = [];
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current && categories.length === 0) {
      hasFetched.current = true;
      fetchCategories();
    }
  }, [categories.length]);

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

  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCategories = safeCategories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()));
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
        toast.error('Category name is required');
        return;
      }

      await apiClient.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type
      });

      toast.success('Category created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleEditCategoryHandler = async () => {
    try {
      if (!editingCategory || !formData.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      await apiClient.updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        is_active: formData.is_active
      });

      toast.success('Category updated successfully');
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
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
    if (
      !confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type,
      is_active: category.is_active
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-6">
      <CategoryHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => {
            clearError();
            fetchCategories();
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
          className="fade-in-up flex flex-1 items-center justify-center p-6"
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
              No categories found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {searchTerm || selectedType !== 'all'
                ? 'No categories match your search criteria.'
                : 'Create your first category to organize your content.'}
            </p>
            {!searchTerm && selectedType === 'all' && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-6 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25"
              >
                <Plus className="h-4 w-4" />
                Create Category
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
