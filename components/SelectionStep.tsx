'use client'

import { useState, useEffect } from 'react'
import styles from './SelectionStep.module.css'

interface Item {
  id: string
  label: string
  icon: string
  isCustom?: boolean
}

interface CustomActionProps {
  value: string
  onChange: (v: string) => void
  onContinue: () => void
}

interface Props {
  stepNumber: number
  question: string
  items: Item[]
  selected: string[]
  multiSelect: boolean
  answeredLabel?: string
  customAction?: CustomActionProps
  campaignCountPerItem?: Record<string, number>
  onSelect: (id: string) => void
}

// Simple icon renderer matching existing icon key system
function Icon({ type, active }: { type: string; active: boolean }) {
  const col = active ? 'rgba(255,255,255,0.8)' : '#6A6560'
  const icons: Record<string, string> = {
    o:  `<polygon points="9,2.5 14.5,5.7 14.5,12.3 9,15.5 3.5,12.3 3.5,5.7" fill="none" stroke="${col}" stroke-width="1.4"/>`,
    f:  `<polygon points="9,2.5 14.5,5.7 14.5,12.3 9,15.5 3.5,12.3 3.5,5.7" fill="${col}"/>`,
    s:  `<polygon points="9,2.5 14.5,5.7 14.5,12.3 9,15.5 3.5,12.3 3.5,5.7" fill="none" stroke="${col}" stroke-width="1.4"/><polygon points="9,5.5 12,7.5 12,10.5 9,12.5 6,10.5 6,7.5" fill="${col}" opacity="0.6"/>`,
    sp: `<rect x="2.5" y="2" width="5" height="14" rx="1" fill="none" stroke="${col}" stroke-width="1.4"/><rect x="10.5" y="2" width="5" height="14" rx="1" fill="none" stroke="${col}" stroke-width="1.4"/>`,
    d:  `<polygon points="9,2 16,9 9,16 2,9" fill="none" stroke="${col}" stroke-width="1.4"/>`,
    c:  `<circle cx="9" cy="9" r="6.5" fill="none" stroke="${col}" stroke-width="1.4"/><circle cx="9" cy="9" r="2.8" fill="${col}"/>`,
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" dangerouslySetInnerHTML={{ __html: icons[type] || icons.o }} />
  )
}

export function SelectionStep({
  stepNumber, question, items, selected, multiSelect,
  answeredLabel, customAction, campaignCountPerItem, onSelect,
}: Props) {
  const [open, setOpen] = useState(true)
  const isAnswered = selected.length > 0 || (customAction && customAction.value)

  // Auto-open when step becomes relevant
  useEffect(() => { setOpen(true) }, [stepNumber])

  const showCustomField = items.some(i => i.isCustom && selected.includes(i.id))

  return (
    <div className={`${styles.acc} ${open ? styles.open : ''}`}>
      <div className={styles.header} onClick={() => setOpen(o => !o)}>
        <span className={styles.num}>{stepNumber}.</span>
        <span className={styles.question}>
          {question}
          {isAnswered && <span className={styles.answered}> — {answeredLabel}</span>}
        </span>
        <span className={styles.arrow}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.inner}>
          <div className={styles.content}>
            <div className={styles.grid}>
              {items.map(item => {
                const isOn = selected.includes(item.id)
                const count = campaignCountPerItem?.[item.id] ?? 0
                return (
                  <div
                    key={item.id}
                    className={`${styles.card} ${isOn ? styles.on : ''}`}
                    onClick={() => onSelect(item.id)}
                  >
                    {count > 0 && (
                      <span className={styles.badge}>{count}</span>
                    )}
                    <div className={styles.cardIcon}>
                      <Icon type={item.icon} active={isOn} />
                    </div>
                    <div className={styles.cardLabel}>{item.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Custom action text field */}
            {showCustomField && customAction && (
              <div className={styles.customField}>
                <div className={styles.customInner}>
                  <label className={styles.customLabel}>Beschrijf je actie</label>
                  <input
                    className={styles.customInput}
                    type="text"
                    placeholder="Bijv. gratis montuur bij aankoop van glazen..."
                    value={customAction.value}
                    onChange={e => customAction.onChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && customAction.value) customAction.onContinue() }}
                    autoFocus
                  />
                </div>
                <button
                  className={styles.customBtn}
                  disabled={!customAction.value}
                  onClick={customAction.onContinue}
                >
                  Doorgaan →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
