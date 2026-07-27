import { redirect } from 'next/navigation';

export default function PricingSettingsPage() {
  redirect('/plans?tab=academy');
}
