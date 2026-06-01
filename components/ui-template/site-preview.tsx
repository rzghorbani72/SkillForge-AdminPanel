'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Circle } from 'lucide-react';
import type { UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

// Exported so the page can build it from its own ThemeColors + ThemeStyle state
export interface PreviewTheme {
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
  borderRadius: 'rounded' | 'soft' | 'sharp';
  shadow: 'none' | 'subtle' | 'medium' | 'strong';
}

type DeviceMode = 'widescreen' | 'desktop' | 'tablet' | 'mobile';

interface SitePreviewProps {
  blocks: UIBlockConfig[];
  siteUrl?: string;
  activeBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  theme: PreviewTheme;
  deviceMode?: DeviceMode;
}

// Virtual viewport width per device — the 960px block components scale inside this.
const DEVICE_VIRTUAL_W: Record<DeviceMode, number> = {
  widescreen: 1920,
  desktop: 1280,
  tablet: 768,
  mobile: 375
};

const DEVICE_W_CLASS: Record<DeviceMode, string> = {
  widescreen: 'w-[1920px]',
  desktop: 'w-[1280px]',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]'
};

const RADIUS: Record<PreviewTheme['borderRadius'], string> = {
  sharp: '4px',
  rounded: '12px',
  soft: '20px'
};

const SHADOW: Record<PreviewTheme['shadow'], string> = {
  none: 'none',
  subtle: '0 1px 4px rgba(0,0,0,0.08)',
  medium: '0 4px 12px rgba(0,0,0,0.12)',
  strong: '0 10px 24px rgba(0,0,0,0.20)'
};

