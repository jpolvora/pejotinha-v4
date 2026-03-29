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
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "group rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-all")}>
        <Palette className="h-[1.1rem] w-[1.1rem] transition-transform group-hover:rotate-12" />
        <span className="sr-only">Toggle theme and color</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-border bg-popover/95 backdrop-blur-md shadow-2xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            Appearance
          </DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-1 px-1">
            <DropdownMenuItem onClick={() => setTheme("light")} className={cn("flex flex-col items-center justify-center gap-1.5 p-2 cursor-pointer rounded-lg border border-transparent hover:bg-accent transition-all", theme === "light" && "bg-accent border-border shadow-sm")}>
              <Sun className="h-4 w-4 text-orange-500" />
              <span className="text-[10px] font-medium">Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className={cn("flex flex-col items-center justify-center gap-1.5 p-2 cursor-pointer rounded-lg border border-transparent hover:bg-accent transition-all", theme === "dark" && "bg-accent border-border shadow-sm")}>
              <Moon className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-medium">Dark</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-2 opacity-50" />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            Accent Color
          </DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-2 p-1">
            {[
              { id: "theme-blue", label: "Blue", color: "bg-blue-500" },
              { id: "theme-orange", label: "Orange", color: "bg-orange-500" },
              { id: "theme-purple", label: "Purple", color: "bg-purple-500" },
              { id: "theme-green", label: "Green", color: "bg-emerald-500" },
              { id: "theme-red", label: "Red", color: "bg-rose-500" },
              { id: "theme-zinc", label: "Zinc", color: "bg-zinc-700" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setThemeColor(c.id as any)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1 rounded-lg p-1.5 transition-all hover:bg-accent",
                  themeColor === c.id && "bg-accent ring-1 ring-border shadow-inner"
                )}
              >
                <div className={cn("h-4 w-4 rounded-full shadow-sm transition-transform group-hover:scale-110", c.color)}>
                  {themeColor === c.id && (
                    <div className="flex h-full w-full items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{c.label}</span>
              </button>
            ))}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
