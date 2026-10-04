'use client';

import { useNumberFormat } from '@/lib/i18n/use-number-format';

export function StepNumber({ value }: { value: number }) {
  const formatNumber = useNumberFormat();
  return (
    <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] bg-background text-xs font-extrabold">
      {formatNumber(value)}
    </span>
  );
}

/** A short numbered "how it works" strip of boxes. */
export function FlowSteps({ steps }: { steps: readonly { title: string; hint?: string }[] }) {
  return (
    <ol className="flex flex-wrap items-stretch gap-2">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-[1_1_150px] flex-col gap-1.5 rounded-[10px] border bg-card p-3 text-[13px]"
        >
          <StepNumber value={index + 1} />
          <b>{step.title}</b>
          {step.hint ? <span className="text-muted-foreground">{step.hint}</span> : null}
        </li>
      ))}
    </ol>
  );
}
