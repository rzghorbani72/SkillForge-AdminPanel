import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage your products and inventory
        </p>
      </div>
      <Button onClick={() => router.push('/products/create')}>
        <Plus className="mr-2 h-4 w-4" />
        Create Product
      </Button>
    </div>
  );
}
