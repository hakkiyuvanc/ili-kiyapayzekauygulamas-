'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers';
import { PageLoadingSpinner } from '@/components/LoadingSkeleton';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log("Home: Checking auth state", { isLoading, user });

    // Safety timeout: If still loading after 2s, force auth
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Home: Loading timed out, forcing auth");
        router.push('/auth');
      }
    }, 2000);

    if (!isLoading) {
      if (user) {
        console.log("Home: Redirecting to dashboard");
        router.push('/dashboard');
      } else {
        console.log("Home: Redirecting to auth");
        router.push('/auth');
      }
    }

    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  return <PageLoadingSpinner />;
}
