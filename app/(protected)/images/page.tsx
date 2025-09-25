'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Eye,
  Calendar,
  User,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';

interface ImageItem {
  id: number;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  created_at: string;
  access_control?: {
    can_modify: boolean;
    can_delete: boolean;
    can_view: boolean;
    is_owner: boolean;
    user_role: string;
    user_permissions: string[];
  };
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getImages();

      // Handle new response structure with access control
      if (response && response.data && Array.isArray(response.data)) {
        setImages(response.data);
        setFilteredImages(response.data);
      } else if (Array.isArray(response)) {
        // Fallback for old response format
        setImages(response);
        setFilteredImages(response);
      } else {
        setError('Failed to load images');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images');
      ErrorHandler.handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredImages(images);
    } else {
      const filtered = images.filter((image) =>
        image.filename.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredImages(filtered);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await apiClient.deleteImage(imageId);
      toast.success('Image deleted successfully');
      fetchImages(); // Refresh the list
    } catch (error) {
      console.error('Error deleting image:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading images...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-destructive">Error</h2>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={fetchImages} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Images</h1>
          <p className="text-muted-foreground">
            Manage your image library ({filteredImages.length} of{' '}
            {images.length} images)
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search images by title or owner..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No images found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No images match your search criteria.'
                  : 'Upload your first image to get started.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((image) => {
            return (
              <Card key={image.id} className={`overflow-hidden `}>
                <CardHeader className="p-0">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image
                      src={
                        image.url.startsWith('/')
                          ? `${process.env.NEXT_PUBLIC_HOST}${image.url}`
                          : image.url
                      }
                      alt={image.filename}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder =
                          target.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
                      style={{ display: 'none' }}
                    >
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="line-clamp-2 flex-1 font-semibold">
                        {image.filename}
                      </h3>
                      {/* Access Control Badge */}
                      {image.access_control && (
                        <div className="ml-2">
                          <AccessControlBadge
                            accessControl={image.access_control}
                            className="text-xs"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatFileSize(image.size)}</span>
                      <Badge variant="outline">
                        {image.mime_type.split('/')[1].toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>{formatDate(image.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      {image.access_control ? (
                        <AccessControlActions
                          accessControl={image.access_control}
                          onView={() => console.log('View image', image.id)}
                          onEdit={() => console.log('Edit image', image.id)}
                          onDelete={() => handleDeleteImage(image.id)}
                          className="flex-1"
                        />
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the image "{image.filename}
                                  ".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
