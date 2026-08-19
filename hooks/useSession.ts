'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/apiClient';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  hasPin: boolean;
}

/** Fetches the current session; redirects to /login if there isn't one. */
export function useRequireSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then(({ user }) => {
        if (!cancelled) {
          setUser(user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) router.replace('/login');
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { user, loading };
}
