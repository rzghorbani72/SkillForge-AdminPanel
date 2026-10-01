export interface ImageSlot {
  key: string;
  aspect: '16:9' | '4:3' | '1:1' | 'auto';
  sizeOptions: ('sm' | 'md' | 'lg' | 'full')[];
}

export interface SectionCatalogEntry {
  id: string;
  presetId: string;
  presetName: string;
  presetPreview: string | null;
  blockId: string;
  blockType: string;
  sectionVariant: string | null;
  label: string;
  coverImage: string | null;
  hasImagePlaceholder: boolean;
  imageSlots: ImageSlot[];
}
