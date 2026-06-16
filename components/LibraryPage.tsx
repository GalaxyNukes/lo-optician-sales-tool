'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Nav } from './Nav'
import { useI18n } from './i18n'
import type { Campaign, Subject, Goal, Action, CampaignType } from './types'
import { FALLBACK_IMAGE_DATA_URI } from './imageFallback'
import { LibraryStartModal } from './LibraryStartModal'
import styles from './LibraryPage.module.css'

// ── Horizontal detail overlay ─────────────────────────────────────────────────
function DetailOverlay({ campaign: c, onClose, onStartBriefing }: { campaign: Campaign; onClose: () => void; onStartBriefing: (campaign: Campaign) => void }) {
  const { copy } = useI18n()
  const [activeImg, setActiveImg] = useState(0)
  const imgs = c.mockups?.filter(Boolean).length ? c.mockups : [c.thumbnail].filter(Boolean)
  const typeColor = c.type?.color || '#0D2340'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.overlayCard}>
        {/* Close button */}
        <button className={styles.overlayClose} onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Left: Image */}
        <div className={styles.overlayLeft}>
          <div className={styles.overlayMainImg}>
            {imgs[activeImg] && (
              <Image src={imgs[activeImg]} alt={c.title} fill sizes="50vw" className={styles.overlayImg} priority />
            )}
            {/* Type badge */}
            {c.type && <span className={styles.overlayTypeBadge} style={{ background: typeColor }}>{c.type.label}</span>}
            {/* Gallery arrows */}
            {imgs.length > 1 && (
              <>
                <button className={`${styles.galBtn} ${styles.galBtnLeft}`} onClick={() => setActiveImg(i => (i - 1 + imgs.length) % imgs.length)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7l6 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className={`${styles.galBtn} ${styles.galBtnRight}`} onClick={() => setActiveImg(i => (i + 1) % imgs.length)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l6 5-6 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {imgs.length > 1 && (
            <div className={styles.overlayThumbs}>
              {imgs.map((url, i) => (
                <div key={i} className={`${styles.overlayThumb} ${i === activeImg ? styles.overlayThumbOn : ''}`} onClick={() => setActiveImg(i)}>
                  <Image src={url} alt="" fill sizes="70px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className={styles.overlayRight}>
          <div className={styles.overlayMeta}>
            {c.visualStyle && <span className={styles.overlayStyle}>{c.visualStyle.label}</span>}
            {c.season && <span className={styles.overlayStyle}>{c.season}</span>}
          </div>

          <h2 className={styles.overlayTitle}>{c.title}</h2>
          <p className={styles.overlayDesc}>{c.description}</p>

          {/* Subjects */}
          {c.subjects?.length > 0 && (
            <div className={styles.overlayTagRow}>
              {c.subjects.map(s => <span key={s._id} className={styles.overlaySubject}>{s.label}</span>)}
            </div>
          )}

          {/* Divider */}
          <div className={styles.overlayDivider} />

          {/* Formats */}
          {c.formats?.length > 0 && (
            <div className={styles.overlaySection}>
              <div className={styles.overlaySectionLabel}>{copy.detail.includedFormats}</div>
              <div className={styles.overlayFormats}>
                {c.formats.map(f => <span key={f} className={styles.overlayFormat}>{f}</span>)}
              </div>
            </div>
          )}

          {/* Goals */}
          {c.goals?.length > 0 && (
            <div className={styles.overlaySection}>
              <div className={styles.overlaySectionLabel}>{copy.detail.goals}</div>
              <div className={styles.overlayGoals}>
                {c.goals.map(g => <span key={g._id} className={styles.overlayGoal}>{g.label}</span>)}
              </div>
            </div>
          )}

          <button className={styles.overlayCta} onClick={() => onStartBriefing(c)}>
            {copy.library.startBriefing}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Bento card ────────────────────────────────────────────────────────────────
type CardSize = 'small' | 'medium' | 'large' | 'wide' | 'tall'

function CampaignCard({ campaign: c, size, index, onClick }: {
  campaign: Campaign
  size: CardSize
  index: number
  onClick: () => void
}) {
  const typeColor = c.type?.color || '#0D2340'

  return (
    <article
      className={`${styles.card} ${styles[`card--${size}`]}`}
      onClick={onClick}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image */}
      <div className={styles.cardImg}>
        <Image
          src={c.thumbnail || FALLBACK_IMAGE_DATA_URI}
          alt={c.title}
          fill
          sizes="(max-width: 700px) 100vw, 33vw"
          className={styles.cardImgEl}
        />
        <div className={styles.cardScrim} />
      </div>

      {/* Content */}
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          {c.type && <span className={styles.cardType} style={{ color: typeColor }}>{c.type.label}</span>}
          {c.visualStyle && <span className={styles.cardStyle}>{c.visualStyle.label}</span>}
        </div>
        <div className={styles.cardBottom}>
          {c.subjects?.slice(0, 2).map(s => (
            <span key={s._id} className={styles.cardSubject}>{s.label}</span>
          ))}
          <h3 className={styles.cardTitle}>{c.title}</h3>
          {(size === 'large' || size === 'wide' || size === 'tall') && (
            <p className={styles.cardDesc}>{c.description}</p>
          )}
          <div className={styles.cardFormats}>
            {c.formats?.slice(0, size === 'small' ? 2 : 4).map(f => (
              <span key={f} className={styles.cardFmt}>{f}</span>
            ))}
            {(c.formats?.length || 0) > (size === 'small' ? 2 : 4) && (
              <span className={styles.cardFmt}>+{(c.formats?.length || 0) - (size === 'small' ? 2 : 4)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Hover arrow */}
      <div className={styles.cardArrow}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </article>
  )
}

// ── Bento layout pattern — cycles through sizes ───────────────────────────────
const BENTO_PATTERN: CardSize[] = ['large', 'medium', 'small', 'small', 'wide', 'small', 'medium', 'tall', 'small', 'medium', 'large', 'small', 'small', 'wide', 'medium']

function getSize(index: number): CardSize {
  return BENTO_PATTERN[index % BENTO_PATTERN.length]
}

// ── Main library page ─────────────────────────────────────────────────────────
interface Props {
  campaigns: Campaign[]
  subjects: Subject[]
  goals: Goal[]
  actions: Action[]
  campaignTypes: CampaignType[]
}

export function LibraryPage({ campaigns, subjects, goals, actions, campaignTypes }: Props) {
  const { copy } = useI18n()
  const [selSubject, setSelSubject] = useState<string | null>(null)
  const [selType, setSelType]       = useState<string | null>(null)
  const [detail, setDetail]         = useState<Campaign | null>(null)
  const [briefingCampaign, setBriefingCampaign] = useState<Campaign | null>(null)

  const filtered = campaigns.filter(c => {
    if (selType && c.type?._id !== selType) return false
    if (selSubject && !c.subjects?.some(s => s.label === selSubject)) return false
    return true
  })

  const presentTypes = campaignTypes.filter(t => campaigns.some(c => c.type?._id === t._id))

  return (
    <div className={styles.page}>
      <Nav activePage="library" />

      {/* Filter bar — directly below nav */}
      <div className={styles.filterBar}>
        <div className={styles.filterRow}>
          {/* Type filters */}
          <div className={styles.filterGroup}>
            <button
              className={`${styles.chip} ${!selType ? styles.chipOn : ''}`}
              onClick={() => setSelType(null)}
            >
              {copy.filters.all}
            </button>
            {presentTypes.map(t => (
              <button
                key={t._id}
                className={`${styles.chip} ${selType === t._id ? styles.chipOn : ''}`}
                onClick={() => setSelType(t._id === selType ? null : t._id)}
              >
                <span className={styles.chipDot} style={{ background: t.color || '#888' }} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Subject filters */}
          {subjects.length > 0 && (
            <>
              <div className={styles.filterSep} />
              <div className={styles.filterGroup}>
                {subjects.map(s => (
                  <button
                    key={s._id}
                    className={`${styles.chip} ${selSubject === s.label ? styles.chipOn : ''}`}
                    onClick={() => setSelSubject(selSubject === s.label ? null : s.label)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <span className={styles.filterCount}>{copy.library.campaignCount(filtered.length)}</span>
        </div>
      </div>

      {/* Bento grid */}
      <main className={styles.bento}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>{copy.filters.noCampaigns}</div>
        ) : (
          filtered.map((c, i) => (
            <CampaignCard
              key={c._id}
              campaign={c}
              size={getSize(i)}
              index={i}
              onClick={() => setDetail(c)}
            />
          ))
        )}
      </main>

      {/* Detail overlay */}
      {detail && (
        <DetailOverlay
          campaign={detail}
          onClose={() => setDetail(null)}
          onStartBriefing={(c) => { setDetail(null); setBriefingCampaign(c) }}
        />
      )}

      {/* Start-briefing pop-up */}
      {briefingCampaign && (
        <LibraryStartModal
          campaign={briefingCampaign}
          goals={goals}
          actions={actions}
          onClose={() => setBriefingCampaign(null)}
        />
      )}
    </div>
  )
}
