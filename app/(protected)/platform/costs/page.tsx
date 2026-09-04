import type { Metadata } from 'next';
import { CostsPageClient } from './costs-page-client';

export const metadata: Metadata = {
  title: 'Platform costs'
};

export default function PlatformCostsPage() {
  return <CostsPageClient />;
}
