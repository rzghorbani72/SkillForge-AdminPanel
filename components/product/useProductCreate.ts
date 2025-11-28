import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/hooks/useSchool';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

export const productFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must be less than 80 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  short_description: z
    .string()
    .max(400, 'Short description must be less than 400 characters')
    .optional(),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => /^\d+$/.test(val.trim()), 'Price must be a whole number')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 999999999;
    }, 'Price must be between 0 and 999,999,999'),
  original_price: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d+$/.test(val.trim()),
      'Original price must be a whole number'
    ),
  product_type: z.enum(['DIGITAL', 'PHYSICAL']),
  stock_quantity: z.string().optional(),
  sku: z.string().optional(),
  category_id: z.string().optional(),
  cover_id: z.string().optional(),
  published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  course_ids: z.array(z.string()).optional()
});

export type ProductCreateFormData = z.infer<typeof productFormSchema>;

export const useProductCreate = () => {
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductCreateFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      price: '0',
      original_price: '',
      product_type: 'DIGITAL',
      stock_quantity: '',
      sku: '',
      category_id: '',
      cover_id: '',
      published: false,
      is_featured: false,
      weight: '',
      dimensions: '',
      course_ids: []
    }
  });

  const imageUpload = useImageUpload({
    title: form.watch('title') || 'Product Cover',
    description: form.watch('description') || 'Product cover image',
    onSuccess: (image) => {
      form.setValue('cover_id', image.id.toString());
    }
  });

  const onSubmitHandler = async (data: ProductCreateFormData) => {
    if (!selectedSchool) {
      toast.error('Please select a school first');
      return;
    }

    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      if (!data.title.trim() || data.title.trim().length < 5) {
        toast.error('Title must be at least 5 characters long');
        return;
      }

      const price = Number(data.price);
      if (
        isNaN(price) ||
        !Number.isInteger(price) ||
        price < 0 ||
        price > 999999999
      ) {
        toast.error(
          'Price must be a valid whole number between 0 and 999,999,999'
        );
        return;
      }

      const productData: any = {
        title: data.title.trim(),
        description: data.description.trim(),
        price: price,
        product_type: data.product_type,
        published: !!data.published,
        is_featured: !!data.is_featured
      };

      if (data.short_description?.trim()) {
        productData.short_description = data.short_description.trim();
      }

      if (data.original_price && data.original_price.trim()) {
        const originalPrice = Number(data.original_price);
        if (
          !isNaN(originalPrice) &&
          Number.isInteger(originalPrice) &&
          originalPrice >= price
        ) {
          productData.original_price = originalPrice;
        }
      }

      if (data.product_type === 'PHYSICAL' && data.stock_quantity?.trim()) {
        const stock = Number(data.stock_quantity);
        if (!isNaN(stock) && Number.isInteger(stock) && stock >= 0) {
          productData.stock_quantity = stock;
        }
      }

      if (data.sku?.trim()) {
        productData.sku = data.sku.trim();
      }

      if (data.category_id) {
        productData.category_id = Number(data.category_id);
      }

      if (data.cover_id) {
        productData.cover_id = Number(data.cover_id);
      }

      if (data.course_ids && data.course_ids.length > 0) {
        productData.course_ids = data.course_ids
          .filter((id) => id && id.trim())
          .map((id) => Number(id));
      }

      if (data.product_type === 'PHYSICAL') {
        if (data.weight?.trim()) {
          const weight = Number(data.weight);
          if (!isNaN(weight) && weight > 0) {
            productData.weight = weight;
          }
        }
        if (data.dimensions?.trim()) {
          productData.dimensions = data.dimensions.trim();
        }
      }

      await apiClient.createProduct(productData);
      toast.success('Product created successfully');
      router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the submit handler to prevent multiple rapid submissions
  const onSubmit = useDebouncedCallback(onSubmitHandler, 500);

  const handleBack = () => {
    router.back();
  };

  return {
    form,
    selectedSchool,
    isLoading,
    coverImage: imageUpload.selectedFile,
    coverPreview: imageUpload.preview,
    isUploading: imageUpload.isUploading,
    handleCoverImageChange: imageUpload.handleFileChange,
    removeCoverImage: imageUpload.removeFile,
    uploadCoverImage: imageUpload.uploadImage,
    cancelUpload: imageUpload.cancelUpload,
    onSubmit,
    handleBack
  };
};
