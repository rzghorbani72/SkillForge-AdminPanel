'use client';

import { useTranslation } from '@/lib/i18n/hooks';

// ── Shared primitives ─────────────────────────────────────────────────────────

const FakeText = ({
  w = 'w-full',
  h = 'h-1.5',
  color = 'bg-gray-200'
}: {
  w?: string;
  h?: string;
  color?: string;
}) => <div className={`rounded ${w} ${h} ${color}`} />;

const NavBar = ({
  bg = 'bg-white',
  border = 'border-gray-100',
  logoColor = 'bg-gray-800',
  dotColor = 'bg-gray-700',
  ctaBg = 'bg-gray-800'
}: {
  bg?: string;
  border?: string;
  logoColor?: string;
  dotColor?: string;
  ctaBg?: string;
}) => {
  const { t } = useTranslation();
  return (
    <div
      dir="rtl"
      className={`flex items-center justify-between border-b px-3 py-1.5 ${bg} ${border}`}
    >
      <div className="flex items-center gap-1.5">
        <div className={`h-3 w-3 rounded-md ${logoColor}`} />
        <div className={`h-1.5 w-10 rounded ${dotColor}`} />
      </div>
      <div className="flex gap-2">
        <FakeText w="w-5" h="h-1" color={`${dotColor} opacity-50`} />
        <FakeText w="w-5" h="h-1" color={`${dotColor} opacity-50`} />
        <FakeText w="w-5" h="h-1" color={`${dotColor} opacity-50`} />
      </div>
      <div
        className={`h-4 w-10 rounded ${ctaBg} flex items-center justify-center text-[6px] font-medium text-white`}
      >
        {t('sitePreview.thumbnailCta')}
      </div>
    </div>
  );
};

const CourseCard = ({ from, to }: { from: string; to: string }) => (
  <div className="overflow-hidden rounded border border-gray-100">
    <div className={`h-8 bg-gradient-to-br ${from} ${to}`} />
    <div className="space-y-0.5 bg-white p-1">
      <FakeText w="w-full" h="h-1.5" color="bg-gray-200" />
      <FakeText w="w-3/4" h="h-1" color="bg-gray-100" />
    </div>
  </div>
);

// ── Inline SVG Illustrations ──────────────────────────────────────────────────

const IllustLaptop = () => (
  <svg viewBox="0 0 40 34" fill="none" className="h-10 w-10">
    <rect x="1" y="1" width="28" height="20" rx="2" fill="#4338ca" />
    <rect x="2" y="2" width="26" height="18" rx="1" fill="#818cf8" />
    <rect x="4" y="5" width="13" height="1.5" rx="0.5" fill="#e0e7ff" />
    <rect x="4" y="8" width="9" height="1.5" rx="0.5" fill="#c7d2fe" />
    <rect x="4" y="11" width="11" height="1.5" rx="0.5" fill="#e0e7ff" />
    <rect x="19" y="5" width="6" height="9" rx="1" fill="#6366f1" />
    <rect x="0" y="21" width="30" height="4" rx="1" fill="#3730a3" />
    <circle cx="36" cy="4" r="3" fill="#fbbf24" />
    <circle cx="37" cy="14" r="2" fill="#34d399" />
    <path d="M34 24 L36 28 L38 24 L36 20 Z" fill="#f472b6" opacity="0.8" />
    <path
      d="M32 1 L33 4 L36 4 L34 6 L35 9 L32 7 L29 9 L30 6 L28 4 L31 4 Z"
      fill="#fbbf24"
      opacity="0.7"
    />
  </svg>
);

const IllustBook = () => (
  <svg viewBox="0 0 44 44" fill="none" className="h-11 w-11">
    <polygon points="22,2 38,9 22,16 6,9" fill="#1e40af" />
    <polygon points="22,5 38,9 22,13 6,9" fill="#3b82f6" opacity="0.6" />
    <circle cx="22" cy="9" r="3" fill="#fbbf24" />
    <rect x="4" y="13" width="18" height="24" rx="2" fill="#2563eb" />
    <rect x="5" y="14" width="16" height="22" rx="1" fill="#93c5fd" />
    <rect x="7" y="18" width="12" height="1.5" rx="0.5" fill="#eff6ff" />
    <rect x="7" y="21" width="10" height="1.5" rx="0.5" fill="#dbeafe" />
    <rect x="7" y="24" width="11" height="1.5" rx="0.5" fill="#eff6ff" />
    <rect x="7" y="27" width="8" height="1.5" rx="0.5" fill="#dbeafe" />
    <rect x="21" y="13" width="3" height="24" rx="1" fill="#1d4ed8" />
    <rect x="23" y="13" width="17" height="24" rx="2" fill="#1e40af" />
    <rect x="24" y="14" width="15" height="22" rx="1" fill="#bfdbfe" />
    <rect x="26" y="18" width="11" height="1.5" rx="0.5" fill="#eff6ff" />
    <rect x="26" y="21" width="9" height="1.5" rx="0.5" fill="#dbeafe" />
    <rect x="26" y="24" width="10" height="1.5" rx="0.5" fill="#eff6ff" />
    <rect x="26" y="27" width="7" height="1.5" rx="0.5" fill="#dbeafe" />
  </svg>
);

