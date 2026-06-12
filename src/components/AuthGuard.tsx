'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RouteLoading from '@/components/ui/RouteLoading';

// Routes anyone can see without signing in. The landing/home experience and the
// auth screens are public; everything else requires authentication. Navigating
// to a protected route while signed out bounces to the login page.
const PUBLIC_PATHS = new Set(['/', '/home3']);

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith('/auth');
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const allowed = isPublic(pathname);

  useEffect(() => {
    if (!allowed && !loading && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [allowed, loading, user, pathname, router]);

  // On a protected route, don't flash its content while we resolve auth or
  // redirect to the login page.
  if (!allowed && (loading || !user)) {
    return <RouteLoading />;
  }

  return <>{children}</>;
}
