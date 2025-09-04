// Example of how to use the useImageUpload hook in any component

import React from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';

const ImageUploadExample = () => {
  const imageUpload = useImageUpload({
    title: 'Example Image',
    description: 'This is an example image upload',
    onSuccess: (imageId) => {
      console.log('Image uploaded with ID:', imageId);
      // Handle the uploaded image ID (e.g., save to form, update state, etc.)
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
    onCancel: () => {
      console.log('Upload cancelled');
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Image Upload Example</h3>

      {/* File Input */}
      <Input
        type="file"
        accept="image/*"
        onChange={imageUpload.handleFileChange}
        className="cursor-pointer"
      />

      {/* Upload Controls */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={imageUpload.uploadImage}
          disabled={!imageUpload.canUpload}
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
              Upload Image
            </>
          ) : (
            'Select an image first'
          )}
        </Button>

        {imageUpload.canCancel && (
          <Button
            type="button"
            variant="destructive"
            onClick={imageUpload.cancelUpload}
            className="px-4"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      {/* Image Preview */}
      {imageUpload.preview && (
        <div className="space-y-3">
          <div className="relative">
            <div className="w-full max-w-md overflow-hidden rounded-lg border border-gray-200">
              <img
                src={imageUpload.preview}
                alt="Image preview"
                className="h-auto w-full"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={imageUpload.removeFile}
              className="absolute right-2 top-2"
            >
              ×
            </Button>
          </div>
          {imageUpload.uploadedImageId && (
            <p className="text-xs text-green-600">
              ✓ Image uploaded successfully (ID: {imageUpload.uploadedImageId})
            </p>
          )}
        </div>
      )}

      {/* No Image State */}
      {!imageUpload.preview && (
        <div className="flex aspect-[5/4] w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">No image selected</p>
          <p className="mt-1 text-xs text-gray-500">
            Upload an image to preview it here
          </p>
        </div>
      )}

      {/* Status Information */}
      <div className="text-sm text-gray-600">
        <p>Has File: {imageUpload.hasFile ? 'Yes' : 'No'}</p>
        <p>Is Uploading: {imageUpload.isUploading ? 'Yes' : 'No'}</p>
        <p>Is Uploaded: {imageUpload.isUploaded ? 'Yes' : 'No'}</p>
        <p>Can Upload: {imageUpload.canUpload ? 'Yes' : 'No'}</p>
        <p>Can Cancel: {imageUpload.canCancel ? 'Yes' : 'No'}</p>
        {imageUpload.uploadedImageId && (
          <p>Uploaded Image ID: {imageUpload.uploadedImageId}</p>
        )}
      </div>
    </div>
  );
};

export default ImageUploadExample;
