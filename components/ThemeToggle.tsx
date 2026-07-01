'use client'

import { useEffect, useState } from 'react'
import { useI18n } from './i18n'
import styles from './ThemeToggle.module.css'

type Theme = 'light' | 'dark'

const LABELS: Record<string, { toDark: string; toLight: string }> = {
  nl: { toDark: 'Donkere modus', toLight: 'Lichte modus' },
  fr: { toDark: 'Mode sombre', toLight: 'Mode clair' },
  en: { toDark: 'Dark mode', toLight: 'Light mode' },
}

export function ThemeToggle({ className }: { className?: string }) {
  const { lang } = useI18n()
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const current = document.documentElement.getAttribute('data-theme')
    setTheme(current === 'dark' ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('lo-theme', next) } catch { /* ignore */ }
  }

  const labels = LABELS[lang] ?? LABELS.nl
  // Before mount the icon is rendered from the default state; suppress mismatch.
  const isDark = mounted && theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${styles.toggle} ${className ?? ''}`}
      aria-label={isDark ? labels.toLight : labels.toDark}
      title={isDark ? labels.toLight : labels.toDark}
      suppressHydrationWarning
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" fill="currentColor" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  )
}
