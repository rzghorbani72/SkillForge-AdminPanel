'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import Header from '@/components/product/Header';
import SearchBar from '@/components/product/SearchBar';
import ProductsGrid from '@/components/product/ProductsGrid';
import useProducts from '@/components/product/useProducts';
import { useTranslation } from '@/lib/i18n/hooks';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Building2 } from 'lucide-react';

export default function ProductsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useStore();
  const {
    products,
    totalProducts,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleViewProduct,
    handleEditProduct,
    handleDeleteProduct
  } = useProducts();

  if (!selectedStore) {
    return (
      <div className="page-wrapper flex-1 p-6">
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title={t('common.noStoreSelected')}
          description={t('common.selectStoreToView')}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message={t('products.loadingProducts')} />;
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-6">
      <Header />
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <ProductsGrid
        products={products}
        searchTerm={searchTerm}
        onCreate={() => router.push('/products/create')}
        onView={handleViewProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}
