"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  FileText,
  PieChart,
  Settings,
  Menu,
  Command,
  Receipt
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  hasClientProjects?: boolean;
  userRole?: string;
}

export function Sidebar({ className, hasClientProjects, userRole }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: pathname === "/dashboard" },
    { label: "Timeline", icon: FileText, href: "/timeline", active: pathname.includes("/timeline") },
    { label: "Taskboard", icon: FolderKanban, href: "/taskboard", active: pathname.includes("/taskboard") },
    { label: "Clientes", icon: Users, href: "/clients", active: pathname.includes("/clients"), hide: userRole === 'client' },
    { label: "Projetos", icon: FolderKanban, href: "/projects", active: pathname.includes("/projects") },
    { label: "Área do Cliente", icon: Users, href: "/client", active: pathname === "/client" },
    { label: "Calendário", icon: Calendar, href: "/calendar", active: pathname.includes("/calendar"), hide: userRole === 'client' },
    { label: "Cobrança", icon: Receipt, href: "/billing", active: pathname.includes("/billing"), hide: userRole === 'client' },
    { label: "Financeiro", icon: Receipt, href: "/expenses", active: pathname.includes("/expenses"), hide: userRole === 'client' },
    { label: "Relatórios", icon: PieChart, href: "/reports", active: pathname.includes("/reports") },
    { label: "Configurações", icon: Settings, href: "/settings", active: pathname === "/settings" },
  ].filter(r => !(r as any).hide)

  const teams: { name: string; initial: string; href: string }[] = []

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
          <Command className="h-6 w-6 text-primary" />
          <span>Pejotinha</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-8">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.label}
                href={route.href}
                className={cn(
                  "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  route.active 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <route.icon 
                  className={cn(
                    "h-5 w-5 shrink-0", 
                    route.active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {route.label}
              </Link>
            ))}
          </div>

          {teams.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Your teams
              </div>
              {teams.map((team) => (
                <Link
                  key={team.name}
                  href={team.href}
                  className="group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[0.625rem] font-medium text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                    {team.initial}
                  </span>
                  <span className="truncate">{team.name}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>

      <div className="mt-auto px-4 py-4 border-t border-border/40">
        <div className="flex items-center gap-x-4 px-2 py-2 rounded-md">
          <Avatar className="h-8 w-8 rounded-full bg-muted border border-border">
            <AvatarFallback className="text-xs bg-primary/20 text-primary">PJ</AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground">Pejotinha</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden fixed top-3 left-4 z-50")}>
          <Menu className="h-6 w-6 text-foreground" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r-border/40 bg-background">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r border-border/40 bg-background print:hidden", className)}>
        <SidebarContent />
      </aside>
    </>
  )
}
