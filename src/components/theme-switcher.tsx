"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useThemeColor } from "@/components/theme-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Palette, Check } from "lucide-react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { themeColor, setThemeColor } = useThemeColor()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "group rounded-md border border-transparent hover:border-border transition-all focus-visible:outline-none focus:outline-none")}>
        <Palette className="h-[1.2rem] w-[1.2rem] scale-100 transition-transform group-hover:scale-110" />
        <span className="sr-only">Toggle theme and color</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-md border-border">
        <div className="px-2 py-1.5 text-xs uppercase text-muted-foreground tracking-wider font-semibold">
          Light / Dark
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setTheme("light")} className="justify-between cursor-pointer rounded-sm">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" /> Light
            </div>
            {theme === "light" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="justify-between cursor-pointer rounded-sm">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" /> Dark
            </div>
            {theme === "dark" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <div className="px-2 py-1.5 text-xs uppercase text-muted-foreground tracking-wider font-semibold">
          Theme Color
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setThemeColor("theme-blue")} className="justify-between cursor-pointer rounded-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              Crisp Blue
            </div>
            {themeColor === "theme-blue" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeColor("theme-orange")} className="justify-between cursor-pointer rounded-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              Sharp Orange
            </div>
            {themeColor === "theme-orange" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeColor("theme-purple")} className="justify-between cursor-pointer rounded-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              Deep Purple
            </div>
            {themeColor === "theme-purple" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
