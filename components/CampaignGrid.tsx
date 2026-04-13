'use client'

import Image from 'next/image'
import type { Campaign } from './types'
import styles from './CampaignGrid.module.css'

const CHECK_ICON = (
  <svg viewBox="0 0 11 9" fill="none" width="11" height="9">
    <path d="M1 4L4.2 7.5L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

interface Props {
  campaigns: Campaign[]
  selected: Record<string, Campaign>
  onToggle: (c: Campaign) => void
  onOpen: (c: Campaign) => void
}

export function CampaignGrid({ campaigns, selected, onToggle, onOpen }: Props) {
  if (campaigns.length === 0) {
    return <div className={styles.empty}>Geen assets gevonden. Pas de filters aan.</div>
  }

  return (
    <>
      <div className={styles.divider} />
      <div className={styles.grid}>
        {campaigns.map((c, i) => {
          const isSel = !!selected[c._id]
          return (
            <div
              key={c._id}
              className={`${styles.card} ${isSel ? styles.selected : ''}`}
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => onOpen(c)}
            >
              {/* Image */}
              <div className={styles.imgWrap}>
                <Image
                  src={c.thumbnail || `https://picsum.photos/seed/${c._id}/400/260`}
                  alt={c.title}
                  fill
                  sizes="(max-width: 700px) 50vw, 20vw"
                  className={styles.img}
                />
                <div className={styles.badges}>
                  <span className={styles.typeBadge}>{c.type}</span>
                  <button
                    className={`${styles.check} ${isSel ? styles.ticked : ''}`}
                    title="Toevoegen aan pakket"
                    onClick={e => { e.stopPropagation(); onToggle(c) }}
                  >
                    {isSel && CHECK_ICON}
                  </button>
                </div>
                {c.visualStyle && (
                  <span className={styles.styleBadge}>{c.visualStyle.label}</span>
                )}
              </div>

              {/* Body */}
              <div className={styles.body}>
                <div className={styles.title}>{c.title}</div>
                <div className={styles.desc}>{c.description}</div>
                <div className={styles.formats}>
                  {c.formats.slice(0, 3).map(f => (
                    <span key={f} className={styles.format}>{f}</span>
                  ))}
                  {c.formats.length > 3 && (
                    <span className={styles.format}>+{c.formats.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <div className={styles.goals}>
                  {c.goals.slice(0, 2).map(g => (
                    <span key={g._id} className={styles.goal}>{g.label}</span>
                  ))}
                </div>
                <span className={styles.bekijk}>Bekijk →</span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
