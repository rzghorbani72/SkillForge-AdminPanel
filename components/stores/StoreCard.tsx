import { Store } from '@/types/api';
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

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
}

export function StoreCard({ store, onEdit }: StoreCardProps) {
  return (
    <Card key={store.id}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <CardTitle className="text-lg">
              {store?.name || 'Unnamed Store'}
            </CardTitle>
            <CardDescription className="text-sm">
              {store?.domain?.private_address ||
                `${store?.slug || 'unknown'}.skillforge.com`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          {store?.description || 'No description provided'}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {store?.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => onEdit(store)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
