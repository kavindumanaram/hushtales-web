'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Native auth no longer uses a redirect callback. Kept so any stale
// /auth/callback link simply forwards home.
export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/home3');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
    </div>
  );
}
