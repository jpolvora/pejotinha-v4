import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['pt-BR', 'en-US', 'es-LA'],
  
  // Used when no locale matches
  defaultLocale: 'pt-BR',
  
  // The locale prefix strategy. 'as-needed' means the default locale 
  // doesn't have a prefix (e.g. /dashboard) but others do (e.g. /en-US/dashboard).
  localePrefix: 'as-needed'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
