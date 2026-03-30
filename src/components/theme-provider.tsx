"use client"

import * as React from "react"

export type Theme = "dark" | "light" | "system"
export type ThemeColor = "theme-blue" | "theme-orange" | "theme-purple" | "theme-green" | "theme-red" | "theme-zinc"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}

// Re-export for compatibility
export const useThemeColor = useTheme

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  attribute?: string
  enableSystem?: boolean
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "dark",
  enableSystem = true 
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [themeColor, setThemeColorState] = React.useState<ThemeColor>("theme-blue")

  React.useEffect(() => {
    // Initial sync from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme
    const savedColor = localStorage.getItem("themeColor") as ThemeColor
    
    if (savedTheme) setThemeState(savedTheme)
    if (savedColor) setThemeColorState(savedColor)

    // Apply classes
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    
    if (savedTheme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(savedTheme || defaultTheme)
    }

    if (savedColor) {
      const colorClasses = ["theme-blue", "theme-orange", "theme-purple", "theme-green", "theme-red", "theme-zinc"]
      colorClasses.forEach(c => root.classList.remove(c))
      root.classList.add(savedColor)
    }
  }, [defaultTheme, enableSystem])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
    
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    
    if (newTheme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  const setThemeColor = (newColor: ThemeColor) => {
    setThemeColorState(newColor)
    localStorage.setItem("themeColor", newColor)
    
    const root = window.document.documentElement
    const colorClasses = ["theme-blue", "theme-orange", "theme-purple", "theme-green", "theme-red", "theme-zinc"]
    colorClasses.forEach(c => root.classList.remove(c))
    root.classList.add(newColor)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
