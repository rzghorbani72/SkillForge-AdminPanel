'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Image as ImageIcon, X, SlidersHorizontal } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'react-toastify';
import ImageViewModal from '@/components/modal/image-view-modal';
import ImageEditModal from '@/components/modal/image-edit-modal';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useTranslation } from '@/lib/i18n/hooks';
import { ImageGrid } from './_components/image-grid';
import { ImagesToolbar } from './_components/images-toolbar';
import { ImageItem, resolveImageSrc } from './_lib/page-helpers';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export default function ImagesPage() {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [viewImage, setViewImage] = useState<ImageItem | null>(null);
  const [editImage, setEditImage] = useState<ImageItem | null>(null);
  const [deleteImage, setDeleteImage] = useState<ImageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getImages();

      if (response && response.data && Array.isArray(response.data)) {
        setImages(response.data);
        setFilteredImages(response.data);
      } else if (Array.isArray(response)) {
        setImages(response);
        setFilteredImages(response);
      } else {
        setError('Failed to load images');
      }
    } catch (err) {
      logger.error('Images', 'FetchingImagesFailed', errorFields(err));
      setError('Failed to load images');
      ErrorHandler.handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredImages(images);
    } else {
      const filtered = images.filter((image) =>
        image.filename.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredImages(filtered);
    }
  };

  const handleViewImage = (image: ImageItem) => {
    setViewImage(image);
  };

  const handleEditImage = (image: ImageItem) => {
    setEditImage(image);
  };

  const handleUpdateImage = async (data: { alt?: string }) => {
    if (!editImage) return;

    try {
      await apiClient.updateImage(editImage.id, data);
      toast.success(t('toasts.imageUpdated'));
      fetchImages();
      setEditImage(null);
    } catch (error) {
      logger.error('Images', 'UpdatingImageFailed', errorFields(error));
      ErrorHandler.handleApiError(error);
      throw error;
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      setIsDeleting(true);
      await apiClient.deleteImage(imageId);
      toast.success(t('toasts.imageDeleted'));
      setDeleteImage(null);
      fetchImages();
    } catch (error) {
      logger.error('Images', 'DeletingImageFailed', errorFields(error));
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (image: ImageItem) => {
    setDeleteImage(image);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const locale = 'fa-IR';

    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingSpinner message={t('media.loadingImages')} />;
  }

  if (error) {
    return (
      <div className="page-wrapper flex-1 p-4 sm:p-6">
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ImageIcon className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">{t('media.somethingWentWrong')}</h2>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={fetchImages} variant="outline">
              {t('media.tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-4 sm:p-6" dir={'rtl'}>
      {/* Header */}
      <ImagesToolbar fetchImages={fetchImages} filteredImages={filteredImages} images={images} />

      {/* Search */}
      <div className="fade-in-up flex items-center gap-3" style={{ animationDelay: '0.1s' }}>
        <div className="relative max-w-md flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('media.searchImages')}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-10 rounded-xl border-border/50 bg-background/50 pe-10 ps-10 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute end-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => handleSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl border-border/50"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div
          className="fade-in-up flex flex-1 items-center justify-center p-4 sm:p-6"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="text-center">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent blur-2xl" />
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm">
                <ImageIcon className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">{t('media.noImagesFound')}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {searchQuery ? t('media.noImagesMatch') : t('media.uploadFirstImage')}
            </p>
          </div>
        </div>
      ) : (
        <ImageGrid
          filteredImages={filteredImages}
          formatDate={formatDate}
          formatFileSize={formatFileSize}
          handleDeleteClick={handleDeleteClick}
          handleEditImage={handleEditImage}
          handleViewImage={handleViewImage}
        />
      )}

      {/* View Image Modal */}
      {viewImage && (
        <ImageViewModal
          open={!!viewImage}
          onOpenChange={(open: boolean) => !open && setViewImage(null)}
          imageUrl={resolveImageSrc(viewImage)}
          title={viewImage.alt || viewImage.filename}
          filename={viewImage.filename}
        />
      )}

      {/* Edit Image Modal */}
      {editImage && (
        <ImageEditModal
          open={!!editImage}
          onOpenChange={(open: boolean) => !open && setEditImage(null)}
          image={{
            id: editImage.id,
            publicUrl: resolveImageSrc(editImage),
            filename: editImage.filename,
            alt: editImage.alt,
          }}
          onSave={handleUpdateImage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteImage && (
        <ConfirmDeleteModal
          open={!!deleteImage}
          onOpenChange={(open: boolean) => !open && setDeleteImage(null)}
          title={deleteImage.filename}
          itemType="image"
          onConfirm={() => handleDeleteImage(deleteImage.id)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