function alpha(hex: string, opacity: number) {
  return `${hex}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

// Responsive helpers — return Tailwind class strings based on device
function rPx(d: DeviceMode) {
  return d === 'mobile' ? 'px-4' : d === 'tablet' ? 'px-6' : 'px-8';
}
function rInner(d: DeviceMode) {
  return d === 'desktop' || d === 'widescreen'
    ? 'mx-auto w-full max-w-5xl'
    : '';
}
function rPy(d: DeviceMode, lg = false) {
  if (lg) return d === 'mobile' ? 'py-8' : d === 'tablet' ? 'py-10' : 'py-14';
  return d === 'mobile' ? 'py-6' : 'py-10';
}
// Safe Tailwind grid-cols: always returns a known literal class
function rCols(
  d: DeviceMode,
  desktop: number,
  tablet: number,
  mobile: number
): string {
  const n = d === 'mobile' ? mobile : d === 'tablet' ? tablet : desktop;
  return (
    ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'][n - 1] ??
    'grid-cols-1'
  );
}

// ── Block preview components ─────────────────────────────────────────────────

function IllustrationSVG({ presetId }: { presetId: string }) {
  const sharedHead = (
    <>
      <circle cx="120" cy="63" r="26" fill="#86efac" />
      <circle cx="110" cy="60" r="3" fill="#15803d" />
      <circle cx="130" cy="60" r="3" fill="#15803d" />
      <path
        d="M111 72 Q120 80 129 72"
        stroke="#15803d"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );

  const plants = (
    <>
      <path
        d="M22 200 Q28 182 36 188 M36 188 Q30 165 44 170"
        stroke="#86efac"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M218 200 Q212 182 204 188 M204 188 Q210 165 196 170"
        stroke="#86efac"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="120" cy="218" rx="42" ry="7" fill="#15803d" opacity="0.1" />
    </>
  );

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <ellipse cx="120" cy="140" rx="92" ry="78" fill="#dcfce7" opacity="0.9" />
      {sharedHead}

      {presetId === 'person-thinking' && (
        <>
          <ellipse cx="120" cy="148" rx="28" ry="33" fill="#4ade80" />
          <path
            d="M92 112 Q75 132 82 156"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="83" cy="159" r="9" fill="#86efac" />
          <path
            d="M148 112 Q162 130 158 152"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M102 178 Q85 188 78 205"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M138 178 Q155 188 162 205"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* floating ? circles */}
          <circle cx="172" cy="55" r="14" fill="#4ade80" opacity="0.25" />
          <path
            d="M169 48 Q169 52 172 54 Q175 56 175 59"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="172" cy="64" r="1.8" fill="#22c55e" />
          <circle cx="46" cy="88" r="10" fill="#86efac" opacity="0.3" />
          <path
            d="M43 82 Q43 85 46 87 Q49 89 49 91"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="46" cy="96" r="1.4" fill="#22c55e" opacity="0.7" />
          <circle cx="185" cy="110" r="7" fill="#86efac" opacity="0.4" />
          <path
            d="M183 106 Q183 108 185 109 Q187 111 187 113"
            stroke="#22c55e"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="185" cy="118" r="1.2" fill="#22c55e" opacity="0.6" />
        </>
      )}

      {presetId === 'person-learning' && (
        <>
          <ellipse cx="120" cy="142" rx="28" ry="33" fill="#4ade80" />
          <rect
            x="79"
            y="120"
            width="37"
            height="25"
            rx="3"
            fill="#f0fdf4"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          <rect
            x="116"
            y="120"
            width="37"
            height="25"
            rx="3"
            fill="#dcfce7"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          <line
            x1="116"
            y1="120"
            x2="116"
            y2="145"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          <line
            x1="84"
            y1="129"
            x2="112"
            y2="129"
            stroke="#22c55e"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="84"
            y1="135"
            x2="108"
            y2="135"
            stroke="#22c55e"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="121"
            y1="129"
            x2="149"
            y2="129"
            stroke="#22c55e"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="121"
            y1="135"
            x2="145"
            y2="135"
            stroke="#22c55e"
            strokeWidth="1"
            opacity="0.4"
          />
          <path
            d="M92 110 Q80 122 84 142"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M148 110 Q160 122 156 142"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M102 173 L90 205"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M138 173 L150 205"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="45" cy="70" r="8" fill="#4ade80" opacity="0.5" />
          <circle cx="188" cy="78" r="6" fill="#86efac" opacity="0.5" />
          <circle cx="172" cy="52" r="4" fill="#22c55e" opacity="0.4" />
        </>
      )}

      {presetId === 'person-laptop' && (
        <>
          <ellipse cx="120" cy="142" rx="28" ry="33" fill="#4ade80" />
          <rect x="83" y="118" width="74" height="46" rx="4" fill="#1e293b" />
          <rect x="86" y="121" width="68" height="40" rx="2" fill="#0f172a" />
          <line
            x1="94"
            y1="130"
            x2="140"
            y2="130"
            stroke="#4ade80"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="94"
            y1="137"
            x2="128"
            y2="137"
            stroke="#86efac"
            strokeWidth="2"
            opacity="0.4"
          />
          <line
            x1="94"
            y1="144"
            x2="135"
            y2="144"
            stroke="#4ade80"
            strokeWidth="2"
            opacity="0.3"
          />
          <rect x="75" y="164" width="90" height="7" rx="3" fill="#1e293b" />
          <path
            d="M92 112 Q80 128 88 148"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M148 112 Q160 128 152 148"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M102 173 L90 205"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M138 173 L150 205"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="175" cy="65" r="8" fill="#4ade80" opacity="0.3" />
          <circle cx="40" cy="80" r="6" fill="#86efac" opacity="0.4" />
        </>
      )}

      {presetId === 'person-teaching' && (
        <>
          <ellipse cx="108" cy="142" rx="26" ry="33" fill="#4ade80" />
          <rect
            x="148"
            y="82"
            width="72"
            height="52"
            rx="4"
            fill="white"
            stroke="#22c55e"
            strokeWidth="2"
          />
          <line
            x1="158"
            y1="96"
            x2="208"
            y2="96"
            stroke="#4ade80"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <line
            x1="158"
            y1="104"
            x2="200"
            y2="104"
            stroke="#86efac"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            d="M158 116 L164 122 L172 110"
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="185" cy="116" r="5" fill="#4ade80" opacity="0.3" />
          <line
            x1="130"
            y1="108"
            x2="148"
            y2="100"
            stroke="#86efac"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M82 110 Q70 124 76 142"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M134 110 Q142 107 148 100"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M90 172 L78 205"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M126 172 L138 205"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="38" cy="90" r="7" fill="#86efac" opacity="0.3" />
        </>
      )}

      {presetId === 'person-achievement' && (
        <>
          <ellipse cx="120" cy="145" rx="28" ry="35" fill="#4ade80" />
          <path
            d="M107 82 L107 110 Q107 118 120 120 Q133 118 133 110 L133 82Z"
            fill="#fbbf24"
          />
          <path
            d="M107 90 Q100 90 100 98 Q100 106 107 108"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
          />
          <path
            d="M133 90 Q140 90 140 98 Q140 106 133 108"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
          />
          <rect x="115" y="120" width="10" height="12" fill="#f59e0b" />
          <rect x="108" y="132" width="24" height="5" rx="2" fill="#fbbf24" />
          <path
            d="M92 110 Q75 95 82 78"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M148 110 Q165 95 158 78"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M102 178 L90 206"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M138 178 L150 206"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="55" cy="55" r="5" fill="#fbbf24" opacity="0.7" />
          <circle cx="185" cy="50" r="6" fill="#4ade80" opacity="0.6" />
          <circle cx="40" cy="75" r="4" fill="#86efac" opacity="0.8" />
          <circle cx="195" cy="72" r="4" fill="#fbbf24" opacity="0.5" />
        </>
      )}

      {presetId === 'person-team' && (
        <>
          <ellipse cx="120" cy="142" rx="22" ry="28" fill="#4ade80" />
          <path
            d="M98 110 Q86 124 92 142"
            stroke="#86efac"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M142 110 Q154 124 148 142"
            stroke="#86efac"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M105 168 L95 200"
            stroke="#22c55e"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M135 168 L145 200"
            stroke="#22c55e"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <circle cx="60" cy="80" r="18" fill="#86efac" />
          <ellipse cx="60" cy="126" rx="18" ry="24" fill="#86efac" />
          <path
            d="M42 100 Q30 114 36 130"
            stroke="#bbf7d0"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M78 100 Q90 114 84 130"
            stroke="#bbf7d0"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M48 149 L38 180"
            stroke="#4ade80"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M72 149 L82 180"
            stroke="#4ade80"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="180" cy="80" r="18" fill="#86efac" />
          <ellipse cx="180" cy="126" rx="18" ry="24" fill="#86efac" />
          <path
            d="M162 100 Q150 114 156 130"
            stroke="#bbf7d0"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M198 100 Q210 114 204 130"
            stroke="#bbf7d0"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M168 149 L158 180"
            stroke="#4ade80"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M192 149 L202 180"
            stroke="#4ade80"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M80 118 L98 118 M142 118 L160 118"
            stroke="#22c55e"
            strokeWidth="2"
            opacity="0.4"
            strokeDasharray="3 2"
          />
        </>
      )}

      {plants}
    </svg>
  );
}

function PreviewHeader({
  config,
  active,
  theme,
  deviceMode
}: {
  config: Record<string, unknown>;
  active: boolean;
  theme: PreviewTheme;
  deviceMode: DeviceMode;
}) {
  const { t } = useTranslation();
  const r = RADIUS[theme.borderRadius];
  const brandName =
    (config?.brandName as string) || t('sitePreview.academyName');
  const isMobile = deviceMode === 'mobile';

  return (
    <div
      className={`flex items-center justify-between border-b ${rPx(deviceMode)} py-3 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{
        backgroundColor: theme.backgroundLight,
        borderColor: alpha(theme.primaryLight, 0.15)
      }}
    >
      <div className="flex items-center gap-2">
        <div
          style={{
            width: 24,
            height: 24,
            backgroundColor: theme.primaryLight,
            borderRadius: r
          }}
        />
        <span
          className="text-sm font-bold"
          style={{ color: theme.primaryLight }}
        >
          {brandName}
        </span>
      </div>
      {!isMobile && (
        <nav
          className="flex items-center gap-4 text-sm"
          style={{ color: alpha(theme.primaryLight, 0.7) }}
        >
          <span>{t('sitePreview.navCourses')}</span>
          <span>{t('sitePreview.navAbout')}</span>
        </nav>
      )}
      <span
        className="text-xs font-medium text-white"
        style={{
          backgroundColor: theme.primaryLight,
          borderRadius: r,
          padding: isMobile ? '4px 10px' : '6px 14px'
        }}
      >
        {t('sitePreview.navCta')}
      </span>
    </div>
  );
}

