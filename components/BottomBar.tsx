'use client'

import { useI18n } from './i18n'
import styles from './BottomBar.module.css'

interface Props {
  count: number
  onSummarise: () => void
  onReset: () => void
}

const ResetIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" width="18" height="18">
    <path d="M25 4.002C22.492 2.117 19.375 1 16 1C7.721 1 1 7.721 1 16C1 24.279 7.721 31 16 31C23.891 31 30.366 24.893 30.956 17.152C31.04 16.051 30.215 15.09 29.114 15.006C28.013 14.922 27.052 15.747 26.968 16.848C26.535 22.524 21.786 27 16 27C9.929 27 5 22.071 5 16C5 9.929 9.929 5 16 5C18.352 5 20.533 5.74 22.322 7L21 7C19.896 7 19 7.896 19 9C19 10.104 19.896 11 21 11L27 11C28.105 11 29 10.105 29 9L29 3C29 1.896 28.104 1 27 1C25.896 1 25 1.896 25 3L25 4.002Z" fill="white"/>
  </svg>
)

export function BottomBar({ count, onSummarise, onReset }: Props) {
  const { copy } = useI18n()

  if (count === 0) return null

  return (
    <div className={styles.bar}>
      <span className={styles.count}>{copy.bar.chosenAssets(count)}</span>
      <button className={styles.reset} onClick={onReset} title={copy.bar.reset}>
        <ResetIcon />
      </button>
      <button className={styles.cta} onClick={onSummarise}>
        {copy.bar.summarize}
      </button>
    </div>
  )
}
