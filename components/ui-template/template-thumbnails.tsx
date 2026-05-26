'use client';

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
}) => (
  <div
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
      Start
    </div>
  </div>
);

const CourseCard = ({ from, to }: { from: string; to: string }) => (
  <div className="overflow-hidden rounded border border-gray-100">
    <div className={`h-8 bg-gradient-to-br ${from} ${to}`} />
    <div className="space-y-0.5 bg-white p-1">
      <FakeText w="w-full" h="h-1.5" color="bg-gray-200" />
      <FakeText w="w-3/4" h="h-1" color="bg-gray-100" />
    </div>
  </div>
);

// ── Kajabi (Expert Academy) ───────────────────────────────────────────────────

export function KajabiThumbnail() {
  return (
    <div className="overflow-hidden rounded-lg bg-white text-[0]">
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
    <div className="overflow-hidden rounded-lg bg-white">
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
          {[
            ['bg-orange-400', 'Online store'],
            ['bg-pink-400', 'Website'],
            ['bg-purple-400', 'Email']
          ].map(([bg, label]) => (
            <div
              key={label}
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
  return (
    <div className="overflow-hidden rounded-lg">
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
          Sign In
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
              Start Trial →
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
  return (
    <div className="overflow-hidden rounded-lg bg-slate-900">
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
          Sign In
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
              Start Free
            </div>
            <div className="flex h-5 w-14 items-center justify-center rounded border border-slate-500 text-[6px] text-slate-300">
              Watch
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

// ── Modern ────────────────────────────────────────────────────────────────────

export function ModernThumbnail() {
  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <NavBar
        logoColor="bg-indigo-600"
        dotColor="bg-gray-600"
        ctaBg="bg-indigo-600"
      />
      <div className="space-y-1 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 pb-3 pt-4 text-center">
        <FakeText w="w-44 mx-auto" h="h-2" color="bg-gray-800" />
        <FakeText w="w-52 mx-auto" h="h-1.5" color="bg-gray-400" />
        <div className="flex justify-center gap-2 pt-2">
          <div className="h-5 w-16 rounded bg-indigo-600" />
          <div className="h-5 w-16 rounded border border-indigo-300" />
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
  return (
    <div className="overflow-hidden rounded-lg bg-white">
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
          Start
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
        <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-blue-100 text-lg">
          📚
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
  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <FakeText w="w-16" h="h-2" color="bg-gray-900" />
        <div className="flex h-4 w-10 items-center justify-center rounded border border-gray-200 text-[6px] text-gray-500">
          Menu
        </div>
      </div>
      <div className="space-y-1 px-6 pb-4 pt-8 text-center">
        <FakeText w="w-40 mx-auto" h="h-2.5" color="bg-gray-900" />
        <FakeText w="w-48 mx-auto" h="h-1.5" color="bg-gray-400" />
        <div className="flex justify-center pt-3">
          <div className="h-5 w-20 rounded bg-gray-900" />
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
    <div className="overflow-hidden rounded-lg bg-white">
      <NavBar
        bg="bg-blue-800"
        border="border-blue-900"
        logoColor="bg-white"
        dotColor="bg-blue-200"
        ctaBg="bg-white"
      />
      <div className="space-y-1.5 bg-gradient-to-br from-blue-900 to-indigo-900 px-4 pb-4 pt-5 text-center">
        <FakeText w="w-44 mx-auto" h="h-2" color="bg-white" />
        <FakeText w="w-52 mx-auto" h="h-1.5" color="bg-blue-300" />
        <div className="flex justify-center gap-2 pt-2">
          <div className="h-4 w-16 rounded bg-white" />
          <div className="h-4 w-16 rounded border border-blue-400" />
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
  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <NavBar logoColor="bg-fuchsia-600" ctaBg="bg-fuchsia-600" />
      <div className="space-y-1 bg-gradient-to-br from-fuchsia-50 to-pink-50 px-4 pb-3 pt-5 text-center">
        <FakeText w="w-40 mx-auto" h="h-2" color="bg-gray-800" />
        <FakeText w="w-48 mx-auto" h="h-1.5" color="bg-gray-400" />
        <div className="flex justify-center pt-2">
          <div className="flex h-5 w-20 items-center justify-center rounded-full bg-fuchsia-500 text-[6px] text-white">
            Browse Courses
          </div>
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
  return (
    <div className="overflow-hidden rounded-lg bg-white">
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
              Filter
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
  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <NavBar logoColor="bg-gray-700" ctaBg="bg-gray-700" />
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
        <FakeText w="w-24" h="h-2" color="bg-gray-800" />
        <div className="flex-1" />
        <div className="flex h-5 w-14 items-center justify-center rounded bg-gray-800 text-[6px] text-white">
          Explore →
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
                All
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
