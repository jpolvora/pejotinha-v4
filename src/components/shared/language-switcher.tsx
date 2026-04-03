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
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-muted/20 backdrop-blur-md hover:bg-accent transition-all duration-300 disabled:opacity-50"
        disabled={isPending}
      >
        <Languages className={isPending ? "h-4 w-4 animate-spin text-foreground/70" : "h-4 w-4 text-foreground/70"} />
        <span className="sr-only">{t('language')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl border-border bg-popover/95 backdrop-blur-xl shadow-2xl">
        {routing.locales.map((cur) => (
          <DropdownMenuItem
            key={cur}
            onClick={() => onLocaleChange(cur)}
            className={`cursor-pointer transition-colors hover:bg-accent ${locale === cur ? "bg-accent text-primary font-medium" : "text-foreground/70"}`}
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
