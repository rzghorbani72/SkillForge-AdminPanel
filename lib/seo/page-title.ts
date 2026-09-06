import { navItems } from '@/constants/data';
import type { NavItem } from '@/types';

/** Routes with no sidebar entry (auth, legal, detail screens). */
const EXTRA_TITLE_KEYS: Record<string, string> = {
  '/': 'pageTitles.home',
  '/login': 'pageTitles.login',
  '/register': 'pageTitles.register',
  '/admin-login': 'pageTitles.adminLogin',
  '/admin-forget-password': 'pageTitles.forgotPassword',
  '/forget-password': 'pageTitles.forgotPassword',
  '/select-school': 'pageTitles.selectSchool',
  '/unauthorized': 'pageTitles.unauthorized',
  '/payment/callback': 'pageTitles.paymentCallback',
  '/terms': 'pageTitles.terms',
  '/staff-terms': 'pageTitles.staffTerms',
  '/privacy': 'pageTitles.privacy',
  '/acceptable-use': 'pageTitles.acceptableUse',
  '/database': 'pageTitles.database',
  '/billing': 'navigation.platformPlan',
  '/videos': 'navigation.videos',
  '/images': 'navigation.images',
  '/audios': 'navigation.audios',
  '/documents': 'navigation.documents',
  '/categories': 'navigation.categories',
  '/bundles': 'navigation.bundles',
  '/refunds': 'navigation.refunds',
  '/products': 'navigation.products',
  '/products/create': 'pageTitles.productCreate',
  '/payments': 'navigation.transactions',
  '/payments/invoices': 'navigation.invoices',
  '/payments/methods': 'navigation.payment-methods',
  '/analytics/revenue': 'navigation.revenue-analytics',
  '/analytics/courses': 'navigation.course-performance',
  '/analytics/engagement': 'navigation.student-engagement',
  '/financial/academy': 'navigation.store-financial',
  '/financial/academy/costs': 'navigation.store-costs',
  '/financial/academy/payments': 'navigation.store-payments',
  '/financial/academy/reports': 'navigation.store-reports',
  '/financial/academy/revenue': 'navigation.store-revenue',
  '/financial/platform': 'navigation.platform-financial',
  '/settings/profile': 'navigation.profile-settings',
  '/settings/academy': 'navigation.academyProfile',
  '/settings/security': 'navigation.security-settings',
  '/settings/pricing': 'navigation.academy-pricing',
  '/settings/ui-template': 'navigation.ui-template-settings',
  '/settings/domain': 'pageTitles.domain',
  '/settings/compliance': 'pageTitles.compliance',
  '/settings/payment-gateway': 'pageTitles.paymentGateway',
  '/settings/site-pages': 'pageTitles.sitePages',
  '/users/admins': 'navigation.admins',
  '/users/lesson-access': 'pageTitles.lessonAccess',
  '/users/manual-enroll': 'pageTitles.manualEnroll',
  '/user': 'pageTitles.userDetail',
  '/courses/create': 'pageTitles.courseCreate',
  '/website/pages': 'pageTitles.websitePages',
  '/website/seo': 'pageTitles.websiteSeo',
  '/website/domain': 'pageTitles.websiteDomain',
  '/website/trust': 'pageTitles.websiteTrust',
  '/platform/academies': 'navigation.allAcademies'
};

/** Sub-routes under a dynamic id: /courses/<id>/edit, /user/<id>/learning … */
const DYNAMIC_SEGMENT_KEYS: Record<string, string> = {
  edit: 'pageTitles.edit',
  seasons: 'pageTitles.seasons',
  lessons: 'pageTitles.lessons',
  live: 'pageTitles.courseLive',
  financial: 'courseDetail.tabFinancial',
  certificates: 'certificates.tab',
  plans: 'navigation.studentPlans',
  learning: 'pageTitles.userLearning',
  create: 'pageTitles.create',
  webhooks: 'pageTitles.webhooks'
};

function navTitleKeys(
  items: NavItem[] = navItems,
  keys: Record<string, string> = {}
): Record<string, string> {
  for (const item of items) {
    const path = item.href?.split('?')[0];
    if (path && item.label) keys[path] = `navigation.${item.label}`;
    if (item.children) navTitleKeys(item.children, keys);
  }
  return keys;
}

const TITLE_KEYS: Record<string, string> = {
  ...navTitleKeys(),
  ...EXTRA_TITLE_KEYS
};

/**
 * Longest-prefix match, so a detail page falls back to its section title.
 * A known trailing segment (edit, lessons…) wins over the section itself.
 */
export function resolvePageTitleKey(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  if (TITLE_KEYS[path]) return TITLE_KEYS[path];

  const lastSegment = segments[segments.length - 1];
  if (lastSegment && DYNAMIC_SEGMENT_KEYS[lastSegment] && segments.length > 1) {
    return DYNAMIC_SEGMENT_KEYS[lastSegment];
  }

  for (let end = segments.length - 1; end > 0; end--) {
    const candidate = `/${segments.slice(0, end).join('/')}`;
    if (TITLE_KEYS[candidate]) return TITLE_KEYS[candidate];
  }

  return null;
}
