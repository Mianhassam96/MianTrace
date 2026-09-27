import { useEffect, useState } from 'react'

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem('miantrace-theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    // Default: light mode on first visit
    return false
  } catch {
    return false
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(getInitialDark)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('miantrace-theme', isDark ? 'dark' : 'light')
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [isDark])

  const toggle = () => setIsDark(prev => !prev)
  return { isDark, toggle }
}
