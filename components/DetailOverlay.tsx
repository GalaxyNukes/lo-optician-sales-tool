'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Campaign } from './types'
import styles from './DetailOverlay.module.css'

interface Props {
  campaign: Campaign
  isSelected: boolean
  onToggle: () => void
  onClose: () => void
}

export function DetailOverlay({ campaign: c, isSelected, onToggle, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0)
  const imgs = c.mockups?.length ? c.mockups : [c.thumbnail]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.bg} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.panel}>
        <div className={styles.drag} />
        <button className={styles.close} onClick={onClose}>✕</button>

        <div className={styles.inner}>
          {/* Left: info */}
          <div className={styles.left}>
            <div className={styles.type}>{c.type}</div>
            <h2 className={styles.title}>{c.title}</h2>
            <p className={styles.desc}>{c.description}</p>

            <div className={styles.meta}>
              <div className={styles.metaItem}><span className={styles.metaLabel}>Type</span><span className={styles.metaVal}>{c.type}</span></div>
              {c.visualStyle && <div className={styles.metaItem}><span className={styles.metaLabel}>Visual style</span><span className={styles.metaVal}>{c.visualStyle.label}</span></div>}
              <div className={styles.metaItem}><span className={styles.metaLabel}>Formaten</span><span className={styles.metaVal}>{c.formats.length} items</span></div>
              {c.season && <div className={styles.metaItem}><span className={styles.metaLabel}>Seizoen</span><span className={styles.metaVal}>{c.season}</span></div>}
            </div>

            <div className={styles.sectionLabel}>Formats inbegrepen</div>
            <div className={styles.tags}>{c.formats.map(f => <span key={f} className={styles.tag}>{f}</span>)}</div>

            <div className={styles.sectionLabel}>Doelstellingen</div>
            <div className={styles.goals}>{c.goals.map(g => <span key={g._id} className={styles.goal}>{g.label}</span>)}</div>

            <div className={styles.cta}>
              <button
                className={`${styles.btnPri} ${isSelected ? styles.added : ''}`}
                onClick={onToggle}
              >
                {isSelected ? '✓ Toegevoegd aan pakket' : 'Toevoegen aan pakket'}
              </button>
              <button className={styles.btnSec} onClick={onClose}>Sluiten</button>
            </div>
          </div>

          {/* Right: gallery */}
          <div className={styles.right}>
            <div className={styles.mainImg}>
              <Image src={imgs[activeImg] || imgs[0]} alt={c.title} fill sizes="50vw" className={styles.mainImgEl} />
              <span className={styles.counter}>{activeImg + 1} / {imgs.length}</span>
            </div>
            {imgs.length > 1 && (
              <div className={styles.thumbs}>
                {imgs.map((url, i) => (
                  <div key={i} className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`} onClick={() => setActiveImg(i)}>
                    <Image src={url} alt={`Mockup ${i + 1}`} fill sizes="15vw" className={styles.thumbImg} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
