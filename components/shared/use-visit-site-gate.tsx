'use client';

import { useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  TemplateChoiceDialog,
  type TemplateChoice,
} from '@/components/dashboard/onboarding/template-choice-dialog';
import { useTemplateChoiceGate } from '@/components/dashboard/onboarding/use-template-choice-gate';

const TEMPLATE_GALLERY_HREF = '/website/appearance/list';

export type VisitClick = (event: MouseEvent<HTMLAnchorElement>) => void;

/**
 * Wraps a "visit site" link: while the academy's auto-picked template has not
 * been confirmed, the click opens the keep-or-choose dialog instead of the site.
 */
export function useVisitSiteGate(academyId: string | null, enabled: boolean) {
  const router = useRouter();
  const gate = useTemplateChoiceGate(academyId, enabled);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const guard =
    (href: string): VisitClick =>
    (event) => {
      if (!gate.shouldAsk) return;
      event.preventDefault();
      setPendingHref(href);
    };

  const confirm = (choice: TemplateChoice) => {
    gate.markChoiceMade(choice);
    const href = pendingHref;
    setPendingHref(null);
    if (choice === 'choose') {
      router.push(TEMPLATE_GALLERY_HREF);
      return;
    }
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  };

  const dialog = (
    <TemplateChoiceDialog
      open={pendingHref !== null}
      presetKey={gate.presetKey}
      onConfirm={confirm}
      onClose={() => {
        gate.markChoiceMade('default');
        setPendingHref(null);
      }}
    />
  );

  return { guard, dialog };
}
