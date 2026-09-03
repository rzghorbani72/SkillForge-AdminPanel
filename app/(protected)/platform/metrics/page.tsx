import type { Metadata } from 'next';
import { MetricsPageClient } from './_components/metrics-page-client';

export const metadata: Metadata = {
  title: 'Investor report'
};

/**
 * Platform metrics report.
 *
 * Access is enforced server-side by the backend (PLATFORM_OWNER, ADMIN and
 * FINANCE only); the nav entry merely hides the link.
 */
export default function PlatformMetricsPage() {
  return <MetricsPageClient />;
}
