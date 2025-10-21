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
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getCategoryTypeIcon, getCategoryTypeColor } from './category-utils';

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
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryTypeIcon(category.type)}
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <Badge
                variant="secondary"
                className={getCategoryTypeColor(category.type)}
              >
                {category.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {category.is_active ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {category.description && (
          <CardDescription className="mb-4 line-clamp-2">
            {category.description}
          </CardDescription>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Created: {new Date(category.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
