"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import * as React from "react"

import type { ThemeProviderProps } from "next-themes"

type ThemeColor = "theme-blue" | "theme-orange" | "theme-purple"

interface ThemeColorContextType {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

export const ThemeColorContext = React.createContext<ThemeColorContextType | undefined>(undefined)

export function useThemeColor() {
  const context = React.useContext(ThemeColorContext)
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider")
  }
  return context
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  const [themeColor, setThemeColor] = React.useState<ThemeColor>("theme-blue")

  React.useEffect(() => {
    setMounted(true)
    const savedColor = localStorage.getItem("themeColor") as ThemeColor
    if (savedColor) {
      setThemeColor(savedColor)
      document.documentElement.classList.add(savedColor)
    } else {
      document.documentElement.classList.add("theme-blue")
    }
  }, [])

  const handleSetThemeColor = (color: ThemeColor) => {
    const root = document.documentElement
    root.classList.remove("theme-orange", "theme-blue", "theme-purple")
    root.classList.add(color)
    localStorage.setItem("themeColor", color)
    setThemeColor(color)
  }

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor: handleSetThemeColor }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemeColorContext.Provider>
  )
}
