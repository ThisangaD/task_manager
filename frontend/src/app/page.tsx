'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/** Root page: redirects authenticated users to dashboard, others to login. */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/auth');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
      <Loader2 className="w-8 h-8 text-brand-violet animate-spin" />
    </div>
  );
}
