import { cn } from '@/lib/utils';

/** Brand lockup used at the top of every auth card (Figma: logo 140×50). */
export function AuthLogo({ className }: { className?: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/auth-logo.svg"
      alt=""
      width={140}
      height={50}
      aria-hidden
      className={cn('h-[50px] w-[140px]', className)}
    />
  );
}
