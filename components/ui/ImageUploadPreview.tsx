import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Upload, Loader2, X } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImagePreview from './ImagePreview';

interface ImageUploadPreviewProps {
  title?: string;
  description?: string;
  onSuccess?: (imageId: string) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  existingImageUrl?: string | null;
  existingImageId?: string | number | null;
  alt?: string;
  className?: string;
  showPlaceholder?: boolean;
  placeholderText?: string;
  placeholderSubtext?: string;
  uploadButtonText?: string;
  selectButtonText?: string;
  disabled?: boolean;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  title = 'Image Upload',
  description = 'Upload an image',
  onSuccess,
  onError,
  onCancel,
  existingImageUrl,
  existingImageId,
  alt = 'Image preview',
  className = '',
  showPlaceholder = true,
  placeholderText = 'No image selected',
  placeholderSubtext = 'Upload an image to preview it here',
  uploadButtonText = 'Upload Image',
  selectButtonText = 'Select an image first',
  disabled = false
}) => {
  const imageUpload = useImageUpload({
    title,
    description,
    onSuccess,
    onError,
    onCancel
  });

  return (
    <div className="space-y-4">
      {/* File Input */}
      <Input
        type="file"
        accept="image/*"
        onChange={imageUpload.handleFileChange}
        className="cursor-pointer"
        disabled={disabled}
      />

      {/* Upload and Cancel Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={imageUpload.uploadImage}
          disabled={!imageUpload.canUpload || disabled}
          className="flex-1"
        >
          {imageUpload.isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : imageUpload.hasFile ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {uploadButtonText}
            </>
          ) : (
            selectButtonText
          )}
        </Button>

        {imageUpload.canCancel && (
          <Button
            type="button"
            variant="destructive"
            onClick={imageUpload.cancelUpload}
            className="px-4"
            disabled={disabled}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      {/* Image Preview */}
      <ImagePreview
        preview={imageUpload.preview}
        uploadedImageId={imageUpload.uploadedImageId}
        onRemove={imageUpload.removeFile}
        existingImageUrl={existingImageUrl}
        existingImageId={existingImageId}
        alt={alt}
        className={className}
        showPlaceholder={showPlaceholder}
        placeholderText={placeholderText}
        placeholderSubtext={placeholderSubtext}
      />
    </div>
  );
};

export default ImageUploadPreview;
