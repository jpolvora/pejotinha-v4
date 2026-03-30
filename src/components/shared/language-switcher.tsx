"use client"

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, routing } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onLocaleChange = (newLocale: any) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
        disabled={isPending}
      >
        <Languages className={isPending ? "h-4 w-4 animate-spin text-white/70" : "h-4 w-4 text-white/70"} />
        <span className="sr-only">{t('language')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl border-white/10 bg-black/80 backdrop-blur-xl">
        {routing.locales.map((cur) => (
          <DropdownMenuItem
            key={cur}
            onClick={() => onLocaleChange(cur)}
            className={`cursor-pointer transition-colors hover:bg-white/10 ${locale === cur ? "bg-white/10 text-primary font-medium" : "text-white/70"}`}
          >
            <span className="mr-2 text-lg">
              {cur === 'pt-BR' && "🇧🇷"}
              {cur === 'en-US' && "🇺🇸"}
              {cur === 'es-LA' && "🇲🇽"}
            </span>
            <span>
              {cur === 'pt-BR' && "Português"}
              {cur === 'en-US' && "English"}
              {cur === 'es-LA' && "Español"}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
