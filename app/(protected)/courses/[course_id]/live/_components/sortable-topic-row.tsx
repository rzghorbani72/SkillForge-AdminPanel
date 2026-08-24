'use client';

import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

interface SortableTopicRowProps {
  rowKey: string;
  index: number;
  title: string;
  onChange: (title: string) => void;
  onRemove: () => void;
}

/** One syllabus row. The grip is the only drag handle, so the field stays typeable. */
export default function SortableTopicRow({
  rowKey,
  index,
  title,
  onChange,
  onRemove
}: SortableTopicRowProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: rowKey });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform) ?? undefined,
        transition: transition ?? undefined
      }}
      className={isDragging ? 'relative z-10 opacity-80' : undefined}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label={t('courses.live.reorderTopic')}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="w-6 shrink-0 text-sm text-muted-foreground">
          {formatNumber(index + 1)}
        </span>
        <Input
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('courses.live.topicPlaceholder')}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('common.delete')}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
