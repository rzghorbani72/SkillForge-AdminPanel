import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { Product } from '@/types/api';
import { toast } from 'sonner';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

type UseProductsReturn = {
  products: Product[];
  totalProducts: number;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleViewProduct: (product: Product) => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProduct: (product: Product) => void;
};

const useProducts = (): UseProductsReturn => {
  const router = useRouter();
  const { selectedStore } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const totalProducts = products.length;

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return products;
    }

    return products.filter((product) => {
      const titleMatch = product.title?.toLowerCase().includes(term);
      const slugMatch = product.slug?.toLowerCase().includes(term);
      const descriptionMatch = product.description
        ?.toLowerCase()
        .includes(term);
      const shortDescriptionMatch = product.short_description
        ?.toLowerCase()
        .includes(term);
      const categoryMatch = (product as any)?.category?.name
        ?.toLowerCase()
        .includes(term);
      const skuMatch = product.sku?.toLowerCase().includes(term);

      return (
        titleMatch ||
        slugMatch ||
        descriptionMatch ||
        shortDescriptionMatch ||
        categoryMatch ||
        skuMatch
      );
    });
  }, [products, searchTerm]);

  useEffect(() => {
    if (selectedStore) {
      fetchProducts();
    }
  }, [selectedStore]);

  const fetchProducts = async () => {
    if (!selectedStore) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getProducts();
      let nextProducts: Product[] = [];
      if (response && response.products && Array.isArray(response.products)) {
        nextProducts = response.products;
      } else if (Array.isArray(response)) {
        nextProducts = response;
      }

      if (selectedStore && nextProducts.length > 0) {
        nextProducts = nextProducts.filter((p) =>
          (p as any).store_id ? (p as any).store_id === selectedStore.id : true
        );
      }

      setProducts(nextProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      ErrorHandler.handleApiError(error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/products/${product.id}/edit`);
  };

  const handleDeleteProductHandler = async (product: Product) => {
    try {
      const response = await apiClient.deleteProduct(product.id);
      if (response && response.status === 200) {
        toast.success(
          (response.data as any).message || 'Product deleted successfully'
        );
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  const handleDeleteProduct = useDebouncedCallback(
    handleDeleteProductHandler,
    500
  );

  return {
    products: filteredProducts,
    totalProducts,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleViewProduct,
    handleEditProduct,
    handleDeleteProduct
  };
};

export default useProducts;
