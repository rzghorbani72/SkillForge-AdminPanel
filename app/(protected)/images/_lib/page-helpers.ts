export interface ImageItem {
  id: string;
  filename: string;
  publicUrl?: string;
  size: number;
  mime_type: string;
  created_at: string;
  alt?: string;
  access_control?: {
    can_modify: boolean;
    can_delete: boolean;
    can_view: boolean;
    is_owner: boolean;
    user_role: string;
    user_permissions: string[];
  };
}

export const resolveImageSrc = (image: ImageItem): string => {
  const raw = image.publicUrl ?? '';
  if (!raw) return '';
  return raw.startsWith('/') ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${raw}` : raw;
};
