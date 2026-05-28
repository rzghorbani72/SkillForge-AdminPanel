'use client';

import { useRef, useState, useEffect } from 'react';
import { Circle } from 'lucide-react';
import type { UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

interface SitePreviewProps {
  blocks: UIBlockConfig[];
  siteUrl?: string;
  activeBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
}

// Virtual desktop width — blocks render at this size, then zoom scales them down
const VIRTUAL_W = 960;

// ── Block preview components (rendered at real desktop sizes) ─────────────────

function PreviewHeader({
  config,
  active
}: {
  config: Record<string, unknown>;
  active: boolean;
}) {
  const { t } = useTranslation();
  const transparent = config?.transparent as boolean;
  return (
    <div
      className={`flex items-center justify-between px-8 py-4 ${transparent ? 'bg-transparent' : 'bg-white'} border-b border-gray-100 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
    >
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gray-900" />
        <span className="text-base font-bold text-gray-900">
          {t('sitePreview.academyName')}
        </span>
      </div>
      <nav className="flex items-center gap-6 text-sm text-gray-600">
        <span className="cursor-pointer hover:text-gray-900">
          {t('sitePreview.navCourses')}
        </span>
        <span className="cursor-pointer hover:text-gray-900">
          {t('sitePreview.navAbout')}
        </span>
        <span className="cursor-pointer hover:text-gray-900">
          {t('sitePreview.navBlog')}
        </span>
        <span className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
          {t('sitePreview.navCta')}
        </span>
      </nav>
    </div>
  );
}

function PreviewHero({
  config,
  active
}: {
  config: Record<string, unknown>;
  active: boolean;
}) {
  const { t } = useTranslation();
  const style = config?.style as string | undefined;
  const title = (config?.title as string) || t('sitePreview.heroTitle');
  const subtitle =
    (config?.subtitle as string) || t('sitePreview.heroSubtitle');
  const ctaText = (config?.ctaText as string) || t('sitePreview.heroCta');
  const alignment = (config?.alignment as string) || 'center';
  const height = config?.height as string;
  const bgType = (config?.bgType as string) ?? 'gradient';
  const bgImage = config?.bgImage as string | undefined;
  const bgColor = (config?.bgColor as string) ?? '#3b82f6';
  const overlayOpacity = (config?.overlayOpacity as number) ?? 40;

  const themes: Record<
    string,
    {
      bg: string;
      title: string;
      sub: string;
      btn: string;
      btnText: string;
      btnBorder: string;
    }
  > = {
    expert: {
      bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-white',
      title: 'text-gray-900',
      sub: 'text-gray-500',
      btn: 'bg-rose-600',
      btnText: 'text-white',
      btnBorder: 'border-rose-200'
    },
    'expert-academy': {
      bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-white',
      title: 'text-gray-900',
      sub: 'text-gray-500',
      btn: 'bg-rose-600',
      btnText: 'text-white',
      btnBorder: 'border-rose-200'
    },
    community: {
      bg: 'bg-slate-950',
      title: 'text-white',
      sub: 'text-slate-400',
      btn: 'bg-indigo-500',
      btnText: 'text-white',
      btnBorder: 'border-slate-700'
    },
    'creator-store': {
      bg: 'bg-white',
      title: 'text-gray-900',
      sub: 'text-gray-500',
      btn: 'bg-gray-900',
      btnText: 'text-white',
      btnBorder: 'border-gray-200'
    },
    creator: {
      bg: 'bg-white',
      title: 'text-gray-900',
      sub: 'text-gray-500',
      btn: 'bg-gray-900',
      btnText: 'text-white',
      btnBorder: 'border-gray-200'
    },
    studio: {
      bg: 'bg-amber-50',
      title: 'text-gray-900',
      sub: 'text-gray-600',
      btn: 'bg-teal-500',
      btnText: 'text-white',
      btnBorder: 'border-amber-200'
    },
    social: {
      bg: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700',
      title: 'text-white',
      sub: 'text-violet-200',
      btn: 'bg-white',
      btnText: 'text-violet-700',
      btnBorder: 'border-violet-400'
    }
  };
  const th = themes[style ?? ''] ?? {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    title: 'text-gray-900',
    sub: 'text-gray-500',
    btn: 'bg-indigo-600',
    btnText: 'text-white',
    btnBorder: 'border-indigo-200'
  };

  const usesImage = bgType === 'image' && !!bgImage;
  const textOnDark = usesImage || bgType === 'solid';

  const alignCls =
    alignment === 'left'
      ? 'items-start text-right'
      : 'items-center text-center mx-auto';
  const heightCls =
    height === 'large'
      ? 'min-h-[420px]'
      : height === 'small'
        ? 'min-h-[220px]'
        : 'min-h-[320px]';

  const wrapperStyle: React.CSSProperties =
    bgType === 'image' && bgImage
      ? {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      : bgType === 'solid'
        ? { backgroundColor: bgColor }
        : {};

  const titleCls = usesImage ? 'text-white' : th.title;
  const subCls = usesImage ? 'text-white/80' : th.sub;
  const btnBorderCls = usesImage ? 'border-white/40' : th.btnBorder;

  return (
    <div
      className={`relative flex flex-col justify-center px-12 py-10 ${bgType === 'gradient' ? th.bg : ''} ${heightCls} ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      style={wrapperStyle}
    >
      {/* Dark overlay for image backgrounds */}
      {usesImage && (
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${overlayOpacity / 100})` }}
        />
      )}

      <div className={`relative flex max-w-2xl flex-col gap-4 ${alignCls}`}>
        <h1
          className={`text-4xl font-bold leading-tight tracking-tight ${titleCls}`}
        >
          {title}
        </h1>
        <p className={`text-lg leading-relaxed ${subCls}`}>{subtitle}</p>
        {config?.showCTA !== false && (
          <div className="mt-2 flex flex-wrap gap-3">
            <span
              className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-sm ${th.btn} ${textOnDark && bgType !== 'solid' ? 'text-white' : th.btnText}`}
            >
              {ctaText}
            </span>
            {!!config?.ctaSecondary && (
              <span
                className={`rounded-xl border bg-transparent px-6 py-3 text-sm font-semibold ${titleCls} ${btnBorderCls}`}
              >
                {config.ctaSecondary as string}
              </span>
            )}
          </div>
        )}
        <div
          className={`mt-3 flex items-center gap-3 text-xs ${subCls} opacity-70`}
        >
          <span>★★★★★</span>
          <span>{t('sitePreview.heroTrust')}</span>
        </div>
      </div>
    </div>
  );
}

