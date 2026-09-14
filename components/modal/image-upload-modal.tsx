'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';

interface ImageUploadModalProps {
  /** Trigger button element - if not provided, modal must be controlled via open/onOpenChange */
  trigger?: React.ReactNode;
  /** Whether the modal is open (for controlled usage) */
  open?: boolean;
  /** Callback when modal open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Callback when image is successfully uploaded or selected */
  onSuccess?: (image: { id: string; url: string }) => void;
  /** Callback when upload/selection fails */
  onError?: (error: any) => void;
  /** Title for the uploaded image */
  title?: string;
  /** Description for the uploaded image */
  description?: string;
  /** Modal title */
  modalTitle?: string;
  /** Modal description */
  modalDescription?: string;
  /** Currently selected image ID */
  selectedImageId?: string | null;
  /** Disable the upload functionality */
  disabled?: boolean;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  trigger,
  open,
  onOpenChange,
  onSuccess,
  onError,
  title = 'Image Upload',
  description = 'Upload an image',
  modalTitle = 'Upload Image',
  modalDescription = 'Click to browse or drag an image here',
  selectedImageId,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = open !== undefined;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleSuccess = (image: { id: string; url: string }) => {
    onSuccess?.(image);
    // Close modal after successful upload/selection with a small delay
    // to ensure toast notifications are visible
    setTimeout(() => {
      handleOpenChange(false);
    }, 100);
  };

  const currentOpen = isControlled ? open : isOpen;

  return (
    <Dialog open={currentOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ImageUploadPreview
            title={title}
            description={description}
            onSuccess={handleSuccess}
            onError={onError}
            selectedImageId={selectedImageId}
            disabled={disabled}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
