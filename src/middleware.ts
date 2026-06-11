import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require an authenticated session.
const PROTECTED_PREFIXES = ['/generate', '/voice', '/player'];

// Amplify v6 (with cookieStorage) writes a cookie named
// `CognitoIdentityServiceProvider.<clientId>.LastAuthUser` once signed in.
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? '';
const LAST_AUTH_USER_COOKIE = `CognitoIdentityServiceProvider.${CLIENT_ID}.LastAuthUser`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has(LAST_AUTH_USER_COOKIE);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/generate/:path*', '/voice/:path*', '/player/:path*'],
};
