'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';
import { useCategoriesStore } from '@/lib/store';
import { toast } from 'sonner';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { SearchAndFilters } from '@/components/category/SearchAndFilters';
import { ErrorDisplay } from '@/components/category/ErrorDisplay';
import { LoadingState } from '@/components/category/LoadingState';
import { EmptyState } from '@/components/category/EmptyState';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategoryDialog } from '@/components/category/CategoryDialog';
import { CategoryType, FilterType } from '@/components/category/category-utils';

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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const response = await apiClient.getCategories();

      let categoriesData: Category[] = [];

      if (Array.isArray(response)) {
        categoriesData = response;
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
  }, [clearError, setCategories, setError, setLoading]);

  useEffect(() => {
    // Only fetch if categories are not already loaded from store
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Handle URL parameters for filtering
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

  const handleCreateCategory = async () => {
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

  const handleEditCategory = async () => {
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
    return <LoadingState />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.length === 0 ? (
          <EmptyState searchTerm={searchTerm} selectedType={selectedType} />
        ) : (
          filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={openEditDialog}
              onDelete={handleDeleteCategory}
            />
          ))
        )}
      </div>

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
