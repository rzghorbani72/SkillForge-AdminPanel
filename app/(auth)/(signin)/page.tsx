'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Perform the redirect on the client side
    setIsRedirecting(true);
    // router.push('/dashboard');
  }, [router]);

  // Render a loading state or nothing while redirecting
  if (isRedirecting) {
    return <div>Loading...</div>; // Optional loading state
  }

  return null; // Since we're redirecting, there's no need to render anything
}
