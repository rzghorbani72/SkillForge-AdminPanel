'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Edit, Calendar, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { AccessControlBadge, AccessControlActions } from '@/components/ui/access-control-badge';
import { cn } from '@/lib/utils';
import { ImageItem, resolveImageSrc } from '../_lib/page-helpers';

export function ImageGrid({
  filteredImages,
  formatDate,
  formatFileSize,
  handleDeleteClick,
  handleEditImage,
  handleViewImage,
}: {
  filteredImages: ImageItem[];
  formatDate: (dateString: string) => string;
  formatFileSize: (bytes: number) => string;
  handleDeleteClick: (image: ImageItem) => void;
  handleEditImage: (image: ImageItem) => void;
  handleViewImage: (image: ImageItem) => void;
}) {
  return (
    <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredImages.map((image, index) => (
        <Card
          key={image.id}
          className={cn(
            'group overflow-hidden border-border/50 transition-all duration-300',
            'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5',
          )}
          style={{ animationDelay: `${0.05 * (index + 1)}s` }}
        >
          <CardHeader className="p-0">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {(() => {
                const src = resolveImageSrc(image);
                if (!src) {
                  return (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  );
                }
                return (
                  <>
                    <Image
                      src={src}
                      alt={image.alt || image.filename}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
                      style={{ display: 'none' }}
                    >
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  </>
                );
              })()}
              {/* Hover overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                    {image.filename}
                  </h3>
                  {image.alt && (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{image.alt}</p>
                  )}
                </div>
                {image.access_control && (
                  <div className="ml-2 flex-shrink-0">
                    <AccessControlBadge
                      accessControl={image.access_control}
                      className="text-[10px]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs">
                <span className="font-medium text-muted-foreground">
                  {formatFileSize(image.size)}
                </span>
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-[10px] font-semibold"
                >
                  {image.mime_type.split('/')[1].toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="mr-1.5 h-3 w-3" />
                <span>{formatDate(image.created_at)}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {image.access_control ? (
                  <AccessControlActions
                    accessControl={image.access_control}
                    onView={() => handleViewImage(image)}
                    onEdit={() => handleEditImage(image)}
                    onDelete={() => handleDeleteClick(image)}
                    className="flex-1"
                  />
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => handleViewImage(image)}
                    >
                      <Eye className="mr-1.5 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => handleEditImage(image)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-border/50 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                      onClick={() => handleDeleteClick(image)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
