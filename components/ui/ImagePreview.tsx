import React from 'react';
import { langApiVersionPath } from '@/lib/api-lang';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImagePreviewProps {
  preview?: string | null;
  uploadedImageId?: string | null;
  selectedImage?: { id: string; publicUrl: string } | null;
  onRemove: () => void;
  existingImageUrl?: string | null;
  existingImageId?: string | number | null;
  alt?: string;
  className?: string;
  showPlaceholder?: boolean;
  placeholderText?: string;
  placeholderSubtext?: string;
}

/** Same-origin API image URL (lang-prefixed /v1). Keep relative for the image loader. */
function fetchImageByIdSrc(id: string | number): string {
  return `${langApiVersionPath()}/images/fetch-image-by-id/${id}`;
}

/**
 * Prefer relative same-origin paths so the custom loader resolves the panel host.
 * Absolute / blob / data URLs pass through unchanged.
 */
function resolveImageSrc(pathOrUrl: string): string {
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('blob:') ||
    pathOrUrl.startsWith('data:')
  ) {
    return pathOrUrl;
  }
  return pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
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
  // Show uploaded preview if available
  if (preview) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <div
            className={`w-full max-w-md overflow-hidden rounded-lg border border-border ${className}`}
          >
            <Image
              src={resolveImageSrc(preview)}
              alt={alt}
              className="h-auto w-full object-contain"
              width={0}
              height={0}
              sizes="100vw"
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
            className={`w-full max-w-md overflow-hidden rounded-lg border border-border ${className}`}
          >
            <Image
              src={resolveImageSrc(selectedImage.publicUrl)}
              alt={alt}
              className="h-auto w-full object-contain"
              width={0}
              height={0}
              sizes="100vw"
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
            className={`w-full max-w-md overflow-hidden rounded-lg border border-border ${className}`}
          >
            <Image
              src={fetchImageByIdSrc(uploadedImageId)}
              alt={alt}
              className="h-auto w-full object-contain"
              width={0}
              height={0}
              sizes="100vw"
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
    const existingSrc = existingImageUrl
      ? resolveImageSrc(existingImageUrl)
      : fetchImageByIdSrc(existingImageId!);

    return (
      <div className="relative h-48 w-full overflow-hidden rounded-lg border">
        <Image
          src={existingSrc}
          alt="Current image"
          className="h-full w-full object-cover"
          width={0}
          height={0}
        />
      </div>
    );
  }

  // Show placeholder if enabled and no image
  if (showPlaceholder) {
    return (
      <div className="flex aspect-[5/4] w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-border">
        <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{placeholderText}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {placeholderSubtext}
        </p>
      </div>
    );
  }

  return null;
};

export default ImagePreview;
