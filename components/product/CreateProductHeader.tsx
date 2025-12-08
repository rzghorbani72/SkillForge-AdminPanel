import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Props = {
  storeName: string;
  onBack: () => void;
};

const CreateProductHeader = ({ storeName, onBack }: Props) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
        <p className="text-muted-foreground">
          Add a new product to {storeName}
        </p>
      </div>
    </div>
  );
};

export default CreateProductHeader;
