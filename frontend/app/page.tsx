'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-400 rounded-full mb-4"></div>
        <div className="text-slate-500">Yükleniyor...</div>
      </div>
    </div>
  );
}
