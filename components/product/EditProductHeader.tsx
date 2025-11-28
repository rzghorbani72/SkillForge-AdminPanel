import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Product } from '@/types/api';

type Props = {
  product: Product;
  onBack: () => void;
};

const EditProductHeader = ({ product, onBack }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Edit Product
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {product.title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProductHeader;
