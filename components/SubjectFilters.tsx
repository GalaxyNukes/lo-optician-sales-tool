'use client'

import type { Subject } from './types'
import { useI18n } from './i18n'
import styles from './SubjectFilters.module.css'

interface Props {
  subjects: Subject[]
  selected: Subject[]
  onToggle: (s: Subject) => void
}

export function SubjectFilters({ subjects, selected, onToggle }: Props) {
  const { copy } = useI18n()

  return (
    <div className={styles.row}>
      <span className={styles.label}>{copy.filters.subjects}</span>
      <div className={styles.chips}>
        {subjects.map(s => {
          const isOn = selected.some(x => x._id === s._id)
          return (
            <button
              key={s._id}
              className={`${styles.chip} ${isOn ? styles.on : ''}`}
              onClick={() => onToggle(s)}
            >
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