function PreviewHero({
  config,
  active,
  theme,
  deviceMode
}: {
  config: Record<string, unknown>;
  active: boolean;
  theme: PreviewTheme;
  deviceMode: DeviceMode;
}) {
  const { t } = useTranslation();
  const r = RADIUS[theme.borderRadius];
  const sh = SHADOW[theme.shadow];
  const isMobile = deviceMode === 'mobile';
  const title = (config?.title as string) || t('sitePreview.heroTitle');
  const subtitle =
    (config?.subtitle as string) || t('sitePreview.heroSubtitle');
  const ctaText = (config?.ctaText as string) || t('sitePreview.heroCta');
  const bgType = (config?.bgType as string) ?? 'gradient';
  const bgImage = config?.bgImage as string | undefined;
  const bgColor = (config?.bgColor as string) ?? theme.primaryLight;
  const overlayOpacity = (config?.overlayOpacity as number) ?? 40;
  const height = config?.height as string;
  const alignment = (config?.alignment as string) || 'center';
  const illustration = config?.illustration as string | undefined;
  const illustrationPreset = config?.illustrationPreset as string | undefined;
  const hasIllustration = !isMobile && (illustration || illustrationPreset);

  const heightCls =
    height === 'large'
      ? 'min-h-[420px]'
      : height === 'small'
        ? 'min-h-[220px]'
        : 'min-h-[320px]';
  const alignCls =
    alignment === 'left'
      ? 'items-start text-right'
      : hasIllustration
        ? 'items-start text-right'
        : 'items-center text-center mx-auto';
  const wrapperStyle: React.CSSProperties =
    bgType === 'image' && bgImage
      ? {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      : bgType === 'solid'
        ? { backgroundColor: bgColor }
        : {
            background: `linear-gradient(135deg, ${theme.primaryLight} 0%, ${theme.secondaryLight} 60%, ${theme.accent} 100%)`
          };

  return (
    <div
      className={`relative flex ${hasIllustration ? 'flex-row items-center' : 'flex-col justify-center'} ${rPx(deviceMode)} ${isMobile ? 'py-8' : 'py-10'} ${heightCls} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={wrapperStyle}
    >
      {bgType === 'image' && bgImage && (
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${overlayOpacity / 100})` }}
        />
      )}
      <div
        className={`relative flex flex-col gap-3 ${alignCls} ${hasIllustration ? 'flex-1' : 'max-w-2xl'}`}
      >
        <h1
          className={`font-bold leading-tight tracking-tight text-white ${isMobile ? 'text-2xl' : 'text-4xl'}`}
        >
          {title}
        </h1>
        <p
          className={`leading-relaxed text-white/80 ${isMobile ? 'text-sm' : 'text-lg'}`}
        >
          {subtitle}
        </p>
        {config?.showCTA !== false && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className="font-semibold text-white"
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderRadius: r,
                padding: isMobile ? '6px 14px' : '10px 24px',
                fontSize: isMobile ? '12px' : '14px',
                boxShadow: sh
              }}
            >
              {ctaText}
            </span>
            {!isMobile && !!config?.ctaSecondary && (
              <span
                className="text-sm font-semibold text-white"
                style={{
                  border: '1px solid rgba(255,255,255,0.45)',
                  borderRadius: r,
                  padding: '10px 24px'
                }}
              >
                {config.ctaSecondary as string}
              </span>
            )}
          </div>
        )}
        {!isMobile && (
          <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
            <span>★★★★★</span>
            <span>{t('sitePreview.heroTrust')}</span>
          </div>
        )}
      </div>

      {hasIllustration && (
        <div className="relative flex min-h-[200px] w-2/5 shrink-0 items-center justify-center">
          {illustration ? (
            <img
              src={illustration}
              alt="Hero illustration"
              className="max-h-64 w-full object-contain drop-shadow-lg"
            />
          ) : illustrationPreset ? (
            <div className="h-56 w-56">
              <IllustrationSVG presetId={illustrationPreset} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function PreviewFeatures({
  config,
  active,
  theme,
  deviceMode
}: {
  config: Record<string, unknown>;
  active: boolean;
  theme: PreviewTheme;
  deviceMode: DeviceMode;
}) {
  const { t } = useTranslation();
  const r = RADIUS[theme.borderRadius];
  const sh = SHADOW[theme.shadow];
  const title = (config?.title as string) || t('sitePreview.featuresTitle');
  const desktopCols = Math.min((config?.gridColumns as number) || 3, 4);
  const colsCls = rCols(deviceMode, desktopCols, Math.min(desktopCols, 2), 1);
  const style = config?.style as string | undefined;

  const features = [
    {
      icon: '🎓',
      title: t('sitePreview.feature1Title'),
      desc: t('sitePreview.feature1Desc')
    },
    {
      icon: '📚',
      title: t('sitePreview.feature2Title'),
      desc: t('sitePreview.feature2Desc')
    },
    {
      icon: '🏆',
      title: t('sitePreview.feature3Title'),
      desc: t('sitePreview.feature3Desc')
    },
    {
      icon: '💡',
      title: t('sitePreview.feature4Title'),
      desc: t('sitePreview.feature4Desc')
    },
    {
      icon: '🚀',
      title: t('sitePreview.feature5Title'),
      desc: t('sitePreview.feature5Desc')
    },
    {
      icon: '⭐',
      title: t('sitePreview.feature6Title'),
      desc: t('sitePreview.feature6Desc')
    }
  ].slice(0, deviceMode === 'mobile' ? 2 : desktopCols);

  if (style === 'stats') {
    const stats = (config?.stats as Array<{
      value: string;
      label: string;
    }>) || [
      {
        value: t('sitePreview.stat1Value'),
        label: t('sitePreview.stat1Label')
      },
      {
        value: t('sitePreview.stat2Value'),
        label: t('sitePreview.stat2Label')
      },
      { value: t('sitePreview.stat3Value'), label: t('sitePreview.stat3Label') }
    ];
    const statCols = rCols(
      deviceMode,
      stats.length,
      Math.min(stats.length, 2),
      1
    );
    return (
      <div
        className={`border-y ${rPy(deviceMode)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{
          backgroundColor: theme.backgroundLight,
          borderColor: alpha(theme.primaryLight, 0.12)
        }}
      >
        <div className={`${rInner(deviceMode)} ${rPx(deviceMode)}`}>
          {title && (
            <p
              className="mb-6 text-center text-xs font-semibold uppercase tracking-widest"
              style={{ color: theme.primaryLight }}
            >
              {title}
            </p>
          )}
          <div className={`grid ${statCols} gap-6`}>
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <p
                  className={`font-bold ${deviceMode === 'mobile' ? 'text-3xl' : 'text-5xl'}`}
                  style={{ color: theme.primaryLight }}
                >
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (style === 'dark') {
    return (
      <div
        className={`${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{ backgroundColor: theme.backgroundDark }}
      >
        <div className={`${rInner(deviceMode)} ${rPx(deviceMode)}`}>
          <h2
            className={`mb-3 text-center font-bold text-white ${deviceMode === 'mobile' ? 'text-xl' : 'text-3xl'}`}
          >
            {title}
          </h2>
          {!!config?.subtitle && (
            <p className="mb-8 text-center text-sm text-white/60">
              {config.subtitle as string}
            </p>
          )}
          <div className={`grid ${colsCls} gap-4`}>
            {features.map((f, i) => (
              <div
                key={i}
                className="p-4"
                style={{
                  backgroundColor: alpha(theme.primaryLight, 0.08),
                  border: `1px solid ${alpha(theme.primaryLight, 0.18)}`,
                  borderRadius: r,
                  boxShadow: sh
                }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center text-xl"
                  style={{
                    backgroundColor: alpha(theme.primaryLight, 0.15),
                    borderRadius: r
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                {deviceMode !== 'mobile' && (
                  <p className="mt-1 text-xs text-white/60">{f.desc}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (style === 'benefits') {
    return (
      <div
        className={`${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{ backgroundColor: theme.backgroundLight }}
      >
        <div className={`${rInner(deviceMode)} ${rPx(deviceMode)}`}>
          <h2
            className={`mb-3 text-center font-bold text-gray-900 ${deviceMode === 'mobile' ? 'text-xl' : 'text-3xl'}`}
          >
            {title}
          </h2>
          {!!config?.subtitle && (
            <p className="mb-8 text-center text-gray-500">
              {config.subtitle as string}
            </p>
          )}
          <div className={`grid ${colsCls} gap-3`}>
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4"
                style={{
                  backgroundColor: alpha(theme.accent, 0.08),
                  border: `1px solid ${alpha(theme.accent, 0.15)}`,
                  borderRadius: r
                }}
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center"
                  style={{
                    backgroundColor: alpha(theme.accent, 0.2),
                    borderRadius: '50%'
                  }}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    style={{ color: theme.accent }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {f.title}
                  </p>
                  {deviceMode !== 'mobile' && (
                    <p className="mt-0.5 text-xs text-gray-500">{f.desc}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{ backgroundColor: alpha(theme.backgroundLight, 0.6) }}
    >
      <div className={`${rInner(deviceMode)} ${rPx(deviceMode)}`}>
        <div
          className={`${deviceMode === 'mobile' ? 'mb-6' : 'mb-10'} text-center`}
        >
          <h2
            className={`font-bold text-gray-900 ${deviceMode === 'mobile' ? 'text-xl' : 'text-3xl'}`}
          >
            {title}
          </h2>
          {!!config?.subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {config.subtitle as string}
            </p>
          )}
        </div>
        <div className={`grid ${colsCls} gap-4`}>
          {features.map((f, i) => (
            <div
              key={i}
              className="p-4"
              style={{
                backgroundColor: theme.backgroundLight,
                border: `1px solid ${alpha(theme.primaryLight, 0.1)}`,
                borderRadius: r,
                boxShadow: sh
              }}
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center text-xl"
                style={{
                  backgroundColor: alpha(theme.primaryLight, 0.08),
                  borderRadius: r
                }}
              >
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
              {deviceMode !== 'mobile' && (
                <p className="mt-1 text-xs text-gray-500">{f.desc}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewCourses({
  config,
  active,
  theme,
  deviceMode
}: {
  config: Record<string, unknown>;
  active: boolean;
  theme: PreviewTheme;
  deviceMode: DeviceMode;
}) {
  const { t } = useTranslation();
  const r = RADIUS[theme.borderRadius];
  const sh = SHADOW[theme.shadow];
  const title = (config?.title as string) || t('sitePreview.coursesTitle');
  const desktopCols = Math.min((config?.gridColumns as number) || 3, 4);
  const colsCls = rCols(deviceMode, desktopCols, Math.min(desktopCols, 2), 1);
  const displayCount = deviceMode === 'mobile' ? 2 : desktopCols;

  const courses = [
    {
      title: t('sitePreview.course1Title'),
      tag: t('sitePreview.course1Tag'),
      price: t('sitePreview.course1Price')
    },
    {
      title: t('sitePreview.course2Title'),
      tag: t('sitePreview.course2Tag'),
      price: t('sitePreview.course2Price')
    },
    {
      title: t('sitePreview.course3Title'),
      tag: t('sitePreview.course3Tag'),
      price: t('sitePreview.course3Price')
    },
    {
      title: t('sitePreview.course4Title'),
      tag: t('sitePreview.course4Tag'),
      price: t('sitePreview.course4Price')
    }
  ].slice(0, displayCount);

  const gradients = [
    `linear-gradient(135deg, ${theme.primaryLight}, ${theme.secondaryLight})`,
    `linear-gradient(135deg, ${theme.secondaryLight}, ${theme.accent})`,
    `linear-gradient(135deg, ${theme.accent}, ${theme.primaryLight})`,
    `linear-gradient(135deg, ${theme.primaryDark}, ${theme.secondaryDark})`
  ];

  return (
    <div
      className={`${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{ backgroundColor: theme.backgroundLight }}
    >
      <div className={`${rInner(deviceMode)} ${rPx(deviceMode)}`}>
        {title && (
          <div
            className={`${deviceMode === 'mobile' ? 'mb-6' : 'mb-10'} text-center`}
          >
            <h2
              className={`font-bold text-gray-900 ${deviceMode === 'mobile' ? 'text-xl' : 'text-3xl'}`}
            >
              {title}
            </h2>
            {!!config?.subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {config.subtitle as string}
              </p>
            )}
          </div>
        )}
        <div className={`grid ${colsCls} gap-4`}>
          {courses.map((c, i) => (
            <div
              key={i}
              className="overflow-hidden"
              style={{
                borderRadius: r,
                boxShadow: sh,
                border: `1px solid ${alpha(theme.primaryLight, 0.1)}`
              }}
            >
              <div
                className={`flex w-full items-center justify-center ${deviceMode === 'mobile' ? 'h-24' : 'h-36'}`}
                style={{ background: gradients[i % gradients.length] }}
              >
                <span
                  className={`text-white ${deviceMode === 'mobile' ? 'text-2xl' : 'text-3xl'}`}
                >
                  📖
                </span>
              </div>
              <div
                className="p-3"
                style={{ backgroundColor: theme.backgroundLight }}
              >
                <span
                  className="text-xs font-medium"
                  style={{
                    backgroundColor: alpha(theme.primaryLight, 0.1),
                    color: theme.primaryLight,
                    borderRadius: '999px',
                    padding: '2px 8px'
                  }}
                >
                  {c.tag}
                </span>
                <h3 className="mt-1.5 text-xs font-semibold leading-snug text-gray-900">
                  {c.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex text-xs text-amber-400">★★★★</div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: theme.primaryLight }}
                  >
                    {c.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewTestimonials({
  config,
  active,
  theme,
  deviceMode
}: {
  config: Record<string, unknown>;
  active: boolean;
  theme: PreviewTheme;
  deviceMode: DeviceMode;
}) {
  const { t } = useTranslation();
  const r = RADIUS[theme.borderRadius];
  const sh = SHADOW[theme.shadow];
  const style = config?.style as string | undefined;
  const title = (config?.title as string) || t('sitePreview.testimonialsTitle');
  const colsCls = rCols(deviceMode, 3, 2, 1);

  const reviews = [
    {
      name: t('sitePreview.review1Name'),
      role: t('sitePreview.review1Role'),
      text: t('sitePreview.review1Text'),
      emoji: '👩‍💻'
    },
    {
      name: t('sitePreview.review2Name'),
      role: t('sitePreview.review2Role'),
      text: t('sitePreview.review2Text'),
      emoji: '👨‍💼'
    },
    {
      name: t('sitePreview.review3Name'),
      role: t('sitePreview.review3Role'),
      text: t('sitePreview.review3Text'),
      emoji: '👩‍🔬'
    }
  ].slice(0, deviceMode === 'mobile' ? 1 : 3);

  if (style === 'dark-quote') {
    return (
      <div
        className={`${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{ backgroundColor: theme.backgroundDark }}
      >
        <div className={`${rInner(deviceMode)} ${rPx(deviceMode)}`}>
          <h2
            className={`mb-8 text-center font-bold text-white ${deviceMode === 'mobile' ? 'text-xl' : 'text-3xl'}`}
          >
            {title}
          </h2>
          <div
            className="mx-auto max-w-2xl p-6 text-center"
            style={{
              border: `1px solid ${alpha(theme.primaryLight, 0.2)}`,
              borderRadius: r,
              backgroundColor: alpha(theme.primaryLight, 0.06)
            }}
          >
            <p
              className={`font-bold text-white ${deviceMode === 'mobile' ? 'text-3xl' : 'text-5xl'}`}
            >
              {t('sitePreview.darkQuoteRevenue')}
            </p>
            <p className="mb-4 mt-1 text-xs uppercase tracking-wide text-white/50">
              {t('sitePreview.darkQuoteRevenueLabel')}
            </p>
            <blockquote className="mb-4 text-sm italic text-white/80">
              {t('sitePreview.darkQuoteText')}
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center text-xl"
                style={{
                  backgroundColor: alpha(theme.primaryLight, 0.2),
                  borderRadius: '50%'
                }}
              >
                👩‍💼
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {t('sitePreview.darkQuoteAuthor')}
                </p>
                <p className="text-xs text-white/50">
                  {t('sitePreview.darkQuoteAuthorRole')}
                </p>
              </div>
            </div>
          </div>
          {deviceMode !== 'mobile' && (
            <div className={`mt-5 grid ${colsCls} gap-4`}>
              {reviews.map((r_, i) => (
                <div
                  key={i}
                  className="p-4"
                  style={{
                    border: `1px solid ${alpha(theme.primaryLight, 0.15)}`,
                    borderRadius: r,
                    backgroundColor: alpha(theme.primaryLight, 0.04)
                  }}
                >
                  <div className="mb-2 flex text-xs text-amber-400">★★★★★</div>
                  <p className="mb-2 text-xs text-white/80">«{r_.text}»</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r_.emoji}</span>
                    <p className="text-xs font-semibold text-white">
                      {r_.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{ backgroundColor: alpha(theme.backgroundLight, 0.5) }}
    >
      <div className={`${rInner(deviceMode)} ${rPx(deviceMode)}`}>
        <div
          className={`${deviceMode === 'mobile' ? 'mb-6' : 'mb-10'} text-center`}
        >
          <h2
            className={`font-bold text-gray-900 ${deviceMode === 'mobile' ? 'text-xl' : 'text-3xl'}`}
          >
            {title}
          </h2>
          {!!config?.subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {config.subtitle as string}
            </p>
          )}
        </div>
        <div className={`grid ${colsCls} gap-4`}>
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="p-4"
              style={{
                backgroundColor: theme.backgroundLight,
                border: `1px solid ${alpha(theme.primaryLight, 0.1)}`,
                borderRadius: r,
                boxShadow: sh
              }}
            >
              <div className="mb-2 flex text-xs text-amber-400">★★★★★</div>
              <p className="mb-3 text-xs leading-relaxed text-gray-700">
                «{rev.text}»
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center text-xl"
                  style={{
                    backgroundColor: alpha(theme.primaryLight, 0.08),
                    borderRadius: '50%'
                  }}
                >
                  {rev.emoji}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {rev.name}
                  </p>
                  <p className="text-[10px] text-gray-500">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewFooter({
  config,
  active,
  theme,
  deviceMode
}: {
  config: Record<string, unknown>;
  active: boolean;
  theme: PreviewTheme;
  deviceMode: DeviceMode;
}) {
  const { t } = useTranslation();
  const minimal = config?.minimal as boolean;
  const footerCols = [
    t('sitePreview.footerCol1'),
    t('sitePreview.footerCol2'),
    t('sitePreview.footerCol3'),
    t('sitePreview.footerCol4')
  ];
  const links = [
    t('sitePreview.footerLink1'),
    t('sitePreview.footerLink2'),
    t('sitePreview.footerLink3')
  ];
  const socials = [
    t('sitePreview.footerSocial1'),
    t('sitePreview.footerSocial2'),
    t('sitePreview.footerSocial3')
  ];
  const colsCls = rCols(deviceMode, 4, 2, 2);

  if (minimal) {
    return (
      <div
        className={`py-4 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{ backgroundColor: theme.backgroundDark }}
      >
        <div
          className={`${rInner(deviceMode)} ${rPx(deviceMode)} flex items-center justify-between`}
        >
          <span className="text-sm font-bold text-white">
            {t('sitePreview.academyName')}
          </span>
          <span className="text-xs text-white/50">
            {t('sitePreview.footerMinimalCopyright')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${rPy(deviceMode)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{ backgroundColor: theme.backgroundDark }}
    >
      <div className={`${rInner(deviceMode)} ${rPx(deviceMode)}`}>
        <div className={`mb-6 grid ${colsCls} gap-6`}>
          {(deviceMode === 'mobile' ? footerCols.slice(0, 2) : footerCols).map(
            (col, i) => (
              <div key={i}>
                <p className="mb-2 text-sm font-semibold text-white">{col}</p>
                {links.map((link) => (
                  <p key={link} className="py-0.5 text-xs text-white/50">
                    {link}
                  </p>
                ))}
              </div>
            )
          )}
        </div>
        <div
          className="flex items-center justify-between border-t pt-4"
          style={{ borderColor: alpha(theme.primaryLight, 0.15) }}
        >
          <span className="text-xs text-white/50">
            {t('sitePreview.footerCopyright')}
          </span>
          {deviceMode !== 'mobile' && (
            <div className="flex gap-3">
              {socials.map((s) => (
                <span key={s} className="text-xs text-white/50">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewSidebar({
  active,
  theme
}: {
  active: boolean;
  theme: PreviewTheme;
}) {
  const { t } = useTranslation();
  const r = RADIUS[theme.borderRadius];
  const items = [
    t('sitePreview.sidebarItem1'),
    t('sitePreview.sidebarItem2'),
    t('sitePreview.sidebarItem3'),
    t('sitePreview.sidebarItem4'),
    t('sitePreview.sidebarItem5'),
    t('sitePreview.sidebarItem6')
  ];
  return (
    <div
      className={`h-full border-l px-4 py-6 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{
        backgroundColor: alpha(theme.backgroundLight, 0.7),
        borderColor: alpha(theme.primaryLight, 0.12)
      }}
    >
      <p
        className="mb-4 text-xs font-semibold uppercase tracking-wider"
        style={{ color: alpha(theme.primaryLight, 0.6) }}
      >
        {t('sitePreview.sidebarNavLabel')}
      </p>
      {items.map((item) => (
        <div
          key={item}
          className="mb-1 flex cursor-pointer items-center gap-3 px-3 py-2 text-sm text-gray-600"
          style={{ borderRadius: r }}
        >
          <div
            className="h-4 w-4"
            style={{
              backgroundColor: alpha(theme.primaryLight, 0.2),
              borderRadius: '4px'
            }}
          />
          {item}
        </div>
      ))}
    </div>
  );
}

interface SlideItem {
  id: string;
  image?: string;
  gradient: string;
  title?: string;
  subtitle?: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: '1',
    gradient: 'from-indigo-600 via-blue-600 to-cyan-500',
    title: 'اسلاید اول',
    subtitle: 'توضیح کوتاه'
  },
  {
    id: '2',
    gradient: 'from-violet-600 via-purple-600 to-pink-500',
    title: 'اسلاید دوم',
    subtitle: 'توضیح کوتاه'
  },
  {
    id: '3',
    gradient: 'from-rose-600 via-pink-500 to-orange-400',
    title: 'اسلاید سوم',
    subtitle: 'توضیح کوتاه'
  },
  {
    id: '4',
    gradient: 'from-emerald-600 via-teal-500 to-cyan-500',
    title: 'اسلاید چهارم',
    subtitle: 'توضیح کوتاه'
  }
];

function PreviewSlideshow({
  config,
  active,
  deviceMode
}: {
  config: Record<string, unknown>;
  active: boolean;
  deviceMode: DeviceMode;
}) {
  const slides = ((config?.slides as SlideItem[]) ?? []).filter(Boolean);
  const displaySlides = slides.length > 0 ? slides : DEFAULT_SLIDES;
  const isBanner = displaySlides.length === 1;
  const [current, setCurrent] = useState(0);

  const speedMs =
    (config?.speed as string) === 'slow'
      ? 5000
      : (config?.speed as string) === 'fast'
        ? 1500
        : 2800;

  useEffect(() => {
    if (isBanner) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % displaySlides.length);
    }, speedMs);
    return () => clearInterval(timer);
  }, [isBanner, displaySlides.length, speedMs]);

  const slide = displaySlides[current] ?? displaySlides[0];
  const isMobile = deviceMode === 'mobile';
  const heightSize = (config?.height as string) ?? 'medium';
  const heightCls =
    heightSize === 'large'
      ? isMobile
        ? 'h-52'
        : 'h-80'
      : heightSize === 'small'
        ? isMobile
          ? 'h-28'
          : 'h-44'
        : isMobile
          ? 'h-36'
          : 'h-56';

  return (
    <div
      className={`relative overflow-hidden ${heightCls} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
    >
      {slide.image ? (
        <img
          src={slide.image}
          alt={slide.title ?? 'slide'}
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
        />
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 text-center">
        {slide.title && (
          <p
            className={`font-bold text-white drop-shadow ${isMobile ? 'text-lg' : 'text-2xl'}`}
          >
            {slide.title}
          </p>
        )}
        {slide.subtitle && (
          <p
            className={`text-white/80 drop-shadow ${isMobile ? 'text-xs' : 'text-sm'}`}
          >
            {slide.subtitle}
          </p>
        )}
        {isBanner && (
          <span className="mt-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            بنر
          </span>
        )}
      </div>

      {!isBanner && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {displaySlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function renderBlock(
  block: UIBlockConfig,
  active: boolean,
  theme: PreviewTheme,
  deviceMode: DeviceMode
) {
  const cfg = (block.config ?? {}) as Record<string, unknown>;
  switch (block.type) {
    case 'header':
      return (
        <PreviewHeader
          config={cfg}
          active={active}
          theme={theme}
          deviceMode={deviceMode}
        />
      );
    case 'hero':
      return (
        <PreviewHero
          config={cfg}
          active={active}
          theme={theme}
          deviceMode={deviceMode}
        />
      );
    case 'features':
      return (
        <PreviewFeatures
          config={cfg}
          active={active}
          theme={theme}
          deviceMode={deviceMode}
        />
      );
    case 'courses':
      return (
        <PreviewCourses
          config={cfg}
          active={active}
          theme={theme}
          deviceMode={deviceMode}
        />
      );
    case 'testimonials':
      return (
        <PreviewTestimonials
          config={cfg}
          active={active}
          theme={theme}
          deviceMode={deviceMode}
        />
      );
    case 'footer':
      return (
        <PreviewFooter
          config={cfg}
          active={active}
          theme={theme}
          deviceMode={deviceMode}
        />
      );
    case 'sidebar':
      return <PreviewSidebar active={active} theme={theme} />;
    case 'slideshow':
      return (
        <PreviewSlideshow
          config={cfg}
          active={active}
          deviceMode={deviceMode}
        />
      );
    default:
      return (
        <div
          className={`border-b border-gray-100 bg-gray-50 px-8 py-6 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        >
          <p className="text-sm capitalize text-gray-400">{block.type}</p>
        </div>
      );
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export function SitePreview({
  blocks,
  siteUrl,
  activeBlockId,
  onSelectBlock,
  theme,
  deviceMode = 'desktop'
}: SitePreviewProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);

  const virtualW = DEVICE_VIRTUAL_W[deviceMode];

  const recalcZoom = useCallback(() => {
    if (containerRef.current) {
      setZoom(containerRef.current.clientWidth / virtualW);
    }
  }, [virtualW]);

  // Recalculate whenever container resizes (handles screen resize)
  useEffect(() => {
    recalcZoom();
    const ro = new ResizeObserver(recalcZoom);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recalcZoom]);

  // Also recalculate immediately when deviceMode changes (virtualW changes)
  useEffect(() => {
    recalcZoom();
  }, [deviceMode, recalcZoom]);

  useEffect(() => {
    if (virtualRef.current) {
      (virtualRef.current.style as unknown as Record<string, string>).zoom =
        String(zoom);
    }
  }, [zoom]);

  const visibleBlocks = [...blocks]
    .filter((b) => b.isVisible)
    .sort((a, b) => a.order - b.order);

  const hasSidebar = visibleBlocks.some((b) => b.type === 'sidebar');
  const sidebarBlock = visibleBlocks.find((b) => b.type === 'sidebar');
  const mainBlocks = visibleBlocks.filter((b) => b.type !== 'sidebar');

  const renderPageContent = () => {
    if (visibleBlocks.length === 0) {
      return (
        <div className="flex min-h-[600px] flex-col items-center justify-center gap-3 p-16 text-center">
          <div className="max-w-sm rounded-2xl border-2 border-dashed border-gray-200 p-12">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
              />
            </svg>
            <p className="text-base font-medium text-gray-400">
              {t('settings.noBlocksMessage')}
            </p>
          </div>
        </div>
      );
    }

    if (hasSidebar && sidebarBlock) {
      return (
        <div className="flex min-h-[800px]">
          <div
            className="w-56 shrink-0 cursor-pointer"
            onClick={() => onSelectBlock(sidebarBlock.id)}
          >
            <PreviewSidebar
              active={activeBlockId === sidebarBlock.id}
              theme={theme}
            />
          </div>
          <div className="flex flex-1 flex-col">
            {mainBlocks.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => onSelectBlock(block.id)}
                className="w-full text-left focus:outline-none"
              >
                {renderBlock(
                  block,
                  block.id === activeBlockId,
                  theme,
                  deviceMode
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col bg-background">
        {visibleBlocks.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => onSelectBlock(block.id)}
            className="w-full text-left focus:outline-none"
          >
            {renderBlock(block, block.id === activeBlockId, theme, deviceMode)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border shadow-md">
      {/* Browser chrome */}
      <div className="flex flex-shrink-0 items-center gap-2 border-b bg-muted/40 px-3 py-2">
        <div className="flex gap-1.5">
          <Circle className="h-2.5 w-2.5 fill-red-400 text-red-400" />
          <Circle className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
          <Circle className="h-2.5 w-2.5 fill-green-400 text-green-400" />
        </div>
        <div className="flex-1 truncate rounded border bg-background px-3 py-0.5 text-xs text-muted-foreground">
          {siteUrl ?? t('sitePreview.defaultSiteUrl')}
        </div>
      </div>

      {/* Zoomed page content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-white">
        <div ref={virtualRef} dir="rtl" className={DEVICE_W_CLASS[deviceMode]}>
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
}
