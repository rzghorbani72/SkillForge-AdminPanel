'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';
import { useCategoriesStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Folder,
  BookOpen,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

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
  const [selectedType, setSelectedType] = useState<
    'all' | 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS'
  >('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'COURSE' as 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS',
    is_active: true
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const response = await apiClient.getCategories();

      let categoriesData: Category[] = [];
      if (response && typeof response === 'object') {
        const responseData = response.data as
          | { data?: Category[]; categories?: Category[] }
          | Category[];
        if (Array.isArray(responseData)) {
          categoriesData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (Array.isArray(responseData.data)) {
            categoriesData = responseData.data;
          } else if (Array.isArray(responseData.categories)) {
            categoriesData = responseData.categories;
          } else {
            categoriesData = [];
          }
        } else {
          categoriesData = [];
        }
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
      setSelectedType(typeParam as 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS');
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
      type: 'COURSE',
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

  const getCategoryTypeIcon = (type: string) => {
    switch (type) {
      case 'COURSE':
        return <BookOpen className="h-4 w-4" />;
      case 'ARTICLE':
        return <FileText className="h-4 w-4" />;
      case 'BLOG':
        return <FileText className="h-4 w-4" />;
      case 'NEWS':
        return <FileText className="h-4 w-4" />;
      default:
        return <Folder className="h-4 w-4" />;
    }
  };

  const getCategoryTypeColor = (type: string) => {
    switch (type) {
      case 'COURSE':
        return 'bg-blue-100 text-blue-800';
      case 'ARTICLE':
        return 'bg-green-100 text-green-800';
      case 'BLOG':
        return 'bg-purple-100 text-purple-800';
      case 'NEWS':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage categories for courses and content
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading categories
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearError();
                    fetchCategories();
                  }}
                  className="border-red-300 text-red-800 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <Folder className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <Select
          value={selectedType}
          onValueChange={(
            value: 'all' | 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS'
          ) => setSelectedType(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="COURSE">Course</SelectItem>
            <SelectItem value="ARTICLE">Article</SelectItem>
            <SelectItem value="BLOG">Blog</SelectItem>
            <SelectItem value="NEWS">News</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm || selectedType !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first category.'}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryTypeIcon(category.type)}
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={getCategoryTypeColor(category.type)}
                      >
                        {category.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {category.is_active ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <CardDescription className="mb-4 line-clamp-2">
                    {category.description}
                  </CardDescription>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Created:{' '}
                    {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for organizing your courses and content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter category name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(
                  value: 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS'
                ) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COURSE">Course</SelectItem>
                  <SelectItem value="ARTICLE">Article</SelectItem>
                  <SelectItem value="BLOG">Blog</SelectItem>
                  <SelectItem value="NEWS">News</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter category name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(
                  value: 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS'
                ) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COURSE">Course</SelectItem>
                  <SelectItem value="ARTICLE">Article</SelectItem>
                  <SelectItem value="BLOG">Blog</SelectItem>
                  <SelectItem value="NEWS">News</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
