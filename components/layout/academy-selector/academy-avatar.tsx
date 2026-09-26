import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colorIndexForId } from '@/lib/id-color';

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

function academyColor(id: string) {
  return AVATAR_COLORS[colorIndexForId(id, AVATAR_COLORS.length)];
}

export function AcademyAvatar({
  name,
  id,
  logo,
}: {
  name: string;
  id: string;
  logo?: { id: string; publicUrl: string } | null;
}) {
  const logoUrl = logo?.publicUrl
    ? logo.publicUrl.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${logo.publicUrl}`
      : logo.publicUrl
    : null;
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />;
  }
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        academyColor(id),
      )}
    >
      <GraduationCap className="h-4 w-4 text-white" />
    </div>
  );
}
