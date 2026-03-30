"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, User } from "lucide-react"
import { signOut } from "@/actions/auth"
import { Link } from "@/i18n/routing"
import { useTransition } from "react"
import { useTranslations } from "next-intl"

export function UserDropdown() {
  const t = useTranslations('UserDropdown')
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-8 w-8 rounded-full flex items-center justify-center transition-transform hover:scale-105">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-xl border-white/10 bg-black/80 backdrop-blur-xl" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">{t('myAccount')}</p>
              <p className="text-xs leading-none text-white/50">
                {t('configureProfile')}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="p-0">
            <Link href="/profile" className="flex w-full items-center gap-2 px-3 py-2 cursor-pointer text-white/70 hover:text-white transition-colors hover:bg-white/5">
              <User className="h-4 w-4" />
              <span>{t('myProfile')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0">
            <Link href="/settings" className="flex w-full items-center gap-2 px-3 py-2 cursor-pointer text-white/70 hover:text-white transition-colors hover:bg-white/5">
              <Settings className="h-4 w-4" />
              <span>{t('settings')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem 
            onClick={handleSignOut}
            disabled={isPending}
            className="text-destructive/80 focus:text-destructive flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>{isPending ? t('signingOut') : t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