const IllustCap = () => (
  <svg viewBox="0 0 44 36" fill="none" className="h-9 w-11">
    <polygon points="22,2 40,12 22,22 4,12" fill="#ffffff" />
    <polygon points="22,6 40,12 22,18 4,12" fill="#e0e7ff" opacity="0.6" />
    <path
      d="M32 12 L32 24 Q32 30 22 30 Q12 30 12 24 L12 12"
      fill="none"
      stroke="#6366f1"
      strokeWidth="1.5"
    />
    <line
      x1="40"
      y1="12"
      x2="40"
      y2="28"
      stroke="#fbbf24"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="40" cy="30" r="3" fill="#fbbf24" />
    <circle cx="22" cy="12" r="4" fill="#fbbf24" opacity="0.9" />
  </svg>
);

const IllustStudent = () => (
  <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12">
    <rect x="6" y="36" width="36" height="3" rx="1" fill="#7c3aed" />
    <rect x="10" y="26" width="28" height="10" rx="2" fill="#4c1d95" />
    <rect x="11" y="27" width="26" height="8" rx="1" fill="#a78bfa" />
    <rect x="8" y="36" width="32" height="2" rx="1" fill="#3730a3" />
    <rect x="14" y="29" width="12" height="1.5" rx="0.5" fill="#ede9fe" />
    <rect x="14" y="32" width="8" height="1" rx="0.5" fill="#ddd6fe" />
    <circle cx="24" cy="14" r="7" fill="#c4b5fd" />
    <path d="M12 26 Q24 16 36 26" fill="#7c3aed" />
    <circle cx="38" cy="6" r="5" fill="#fbbf24" opacity="0.95" />
    <rect x="36" y="11" width="4" height="3" rx="1" fill="#d97706" />
    <path d="M36 6 Q38 3 40 6" stroke="#fff" strokeWidth="1.2" fill="none" />
  </svg>
);

