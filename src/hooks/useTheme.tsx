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

export function ThemeProvider({ children }: { children: preact.ComponentChildren }) {
  const [theme, setTheme] = useLocalStorage<Theme>('jotty-theme', 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.className = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
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