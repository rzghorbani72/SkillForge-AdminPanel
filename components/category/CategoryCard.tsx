'use client';

import { Category } from '@/types/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { getCategoryTypeIcon, getCategoryTypeColor } from './category-utils';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete
}: CategoryCardProps) {
  return (
    <Card
      className={cn(
        'group overflow-hidden border-border/50 transition-all duration-300',
        'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              {getCategoryTypeIcon(category.type)}
            </div>
            <div className="space-y-1">
              <CardTitle className="line-clamp-1 text-base font-semibold transition-colors group-hover:text-primary">
                {category.name}
              </CardTitle>
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-full px-2 py-0 text-[10px] font-semibold',
                  getCategoryTypeColor(category.type)
                )}
              >
                {category.type}
              </Badge>
            </div>
          </div>
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              category.is_active
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {category.is_active ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {category.description && (
          <CardDescription className="line-clamp-2 text-xs">
            {category.description}
          </CardDescription>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(category.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/50 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => onEdit(category)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/50 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
              onClick={() => onDelete(category.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
