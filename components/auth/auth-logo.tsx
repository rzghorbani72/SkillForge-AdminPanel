import { cn } from '@/lib/utils';

/**
 * Brand lockup used at the top of every auth card: mark + wordmark, same
 * pattern as edusphere's landing header. The mark carries its own
 * mint/blue gradients, so it sits on the bare surface with no tile.
 */
export function AuthLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.svg"
        alt=""
        width={38}
        height={38}
        aria-hidden
        className="h-[38px] w-[38px]"
      />
      <span
        aria-hidden
        className="inline-block h-7 w-[69px] bg-foreground"
        style={{
          WebkitMask: 'url(/logo-type.png) center / contain no-repeat',
          mask: 'url(/logo-type.png) center / contain no-repeat',
        }}
      />
    </div>
  );
}
