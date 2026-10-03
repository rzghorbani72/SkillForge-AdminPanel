/**
 * Every cached entry is tenant-scoped. Keys are built here and nowhere else so
 * that no query can be stored — or invalidated — without an academy prefix.
 *
 * A `null` academy id means "no academy selected yet"; queries built on such a
 * key must stay disabled (see `useApiQuery`), never fall back to a shared key.
 */
export type AcademyId = string | null;

type KeyPart = string | number | boolean | null | undefined;

const scope = (academyId: AcademyId, ...parts: KeyPart[]) =>
  ['academy', academyId, ...parts] as const;

export const queryKeys = {
  /** Prefix for wiping or invalidating everything belonging to one academy. */
  academy: (academyId: AcademyId) => scope(academyId),

  courseOffers: (academyId: AcademyId, courseId: string | undefined) =>
    scope(academyId, 'course-offers', courseId),

  academyOffers: (academyId: AcademyId) => scope(academyId, 'academy-offers'),

  categories: (academyId: AcademyId) => scope(academyId, 'categories'),

  classPlanSeats: (academyId: AcademyId) => scope(academyId, 'class-plan-seats'),

  assignableRoles: (academyId: AcademyId) => scope(academyId, 'assignable-roles'),

  accessControl: (academyId: AcademyId) => scope(academyId, 'access-control'),

  resourceAccess: (academyId: AcademyId, resource: string) =>
    scope(academyId, 'resource-access', resource),

  subscription: (academyId: AcademyId) => scope(academyId, 'subscription'),

  storageUsage: (academyId: AcademyId) => scope(academyId, 'storage-usage'),

  storageFiles: (academyId: AcademyId, kind: string, page: number) =>
    scope(academyId, 'storage-files', kind, String(page)),

  /** `slugs` is the sorted, comma-joined batch these quotes were priced for. */
  upgradeQuotes: (academyId: AcademyId, slugs: string) => scope(academyId, 'upgrade-quotes', slugs),

  learningNavCapabilities: (academyId: AcademyId) => scope(academyId, 'learning-nav-capabilities'),

  entitySearch: (academyId: AcademyId, entity: string, query: string) =>
    scope(academyId, 'entity-search', entity, query),

  slugAvailability: (academyId: AcademyId, slug: string) =>
    scope(academyId, 'slug-availability', slug),

  academyHealthSignals: (academyId: AcademyId) => scope(academyId, 'academy-health-signals'),

  academyHealthSeries: (academyId: AcademyId, days: number) =>
    scope(academyId, 'academy-health-series', days),
} as const;
