import { School } from '@/types/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Edit } from 'lucide-react';

interface SchoolCardProps {
  school: School;
  onEdit: (school: School) => void;
}

export function SchoolCard({ school, onEdit }: SchoolCardProps) {
  return (
    <Card key={school.id}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <CardTitle className="text-lg">
              {school?.name || 'Unnamed School'}
            </CardTitle>
            <CardDescription className="text-sm">
              {school?.domain?.private_address ||
                `${school?.slug || 'unknown'}.skillforge.com`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          {school?.description || 'No description provided'}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {school?.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => onEdit(school)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
