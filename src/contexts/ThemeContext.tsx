import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Public sayfalar - her zaman light mode olmalı
 * Dark mode sadece dashboard sayfalarında aktif olacak
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/user-register',
  '/packages',
  '/purchase',
  '/bayilik-basvurusu',
  '/payment/success',
  '/payment/fail',
  '/about',
  '/distance-sales-contract',
  '/privacy-policy',
  '/kvkk',
  '/delivery-return',
]

/**
 * Mevcut route'un public olup olmadığını kontrol et
 */
function isPublicRoute(pathname: string): boolean {
  // Dashboard route'ları public değil
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/user/dashboard')) {
    return false
  }
  
  // Public route'ları kontrol et
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })
}

const THEME_STORAGE_KEY = 'theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // İlk açılışta temayı localStorage'dan oku (yoksa 'system')
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
    return 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

  // Tema değişince hem state hem localStorage güncellenir (böylece sonraki açılışta aynı tema yüklenir)
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (e) {
      // localStorage dolu veya private modda hata verebilir
    }
  }

  // Route değişikliklerini dinle
  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement
      const pathname = window.location.pathname
      const isPublic = isPublicRoute(pathname)

      root.classList.remove('light', 'dark')

      // Public sayfalarda her zaman light mode
      if (isPublic) {
        root.classList.add('light')
        setResolvedTheme('light')
        return
      }

      // Dashboard sayfalarında tema ayarını uygula
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
        setResolvedTheme(systemTheme)
      } else {
        root.classList.add(theme)
        setResolvedTheme(theme)
      }
    }

    // İlk yükleme
    updateTheme()

    // Route değişikliklerini dinle (popstate ve pushstate)
    const handleRouteChange = () => {
      updateTheme()
    }

    window.addEventListener('popstate', handleRouteChange)
    
    // pushState ve replaceState'i override et
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      setTimeout(handleRouteChange, 0)
    }
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      setTimeout(handleRouteChange, 0)
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [theme])

  // Listen for system theme changes (sadece dashboard sayfalarında)
  useEffect(() => {
    const pathname = window.location.pathname
    const isPublic = isPublicRoute(pathname)
    if (isPublic || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(e.matches ? 'dark' : 'light')
      setResolvedTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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

