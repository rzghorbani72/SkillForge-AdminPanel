import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Image as ImageIcon,
  Check,
  Loader2,
  X,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface Image {
  id: number;
  url: string;
  alt?: string;
  title?: string;
  created_at: string;
  filename?: string;
}

interface ImageWithState extends Image {
  isLoading?: boolean;
  hasError?: boolean;
  isDeleting?: boolean;
}

interface ImageSelectionDialogProps {
  onSelect: (imageId: string) => void;
  selectedImageId?: string | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ImageSelectionDialog: React.FC<ImageSelectionDialogProps> = ({
  onSelect,
  selectedImageId,
  trigger,
  open,
  onOpenChange
}) => {
  const [images, setImages] = useState<ImageWithState[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageWithState[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getImages();

      // Handle the API response structure: { message, status, data: images[] }
      if (response && Array.isArray(response)) {
        // Transform the response to match our Image interface with loading states
        const transformedImages = response.map((img: any) => ({
          id: img.id,
          url:
            process.env.NEXT_PUBLIC_HOST +
            (img.public_url_by_filename || img.public_url_by_id),
          alt: img.alt || '',
          title: img.filename || `Image ${img.id}`,
          created_at: img.created_at || new Date().toISOString(),
          filename: img.filename,
          isLoading: true,
          hasError: false,
          isDeleting: false
        }));

        setImages(transformedImages);
        setFilteredImages(transformedImages);
      } else {
        setError('No images found');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredImages(images);
    } else {
      const filtered = images.filter(
        (image) =>
          image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.id.toString().includes(searchTerm)
      );
      setFilteredImages(filtered);
    }
  }, [searchTerm, images]);

  const handleImageSelect = (imageId: string) => {
    onSelect(imageId);
    onOpenChange?.(false);
  };

  const handleImageLoad = (imageId: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, isLoading: false, hasError: false } : img
      )
    );
    setFilteredImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, isLoading: false, hasError: false } : img
      )
    );
  };

  const handleImageError = (imageId: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, isLoading: false, hasError: true } : img
      )
    );
    setFilteredImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, isLoading: false, hasError: true } : img
      )
    );
  };

  const handleDeleteClick = (imageId: number, event: React.MouseEvent) => {
    setImageToDelete(imageId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      // Update loading state
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageToDelete ? { ...img, isDeleting: true } : img
        )
      );
      setFilteredImages((prev) =>
        prev.map((img) =>
          img.id === imageToDelete ? { ...img, isDeleting: true } : img
        )
      );

      // Call delete API
      await apiClient.deleteImage(imageToDelete);

      // Remove from state
      setImages((prev) => prev.filter((img) => img.id !== imageToDelete));
      setFilteredImages((prev) =>
        prev.filter((img) => img.id !== imageToDelete)
      );

      toast.success('Image deleted successfully');
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('Failed to delete image');

      // Reset loading state on error
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageToDelete ? { ...img, isDeleting: false } : img
        )
      );
      setFilteredImages((prev) =>
        prev.map((img) =>
          img.id === imageToDelete ? { ...img, isDeleting: false } : img
        )
      );
    } finally {
      setShowDeleteDialog(false);
      setImageToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setImageToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" type="button">
            <ImageIcon className="mr-2 h-4 w-4" />
            Select from Library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Image from Library</DialogTitle>
          <DialogDescription>
            Choose an image from your previously uploaded images
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search images by title, alt text, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Images Grid */}
          <ScrollArea className="h-[400px] w-full">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading images...</span>
              </div>
            ) : error ? (
              <div className="flex h-32 items-center justify-center text-red-500">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchImages}
                  className="ml-4"
                >
                  Retry
                </Button>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-gray-500">
                <ImageIcon className="mb-2 h-8 w-8" />
                <span>No images found</span>
                {searchTerm && (
                  <span className="text-sm">Try a different search term</span>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-1 md:grid-cols-3 lg:grid-cols-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`group relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedImageId === image.id.toString()
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={(e) => {
                      // Don't select if clicking on delete button or its children
                      if (
                        e.target instanceof Element &&
                        (e.target.closest('button[data-delete-button]') ||
                          e.target.closest('[data-delete-button]'))
                      ) {
                        return;
                      }
                      if (!image.isDeleting) {
                        handleImageSelect(image.id.toString());
                      }
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      {/* Loading state */}
                      {image.isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      )}

                      {/* Error state - show corrupted image placeholder */}
                      {image.hasError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                          <AlertCircle className="mb-2 h-8 w-8" />
                          <span className="px-2 text-center text-xs">
                            Corrupted Image
                          </span>
                        </div>
                      ) : (
                        <img
                          src={image.url}
                          alt={image.alt || 'Image'}
                          className="h-full w-full object-cover"
                          onLoad={() => handleImageLoad(image.id)}
                          onError={() => handleImageError(image.id)}
                          style={{
                            display: image.isLoading ? 'none' : 'block'
                          }}
                        />
                      )}
                    </div>

                    {/* Selection indicator */}
                    {selectedImageId === image.id.toString() &&
                      !image.isDeleting && (
                        <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                    {/* Delete button */}
                    {!image.isDeleting && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute left-2 top-2 z-10 h-6 w-6 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        data-delete-button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(image.id, e);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}

                    {/* Deleting state */}
                    {image.isDeleting && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}

                    {/* Image info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black bg-opacity-75 p-2 text-white">
                      <div className="truncate text-xs font-medium">
                        {image.title || `Image ${image.id}`}
                      </div>
                      <div className="text-xs opacity-75">
                        {formatDate(image.created_at)}
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 transition-all group-hover:bg-opacity-20" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              {filteredImages.length} of {images.length} images
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default ImageSelectionDialog;
