import { createContext } from 'preact'
import { useContext, useEffect } from 'preact/hooks'
import { useLocalStorage } from './useLocalStorage'
import { Theme } from '../types'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme
}

export function ThemeProvider({ children }: { children: preact.ComponentChildren }) {
  const [theme, setTheme] = useLocalStorage<Theme>('jotty-theme', 'system')

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(theme)
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    document.documentElement.className = effectiveTheme

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const newEffectiveTheme = getEffectiveTheme(theme)
        document.documentElement.setAttribute('data-theme', newEffectiveTheme)
        document.documentElement.className = newEffectiveTheme
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark'
      if (prevTheme === 'dark') return 'system'
      return 'light'
    })
  }

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}