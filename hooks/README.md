# useImageUpload Hook

A reusable React hook for handling image uploads with preview, progress tracking, and cancellation support.

## Features

- ✅ File selection and preview
- ✅ Upload progress tracking
- ✅ Upload cancellation with AbortController
- ✅ Toast notifications for success/error states
- ✅ Automatic cleanup on unmount
- ✅ TypeScript support
- ✅ Customizable callbacks

## Usage

```tsx
import { useImageUpload } from '@/hooks/useImageUpload';

const MyComponent = () => {
  const imageUpload = useImageUpload({
    title: 'My Image',
    description: 'Image description',
    onSuccess: (imageId) => {
      console.log('Uploaded image ID:', imageId);
      // Handle successful upload
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      // Handle upload error
    },
    onCancel: () => {
      console.log('Upload cancelled');
      // Handle upload cancellation
    }
  });

  return (
    <div>
      {/* File input */}
      <input
        type="file"
        accept="image/*"
        onChange={imageUpload.handleFileChange}
      />

      {/* Upload button */}
      <button
        onClick={imageUpload.uploadImage}
        disabled={!imageUpload.canUpload}
      >
        {imageUpload.isUploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {/* Cancel button */}
      {imageUpload.canCancel && (
        <button onClick={imageUpload.cancelUpload}>Cancel</button>
      )}

      {/* Image preview */}
      {imageUpload.preview && <img src={imageUpload.preview} alt="Preview" />}
    </div>
  );
};
```

## API

### Options

| Option        | Type                        | Description                        |
| ------------- | --------------------------- | ---------------------------------- |
| `title`       | `string`                    | Title for the uploaded image       |
| `description` | `string`                    | Description for the uploaded image |
| `onSuccess`   | `(imageId: string) => void` | Callback when upload succeeds      |
| `onError`     | `(error: Error) => void`    | Callback when upload fails         |
| `onCancel`    | `() => void`                | Callback when upload is cancelled  |

### Return Value

| Property           | Type                                             | Description                       |
| ------------------ | ------------------------------------------------ | --------------------------------- |
| `selectedFile`     | `File \| null`                                   | Currently selected file           |
| `preview`          | `string \| null`                                 | Preview URL for selected file     |
| `isUploading`      | `boolean`                                        | Whether upload is in progress     |
| `uploadedImageId`  | `string \| null`                                 | ID of successfully uploaded image |
| `hasFile`          | `boolean`                                        | Whether a file is selected        |
| `isUploaded`       | `boolean`                                        | Whether file has been uploaded    |
| `canUpload`        | `boolean`                                        | Whether upload can be started     |
| `canCancel`        | `boolean`                                        | Whether upload can be cancelled   |
| `handleFileChange` | `(event: ChangeEvent<HTMLInputElement>) => void` | Handle file selection             |
| `removeFile`       | `() => void`                                     | Remove selected file and preview  |
| `uploadImage`      | `() => Promise<void>`                            | Start upload process              |
| `cancelUpload`     | `() => void`                                     | Cancel ongoing upload             |
| `reset`            | `() => void`                                     | Reset all state                   |

## Examples

### Basic Usage

```tsx
const imageUpload = useImageUpload({
  title: 'Profile Picture',
  onSuccess: (imageId) => setProfileImageId(imageId)
});
```

### With Form Integration

```tsx
const form = useForm();
const imageUpload = useImageUpload({
  title: form.watch('title'),
  description: form.watch('description'),
  onSuccess: (imageId) => form.setValue('image_id', imageId)
});
```

### With Custom Error Handling

```tsx
const imageUpload = useImageUpload({
  title: 'Document',
  onSuccess: (imageId) => {
    toast.success('Document uploaded!');
    setDocumentId(imageId);
  },
  onError: (error) => {
    toast.error('Upload failed: ' + error.message);
    // Custom error handling
  },
  onCancel: () => {
    toast.info('Upload cancelled');
    // Custom cancellation handling
  }
});
```

## Integration with Forms

The hook works seamlessly with React Hook Form:

```tsx
const form = useForm();
const imageUpload = useImageUpload({
  title: form.watch('title') || 'Default Title',
  description: form.watch('description') || 'Default Description',
  onSuccess: (imageId) => {
    form.setValue('image_id', imageId);
  }
});
```

## Cleanup

The hook automatically handles cleanup:

- Revokes object URLs to prevent memory leaks
- Cancels ongoing uploads on unmount
- Resets state when needed

## Error Handling

The hook provides comprehensive error handling:

- Network errors
- Upload failures
- Cancellation handling
- Toast notifications for user feedback

## TypeScript Support

Full TypeScript support with proper type definitions for all options and return values.
