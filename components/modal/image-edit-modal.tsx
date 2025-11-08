'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface ImageEditModalProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Image data */
  image: {
    id: number;
    url: string;
    filename?: string;
    alt?: string;
  };
  /** Callback when image is updated */
  onSave: (data: { alt?: string }) => Promise<void>;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({
  open,
  onOpenChange,
  image,
  onSave
}) => {
  const [alt, setAlt] = useState(image.alt || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAlt(image.alt || '');
    }
  }, [open, image.alt]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({ alt: alt.trim() });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>
            Update the image metadata and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Filename (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={image.filename || 'N/A'}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="alt">Alt Text</Label>
            <Textarea
              id="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Enter alt text for the image"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Alt text is used for accessibility and SEO
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditModal;
