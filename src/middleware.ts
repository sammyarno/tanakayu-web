import { type NextRequest, NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

// Routes that require auth verification
const PROTECTED_PREFIXES = ['/member', '/verify-member', '/members', '/waitlist', '/transaction-report'];
// Routes that should redirect authenticated users away
const AUTH_ONLY_PATHS = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check entirely for routes that don't need it
  const isProtectedRoute = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isAuthOnlyPath = AUTH_ONLY_PATHS.includes(pathname);

  if (!isProtectedRoute && !isAuthOnlyPath) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (still handled here via getSession) and read the claims.
  //
  // getClaims() verifies the JWT signature locally with WebCrypto when the
  // project uses asymmetric signing keys, avoiding a network round trip to the
  // Auth server on every single navigation. On projects still using the legacy
  // HS256 symmetric secret it transparently falls back to getUser(), so this is
  // safe either way - it just gets faster once the project migrates its keys.
  //
  // Local verification is authentic (real signature check) but not
  // revocation-aware until the token expires. That's fine here: middleware is
  // only a routing gate. Actual data access stays gated by verifyAuth(), which
  // uses getUser(), plus RLS.
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims ?? null;

  // Redirect unauthenticated users to login (only for protected routes)
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
