import { AuthLogo } from '@/components/auth/auth-logo';
import { cn } from '@/lib/utils';

interface AuthBrandProps {
  title: string;
  subtitle?: React.ReactNode;
  large?: boolean;
}

export function AuthBrand({ title, subtitle, large }: AuthBrandProps) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <AuthLogo className="mb-4" />
      <h1
        className={cn(
          'font-bold text-[#181C20]',
          large ? 'text-2xl tracking-tight' : 'text-lg'
        )}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
