import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Pejotinha v4 - Proof of Work',
  description: 'AI First Next.js + Supabase project',
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  var color = localStorage.getItem('themeColor') || 'theme-blue';
                  var root = document.documentElement;
                  root.classList.remove('light', 'dark', 'theme-blue', 'theme-orange', 'theme-purple', 'theme-green', 'theme-red', 'theme-zinc');
                  
                  if (theme === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  root.classList.add(theme);
                  root.classList.add(color);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background antialiased`} suppressHydrationWarning>
        <ThemeProvider defaultTheme="dark">
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
            <Toaster richColors position="top-right" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
