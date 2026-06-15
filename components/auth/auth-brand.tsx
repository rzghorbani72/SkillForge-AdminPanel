import { cn } from '@/lib/utils';

interface AuthBrandProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  large?: boolean;
}

export function AuthBrand({ icon, title, subtitle, large }: AuthBrandProps) {
  return (
    <div className="mb-8 text-center">
      <div className="brand-tile mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
        {icon}
      </div>
      <h1
        className={cn(
          'font-bold',
          large ? 'text-2xl tracking-tight' : 'text-xl'
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
