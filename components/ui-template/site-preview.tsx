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

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

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
  desktop: 960,
  tablet: 768,
  mobile: 375
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

  const heightCls =
    height === 'large'
      ? 'min-h-[420px]'
      : height === 'small'
        ? 'min-h-[220px]'
        : 'min-h-[320px]';
  const alignCls =
    alignment === 'left'
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
      className={`relative flex flex-col justify-center ${rPx(deviceMode)} ${isMobile ? 'py-8' : 'py-10'} ${heightCls} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={wrapperStyle}
    >
      {bgType === 'image' && bgImage && (
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${overlayOpacity / 100})` }}
        />
      )}
      <div className={`relative flex max-w-2xl flex-col gap-3 ${alignCls}`}>
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
        className={`border-y ${rPx(deviceMode)} ${rPy(deviceMode)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{
          backgroundColor: theme.backgroundLight,
          borderColor: alpha(theme.primaryLight, 0.12)
        }}
      >
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
    );
  }

  if (style === 'dark') {
    return (
      <div
        className={`${rPx(deviceMode)} ${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{ backgroundColor: theme.backgroundDark }}
      >
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
    );
  }

  if (style === 'benefits') {
    return (
      <div
        className={`${rPx(deviceMode)} ${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{ backgroundColor: theme.backgroundLight }}
      >
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
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                {deviceMode !== 'mobile' && (
                  <p className="mt-0.5 text-xs text-gray-500">{f.desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${rPx(deviceMode)} ${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{ backgroundColor: alpha(theme.backgroundLight, 0.6) }}
    >
      <div
        className={`mx-auto ${deviceMode === 'mobile' ? 'mb-6' : 'mb-10'} text-center`}
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
      className={`${rPx(deviceMode)} ${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{ backgroundColor: theme.backgroundLight }}
    >
      {title && (
        <div
          className={`mx-auto ${deviceMode === 'mobile' ? 'mb-6' : 'mb-10'} text-center`}
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
        className={`${rPx(deviceMode)} ${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{ backgroundColor: theme.backgroundDark }}
      >
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
                  <p className="text-xs font-semibold text-white">{r_.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${rPx(deviceMode)} ${rPy(deviceMode, true)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{ backgroundColor: alpha(theme.backgroundLight, 0.5) }}
    >
      <div
        className={`mx-auto ${deviceMode === 'mobile' ? 'mb-6' : 'mb-10'} text-center`}
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
        className={`${rPx(deviceMode)} py-4 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
        style={{ backgroundColor: theme.backgroundDark }}
      >
        <div className="flex items-center justify-between">
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
      className={`${rPx(deviceMode)} ${rPy(deviceMode)} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={{ backgroundColor: theme.backgroundDark }}
    >
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
      <div
        className="flex flex-col"
        style={{ backgroundColor: theme.backgroundLight }}
      >
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
        <div ref={virtualRef} dir="rtl" style={{ width: virtualW }}>
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
}
