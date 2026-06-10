'use client';

import { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Trash2,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { UIBlockConfig } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import {
  getSectionSchema,
  isSectionIncomplete,
  type ContentFieldSchema
} from './section-schema';
import { TextOverridesEditor } from './text-overrides-editor';
import { SectionSlotEditor } from './section-slot-editor';
import { isGridSection } from './slot-constants';

type Tab = 'content' | 'style' | 'layout';
type HeroBgType = 'gradient' | 'solid' | 'image';

const TABS: { id: Tab; label: string }[] = [
  { id: 'content', label: 'محتوا' },
  { id: 'style', label: 'استایل' },
  { id: 'layout', label: 'چیدمان' }
];

export interface SectionCustomizationPanelProps {
  block: UIBlockConfig | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
  onMove: (blockId: string, dir: 'up' | 'down') => void;
  onDelete: (blockId: string) => void;
  onClose: () => void;
}

export function SectionCustomizationPanel({
  block,
  canMoveUp,
  canMoveDown,
  canDelete,
  onUpdate,
  onMove,
  onDelete,
  onClose
}: SectionCustomizationPanelProps) {
  const [tab, setTab] = useState<Tab>('content');

  if (!block) return null;

  const schema = getSectionSchema(block.type);
  const cfg = block.config ?? {};
  const set = (key: string, value: unknown) =>
    onUpdate(block.id, { ...cfg, [key]: value });

  const incomplete = isSectionIncomplete(block.type, cfg);

  return (
    <div
      className="flex h-full w-80 flex-shrink-0 flex-col border-r border-zinc-700 bg-zinc-900"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">
            {schema.name}
          </span>
          {incomplete && (
            <span
              title="این بخش محتوای لازم را ندارد"
              className="h-2 w-2 rounded-full bg-amber-400"
            />
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0 gap-1 border-b border-zinc-700 px-3 py-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              tab === id
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'content' && (
          <ContentTab block={block} cfg={cfg} set={set} schema={schema} />
        )}
        {tab === 'style' && (
          <StyleTab
            block={block}
            cfg={cfg}
            set={set}
            onUpdate={onUpdate}
            hasBackground={!!schema.hasBackground}
          />
        )}
        {tab === 'layout' && (
          <LayoutTab
            block={block}
            cfg={cfg}
            set={set}
            schema={schema}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            canDelete={canDelete}
            onMove={onMove}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}

// ── Content tab ───────────────────────────────────────────────────────────────

function ContentTab({
  block,
  cfg,
  set,
  schema
}: {
  block: UIBlockConfig;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  schema: ReturnType<typeof getSectionSchema>;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const primary = schema.content.filter((f) => !f.advanced);
  const advanced = schema.content.filter((f) => f.advanced);

  const hasAnyContent =
    schema.content.length > 0 ||
    isGridSection(block.type) ||
    block.type === 'header';

  return (
    <div className="space-y-4">
      {primary.map((field) => (
        <Field key={field.key} field={field} cfg={cfg} set={set} />
      ))}

      {advanced.length > 0 && (
        <div className="border-t border-zinc-700/60 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            <span>تنظیمات پیشرفته</span>
            {showAdvanced ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {showAdvanced && (
            <div className="mt-3 space-y-4">
              {advanced.map((field) => (
                <Field key={field.key} field={field} cfg={cfg} set={set} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* List-like content (eyebrows, slot cards) for grid sections */}
      {isGridSection(block.type) && (
        <div className="space-y-3">
          <TextOverridesEditor blockType={block.type} cfg={cfg} set={set} />
          <SectionSlotEditor blockType={block.type} cfg={cfg} set={set} />
        </div>
      )}

      {!hasAnyContent && (
        <p className="text-xs text-zinc-500">
          این بخش محتوای قابل ویرایش ندارد.
        </p>
      )}
    </div>
  );
}

function Field({
  field,
  cfg,
  set
}: {
  field: ContentFieldSchema;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}) {
  if (field.kind === 'toggle') {
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-300">{field.label}</span>
        <Switch
          checked={(cfg[field.key] as boolean) ?? true}
          onCheckedChange={(v) => set(field.key, v)}
        />
      </div>
    );
  }

  const value = String(cfg[field.key] ?? '');
  const empty = field.required && !value.trim();

  return (
    <div className="space-y-1.5">
      <span className="text-xs text-zinc-300">{field.label}</span>
      {field.kind === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => set(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          className="w-full resize-none rounded-md border border-zinc-600 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => set(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="h-8 border-zinc-600 bg-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600"
        />
      )}
      {empty && (
        <p className="flex items-center gap-1 text-[11px] text-amber-400">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          یک {field.label} اضافه کنید تا این بخش برای بازدیدکننده معنا پیدا کند.
        </p>
      )}
    </div>
  );
}

// ── Style tab ─────────────────────────────────────────────────────────────────

function StyleTab({
  block,
  cfg,
  set,
  onUpdate,
  hasBackground
}: {
  block: UIBlockConfig;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
  hasBackground: boolean;
}) {
  if (!hasBackground) {
    return (
      <p className="text-xs text-zinc-500">
        استایل این بخش از تم سراسری قالب پیروی می‌کند.
      </p>
    );
  }
  return (
    <HeroBackground block={block} cfg={cfg} set={set} onUpdate={onUpdate} />
  );
}

function HeroBackground({
  block,
  cfg,
  set,
  onUpdate
}: {
  block: UIBlockConfig;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const bgType: HeroBgType = (cfg.bgType as HeroBgType) ?? 'gradient';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const result = await apiClient.uploadImage(file, {
        title: 'Hero Background'
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
        onUpdate(block.id, { ...cfg, bgImage: url, bgType: 'image' });
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          پس‌زمینه
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { type: 'gradient', label: 'گرادیان' },
              { type: 'solid', label: 'تک‌رنگ' },
              { type: 'image', label: 'تصویر' }
            ] as { type: HeroBgType; label: string }[]
          ).map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => set('bgType', type)}
              className={`rounded border py-1.5 text-xs font-medium transition-colors ${
                bgType === type
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {bgType === 'solid' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            title="رنگ پس‌زمینه"
            value={(cfg.bgColor as string) ?? '#3b82f6'}
            onChange={(e) => set('bgColor', e.target.value)}
            className="h-8 w-9 shrink-0 cursor-pointer rounded border border-zinc-600 bg-transparent"
          />
          <Input
            value={(cfg.bgColor as string) ?? '#3b82f6'}
            onChange={(e) => set('bgColor', e.target.value)}
            className="h-8 border-zinc-600 bg-zinc-800 font-mono text-xs text-zinc-100"
            placeholder="#3b82f6"
          />
        </div>
      )}

      {bgType === 'image' && (
        <div className="space-y-2">
          {cfg.bgImage ? (
            <div className="group relative overflow-hidden rounded-md border border-zinc-700">
              <img
                src={cfg.bgImage as string}
                alt="Hero background"
                className="h-20 w-full object-cover"
              />
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="ml-1 h-3.5 w-3.5" />
                جایگزینی تصویر
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-600 py-4 text-xs text-zinc-400 transition-colors hover:border-blue-500 hover:text-blue-400">
              <Upload className="h-4 w-4" />
              {isUploading ? 'در حال آپلود...' : 'آپلود تصویر'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          )}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">تیرگی پوشش</span>
              <span className="text-xs text-zinc-300">
                {(cfg.overlayOpacity as number) ?? 40}%
              </span>
            </div>
            <input
              type="range"
              title="تیرگی پوشش"
              min={0}
              max={80}
              value={(cfg.overlayOpacity as number) ?? 40}
              onChange={(e) => set('overlayOpacity', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Layout tab ────────────────────────────────────────────────────────────────

function ChipRow<T extends string | number>({
  title,
  options,
  value,
  onChange
}: {
  title: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-zinc-400">{title}</span>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded border py-1.5 text-xs font-medium transition-colors ${
              value === o.value
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LayoutTab({
  block,
  cfg,
  set,
  schema,
  canMoveUp,
  canMoveDown,
  canDelete,
  onMove,
  onDelete
}: {
  block: UIBlockConfig;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  schema: ReturnType<typeof getSectionSchema>;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onMove: (blockId: string, dir: 'up' | 'down') => void;
  onDelete: (blockId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {schema.hasAlignment && (
        <ChipRow
          title="چینش متن"
          value={(cfg.alignment as string) ?? 'center'}
          options={[
            { label: 'وسط', value: 'center' },
            { label: 'راست', value: 'left' }
          ]}
          onChange={(v) => set('alignment', v)}
        />
      )}

      {schema.hasHeight && (
        <ChipRow
          title="ارتفاع"
          value={(cfg.height as string) ?? 'medium'}
          options={[
            { label: 'کوتاه', value: 'small' },
            { label: 'معمول', value: 'medium' },
            { label: 'بلند', value: 'large' }
          ]}
          onChange={(v) => set('height', v)}
        />
      )}

      {schema.hasColumns && (
        <ChipRow
          title="ستون‌ها"
          value={(cfg.gridColumns as number) ?? 3}
          options={[
            { label: '۲', value: 2 },
            { label: '۳', value: 3 },
            { label: '۴', value: 4 }
          ]}
          onChange={(v) => set('gridColumns', v)}
        />
      )}

      {/* Section position in the page stack */}
      <div className="space-y-1.5 border-t border-zinc-700/60 pt-3">
        <span className="text-xs text-zinc-400">جایگاه در صفحه</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={() => onMove(block.id, 'up')}
            className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-600 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-40"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            بالا
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={() => onMove(block.id, 'down')}
            className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-600 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-40"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            پایین
          </button>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="flex w-full items-center justify-center gap-1.5 rounded border border-red-500/30 bg-red-600/10 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف بخش
          </button>
        )}
      </div>
    </div>
  );
}
