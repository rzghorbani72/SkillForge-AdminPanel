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
import { Edit, Eye, Plus, Trash2, Package, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/api';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';
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
  const school = useCurrentSchool();
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

  const resultsLabel =
    products.length === 1
      ? t('products.oneProduct')
      : t('products.multipleProducts', { count: products.length });
  const headerDescription = searchTerm
    ? t('products.showingMatching', {
        count: products.length,
        term: searchTerm
      })
    : t('products.showingCount', { count: products.length });

  if (products.length === 0) {
    return (
      <Card className="py-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">{t('products.noProducts')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchTerm
            ? t('products.noProductsMatch', { term: searchTerm })
            : t('products.getStarted')}
        </p>
        {!searchTerm && onCreate && (
          <Button onClick={onCreate} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {t('products.createProduct')}
          </Button>
        )}
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t('products.title')}
          </h2>
          <p className="text-sm text-muted-foreground">{headerDescription}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onView(product)}
            className="flex min-w-[300px] max-w-full flex-1 cursor-pointer flex-col gap-3 sm:max-w-[340px] lg:max-w-[380px] xl:max-w-[420px]"
          >
            <Card className="flex h-full w-full flex-col border-border/60 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-lg">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {product.short_description || product.description}
                    </CardDescription>
                  </div>
                  {product.access_control && (
                    <AccessControlBadge
                      accessControl={product.access_control}
                      className="shrink-0 text-xs"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                {product.cover && (
                  <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image
                      src={product.cover.url || '/placeholder.svg'}
                      alt={product.cover.alt || product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      product.product_type === 'PHYSICAL'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {product.product_type === 'PHYSICAL' ? (
                      <>
                        <Package className="mr-1 h-3 w-3" />
                        {t('products.physical')}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        {t('products.digital')}
                      </>
                    )}
                  </Badge>
                  {product.product_type === 'PHYSICAL' &&
                    product.stock_quantity !== null && (
                      <Badge variant="outline" className="text-xs">
                        {t('products.stock')}: {product.stock_quantity}
                      </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={product.is_published ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {product.is_published
                        ? t('courses.published')
                        : t('courses.draft')}
                    </Badge>
                    {product.is_featured && (
                      <Badge
                        variant="outline"
                        className="border-yellow-600 text-xs text-yellow-600"
                      >
                        {t('courses.featured')}
                      </Badge>
                    )}
                  </div>
                  {product.price && product.price > 0 ? (
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrencyWithSchool(product.price, school)}
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {t('courses.free')}
                    </Badge>
                  )}
                </div>

                {product.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>⭐ {product.rating.toFixed(1)}</span>
                    {product.rating_count > 0 && (
                      <span>
                        ({product.rating_count} {t('products.reviews')})
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  {product.access_control ? (
                    <AccessControlActions
                      accessControl={product.access_control}
                      onView={() => onView(product)}
                      onEdit={() => onEdit(product)}
                      onDelete={
                        onDelete ? () => handleDeleteClick(product) : undefined
                      }
                      className="w-full justify-between gap-2 sm:flex sm:w-auto"
                    />
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[110px] flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(product);
                        }}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {t('common.delete')}
                      </Button>
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[110px] flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(product);
                          }}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          {t('common.edit')}
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