const IllustStar = () => (
  <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12">
    <rect x="16" y="30" width="16" height="14" rx="2" fill="#f59e0b" />
    <rect x="2" y="36" width="14" height="8" rx="2" fill="#fbbf24" />
    <rect x="32" y="36" width="14" height="8" rx="2" fill="#fbbf24" />
    <path
      d="M24,4 L27,14 L38,14 L29.5,20.5 L32.5,31 L24,24 L15.5,31 L18.5,20.5 L10,14 L21,14 Z"
      fill="#fbbf24"
    />
    <line
      x1="42"
      y1="8"
      x2="45"
      y2="5"
      stroke="#fcd34d"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="44"
      y1="18"
      x2="47"
      y2="18"
      stroke="#fcd34d"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="4"
      y1="8"
      x2="1"
      y2="5"
      stroke="#fcd34d"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const IllustChart = () => (
  <svg viewBox="0 0 40 36" fill="none" className="h-9 w-10">
    <line x1="4" y1="2" x2="4" y2="32" stroke="#9ca3af" strokeWidth="1" />
    <line x1="4" y1="32" x2="38" y2="32" stroke="#9ca3af" strokeWidth="1" />
    <line x1="4" y1="24" x2="38" y2="24" stroke="#e5e7eb" strokeWidth="0.5" />
    <line x1="4" y1="16" x2="38" y2="16" stroke="#e5e7eb" strokeWidth="0.5" />
    <line x1="4" y1="8" x2="38" y2="8" stroke="#e5e7eb" strokeWidth="0.5" />
    <rect x="7" y="20" width="5" height="12" rx="1" fill="#9ca3af" />
    <rect x="15" y="14" width="5" height="18" rx="1" fill="#6b7280" />
    <rect x="23" y="8" width="5" height="24" rx="1" fill="#374151" />
    <rect x="31" y="2" width="5" height="30" rx="1" fill="#1f2937" />
    <path d="M28 0 L32 4 L30 4 L30 10 L26 10 L26 4 L24 4 Z" fill="#10b981" />
  </svg>
);

const IllustSpotlight = () => (
  <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12">
    <path
      d="M24 4 L34 22 L44 44 L4 44 L14 22 Z"
      fill="#f59e0b"
      opacity="0.15"
    />
    <path d="M24 4 L32 20 L40 40 L8 40 L16 20 Z" fill="#fbbf24" opacity="0.2" />
    <circle cx="24" cy="4" r="4" fill="#fbbf24" />
    <rect
      x="12"
      y="30"
      width="24"
      height="14"
      rx="2"
      fill="#fbbf24"
      opacity="0.9"
    />
    <rect x="14" y="32" width="20" height="10" rx="1" fill="#fffbeb" />
    <rect x="16" y="34" width="12" height="1.5" rx="0.5" fill="#d97706" />
    <rect x="16" y="37" width="9" height="1" rx="0.5" fill="#fbbf24" />
    <path
      d="M22,22 L24,16 L26,22 L32,22 L27.5,26 L29.5,32 L24,28 L18.5,32 L20.5,26 L16,22 Z"
      fill="#f59e0b"
    />
  </svg>
);

// ── Kajabi (Expert Academy) ───────────────────────────────────────────────────

export function KajabiThumbnail() {
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white text-[0]">
      <NavBar logoColor="bg-rose-600" ctaBg="bg-rose-500" />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 px-4 pb-3 pt-5">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-rose-200/40" />
        <div className="space-y-1 text-center">
          <FakeText w="w-44 mx-auto" h="h-2" color="bg-gray-800" />
          <FakeText w="w-36 mx-auto" h="h-2" color="bg-gray-600" />
          <FakeText w="w-52 mx-auto" h="h-1.5" color="bg-gray-300" />
          <div className="flex justify-center gap-2 pt-1">
            <div className="h-4 w-14 rounded bg-rose-500" />
            <div className="h-4 w-14 rounded border border-gray-300" />
          </div>
          <div className="flex justify-center -space-x-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-4 rounded-full border-2 border-white bg-rose-200"
              />
            ))}
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="flex divide-x divide-gray-100 border-b border-gray-100">
        {['100K+', '$10B+', '75M+'].map((s) => (
          <div key={s} className="flex-1 space-y-0.5 py-1.5 text-center">
            <FakeText w="w-8 mx-auto" h="h-2" color="bg-gray-800" />
            <FakeText w="w-10 mx-auto" h="h-1" color="bg-gray-300" />
          </div>
        ))}
      </div>
      {/* Courses */}
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
        {[
          ['from-rose-100', 'to-orange-50'],
          ['from-pink-100', 'to-rose-50'],
          ['from-orange-100', 'to-amber-50']
        ].map(([f, t], i) => (
          <CourseCard key={i} from={f} to={t} />
        ))}
      </div>
      {/* Dark testimonials */}
      <div className="bg-slate-800 px-3 py-2">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex h-10 flex-1 flex-col justify-end space-y-0.5 rounded bg-slate-700 p-1"
            >
              <FakeText w="w-full" h="h-1" color="bg-slate-500" />
              <FakeText w="w-2/3" h="h-0.5" color="bg-slate-600" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-4 border-t border-gray-100 bg-gray-50" />
    </div>
  );
}

// ── Podia (Studio) ────────────────────────────────────────────────────────────

