"use client"

import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "@/i18n/routing"
import React from "react"
import { Search } from "lucide-react"
import { UserDropdown } from "./user-dropdown"
import { LanguageSwitcher } from "@/components/shared/language-switcher"
import { useTranslations } from "next-intl"

export function Topbar() {
  const t = useTranslations('Common')
  const pathname = usePathname()
  const paths = pathname.split("/").filter(Boolean)

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur px-6">
      <div className="flex items-center gap-4">
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                {t('dashboard')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {paths.length > 0 && <BreadcrumbSeparator className="text-muted-foreground/50" />}
            
            {paths.map((path, index) => {
              const href = `/${paths.slice(0, index + 1).join("/")}`
              const isLast = index === paths.length - 1
              // Basic translation mapping for breadcrumbs
              const title = t.has(path.toLowerCase()) ? t(path.toLowerCase()) : path.charAt(0).toUpperCase() + path.slice(1)

              return (
                <React.Fragment key={path}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-foreground">
                        {title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="text-muted-foreground hover:text-foreground">
                        {title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="text-muted-foreground/50" />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center text-muted-foreground w-64">
          <Search className="absolute left-2.5 h-4 w-4" />
          <input
            type="search"
            placeholder={t('search')}
            className="flex h-9 w-full rounded-md border border-border/50 bg-muted/20 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
          />
        </div>
        <LanguageSwitcher />
        <ThemeSwitcher />
        <UserDropdown />
      </div>
    </header>
  )
}
