import { Search } from 'lucide-react';

export function AcademySearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b px-3 py-2">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
