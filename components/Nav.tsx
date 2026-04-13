'use client'

import { Logo } from './Logo'
import { useI18n } from './i18n'
import styles from './Nav.module.css'

interface Props {
  activePage?: 'builder' | 'library'
}

export function Nav({ activePage = 'builder' }: Props) {
  const { lang, setLang, copy } = useI18n()

  return (
    <nav className={styles.nav}>
      <a href="/" className={styles.logo}><Logo fill="#0D2340" height={26} /></a>
      <div className={styles.links}>
        <a href="/" className={`${styles.link} ${activePage === 'builder' ? styles.active : ''}`}>{copy.nav.builder}</a>
        <a href="/library" className={`${styles.link} ${activePage === 'library' ? styles.active : ''}`}>{copy.nav.library}</a>
      </div>
      <div className={styles.langs}>
        {(['nl', 'fr', 'en'] as const).map(code => (
          <button
            key={code}
            type="button"
            className={`${styles.langBtn} ${lang === code ? styles.langBtnActive : ''}`}
            onClick={() => setLang(code)}
          >
            {copy.nav.languages[code]}
          </button>
        ))}
      </div>
    </nav>
  )
}
