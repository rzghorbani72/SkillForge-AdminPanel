import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Upload, Loader2, X, Library } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImagePreview from './ImagePreview';
import ImageSelectionDialog from './ImageSelectionDialog';

interface ImageUploadPreviewProps {
  title?: string;
  description?: string;
  onSuccess?: (image: { id: number; url: string }) => void;
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
  showImageSelection?: boolean;
  selectedImageId?: string | null;
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
  showImageSelection = true,
  selectedImageId,
  disabled = false
}) => {
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    id: number;
    url: string;
  } | null>(null);

  const imageUpload = useImageUpload({
    title,
    description,
    onSuccess: (imageId) => {
      // Handle uploaded image
      onSuccess?.({ id: parseInt(imageId), url: '' });
    },
    onError,
    onCancel
  });

  const handleImageSelect = (image: { id: number; url: string }) => {
    console.log('ImageUploadPreview - Image selected:', image);
    console.log('ImageUploadPreview - Calling onSuccess with:', image);
    setSelectedImage(image);
    onSuccess?.(image);
  };

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

      {/* Upload, Select, and Cancel Buttons */}
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

        {showImageSelection && (
          <ImageSelectionDialog
            onSelect={handleImageSelect}
            selectedImageId={selectedImageId}
            trigger={
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className="px-4"
              >
                <Library className="mr-2 h-4 w-4" />
                Library
              </Button>
            }
            open={isSelectionDialogOpen}
            onOpenChange={setIsSelectionDialogOpen}
          />
        )}

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
        uploadedImageId={imageUpload.uploadedImageId || selectedImageId}
        selectedImage={selectedImage}
        onRemove={() => {
          imageUpload.removeFile();
          setSelectedImage(null);
          if (selectedImageId) {
            onSuccess?.({ id: 0, url: '' });
          }
        }}
        existingImageUrl={existingImageUrl}
        existingImageId={existingImageId}
        alt={alt}
        className={className}
        showPlaceholder={showPlaceholder}
        placeholderText={placeholderText}
        placeholderSubtext={placeholderSubtext}
      />
      {/* Debug info */}
      <div className="text-xs text-gray-500">
        Debug: uploadedImageId={imageUpload.uploadedImageId}, selectedImageId=
        {selectedImageId}, selectedImageId={selectedImage?.id},
        selectedImageUrl={selectedImage?.url ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

export default ImageUploadPreview;
