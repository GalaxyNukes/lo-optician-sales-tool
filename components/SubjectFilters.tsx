'use client'

import type { Subject } from './types'
import styles from './SubjectFilters.module.css'

interface Props {
  subjects: Subject[]
  selected: Subject[]
  onToggle: (s: Subject) => void
}

export function SubjectFilters({ subjects, selected, onToggle }: Props) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>Subject filters</span>
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
