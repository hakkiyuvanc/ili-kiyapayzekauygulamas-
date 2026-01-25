'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers';
import { PageLoadingSpinner } from '@/components/LoadingSkeleton';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log("Home: Redirecting to dashboard");
    router.push('/dashboard');
  }, [router]);

  return <PageLoadingSpinner />;
}
