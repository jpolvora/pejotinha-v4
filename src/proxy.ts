import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';

const i18nMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. First run i18n middleware
  const response = i18nMiddleware(request);

  // 2. Supabase Auth Integration (from what was proxy.ts)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Note: In middleware, we update both request cookies and response cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshing auth session
  const { data: { user } } = await supabase.auth.getUser();

  // Protection logic (considering locale prefix)
  const pathname = request.nextUrl.pathname;
  
  // Regex to detect if path starts with locale or is exactly the locale
  // Matches: /pt-BR, /pt-BR/, /pt-BR/dashboard, etc.
  const localePattern = /^\/(pt-BR|en-US|es-LA)(\/|$)/;
  const pathWithoutLocale = pathname.replace(localePattern, '/');

  const isAuthPage = pathWithoutLocale.startsWith('/login') || pathWithoutLocale.startsWith('/auth');
  const isDashboardPage = 
    pathWithoutLocale.startsWith('/dashboard') || 
    pathWithoutLocale.startsWith('/projects') || 
    pathWithoutLocale.startsWith('/clients') ||
    pathWithoutLocale.startsWith('/expenses') ||
    pathWithoutLocale.startsWith('/settings') ||
    pathWithoutLocale === '/'; // root is dashboard-like or protected

  if (!user && isDashboardPage) {
    const loginUrl = new URL('/login', request.url);
    // next-intl will automatically handle the locale of the redirect target 
    // if we redirect within the same origin.
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPage && pathWithoutLocale !== '/auth/callback') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  // Matcher ignoring static files and API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
