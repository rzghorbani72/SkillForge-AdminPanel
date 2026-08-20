'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  CONTENT_KIND_VALUES,
  MODERATION_POLICY,
  type ContentKind,
  type ModerationPolicy,
  type ModerationPolicyMap
} from '@/types/compliance';

/** Sentinel for "no override" — Radix Select cannot hold an empty string value. */
const INHERIT = 'INHERIT';

type Props = {
  defaults: ModerationPolicyMap | null;
  overrides: Partial<ModerationPolicyMap>;
  saving: ContentKind | null;
  onChange: (kind: ContentKind, policy: ModerationPolicy | null) => void;
};

/**
 * Per-academy override of the platform default. Three states per kind, because
 * "inherit" has to stay distinguishable from "explicitly set to the same value
 * the default happens to be" — otherwise changing the global default silently
 * stops affecting academies that were only ever meant to follow it.
 */
export function AcademyPolicyOverrides({
  defaults,
  overrides,
  saving,
  onChange
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {CONTENT_KIND_VALUES.map((kind) => {
        const override = overrides[kind];
        const inherited = defaults?.[kind];
        return (
          <div key={kind} className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor={`override-${kind}`}>
                {t(`compliance.moderation.kind.${kind}`)}
              </Label>
              {!override && inherited ? (
                <p className="text-xs text-muted-foreground">
                  {t('compliance.override.inheriting', {
                    policy: t(`compliance.override.${inherited}`)
                  })}
                </p>
              ) : null}
            </div>
            <Select
              value={override ?? INHERIT}
              disabled={saving === kind}
              onValueChange={(value) =>
                onChange(
                  kind,
                  value === INHERIT ? null : (value as ModerationPolicy)
                )
              }
            >
              <SelectTrigger id={`override-${kind}`} className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={INHERIT}>
                  {t('compliance.override.useDefault')}
                </SelectItem>
                <SelectItem value={MODERATION_POLICY.PUBLISH_IMMEDIATELY}>
                  {t(
                    `compliance.override.${MODERATION_POLICY.PUBLISH_IMMEDIATELY}`
                  )}
                </SelectItem>
                <SelectItem value={MODERATION_POLICY.HOLD_FOR_REVIEW}>
                  {t(
                    `compliance.override.${MODERATION_POLICY.HOLD_FOR_REVIEW}`
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
