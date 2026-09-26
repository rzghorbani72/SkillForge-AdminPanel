'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const SELECTOR_NAME_MAX_CHARS = 16;

function truncateName(name: string): string {
  return name.length > SELECTOR_NAME_MAX_CHARS
    ? `${name.slice(0, SELECTOR_NAME_MAX_CHARS)}…`
    : name;
}

export function TruncatedAcademyName({ name }: { name: string }) {
  const display = truncateName(name);
  const isTruncated = name.length > SELECTOR_NAME_MAX_CHARS;

  if (!isTruncated) {
    return <p className="text-sm font-semibold leading-tight">{display}</p>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="cursor-default text-sm font-semibold leading-tight">{display}</p>
      </TooltipTrigger>
      <TooltipContent side="bottom">{name}</TooltipContent>
    </Tooltip>
  );
}
