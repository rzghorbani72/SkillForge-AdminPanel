'use client';

import { apiClient, type AcademyUpgradeQuote } from '@/lib/api';
import { useApiQuery } from '@/hooks/use-api-query';
import { queryKeys } from '@/lib/query/keys';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';

export type UpgradeQuoteMap = Readonly<Record<string, AcademyUpgradeQuote>>;

/**
 * Prices "what the switch costs from the plan I already pay for" for several
 * target plans at once, so a card can show the prorated difference instead of
 * the full price of the target plan.
 *
 * A plan that cannot be quoted right now (same tier, downgrade, no paid
 * period) is simply left out of the map rather than failing the whole batch.
 */
export function useUpgradeQuotes(slugs: readonly string[], enabled = true) {
  const academyId = useCurrentAcademyId();
  const batchKey = [...slugs].sort().join(',');

  const { data, isLoading } = useApiQuery<UpgradeQuoteMap>({
    queryKey: queryKeys.upgradeQuotes(academyId, batchKey),
    queryFn: async () => {
      const entries = await Promise.all(
        slugs.map(async (slug) => {
          try {
            return [
              slug,
              await apiClient.getAcademyUpgradeQuote(slug)
            ] as const;
          } catch {
            return [slug, null] as const;
          }
        })
      );
      return Object.fromEntries(
        entries.filter(
          (entry): entry is readonly [string, AcademyUpgradeQuote] =>
            entry[1] !== null
        )
      );
    },
    enabled: enabled && slugs.length > 0,
    // The diff shrinks as the paid period runs down, so it is fresh for a
    // minute, not for the session.
    staleTime: 60_000
  });

  return { quotes: data ?? {}, isLoading };
}
