'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Eye,
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  Star,
  Box
} from 'lucide-react';
import { Product } from '@/types/api';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { formatCurrencyWithStore, cn } from '@/lib/utils';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useTranslation } from '@/lib/i18n/hooks';
import Image from 'next/image';

type Props = {
  products: Product[];
  searchTerm: string;
  onCreate?: () => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void;
};

const ProductsGrid = ({
  products,
  searchTerm,
  onCreate,
  onView,
  onEdit,
  onDelete
}: Props) => {
  const { t } = useTranslation();
  const store = useCurrentStore();
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(
    null
  );

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (productToDelete && onDelete) {
      onDelete(productToDelete);
    }
    setProductToDelete(null);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setProductToDelete(null);
    }
  };

  const headerDescription = searchTerm
    ? t('products.showingMatching', {
        count: products.length,
        term: searchTerm
      })
    : t('products.showingCount', { count: products.length });

  if (products.length === 0) {
    return (
      <div
        className="fade-in-up flex flex-1 items-center justify-center p-6"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent blur-2xl" />
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm">
              <Package className="h-10 w-10" />
            </div>
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            {t('products.noProducts')}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {searchTerm
              ? t('products.noProductsMatch', { term: searchTerm })
              : t('products.getStarted')}
          </p>
          {!searchTerm && onCreate && (
            <Button
              onClick={onCreate}
              className="mt-6 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4" />
              {t('products.createProduct')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fade-in-up mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ animationDelay: '0.15s' }}
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t('products.title')}
          </h2>
          <p className="text-sm text-muted-foreground">{headerDescription}</p>
        </div>
      </div>

      <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            onClick={() => onView(product)}
            className="cursor-pointer"
            style={{ animationDelay: `${0.05 * (index + 1)}s` }}
          >
            <Card
              className={cn(
                'group flex h-full flex-col overflow-hidden border-border/50 transition-all duration-300',
                'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
              )}
            >
              {/* Product Cover */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted/50">
                {product.cover?.url ? (
                  <Image
                    src={product.cover.url}
                    alt={product.cover.alt || product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* Featured badge */}
                {product.is_featured && (
                  <Badge className="absolute left-3 top-3 gap-1 rounded-full bg-amber-500/90 text-white backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-current" />
                    {t('courses.featured')}
                  </Badge>
                )}
                {/* Product type badge */}
                <div className="absolute right-3 top-3">
                  <Badge
                    className={cn(
                      'rounded-full backdrop-blur-sm',
                      product.product_type === 'PHYSICAL'
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-purple-500/90 text-white'
                    )}
                  >
                    {product.product_type === 'PHYSICAL' ? (
                      <>
                        <Box className="mr-1 h-3 w-3" />
                        {t('products.physical')}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        {t('products.digital')}
                      </>
                    )}
                  </Badge>
                </div>
                {/* Price badge */}
                <div className="absolute bottom-3 right-3">
                  {product.price && product.price > 0 ? (
                    <Badge className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-foreground backdrop-blur-sm dark:bg-black/90 dark:text-white">
                      {formatCurrencyWithStore(product.price, store)}
                    </Badge>
                  ) : (
                    <Badge className="rounded-full bg-emerald-500/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                      {t('courses.free')}
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {product.short_description || product.description}
                    </CardDescription>
                  </div>
                  {product.access_control && (
                    <AccessControlBadge
                      accessControl={product.access_control}
                      className="shrink-0 text-[10px]"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                {/* Stock and rating info */}
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-xs">
                  {product.product_type === 'PHYSICAL' &&
                    product.stock_quantity !== null && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        <span className="font-medium">
                          {product.stock_quantity} in stock
                        </span>
                      </div>
                    )}
                  {product.rating > 0 ? (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-semibold">
                        {product.rating.toFixed(1)}
                      </span>
                      {product.rating_count > 0 && (
                        <span className="text-muted-foreground">
                          ({product.rating_count})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground/60">
                      No reviews yet
                    </div>
                  )}
                </div>

                {/* Status badges */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={product.is_published ? 'default' : 'secondary'}
                    className={cn(
                      'rounded-full text-[10px] font-semibold',
                      product.is_published
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {product.is_published
                      ? t('courses.published')
                      : t('courses.draft')}
                  </Badge>
                </div>

                {/* Action buttons */}
                <div className="mt-auto flex items-center gap-2 pt-2">
                  {product.access_control ? (
                    <AccessControlActions
                      accessControl={product.access_control}
                      onView={() => onView(product)}
                      onEdit={() => onEdit(product)}
                      onDelete={
                        onDelete ? () => handleDeleteClick(product) : undefined
                      }
                      className="flex w-full justify-between gap-2"
                    />
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(product);
                        }}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(product);
                        }}
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 rounded-lg border-border/50 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(product);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {productToDelete && (
        <ConfirmDeleteModal
          open={Boolean(productToDelete)}
          onOpenChange={handleModalOpenChange}
          title={productToDelete.title}
          itemType="product"
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default ProductsGrid;
