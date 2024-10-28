import { isAuth } from '@/lib/utils';
import { SignInViewPage } from '@/sections/auth/view';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default function Page() {
  if (isAuth(cookies())) {
    redirect('/user/schools');
  }
  return <SignInViewPage />;
}
