'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface ImageViewModalProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Image URL */
  imageUrl: string;
  /** Image title/alt text */
  title?: string;
  /** Image filename */
  filename?: string;
  /** Callback when download is clicked */
  onDownload?: () => void;
}

const ImageViewModal: React.FC<ImageViewModalProps> = ({
  open,
  onOpenChange,
  imageUrl,
  title,
  filename,
  onDownload
}) => {
  const fullImageUrl = imageUrl.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_HOST || ''}${imageUrl}`
    : imageUrl;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = fullImageUrl;
      link.download = filename || 'image';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl p-0">
        <DialogHeader className="px-6 pb-2 pt-10">
          <div className="flex items-center justify-between">
            <DialogTitle>{title || filename || 'Image Preview'}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="relative flex h-[calc(90vh-100px)] w-full items-center justify-center bg-muted p-6">
          <Image
            src={fullImageUrl}
            alt={title || filename || 'Image'}
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewModal;
