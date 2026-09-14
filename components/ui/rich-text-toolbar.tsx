'use client';

import * as React from 'react';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';

export type InlineCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'insertUnorderedList'
  | 'insertOrderedList';

export type BlockTag = 'p' | 'h1' | 'h2' | 'h3';

const BUTTONS: ReadonlyArray<{
  command: InlineCommand;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}> = [
  { command: 'bold', icon: Bold, labelKey: 'editor.bold' },
  { command: 'italic', icon: Italic, labelKey: 'editor.italic' },
  { command: 'underline', icon: Underline, labelKey: 'editor.underline' },
  {
    command: 'strikeThrough',
    icon: Strikethrough,
    labelKey: 'editor.strikethrough',
  },
  { command: 'insertUnorderedList', icon: List, labelKey: 'editor.bulletList' },
  {
    command: 'insertOrderedList',
    icon: ListOrdered,
    labelKey: 'editor.numberedList',
  },
];

const BLOCK_TAGS: ReadonlyArray<{ tag: BlockTag; labelKey: string }> = [
  { tag: 'p', labelKey: 'editor.sizeNormal' },
  { tag: 'h1', labelKey: 'editor.sizeLarge' },
  { tag: 'h2', labelKey: 'editor.sizeMedium' },
  { tag: 'h3', labelKey: 'editor.sizeSmall' },
];

type RichTextToolbarProps = {
  disabled?: boolean;
  activeCommands: ReadonlySet<InlineCommand>;
  activeBlock: BlockTag;
  onCommand: (command: InlineCommand) => void;
  onBlockTag: (tag: BlockTag) => void;
  onLink: () => void;
};

export function RichTextToolbar({
  disabled,
  activeCommands,
  activeBlock,
  onCommand,
  onBlockTag,
  onLink,
}: RichTextToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/40 p-1">
      <Select
        value={activeBlock}
        disabled={disabled}
        onValueChange={(next) => onBlockTag(next as BlockTag)}
      >
        <SelectTrigger
          className="h-8 w-32"
          aria-label={t('editor.textSize')}
          title={t('editor.textSize')}
          onMouseDown={(event) => event.preventDefault()}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BLOCK_TAGS.map(({ tag, labelKey }) => (
            <SelectItem key={tag} value={tag}>
              {t(labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {BUTTONS.map(({ command, icon: Icon, labelKey }) => (
        <Button
          key={command}
          type="button"
          variant={activeCommands.has(command) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          disabled={disabled}
          title={t(labelKey)}
          aria-label={t(labelKey)}
          aria-pressed={activeCommands.has(command)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onCommand(command)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={disabled}
        title={t('editor.link')}
        aria-label={t('editor.link')}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
