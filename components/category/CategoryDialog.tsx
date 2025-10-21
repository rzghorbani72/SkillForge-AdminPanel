import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CategoryForm } from './CategoryForm';
import { CategoryType } from './category-utils';

interface CategoryFormData {
  name: string;
  description: string;
  type: CategoryType;
  is_active: boolean;
}

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  formData: CategoryFormData;
  onFormDataChange: (data: CategoryFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CategoryDialog({
  isOpen,
  onOpenChange,
  isEdit,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel
}: CategoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the category information.'
              : 'Add a new category for organizing your courses and content.'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          formData={formData}
          onFormDataChange={onFormDataChange}
          isEdit={isEdit}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? 'Update Category' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
