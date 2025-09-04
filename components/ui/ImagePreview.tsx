import React from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X } from 'lucide-react';

interface ImagePreviewProps {
  preview?: string | null;
  uploadedImageId?: string | null;
  selectedImage?: { id: number; url: string } | null;
  onRemove: () => void;
  existingImageUrl?: string | null;
  existingImageId?: string | number | null;
  alt?: string;
  className?: string;
  showPlaceholder?: boolean;
  placeholderText?: string;
  placeholderSubtext?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  preview,
  uploadedImageId,
  selectedImage,
  onRemove,
  existingImageUrl,
  existingImageId,
  alt = 'Image preview',
  className = '',
  showPlaceholder = true,
  placeholderText = 'No image selected',
  placeholderSubtext = 'Upload an image to preview it here'
}) => {
  console.log('ImagePreview props:', {
    preview: preview ? 'Yes' : 'No',
    uploadedImageId,
    selectedImageId: selectedImage?.id,
    selectedImageUrl: selectedImage?.url ? 'Yes' : 'No',
    existingImageUrl: existingImageUrl ? 'Yes' : 'No',
    existingImageId
  });
  // Show uploaded preview if available
  if (preview) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <div
            className={`w-full max-w-md overflow-hidden rounded-lg border border-gray-200 ${className}`}
          >
            <img src={preview} alt={alt} className="h-auto w-full" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="absolute right-2 top-2"
          >
            ×
          </Button>
        </div>
        {uploadedImageId && (
          <p className="text-xs text-green-600">
            ✓ Image uploaded successfully (ID: {uploadedImageId})
          </p>
        )}
      </div>
    );
  }

  // Show selected image from library if available
  if (selectedImage && !preview) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <div
            className={`w-full max-w-md overflow-hidden rounded-lg border border-gray-200 ${className}`}
          >
            <img
              src={selectedImage.url}
              alt={alt}
              className="h-auto w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="absolute right-2 top-2"
          >
            ×
          </Button>
        </div>
        <p className="text-xs text-blue-600">
          ✓ Image selected from library (ID: {selectedImage.id})
        </p>
      </div>
    );
  }

  // Show uploaded image by ID if available (fallback)
  if (uploadedImageId && !preview && !selectedImage) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <div
            className={`w-full max-w-md overflow-hidden rounded-lg border border-gray-200 ${className}`}
          >
            <img
              src={`/api/images/fetch-image-by-id/${uploadedImageId}`}
              alt={alt}
              className="h-auto w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="absolute right-2 top-2"
          >
            ×
          </Button>
        </div>
        <p className="text-xs text-blue-600">
          ✓ Image selected from library (ID: {uploadedImageId})
        </p>
      </div>
    );
  }

  // Show existing image if no preview and existing image exists
  if (existingImageUrl || existingImageId) {
    return (
      <div className="relative h-48 w-full overflow-hidden rounded-lg border">
        <img
          src={existingImageUrl || `/api/media/${existingImageId}`}
          alt="Current image"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Show placeholder if enabled and no image
  if (showPlaceholder) {
    return (
      <div className="flex aspect-[5/4] w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
        <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-600">{placeholderText}</p>
        <p className="mt-1 text-xs text-gray-500">{placeholderSubtext}</p>
      </div>
    );
  }

  return null;
};

export default ImagePreview;
