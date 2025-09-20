import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Edit, Eye, Layers, Plus, Trash2 } from 'lucide-react';
import { Season } from '@/types/api';

type Props = {
  seasons: Season[];
  searchTerm: string;
  onCreate?: () => void;
};

const SeasonsGrid = ({ seasons, searchTerm, onCreate }: Props) => {
  if (seasons.length === 0) {
    return (
      <Card className="py-12 text-center">
        <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">No seasons found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchTerm
            ? `No seasons match "${searchTerm}"`
            : 'Get started by creating your first season.'}
        </p>
        {!searchTerm && onCreate && (
          <Button onClick={onCreate} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Create Season
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {seasons.map((season) => (
        <Card key={season.id} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">{season.title}</CardTitle>
            <CardDescription className="text-sm">
              {season.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center">
                  <BookOpen className="mr-1 h-4 w-4" />
                  {season.course?.title || 'No Course'}
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Order: {season.order || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Season {season.order}</Badge>
                <span className="text-sm text-muted-foreground">
                  Lessons: {season.lessons?.length || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-1 h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SeasonsGrid;
