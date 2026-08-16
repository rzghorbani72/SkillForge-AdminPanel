'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  Upload,
  AlertTriangle,
  MousePointerClick,
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { UIBlockConfig } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  getSectionSchema,
  isSectionIncomplete,
  type ContentFieldSchema
} from './section-schema';
import { TextOverridesEditor } from './text-overrides-editor';
import { SectionSlotEditor } from './section-slot-editor';
import { isGridSection } from './slot-constants';
import {
  HeroVariantPicker,
  type HeroPreviewContext
} from './hero-variant-picker';

type Tab = 'content' | 'style' | 'layout';
type HeroBgType = 'gradient' | 'solid' | 'image';

export interface SectionEditorProps {
  block: UIBlockConfig | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
  onMove: (blockId: string, dir: 'up' | 'down') => void;
  onDelete: (blockId: string) => void;
  onToggleVisible: (blockId: string, visible: boolean) => void;
  onBack: () => void;
  // Live-preview context for the hero design picker (null = picker hidden).
  preview?: HeroPreviewContext | null;
  /** Real academy name, used as the live default for brand fields. */
  academyName?: string;
}

// Section-specific editor embedded inside the main sidebar's Sections tab when a
// section is selected (in the preview). `onBack` returns to the sections list.
export function SectionEditor({
  block,
  canMoveUp,
  canMoveDown,
  canDelete,
  onUpdate,
  onMove,
  onDelete,
  onToggleVisible,
  onBack,
  preview,
  academyName
}: SectionEditorProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('content');

  // Always land on the content tab when the user selects a different section
  // so the inputs are immediately visible instead of whichever tab was last open.
  useEffect(() => {
    setTab('content');
  }, [block?.id]);

  if (!block) return null;

  const schema = getSectionSchema(block.type);
  const cfg = block.config ?? {};
  const set = (key: string, value: unknown) =>
    onUpdate(block.id, { ...cfg, [key]: value });

  const incomplete = isSectionIncomplete(block.type, cfg);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'content', label: t('sitePreview.panelTabContent') },
    { id: 'style', label: t('sitePreview.panelTabStyle') },
    { id: 'layout', label: t('sitePreview.panelTabLayout') }
  ];

  return (
    <div className="flex h-full flex-col" dir="rtl">
      {/* Header — back to the sections list */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-zinc-200 px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="بازگشت"
          title="بازگشت"
          className="rounded-lg p-1 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-zinc-900">
          {schema.name}
        </span>
        {incomplete && (
          <span
            title={t('sitePreview.panelIncomplete')}
            className="h-2 w-2 rounded-full bg-amber-400"
          />
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0 gap-1 border-b border-zinc-200 px-3 py-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              tab === id
                ? 'bg-zinc-200 text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'content' && (
          <ContentTab
            block={block}
            cfg={cfg}
            set={set}
            schema={schema}
            preview={preview}
            academyName={academyName}
          />
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
            onToggleVisible={onToggleVisible}
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
  schema,
  preview,
  academyName
}: {
  block: UIBlockConfig;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  schema: ReturnType<typeof getSectionSchema>;
  preview?: HeroPreviewContext | null;
  academyName?: string;
}) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const primary = schema.content.filter((f) => !f.advanced);
  const advanced = schema.content.filter((f) => f.advanced);

  const hasAnyContent =
    schema.content.length > 0 ||
    isGridSection(block.type) ||
    block.type === 'header';

  return (
    <div className="space-y-4">
      {/* Inline-edit hint — always shown so the manager knows how to edit text */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
        <MousePointerClick className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
        <p className="text-[11px] leading-relaxed text-blue-700">
          برای ویرایش متن، روی آن در پیش‌نمایش کلیک کنید
        </p>
      </div>

      {block.type === 'hero' && preview && (
        <div className="border-b border-zinc-200/70 pb-4">
          <HeroVariantPicker
            heroBlockId={block.id}
            value={(cfg.style as string) ?? 'default'}
            onChange={(style) => set('style', style)}
            preview={preview}
          />
        </div>
      )}
      {primary.map((field) => (
        <Field
          key={field.key}
          field={field}
          cfg={cfg}
          set={set}
          academyName={academyName}
        />
      ))}

      {advanced.length > 0 && (
        <div className="border-t border-zinc-200/70 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            <span>{t('sitePreview.panelAdvanced')}</span>
            {showAdvanced ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {showAdvanced && (
            <div className="mt-3 space-y-4">
              {advanced.map((field) => (
                <Field
                  key={field.key}
                  field={field}
                  cfg={cfg}
                  set={set}
                  academyName={academyName}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {isGridSection(block.type) && (
        <div className="space-y-3">
          <TextOverridesEditor blockType={block.type} cfg={cfg} set={set} />
          <SectionSlotEditor blockType={block.type} cfg={cfg} set={set} />
        </div>
      )}

      {/* Live-data note — clarifies which parts of this section come from the
          academy API (not editable here) vs the static text fields above. */}
      {schema.dynamicContentNote && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-400/20 bg-blue-400/5 px-3 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {schema.dynamicContentNote}
          </p>
        </div>
      )}

      {!hasAnyContent && (
        <p className="text-xs text-zinc-500">
          {t('sitePreview.panelNoContent')}
        </p>
      )}
    </div>
  );
}

function Field({
  field,
  cfg,
  set,
  academyName
}: {
  field: ContentFieldSchema;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  academyName?: string;
}) {
  const { t } = useTranslation();

  if (field.kind === 'toggle') {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-700">{field.label}</span>
          <Switch
            checked={(cfg[field.key] as boolean) ?? field.defaultOn ?? true}
            onCheckedChange={(v) => set(field.key, v)}
          />
        </div>
        {field.hint && (
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {field.hint}
          </p>
        )}
      </div>
    );
  }

  // text / textarea — editing happens directly in the preview canvas
  const rawValue = cfg[field.key];
  // An unset field must show what the preview renders, not a generic constant —
  // otherwise the manager sees (and can save) the wrong value.
  const fallback =
    field.defaultFrom === 'academyName' && academyName
      ? academyName
      : (field.defaultValue ?? '');
  const value =
    rawValue !== undefined && rawValue !== null ? String(rawValue) : fallback;
  const empty = field.required && !value.trim();

  // Strip HTML tags for the preview snippet (subtitle may contain <b> etc.)
  const snippet = value.replace(/<[^>]*>/g, '').trim();

  return (
    <div className="space-y-1">
      <span className="text-[11px] font-medium text-zinc-500">
        {field.label}
      </span>
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-2.5 py-2">
        {snippet ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-700">
            {snippet}
          </p>
        ) : (
          <p className="text-xs italic text-zinc-400">
            {field.placeholder ?? '—'}
          </p>
        )}
      </div>
      {empty ? (
        <p className="flex items-center gap-1 text-[11px] text-amber-400">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {t('sitePreview.panelRequiredHint', { field: field.label })}
        </p>
      ) : null}
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
  const { t } = useTranslation();

  if (!hasBackground) {
    return (
      <p className="text-xs text-zinc-500">
        {t('sitePreview.panelStyleFromTheme')}
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
  const { t } = useTranslation();
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

  const bgOptions: { type: HeroBgType; label: string }[] = [
    { type: 'gradient', label: t('sitePreview.panelBgGradient') },
    { type: 'solid', label: t('sitePreview.panelBgSolid') },
    { type: 'image', label: t('sitePreview.panelBgImage') }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {t('sitePreview.panelBackground')}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {bgOptions.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                // When switching to solid without an existing color, default
                // to the primary blue so the preview immediately shows solid.
                if (type === 'solid' && !cfg.bgColor) {
                  onUpdate(block.id, {
                    ...cfg,
                    bgType: 'solid',
                    bgColor: '#3b82f6'
                  });
                } else {
                  set('bgType', type);
                }
              }}
              className={`rounded border py-1.5 text-xs font-medium transition-colors ${
                bgType === type
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
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
            title={t('sitePreview.panelBackground')}
            value={(cfg.bgColor as string) ?? '#3b82f6'}
            onChange={(e) => set('bgColor', e.target.value)}
            className="h-8 w-9 shrink-0 cursor-pointer rounded border border-zinc-300 bg-transparent"
          />
          <Input
            value={(cfg.bgColor as string) ?? '#3b82f6'}
            onChange={(e) => set('bgColor', e.target.value)}
            className="h-8 border-zinc-300 bg-zinc-100 font-mono text-xs text-zinc-900"
            placeholder="#3b82f6"
          />
        </div>
      )}

      {bgType === 'image' && (
        <div className="space-y-2">
          {cfg.bgImage ? (
            <div className="group relative overflow-hidden rounded-md border border-zinc-200">
              <img
                src={cfg.bgImage as string}
                alt="Hero background"
                className="h-20 w-full object-cover"
              />
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="ml-1 h-3.5 w-3.5" />
                {t('sitePreview.panelReplaceImage')}
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
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 py-4 text-xs text-zinc-600 transition-colors hover:border-blue-500 hover:text-blue-400">
              <Upload className="h-4 w-4" />
              {isUploading
                ? t('sitePreview.panelUploading')
                : t('sitePreview.panelUploadImage')}
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
              <span className="text-xs text-zinc-600">
                {t('sitePreview.panelOverlayOpacity')}
              </span>
              <span className="text-xs text-zinc-700">
                {(cfg.overlayOpacity as number) ?? 40}%
              </span>
            </div>
            <input
              type="range"
              title={t('sitePreview.panelOverlayOpacity')}
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
      <span className="text-xs text-zinc-600">{title}</span>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded border py-1.5 text-xs font-medium transition-colors ${
              value === o.value
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
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
  onDelete,
  onToggleVisible
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
  onToggleVisible: (blockId: string, visible: boolean) => void;
}) {
  const { t } = useTranslation();
  const isVisible = block.isVisible !== false;

  return (
    <div className="space-y-4">
      {/* Header/footer stay structural and are never hideable. */}
      {canDelete && (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
          <span className="flex items-center gap-2 text-xs text-zinc-700">
            <Eye className="h-3.5 w-3.5" />
            {t('sitePreview.panelSectionVisible')}
          </span>
          <Switch
            checked={isVisible}
            onCheckedChange={(v) => onToggleVisible(block.id, v)}
          />
        </div>
      )}

      {schema.hasAlignment && (
        <ChipRow
          title={t('sitePreview.panelTextAlignment')}
          value={(cfg.alignment as string) ?? 'center'}
          options={[
            { label: t('sitePreview.panelAlignCenter'), value: 'center' },
            { label: t('sitePreview.panelAlignRight'), value: 'left' }
          ]}
          onChange={(v) => set('alignment', v)}
        />
      )}

      {schema.hasHeight && (
        <ChipRow
          title={t('sitePreview.panelSectionHeight')}
          value={(cfg.height as string) ?? 'medium'}
          options={[
            { label: t('sitePreview.panelHeightShort'), value: 'small' },
            { label: t('sitePreview.panelHeightMedium'), value: 'medium' },
            { label: t('sitePreview.panelHeightTall'), value: 'large' }
          ]}
          onChange={(v) => set('height', v)}
        />
      )}

      {schema.hasColumns && (
        <ChipRow
          title={t('sitePreview.panelColumns')}
          value={(cfg.gridColumns as number) ?? 3}
          options={[
            { label: '۲', value: 2 },
            { label: '۳', value: 3 },
            { label: '۴', value: 4 }
          ]}
          onChange={(v) => set('gridColumns', v)}
        />
      )}

      <div className="space-y-1.5 border-t border-zinc-200/70 pt-3">
        <span className="text-xs text-zinc-600">
          {t('sitePreview.panelPositionInPage')}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={() => onMove(block.id, 'up')}
            className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-300 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            {t('settings.moveUp')}
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={() => onMove(block.id, 'down')}
            className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-300 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            {t('settings.moveDown')}
          </button>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="flex w-full items-center justify-center gap-1.5 rounded border border-red-500/30 bg-red-600/10 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('sitePreview.panelDeleteSection')}
          </button>
        )}
      </div>
    </div>
  );
}