export function PodiaThumbnail() {
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <NavBar
        logoColor="bg-teal-500"
        dotColor="bg-gray-600"
        ctaBg="bg-teal-500"
      />
      {/* Hero split */}
      <div className="flex gap-2 px-3 pb-2 pt-3">
        <div className="flex-1 space-y-1">
          <FakeText w="w-full" h="h-2" color="bg-gray-900" />
          <FakeText w="w-5/6" h="h-2" color="bg-gray-800" />
          <FakeText w="w-full" h="h-1.5" color="bg-gray-300" />
          <FakeText w="w-5/6" h="h-1.5" color="bg-gray-200" />
          <div className="pt-2">
            <div className="h-5 w-20 rounded bg-teal-500" />
          </div>
        </div>
        <div className="flex w-24 flex-col gap-1.5">
          {['bg-orange-400', 'bg-pink-400', 'bg-purple-400'].map((bg, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 rounded-lg p-1.5 ${bg}`}
            >
              <div className="h-3 w-3 rounded bg-white/30" />
              <FakeText w="flex-1" h="h-1.5" color="bg-white/60" />
            </div>
          ))}
        </div>
      </div>
      {/* Creator stories */}
      <div className="border-t border-gray-100 px-3 py-2">
        <FakeText w="w-32 mx-auto" h="h-1.5" color="bg-gray-700" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="space-y-1 rounded-xl border border-gray-100 p-2"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-[8px]">
                  👤
                </div>
                <div className="space-y-0.5">
                  <FakeText w="w-12" h="h-1.5" color="bg-gray-700" />
                  <FakeText w="w-8" h="h-1" color="bg-teal-500" />
                </div>
              </div>
              <FakeText w="w-full" h="h-1" color="bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      {/* Checklist */}
      <div className="border-t border-gray-100 px-3 py-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              <FakeText w="flex-1" h="h-1" color="bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-4 border-t border-teal-100 bg-teal-50" />
    </div>
  );
}

// ── Stan (Creator) ────────────────────────────────────────────────────────────

export function StanThumbnail() {
  const { t } = useTranslation();
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-violet-500" />
          <FakeText w="w-6" h="h-1.5" color="bg-gray-700" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <FakeText key={i} w="w-4" h="h-1" color="bg-gray-300" />
          ))}
        </div>
        <div className="flex h-4 w-12 items-center justify-center rounded border border-gray-200 text-[6px] text-gray-500">
          {t('sitePreview.thumbnailLogin')}
        </div>
      </div>
      {/* Violet gradient hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 px-4 pb-4 pt-5">
        <div className="absolute left-1/4 top-2 h-12 w-12 rounded-full bg-white/5 blur-xl" />
        <div className="space-y-1 text-center">
          <FakeText w="w-40 mx-auto" h="h-2" color="bg-white" />
          <FakeText w="w-32 mx-auto" h="h-2" color="bg-white/80" />
          <FakeText w="w-48 mx-auto" h="h-1.5" color="bg-purple-300/70" />
          <div className="flex justify-center pt-2">
            <div className="flex h-5 w-20 items-center justify-center rounded-full bg-orange-400 text-[6px] font-semibold text-white">
              {t('sitePreview.thumbnailFreeTrial')}
            </div>
          </div>
        </div>
      </div>
      {/* Social proof */}
      <div className="bg-white px-3 py-2">
        <FakeText w="w-36 mx-auto" h="h-1.5" color="bg-gray-700" />
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {[
            'bg-purple-50',
            'bg-indigo-50',
            'bg-violet-50',
            'bg-fuchsia-50'
          ].map((bg, i) => (
            <div
              key={i}
              className={`rounded-lg border border-gray-100 ${bg} h-14 p-1.5`}
            >
              <FakeText w="w-full" h="h-1" color="bg-gray-200" />
              <div className="mt-1 space-y-0.5">
                <FakeText w="w-full" h="h-2" color="bg-gray-100" />
                <FakeText w="w-3/4" h="h-1" color="bg-purple-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 0% badge */}
      <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-yellow-100 bg-yellow-50 px-2 py-1.5">
        <span className="text-[10px] font-black text-yellow-600">0%</span>
        <div className="flex-1 space-y-0.5">
          <FakeText w="w-24" h="h-1.5" color="bg-gray-700" />
          <FakeText w="w-32" h="h-1" color="bg-gray-300" />
        </div>
      </div>
      <div className="h-4 border-t border-gray-100 bg-white" />
    </div>
  );
}

// ── Circle (Community) ────────────────────────────────────────────────────────

export function CircleThumbnail() {
  const { t } = useTranslation();
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-indigo-400" />
          <FakeText w="w-10" h="h-1.5" color="bg-slate-400" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <FakeText key={i} w="w-4" h="h-1" color="bg-slate-600" />
          ))}
        </div>
        <div className="flex h-4 w-12 items-center justify-center rounded border border-slate-600 text-[6px] text-slate-400">
          {t('sitePreview.thumbnailLogin')}
        </div>
      </div>
      {/* Dark hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 px-4 pb-4 pt-5">
        <div className="absolute -top-8 right-0 h-20 w-20 rounded-full bg-indigo-900/40 blur-2xl" />
        <div className="space-y-1 text-center">
          <FakeText w="w-40 mx-auto" h="h-2" color="bg-white" />
          <FakeText w="w-32 mx-auto" h="h-2" color="bg-slate-300" />
          <FakeText w="w-48 mx-auto" h="h-1.5" color="bg-slate-500" />
          <div className="flex justify-center gap-2 pt-2">
            <div className="flex h-5 w-14 items-center justify-center rounded bg-indigo-500 text-[6px] text-white">
              {t('sitePreview.thumbnailFreeTrial')}
            </div>
            <div className="flex h-5 w-14 items-center justify-center rounded border border-slate-500 text-[6px] text-slate-300">
              {t('sitePreview.thumbnailWatch')}
            </div>
          </div>
          <div className="flex justify-center -space-x-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-4 rounded-full bg-slate-700 ring-2 ring-slate-800"
              />
            ))}
          </div>
        </div>
      </div>
      {/* Dark feature cards */}
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
        {['💬', '🎓', '📅'].map((emoji, i) => (
          <div
            key={i}
            className="space-y-1 rounded-lg border border-slate-700 bg-slate-800 p-2"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded bg-indigo-900/60 text-[9px]">
              {emoji}
            </div>
            <FakeText w="w-full" h="h-1.5" color="bg-slate-600" />
            <FakeText w="w-3/4" h="h-1" color="bg-slate-700" />
          </div>
        ))}
      </div>
      {/* Dark testimonial */}
      <div className="mx-3 mb-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
        <div className="flex gap-2">
          <div className="h-5 w-5 shrink-0 rounded-full bg-indigo-900" />
          <div className="flex-1 space-y-0.5">
            <FakeText w="w-full" h="h-1.5" color="bg-slate-500" />
            <FakeText w="w-5/6" h="h-1" color="bg-slate-600" />
          </div>
        </div>
      </div>
      <div className="h-4 border-t border-slate-800 bg-slate-900" />
    </div>
  );
}

// ── Roocket (Dark Programmer) ─────────────────────────────────────────────────

export function RocketThumbnail() {
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-[#0a0f1e]">
      {/* Dark navbar */}
      <div className="flex items-center justify-between border-b border-gray-700/60 bg-[#0f1629] px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <FakeText w="w-10" h="h-1.5" color="bg-gray-400" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <FakeText key={i} w="w-5" h="h-1" color="bg-gray-600" />
          ))}
        </div>
        <div className="flex h-4 w-10 items-center justify-center rounded bg-green-500 text-[6px] font-semibold text-white">
          ورود
        </div>
      </div>
      {/* Dark hero with character */}
      <div className="relative overflow-hidden bg-gradient-to-bl from-[#0f1a30] to-[#0a0f1e] px-4 pb-3 pt-4">
        <div className="absolute -left-4 top-2 h-16 w-16 rounded-full bg-green-900/20 blur-xl" />
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <FakeText w="w-full" h="h-2" color="bg-white" />
            <FakeText w="w-5/6" h="h-2" color="bg-white/80" />
            <FakeText w="w-11/12" h="h-1.5" color="bg-gray-400" />
            <FakeText w="w-4/5" h="h-1.5" color="bg-gray-500" />
            <div className="flex gap-1.5 pt-1.5">
              <div className="h-4 w-16 rounded-full bg-green-500" />
              <div className="h-4 w-12 rounded-full border border-gray-600" />
            </div>
            {/* Feature badges */}
            <div className="flex flex-wrap gap-1 pt-1">
              {['✓ ۵۰۰+ دوره', '✓ ضمانت', '✓ پشتیبانی'].map((f, i) => (
                <span
                  key={i}
                  className="rounded-full bg-green-900/40 px-1.5 py-0.5 text-[6px] text-green-400"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
          {/* Character placeholder */}
          <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-900/40 to-green-900/20">
            <span className="text-2xl">👨‍💻</span>
          </div>
        </div>
      </div>
      {/* Courses row */}
      <div className="px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between">
          <FakeText w="w-20" h="h-1.5" color="bg-gray-300" />
          <FakeText w="w-10" h="h-1" color="bg-green-500" />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            ['from-red-800', 'to-orange-700'],
            ['from-blue-800', 'to-cyan-700'],
            ['from-purple-800', 'to-pink-700'],
            ['from-green-800', 'to-teal-700']
          ].map(([f, t], i) => (
            <div
              key={i}
              className="overflow-hidden rounded border border-gray-700/50"
            >
              <div className={`h-6 bg-gradient-to-br ${f} ${t}`} />
              <div className="space-y-0.5 bg-gray-800/80 p-1">
                <FakeText w="w-full" h="h-1" color="bg-gray-500" />
                <FakeText w="w-3/4" h="h-0.5" color="bg-gray-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Dark footer */}
      <div className="h-4 border-t border-gray-700/50 bg-[#060a14]" />
    </div>
  );
}

// ── Modern ────────────────────────────────────────────────────────────────────

export function ModernThumbnail() {
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <NavBar
        logoColor="bg-indigo-600"
        dotColor="bg-gray-600"
        ctaBg="bg-indigo-600"
      />
      {/* Hero – split: text + laptop illustration */}
      <div className="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 pb-3 pt-4">
        <div className="flex-1 space-y-1">
          <FakeText w="w-full" h="h-2" color="bg-gray-800" />
          <FakeText w="w-4/5" h="h-1.5" color="bg-gray-400" />
          <div className="flex gap-1.5 pt-1.5">
            <div className="h-4 w-12 rounded bg-indigo-600" />
            <div className="h-4 w-12 rounded border border-indigo-300" />
          </div>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-indigo-100">
          <IllustLaptop />
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
        <FakeText w="w-24 mx-auto" h="h-1.5" color="bg-gray-700" />
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {['bg-indigo-50', 'bg-blue-50', 'bg-purple-50'].map((bg, i) => (
            <div
              key={i}
              className={`rounded-lg border border-gray-100 ${bg} space-y-1 p-2`}
            >
              <div className="h-4 w-4 rounded-lg bg-indigo-200" />
              <FakeText w="w-full" h="h-1.5" color="bg-gray-300" />
              <FakeText w="w-3/4" h="h-1" color="bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
        {[
          ['from-indigo-200', 'to-blue-100'],
          ['from-purple-200', 'to-pink-100'],
          ['from-blue-200', 'to-teal-100']
        ].map(([f, t], i) => (
          <CourseCard key={i} from={f} to={t} />
        ))}
      </div>
      <div className="h-4 border-t border-gray-800 bg-gray-900" />
    </div>
  );
}

// ── Classic ───────────────────────────────────────────────────────────────────

export function ClassicThumbnail() {
  const { t } = useTranslation();
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <div className="flex items-center justify-between bg-blue-700 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-white/70" />
          <FakeText w="w-10" h="h-1.5" color="bg-white/70" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <FakeText key={i} w="w-5" h="h-1" color="bg-white/40" />
          ))}
        </div>
        <div className="flex h-4 w-10 items-center justify-center rounded bg-white text-[6px] font-medium text-blue-700">
          {t('sitePreview.thumbnailCta')}
        </div>
      </div>
      <div className="flex gap-3 bg-gray-50 px-4 pb-3 pt-4">
        <div className="flex-1 space-y-1">
          <FakeText w="w-full" h="h-2" color="bg-gray-800" />
          <FakeText w="w-4/5" h="h-2" color="bg-gray-700" />
          <FakeText w="w-full" h="h-1.5" color="bg-gray-300" />
          <div className="pt-1">
            <div className="h-4 w-16 rounded bg-blue-600" />
          </div>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
          <IllustBook />
        </div>
      </div>
      <div className="border-t border-gray-100 px-3 py-2">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            ['from-blue-100', 'to-indigo-100'],
            ['from-teal-100', 'to-cyan-100'],
            ['from-blue-50', 'to-blue-100']
          ].map(([f, t], i) => (
            <CourseCard key={i} from={f} to={t} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 border-t border-gray-100 bg-gray-50 px-3 py-1.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="space-y-0.5 rounded border border-gray-100 bg-white p-1.5"
          >
            <div className="flex text-[8px] text-yellow-400">★★★★★</div>
            <FakeText w="w-full" h="h-1" color="bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-4 border-t border-blue-800 bg-blue-700" />
    </div>
  );
}

// ── Minimal ───────────────────────────────────────────────────────────────────

export function MinimalThumbnail() {
  const { t } = useTranslation();
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <FakeText w="w-16" h="h-2" color="bg-gray-900" />
        <div className="flex h-4 w-10 items-center justify-center rounded border border-gray-200 text-[6px] text-gray-500">
          {t('sitePreview.thumbnailMenu')}
        </div>
      </div>
      <div className="space-y-1 px-6 pb-3 pt-5 text-center">
        <FakeText w="w-40 mx-auto" h="h-2.5" color="bg-gray-900" />
        <FakeText w="w-48 mx-auto" h="h-1.5" color="bg-gray-400" />
        <div className="flex justify-center pt-2">
          <div className="h-5 w-20 rounded bg-gray-900" />
        </div>
        {/* Minimal abstract illustration */}
        <div className="flex justify-center pt-2">
          <svg viewBox="0 0 60 28" fill="none" className="h-7 w-16 opacity-70">
            <circle cx="14" cy="14" r="12" stroke="#d1d5db" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="7" fill="#f3f4f6" />
            <circle cx="14" cy="14" r="3" fill="#9ca3af" />
            <line
              x1="28"
              y1="14"
              x2="38"
              y2="14"
              stroke="#d1d5db"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle
              cx="46"
              cy="14"
              r="12"
              stroke="#e5e7eb"
              strokeWidth="1.5"
              fill="none"
            />
            <rect
              x="40"
              y="10"
              width="12"
              height="8"
              rx="2"
              fill="#f9fafb"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <rect x="42" y="12" width="8" height="1" rx="0.5" fill="#d1d5db" />
            <rect
              x="42"
              y="14.5"
              width="5"
              height="1"
              rx="0.5"
              fill="#e5e7eb"
            />
          </svg>
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['from-gray-100', 'to-gray-50'],
            ['from-gray-200', 'to-gray-100'],
            ['from-gray-100', 'to-slate-100'],
            ['from-slate-100', 'to-gray-50']
          ].map(([f, t], i) => (
            <CourseCard key={i} from={f} to={t} />
          ))}
        </div>
      </div>
      <div className="h-4 border-t border-gray-200 bg-gray-50" />
    </div>
  );
}

// ── Academy ───────────────────────────────────────────────────────────────────

export function AcademyThumbnail() {
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <NavBar
        bg="bg-blue-800"
        border="border-blue-900"
        logoColor="bg-white"
        dotColor="bg-blue-200"
        ctaBg="bg-white"
      />
      {/* Hero – split: text + graduation cap illustration */}
      <div className="flex items-center gap-2 bg-gradient-to-br from-blue-900 to-indigo-900 px-3 pb-4 pt-5">
        <div className="flex-1 space-y-1.5">
          <FakeText w="w-full" h="h-2" color="bg-white" />
          <FakeText w="w-5/6" h="h-1.5" color="bg-blue-300" />
          <div className="flex gap-2 pt-1.5">
            <div className="h-4 w-14 rounded bg-white" />
            <div className="h-4 w-14 rounded border border-blue-400" />
          </div>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <IllustCap />
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
        <div className="grid grid-cols-3 gap-1.5">
          {['bg-blue-50', 'bg-indigo-50', 'bg-blue-100'].map((bg, i) => (
            <div
              key={i}
              className={`rounded-lg border border-gray-100 ${bg} space-y-1 p-2`}
            >
              <div className="h-4 w-4 rounded-full bg-blue-200" />
              <FakeText w="w-full" h="h-1.5" color="bg-gray-300" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
        {[
          ['from-blue-100', 'to-indigo-100'],
          ['from-indigo-100', 'to-blue-100'],
          ['from-blue-200', 'to-indigo-50']
        ].map(([f, t], i) => (
          <CourseCard key={i} from={f} to={t} />
        ))}
      </div>
      <div className="h-4 border-t border-blue-900 bg-blue-800" />
    </div>
  );
}

// ── Student Focused ───────────────────────────────────────────────────────────

export function StudentFocusedThumbnail() {
  const { t } = useTranslation();
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <NavBar logoColor="bg-fuchsia-600" ctaBg="bg-fuchsia-600" />
      {/* Hero – split: text + student illustration */}
      <div className="flex items-center gap-2 bg-gradient-to-br from-fuchsia-50 to-pink-50 px-3 pb-3 pt-5">
        <div className="flex-1 space-y-1">
          <FakeText w="w-full" h="h-2" color="bg-gray-800" />
          <FakeText w="w-4/5" h="h-1.5" color="bg-gray-400" />
          <div className="pt-1.5">
            <div className="flex h-5 w-20 items-center justify-center rounded-full bg-fuchsia-500 text-[6px] text-white">
              {t('sitePreview.thumbnailViewCourses')}
            </div>
          </div>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 ring-1 ring-fuchsia-100">
          <IllustStudent />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
        {[
          ['from-fuchsia-100', 'to-pink-100'],
          ['from-purple-100', 'to-fuchsia-100'],
          ['from-pink-100', 'to-rose-100']
        ].map(([f, t], i) => (
          <CourseCard key={i} from={f} to={t} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1 px-3 pb-2">
        {['🎓', '📚', '🏆', '🚀'].map((e, i) => (
          <div key={i} className="flex flex-col items-center py-1">
            <span className="text-sm">{e}</span>
            <FakeText w="w-8" h="h-1" color="bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-4 border-t border-gray-800 bg-gray-900" />
    </div>
  );
}

// ── Courses First ─────────────────────────────────────────────────────────────

export function CoursesFirstThumbnail() {
  const { t } = useTranslation();
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <NavBar logoColor="bg-amber-500" ctaBg="bg-amber-500" />
      <div className="border-b border-amber-100 bg-amber-50 px-3 py-3">
        <FakeText w="w-32 mx-auto" h="h-2" color="bg-gray-700" />
        <div className="mt-2 flex justify-center gap-1.5">
          {[
            'bg-amber-500 text-white',
            'bg-white border border-gray-200',
            'bg-white border border-gray-200',
            'bg-white border border-gray-200'
          ].map((cls, i) => (
            <div
              key={i}
              className={`flex h-4 w-12 items-center justify-center rounded-full text-[6px] ${cls}`}
            >
              {t('sitePreview.thumbnailFilter')}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {[
          ['from-amber-100', 'to-orange-100'],
          ['from-yellow-100', 'to-amber-100'],
          ['from-orange-100', 'to-red-50'],
          ['from-amber-50', 'to-yellow-100']
        ].map(([f, t], i) => (
          <CourseCard key={i} from={f} to={t} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1 px-2 pb-1">
        {[
          ['from-amber-100', 'to-orange-100'],
          ['from-yellow-100', 'to-amber-100'],
          ['from-orange-100', 'to-red-50'],
          ['from-amber-50', 'to-yellow-100']
        ].map(([f, t], i) => (
          <CourseCard key={i} from={f} to={t} />
        ))}
      </div>
      <div className="h-4 border-t border-gray-800 bg-gray-900" />
    </div>
  );
}

// ── Compact ───────────────────────────────────────────────────────────────────

export function CompactThumbnail() {
  const { t } = useTranslation();
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <NavBar logoColor="bg-gray-700" ctaBg="bg-gray-700" />
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
        <div className="space-y-0.5">
          <FakeText w="w-24" h="h-2" color="bg-gray-800" />
          <FakeText w="w-16" h="h-1" color="bg-gray-400" />
        </div>
        <div className="flex-1" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
          <IllustChart />
        </div>
        <div className="flex h-5 w-14 items-center justify-center rounded bg-gray-800 text-[6px] text-white">
          {t('sitePreview.thumbnailExplore')}
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="mb-2 flex items-center gap-1.5">
          <FakeText w="w-20" h="h-1.5" color="bg-gray-700" />
          <div className="flex-1" />
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex h-4 w-10 items-center justify-center rounded-full text-[6px] ${i === 0 ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
              >
                {t('sitePreview.thumbnailAll')}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            ['from-gray-100', 'to-slate-100'],
            ['from-slate-100', 'to-gray-100'],
            ['from-gray-200', 'to-gray-100'],
            ['from-slate-200', 'to-gray-50'],
            ['from-gray-100', 'to-slate-200'],
            ['from-slate-100', 'to-gray-100']
          ].map(([f, t], i) => (
            <CourseCard key={i} from={f} to={t} />
          ))}
        </div>
      </div>
      <div className="h-4 border-t border-gray-200 bg-gray-100" />
    </div>
  );
}

// ── Featured (Spotlight) ──────────────────────────────────────────────────────

export function FeaturedThumbnail() {
  const { t } = useTranslation();
  return (
    <div dir="rtl" className="overflow-hidden rounded-lg bg-white">
      <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-md bg-amber-500" />
          <FakeText w="w-10" h="h-1.5" color="bg-amber-700" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <FakeText key={i} w="w-5" h="h-1" color="bg-amber-300" />
          ))}
        </div>
        <div className="flex h-4 w-12 items-center justify-center rounded bg-amber-500 text-[6px] font-medium text-white">
          {t('sitePreview.thumbnailCta')}
        </div>
      </div>
      {/* Hero – spotlight illustration + text */}
      <div className="flex items-center gap-2 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-3 pb-3 pt-4">
        <div className="flex-1 space-y-1">
          <FakeText w="w-full" h="h-2" color="bg-gray-800" />
          <FakeText w="w-4/5" h="h-2" color="bg-gray-700" />
          <FakeText w="w-full" h="h-1.5" color="bg-gray-300" />
          <div className="flex gap-1.5 pt-1.5">
            <div className="h-4 w-14 rounded bg-amber-500" />
            <div className="h-4 w-14 rounded border border-amber-300" />
          </div>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200">
          <IllustStar />
        </div>
      </div>
      {/* Featured courses */}
      <div className="border-t border-amber-100 px-3 py-2">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-[7px] font-bold text-amber-600">★</span>
          <FakeText w="w-20" h="h-1.5" color="bg-gray-700" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            ['from-amber-200', 'to-orange-100'],
            ['from-orange-200', 'to-red-100'],
            ['from-yellow-200', 'to-amber-100']
          ].map(([f, t], i) => (
            <CourseCard key={i} from={f} to={t} />
          ))}
        </div>
      </div>
      {/* Testimonials carousel bar */}
      <div className="flex gap-1.5 border-t border-amber-50 bg-amber-50 px-3 py-1.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`flex h-8 flex-1 flex-col justify-end space-y-0.5 rounded-lg p-1.5 ${i === 0 ? 'bg-amber-100 ring-1 ring-amber-200' : 'bg-white'}`}
          >
            <FakeText w="w-full" h="h-1" color="bg-amber-300" />
            <FakeText w="w-2/3" h="h-0.5" color="bg-amber-200" />
          </div>
        ))}
      </div>
      <div className="h-4 border-t border-gray-800 bg-gray-900" />
    </div>
  );
}
