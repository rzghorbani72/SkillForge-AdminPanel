import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema } from './useProductCreate';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { Product } from '@/types/api';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { ProductCreateFormData } from './useProductCreate';

export type ProductEditFormData = ProductCreateFormData;

export const useProductEdit = () => {
  const router = useRouter();
  const params = useParams();
  const { selectedStore } = useStore();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductEditFormData>({
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

  useEffect(() => {
    if (productId && selectedStore) {
      fetchProduct();
    }
  }, [productId, selectedStore]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getProduct(parseInt(productId));
      if (response) {
        setProduct(response);

        // Populate form with existing product data
        form.reset({
          title: response.title || '',
          description: response.description || '',
          short_description: response.short_description || '',
          price:
            typeof response.price === 'number'
              ? Math.trunc(response.price).toString()
              : '0',
          original_price:
            typeof response.original_price === 'number'
              ? Math.trunc(response.original_price).toString()
              : '',
          product_type: response.product_type || 'DIGITAL',
          stock_quantity: response.stock_quantity?.toString() || '',
          sku: response.sku || '',
          category_id: response.category_id?.toString() || '',
          cover_id: response.cover?.id?.toString() || '',
          published: response.is_published || false,
          is_featured: response.is_featured || false,
          weight: response.weight?.toString() || '',
          dimensions: response.dimensions || '',
          course_ids:
            (response as any).productCourses
              ?.map((pc: any) => pc.course_id?.toString())
              .filter(Boolean) || []
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      ErrorHandler.handleApiError(error);
      router.push('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (data: ProductEditFormData) => {
    if (!selectedStore || !product) {
      toast.error('Product or store not found');
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

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

      await apiClient.updateProduct(product.id, productData);
      toast.success('Product updated successfully');
      router.push('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debounce the submit handler to prevent multiple rapid submissions
  const onSubmit = useDebouncedCallback(onSubmitHandler, 500);

  const handleBack = () => {
    router.back();
  };

  return {
    product,
    form,
    selectedStore,
    isLoading,
    isSubmitting,
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
