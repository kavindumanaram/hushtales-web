'use client';

import { useEffect, useState } from 'react';
import { Hub } from 'aws-amplify/utils';
import type { AuthUser } from 'aws-amplify/auth';
import { getCurrentUser, signOut } from '@/lib/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    let active = true;

    getCurrentUser().then((user) => {
      if (active) setState({ user, loading: false });
    });

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          getCurrentUser().then((user) => setState({ user, loading: false }));
          break;
        case 'signedOut':
          setState({ user: null, loading: false });
          break;
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { ...state, signOut };
}