function PreviewFeatures({
  config,
  active
}: {
  config: Record<string, unknown>;
  active: boolean;
}) {
  const { t } = useTranslation();
  const style = config?.style as string | undefined;
  const title = (config?.title as string) || t('sitePreview.featuresTitle');
  const cols = Math.min((config?.gridColumns as number) || 3, 4);

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
  ].slice(0, cols * 2);

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
    return (
      <div
        className={`border-y border-gray-100 bg-white px-8 py-10 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      >
        {title && (
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-rose-500">
            {title}
          </p>
        )}
        <div className={`grid grid-cols-${stats.length} gap-8`}>
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <p className="text-5xl font-bold text-gray-900">{s.value}</p>
              <p className="mt-2 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'dark') {
    return (
      <div
        className={`bg-slate-950 px-8 py-14 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      >
        <h2 className="mb-3 text-center text-3xl font-bold text-white">
          {title}
        </h2>
        {!!config?.subtitle && (
          <p className="mb-10 text-center text-base text-slate-400">
            {config.subtitle as string}
          </p>
        )}
        <div className={`grid grid-cols-${Math.min(cols, 3)} gap-5`}>
          {features.slice(0, cols).map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-2xl">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'benefits') {
    return (
      <div
        className={`bg-white px-8 py-14 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      >
        <h2 className="mb-3 text-center text-3xl font-bold text-gray-900">
          {title}
        </h2>
        {!!config?.subtitle && (
          <p className="mb-10 text-center text-gray-500">
            {config.subtitle as string}
          </p>
        )}
        <div className={`grid grid-cols-${Math.min(cols, 2)} gap-4`}>
          {features.slice(0, Math.min(cols * 2, 6)).map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100">
                <svg
                  className="h-4 w-4 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{f.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-50 px-8 py-14 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
    >
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {!!config?.subtitle && (
          <p className="mt-2 text-gray-500">{config.subtitle as string}</p>
        )}
      </div>
      <div className={`grid grid-cols-${Math.min(cols, 3)} gap-5`}>
        {features.slice(0, cols).map((f, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-1.5 text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewCourses({
  config,
  active
}: {
  config: Record<string, unknown>;
  active: boolean;
}) {
  const { t } = useTranslation();
  const title = (config?.title as string) || t('sitePreview.coursesTitle');
  const cols = Math.min((config?.gridColumns as number) || 3, 4);
  const courses = [
    {
      title: t('sitePreview.course1Title'),
      tag: t('sitePreview.course1Tag'),
      price: t('sitePreview.course1Price'),
      color: 'from-blue-400 to-indigo-500'
    },
    {
      title: t('sitePreview.course2Title'),
      tag: t('sitePreview.course2Tag'),
      price: t('sitePreview.course2Price'),
      color: 'from-purple-400 to-pink-500'
    },
    {
      title: t('sitePreview.course3Title'),
      tag: t('sitePreview.course3Tag'),
      price: t('sitePreview.course3Price'),
      color: 'from-orange-400 to-red-400'
    },
    {
      title: t('sitePreview.course4Title'),
      tag: t('sitePreview.course4Tag'),
      price: t('sitePreview.course4Price'),
      color: 'from-green-400 to-teal-500'
    }
  ].slice(0, cols);

  return (
    <div
      className={`bg-white px-8 py-14 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
    >
      {title && (
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {!!config?.subtitle && (
            <p className="mt-2 text-gray-500">{config.subtitle as string}</p>
          )}
        </div>
      )}
      <div className={`grid grid-cols-${cols} gap-5`}>
        {courses.map((c, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={`h-36 bg-gradient-to-br ${c.color} flex items-center justify-center`}
            >
              <span className="text-3xl text-white">📖</span>
            </div>
            <div className="p-4">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                {c.tag}
              </span>
              <h3 className="mt-2 text-sm font-semibold leading-snug text-gray-900">
                {c.title}
              </h3>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex text-xs text-amber-400">★★★★★</div>
                <span className="text-sm font-bold text-gray-900">
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
  active
}: {
  config: Record<string, unknown>;
  active: boolean;
}) {
  const { t } = useTranslation();
  const style = config?.style as string | undefined;
  const title = (config?.title as string) || t('sitePreview.testimonialsTitle');

  const reviews = [
    {
      name: t('sitePreview.review1Name'),
      role: t('sitePreview.review1Role'),
      text: t('sitePreview.review1Text'),
      revenue: t('sitePreview.review1Revenue'),
      emoji: '👩‍💻'
    },
    {
      name: t('sitePreview.review2Name'),
      role: t('sitePreview.review2Role'),
      text: t('sitePreview.review2Text'),
      revenue: t('sitePreview.review2Revenue'),
      emoji: '👨‍💼'
    },
    {
      name: t('sitePreview.review3Name'),
      role: t('sitePreview.review3Role'),
      text: t('sitePreview.review3Text'),
      revenue: t('sitePreview.review3Revenue'),
      emoji: '👩‍🔬'
    }
  ];

  if (style === 'dark-quote') {
    return (
      <div
        className={`bg-slate-950 px-8 py-16 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      >
        <h2 className="mb-10 text-center text-3xl font-bold text-white">
          {title}
        </h2>
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <p className="text-5xl font-bold text-white">
            {t('sitePreview.darkQuoteRevenue')}
          </p>
          <p className="mb-6 mt-1 text-sm uppercase tracking-wide text-slate-400">
            {t('sitePreview.darkQuoteRevenueLabel')}
          </p>
          <blockquote className="mb-6 text-lg italic text-slate-300">
            {t('sitePreview.darkQuoteText')}
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-2xl">
              👩‍💼
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">
                {t('sitePreview.darkQuoteAuthor')}
              </p>
              <p className="text-sm text-slate-400">
                {t('sitePreview.darkQuoteAuthorRole')}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="mb-2 flex text-sm text-amber-400">★★★★★</div>
              <p className="mb-3 text-sm text-slate-300">«{r.text}»</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{r.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'social-proof') {
    const review4 = {
      name: t('sitePreview.review4Name'),
      role: t('sitePreview.review4Role'),
      text: t('sitePreview.review4Text'),
      revenue: t('sitePreview.review4Revenue'),
      emoji: '👨‍🎨'
    };
    return (
      <div
        className={`bg-white px-8 py-14 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      >
        <h2 className="mb-2 text-center text-3xl font-bold text-gray-900">
          {title} <span className="text-violet-500">👉</span>
        </h2>
        <p className="mb-8 text-center text-sm text-gray-400">
          {t('sitePreview.socialProofSubtitle')}
        </p>
        <div className="grid grid-cols-4 gap-4">
          {[...reviews, review4].map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xl">
                  {r.emoji}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {r.name}
                  </p>
                  <p className="text-xs font-bold text-violet-600">
                    {r.revenue}
                  </p>
                </div>
              </div>
              <div className="mb-2 flex text-xs text-yellow-400">★★★★★</div>
              <p className="text-xs text-gray-600">«{r.text}»</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'creator-stories') {
    const revenueSpots = [
      t('sitePreview.review1Revenue'),
      t('sitePreview.review2Revenue'),
      t('sitePreview.review3Revenue'),
      t('sitePreview.review4Revenue')
    ];
    return (
      <div
        className={`bg-white px-8 py-14 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      >
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {!!config?.subtitle && (
            <p className="mt-2 text-gray-500">{config.subtitle as string}</p>
          )}
        </div>
        <div className="mb-6 grid grid-cols-2 gap-6">
          {reviews.slice(0, 2).map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-7"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-3xl">
                  {r.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{r.name}</p>
                  <p className="text-sm text-gray-500">{r.role}</p>
                  <p className="text-sm font-semibold text-teal-600">
                    {r.revenue}
                  </p>
                </div>
              </div>
              <div className="mb-2 flex text-sm text-amber-400">★★★★★</div>
              <p className="text-sm text-gray-600">«{r.text}»</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {revenueSpots.map((v, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 bg-white p-3 text-center"
            >
              <p className="text-lg font-bold text-teal-600">{v}</p>
              <p className="text-xs text-gray-500">{reviews[i % 3]?.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-50 px-8 py-14 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
    >
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {!!config?.subtitle && (
          <p className="mt-2 text-gray-500">{config.subtitle as string}</p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex text-sm text-amber-400">★★★★★</div>
            <p className="mb-5 text-sm leading-relaxed text-gray-700">
              «{r.text}»
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-2xl">
                {r.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-500">{r.role}</p>
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
  active
}: {
  config: Record<string, unknown>;
  active: boolean;
}) {
  const { t } = useTranslation();
  const dark = config?.dark as boolean;
  const minimal = config?.minimal as boolean;
  const base = dark
    ? 'bg-slate-900 text-slate-400'
    : 'bg-gray-900 text-gray-400';

  const cols = [
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

  if (minimal) {
    return (
      <div
        className={`${base} px-8 py-5 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-white">
            {t('sitePreview.academyName')}
          </span>
          <span className="text-sm">
            {t('sitePreview.footerMinimalCopyright')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${base} px-8 py-10 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
    >
      <div className="mb-8 grid grid-cols-4 gap-8">
        {cols.map((col, i) => (
          <div key={i}>
            <p className="mb-3 font-semibold text-white">{col}</p>
            {links.map((link) => (
              <p
                key={link}
                className="cursor-pointer py-0.5 text-sm hover:text-gray-200"
              >
                {link}
              </p>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-gray-700 pt-6">
        <span className="text-sm">{t('sitePreview.footerCopyright')}</span>
        <div className="flex gap-3">
          {socials.map((s) => (
            <span
              key={s}
              className="cursor-pointer text-sm hover:text-gray-200"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewSidebar({ active }: { active: boolean }) {
  const { t } = useTranslation();
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
      className={`h-full border-l border-gray-200 bg-gray-50 px-4 py-6 ${active ? 'outline outline-2 outline-blue-500' : ''}`}
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {t('sitePreview.sidebarNavLabel')}
      </p>
      {items.map((item) => (
        <div
          key={item}
          className="mb-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-200"
        >
          <div className="h-4 w-4 rounded bg-gray-300" />
          {item}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: UIBlockConfig, active: boolean) {
  const cfg = (block.config ?? {}) as Record<string, unknown>;
  switch (block.type) {
    case 'header':
      return <PreviewHeader config={cfg} active={active} />;
    case 'hero':
      return <PreviewHero config={cfg} active={active} />;
    case 'features':
      return <PreviewFeatures config={cfg} active={active} />;
    case 'courses':
      return <PreviewCourses config={cfg} active={active} />;
    case 'testimonials':
      return <PreviewTestimonials config={cfg} active={active} />;
    case 'footer':
      return <PreviewFooter config={cfg} active={active} />;
    case 'sidebar':
      return <PreviewSidebar active={active} />;
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
  onSelectBlock
}: SitePreviewProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setZoom(containerRef.current.clientWidth / VIRTUAL_W);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

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
            <PreviewSidebar active={activeBlockId === sidebarBlock.id} />
          </div>
          <div className="flex flex-1 flex-col">
            {mainBlocks.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => onSelectBlock(block.id)}
                className="w-full text-left focus:outline-none"
              >
                {renderBlock(block, block.id === activeBlockId)}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {visibleBlocks.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => onSelectBlock(block.id)}
            className="w-full text-left focus:outline-none"
          >
            {renderBlock(block, block.id === activeBlockId)}
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

      {/* Zoomed page content — fills remaining height */}
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-white">
        <div ref={virtualRef} dir="rtl" className="w-[960px]">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
}
