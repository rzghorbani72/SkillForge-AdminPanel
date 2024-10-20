import { isAuth } from '@/lib/utils';
import { OverViewPageView } from '@/sections/overview/view';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard : Overview'
};

export default function page() {
  if (!isAuth(cookies())) {
    redirect('/login');
  }
  return <OverViewPageView />;
}
