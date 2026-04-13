import { Logo } from './Logo'
import styles from './Nav.module.css'

export function Nav() {
  return (
    <nav className={styles.nav}>
      <a href="/" className={styles.logo}><Logo fill="#0D2340" height={26} /></a>
      <div className={styles.links}>
        <a href="/" className={`${styles.link} ${styles.active}`}>Build Your Campaign</a>
        <a href="/library" className={styles.link}>Library</a>
      </div>
    </nav>
  )
}
