'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase.client'; // adjust import if yours differs

export default function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      const onAuthPages = pathname === '/sign-in' || pathname === '/sign-up';

      if (event === 'SIGNED_IN' && onAuthPages) {
        router.replace('/dashboard');
        return;
      }

      if (event === 'SIGNED_OUT') {
        router.replace('/sign-in');
        return;
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}
