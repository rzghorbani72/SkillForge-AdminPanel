'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit,
  Calendar,
  User,
  Image as ImageIcon,
  X,
  SlidersHorizontal,
  Sparkles,
  ImagePlus
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';
import ImageUploadModal from '@/components/modal/image-upload-modal';
import ImageViewModal from '@/components/modal/image-view-modal';
import ImageEditModal from '@/components/modal/image-edit-modal';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';

interface ImageItem {
  id: number;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  created_at: string;
  alt?: string;
  access_control?: {
    can_modify: boolean;
    can_delete: boolean;
    can_view: boolean;
    is_owner: boolean;
    user_role: string;
    user_permissions: string[];
  };
}

export default function ImagesPage() {
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
      console.error('Error fetching images:', err);
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
        image.filename.toLowerCase().includes(query.toLowerCase())
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
      toast.success('Image updated successfully');
      fetchImages();
      setEditImage(null);
    } catch (error) {
      console.error('Error updating image:', error);
      ErrorHandler.handleApiError(error);
      throw error;
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      setIsDeleting(true);
      await apiClient.deleteImage(imageId);
      toast.success('Image deleted successfully');
      setDeleteImage(null);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading images..." />;
  }

  if (error) {
    return (
      <div className="page-wrapper flex-1 p-6">
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ImageIcon className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={fetchImages} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="icon-container-warning">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Images
              </h1>
              <Badge
                variant="secondary"
                className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:flex"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {images.length} files
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage your image library ({filteredImages.length} of{' '}
              {images.length} images)
            </p>
          </div>
        </div>
        <ImageUploadModal
          trigger={
            <Button className="gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30">
              <ImagePlus className="h-4 w-4" />
              Upload Image
            </Button>
          }
          onSuccess={(image) => {
            fetchImages();
          }}
          onError={(error) => {
            console.error('Error uploading image:', error);
            ErrorHandler.handleApiError(error);
          }}
          modalTitle="Upload Image"
          modalDescription="Upload a new image or select from your library"
        />
      </div>

      {/* Search */}
      <div
        className="fade-in-up flex items-center gap-3"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search images by title or owner..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-10 rounded-xl border-border/50 bg-background/50 pl-10 pr-10 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
          className="fade-in-up flex flex-1 items-center justify-center p-6"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="text-center">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent blur-2xl" />
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm">
                <ImageIcon className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              No images found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {searchQuery
                ? 'No images match your search criteria.'
                : 'Upload your first image to get started.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map((image, index) => (
            <Card
              key={image.id}
              className={cn(
                'group overflow-hidden border-border/50 transition-all duration-300',
                'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
              )}
              style={{ animationDelay: `${0.05 * (index + 1)}s` }}
            >
              <CardHeader className="p-0">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <Image
                    src={
                      image.url.startsWith('/')
                        ? `${process.env.NEXT_PUBLIC_HOST}${image.url}`
                        : image.url
                    }
                    alt={image.alt || image.filename}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder =
                        target.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
                    style={{ display: 'none' }}
                  >
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  {/* Hover overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                        {image.filename}
                      </h3>
                      {image.alt && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {image.alt}
                        </p>
                      )}
                    </div>
                    {image.access_control && (
                      <div className="ml-2 flex-shrink-0">
                        <AccessControlBadge
                          accessControl={image.access_control}
                          className="text-[10px]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs">
                    <span className="font-medium text-muted-foreground">
                      {formatFileSize(image.size)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2 py-0 text-[10px] font-semibold"
                    >
                      {image.mime_type.split('/')[1].toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1.5 h-3 w-3" />
                    <span>{formatDate(image.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {image.access_control ? (
                      <AccessControlActions
                        accessControl={image.access_control}
                        onView={() => handleViewImage(image)}
                        onEdit={() => handleEditImage(image)}
                        onDelete={() => handleDeleteClick(image)}
                        className="flex-1"
                      />
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => handleViewImage(image)}
                        >
                          <Eye className="mr-1.5 h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => handleEditImage(image)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-border/50 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                          onClick={() => handleDeleteClick(image)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Image Modal */}
      {viewImage && (
        <ImageViewModal
          open={!!viewImage}
          onOpenChange={(open: boolean) => !open && setViewImage(null)}
          imageUrl={viewImage.url}
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
            url: editImage.url,
            filename: editImage.filename,
            alt: editImage.alt
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
