import React, { useCallback, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { langApiVersionPath } from '@/lib/api-lang';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadPreviewProps {
  title?: string;
  description?: string;
  onSuccess?: (image: { id: string; url: string }) => void;
  onError?: (error: any) => void;
  existingImageUrl?: string | null;
  existingImageId?: string | number | null;
  alt?: string;
  className?: string;
  placeholderText?: string;
  placeholderSubtext?: string;
  selectedImageId?: string | null;
  disabled?: boolean;
}

/** Same-origin API image URL (lang-prefixed /v1). Keep relative for the image loader. */
function fetchImageByIdSrc(id: string | number): string {
  return `${langApiVersionPath()}/images/fetch-image-by-id/${id}`;
}

/** Prefer relative same-origin paths; absolute / blob / data URLs pass through. */
function resolveImageSrc(pathOrUrl: string): string {
  if (/^(https?:|blob:|data:)/.test(pathOrUrl)) return pathOrUrl;
  return pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  title = 'Image Upload',
  description = 'Upload an image',
  onSuccess,
  onError,
  existingImageUrl,
  existingImageId,
  alt = 'Image preview',
  className = '',
  placeholderText = 'No image selected',
  placeholderSubtext = 'Click to browse or drag an image here',
  selectedImageId,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const imageUpload = useImageUpload({
    title,
    description,
    onSuccess,
    onError
  });

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file) imageUpload.selectAndUpload(file);
    },
    [imageUpload]
  );

  const currentSrc = imageUpload.preview
    ? resolveImageSrc(imageUpload.preview)
    : imageUpload.uploadedImageId
      ? fetchImageByIdSrc(imageUpload.uploadedImageId)
      : selectedImageId
        ? fetchImageByIdSrc(selectedImageId)
        : existingImageUrl
          ? resolveImageSrc(existingImageUrl)
          : existingImageId
            ? fetchImageByIdSrc(existingImageId)
            : null;

  const handleRemove = () => {
    imageUpload.removeFile();
    // The remove button only renders while an image is showing, so the
    // parent always needs to be told the cover was cleared.
    onSuccess?.({ id: '', url: '' });
  };

  return (
    <div
      className={cn(
        'relative h-64 w-full max-w-md overflow-hidden rounded-lg border-2 border-dashed transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border',
        !disabled && 'cursor-pointer hover:border-primary/60',
        className
      )}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {currentSrc ? (
        <div className="relative aspect-[5/4] h-64 w-full">
          <Image
            src={currentSrc}
            alt={alt}
            fill
            sizes="400px"
            className="object-cover"
          />
          {!imageUpload.isUploading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={disabled}
              className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex aspect-[5/4] h-64 w-full flex-col items-center justify-center gap-2 px-4 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {placeholderText}
          </p>
          <p className="text-xs text-muted-foreground">{placeholderSubtext}</p>
        </div>
      )}

      {imageUpload.isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs font-medium text-foreground">
            {imageUpload.uploadProgress}%
          </p>
        </div>
      )}

      {!currentSrc && !imageUpload.isUploading && (
        <div className="pointer-events-none absolute bottom-2 end-2 text-muted-foreground/60">
          <UploadCloud className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default ImageUploadPreview;
