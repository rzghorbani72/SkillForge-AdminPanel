import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CategoryType } from './category-utils';

interface CategoryFormData {
  name: string;
  description: string;
  type: CategoryType;
  is_active: boolean;
}

interface CategoryFormProps {
  formData: CategoryFormData;
  onFormDataChange: (data: CategoryFormData) => void;
  isEdit?: boolean;
}

export function CategoryForm({
  formData,
  onFormDataChange,
  isEdit = false
}: CategoryFormProps) {
  const updateFormData = (field: keyof CategoryFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-name' : 'name'}>Name *</Label>
        <Input
          id={isEdit ? 'edit-name' : 'name'}
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter category name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-description' : 'description'}>
          Description
        </Label>
        <Textarea
          id={isEdit ? 'edit-description' : 'description'}
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Enter category description"
          rows={3}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-type' : 'type'}>Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: CategoryType) => updateFormData('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COURSE">Course</SelectItem>
            <SelectItem value="ARTICLE">Article</SelectItem>
            <SelectItem value="BLOG">Blog</SelectItem>
            <SelectItem value="NEWS">News</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isEdit && (
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => updateFormData('is_active', checked)}
          />
          <Label htmlFor="edit-is_active">Active</Label>
        </div>
      )}
    </div>
  );
}
