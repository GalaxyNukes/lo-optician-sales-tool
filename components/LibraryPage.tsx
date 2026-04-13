'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Campaign, Subject } from './types'
import styles from './LibraryPage.module.css'

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function LogoWhite() {
  return (
    <svg viewBox="0 0 826.4 132.4" style={{ height: 22, width: 'auto', fill: '#fff', display: 'block' }}>
      <polygon points="403.1,120.6 403.1,120.6 403.1,120.6"/>
      <path d="M356.1,51c-1.2-3.3-3.1-6.3-5.6-9c-2.7-2.8-6.3-4.9-10.4-6.4c-4.3-1.5-9.2-2.2-14.8-2.2c-6.2,0-11.8,0.5-16.8,1.5c-5,1-9.4,2.5-13.5,4.4l-0.7,0.3l-2,0.9l0,81.1l22.3,0V52.2c1-0.3,1.9-0.6,2.8-0.8c1.6-0.3,4-0.6,7-0.5c2.7,0,4.7,0.4,6.1,0.9c1.6,0.6,2.5,1.4,3.1,2.1c0.8,1,1.3,1.9,1.6,3c0.4,1.3,0.5,2.7,0.5,4.4l0,60.3h22.3l0-60.6C357.8,57.6,357.2,54.2,356.1,51z"/>
      <path d="M416.6,79.6c-1.7-2.5-4-4.7-6.8-6.6c-2.7-1.9-5.9-3.5-9.5-4.9l-0.1-0.1l-0.2-0.1c-3.9-1.5-6.7-3.1-8.4-4.6c-0.7-0.7-1.1-1.2-1.4-1.9c-0.3-0.7-0.5-1.5-0.5-2.6c0-1.2,0.2-2.2,0.5-3.1c0.3-0.9,0.8-1.6,1.6-2.4c0.6-0.7,1.3-1.1,2.3-1.5c1-0.4,2.2-0.6,3.9-0.6c2.2,0,4,0.4,5.6,1c1.9,0.7,3.4,1.6,4.5,2.4l4.7,3.6l7.2-16.6l-3.2-2.2c-2.7-1.8-5.8-3.2-9.2-4.4c-3.6-1.2-7.4-1.7-11.5-1.7h-0.1c-3.9,0-7.6,0.6-11,1.8c-3.4,1.2-6.4,3.1-9,5.6c-2.5,2.4-4.5,5.3-5.8,8.4c-1.3,3.1-2,6.5-2,10v0.1c0,2.5,0.3,4.9,0.8,7.2c0.6,2.5,1.7,5,3.2,7.2c1.6,2.5,3.9,4.7,6.6,6.7c2.8,2.1,6.2,3.8,10,5.3c4.1,1.6,7,3.3,8.4,4.7c0.6,0.6,1,1.2,1.3,2c0.3,0.8,0.5,1.9,0.5,3.2c0,1.4-0.2,2.5-0.6,3.5c-0.4,1-1,1.8-1.9,2.7c-0.9,0.9-1.9,1.4-3,1.9c-1.1,0.4-2.5,0.7-4.2,0.7c-2.8,0-5.2-0.4-7.3-1.1c-2.3-0.8-3.9-1.7-4.8-2.4l-4.9-4l-7.2,17.4l2.8,2.2c2.7,2.1,6.1,3.6,10,4.7c3.9,1.1,8.2,1.6,12.7,1.6c4.3,0,8.5-0.7,12.3-2.2c3.7-1.4,7-3.4,9.8-6c2.7-2.5,4.8-5.4,6.3-8.7c1.5-3.3,2.3-6.8,2.3-10.3v-0.2C421.5,89.7,419.9,84.2,416.6,79.6z"/>
      <polygon points="178.8,13.4 156.5,13.4 156.5,121.7 208.9,121.7 208.9,103.7 178.8,103.7"/>
      <path d="M282,76.3c0-6.8-0.7-12.8-2.1-18.1c-1.4-5.3-3.6-9.9-6.7-13.7c-3-3.7-6.7-6.5-11-8.4c-4.3-1.9-9.1-2.7-14.3-2.7h-0.1c-5.3,0-10.2,1-14.6,3c-4.5,2-8.3,5.1-11.6,9c-3.3,4-5.7,8.8-7.3,14.3c-1.6,5.5-2.3,11.5-2.3,18.3v0.1c0,7,0.8,13.3,2.6,18.9c1.7,5.6,4.4,10.4,8,14.4c3.6,3.9,7.8,6.9,12.6,8.8c4.8,1.9,10.2,2.9,15.9,2.9h0.1c5.3,0,10.2-0.6,14.6-1.7c4.3-1.1,8-2.5,11.1-4.3l0.9-0.6l2.5-1.5L273.7,98l-4.7,2.7c-1.8,1.1-4.2,2.1-7.1,2.8c-2.7,0.7-6,1.1-9.7,1.1c-3.2,0-5.9-0.6-8.1-1.6c-2.3-1-4.1-2.4-5.8-4.5c-1.5-1.8-2.8-4.5-3.8-8c-0.7-2.7-1.2-5.9-1.5-9.6l49,0V76.3z M234,64.1c0.4-1.6,0.8-3.1,1.3-4.3c0.9-2.3,1.9-4,3-5.3c1.3-1.5,2.7-2.5,4.1-3.2c1.5-0.7,3.1-1,5-1c2.3,0,4.1,0.4,5.6,1c1.5,0.7,2.8,1.6,4,3.1c1,1.2,1.9,2.9,2.6,5.1c0.4,1.3,0.7,2.9,1,4.6L234,64.1z"/>
      <g>
        <path d="M122.9,32.8C111.5,13.6,90.6,0.7,66.6,0.7C32.7,0.7,4.9,26.4,1.4,59.3C25.3,46.7,57.2,29,88,29C99.6,29,111.2,30,122.9,32.8z"/>
        <path d="M8.9,97.2c11.1,20.5,32.7,34.5,57.7,34.5c17.2,0,32.8-6.6,44.5-17.4C80.5,94.9,55.2,88.7,8.9,97.2z"/>
        <path d="M132.1,64.3c-5.6-3-34.1-17.4-63.6-17.4c-32.1,0-62.5,16.6-67.3,19.3c0,0.1,0,9.2,0,9.3c7-2,42.5-9.9,62-9.9c23.5,0,40.9,5.5,56.6,13.6c4.5-8.9,7.1-19,7.1-29.6C132.1,65.6,132.1,64.9,132.1,64.3z"/>
      </g>
    </svg>
  )
}

// ── Type badge colours ─────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  'CAMPAIGN':   '#1A9E7E',
  'MEDIA KIT':  '#2A4E8B',
  'MOCKUP':     '#8B3A2A',
  'LANDING PAGE': '#6B2A8B',
  'POS':        '#8B6B2A',
}

// ── Detail overlay ─────────────────────────────────────────────────────────────
function DetailOverlay({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const [activeImg, setActiveImg] = useState(0)
  const imgs = campaign.mockups?.length ? campaign.mockups : [campaign.thumbnail]
  const typeColor = TYPE_COLORS[campaign.type] || '#0D2340'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.overlayPanel}>
        {/* Close */}
        <button className={styles.overlayClose} onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>

        {/* Left: Gallery */}
        <div className={styles.overlayGallery}>
          <div className={styles.overlayMainImg}>
            {imgs[activeImg] && (
              <Image
                src={imgs[activeImg]}
                alt={campaign.title}
                fill
                sizes="55vw"
                className={styles.overlayMainImgEl}
                priority
              />
            )}
            {/* Prev / next */}
            {imgs.length > 1 && (
              <>
                <button className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`} onClick={() => setActiveImg(i => (i - 1 + imgs.length) % imgs.length)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 2L4 8l6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className={`${styles.galleryArrow} ${styles.galleryArrowRight}`} onClick={() => setActiveImg(i => (i + 1) % imgs.length)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2l6 6-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className={styles.galleryCounter}>{activeImg + 1} / {imgs.length}</div>
              </>
            )}
          </div>
          {imgs.length > 1 && (
            <div className={styles.overlayThumbs}>
              {imgs.map((url, i) => (
                <div key={i} className={`${styles.overlayThumb} ${i === activeImg ? styles.overlayThumbActive : ''}`} onClick={() => setActiveImg(i)}>
                  <Image src={url} alt="" fill sizes="80px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className={styles.overlayInfo}>
          <div className={styles.overlayTypeBadge} style={{ background: typeColor }}>{campaign.type}</div>
          <h2 className={styles.overlayTitle}>{campaign.title}</h2>
          {campaign.visualStyle && <div className={styles.overlayStyle}>{campaign.visualStyle.label}</div>}
          <p className={styles.overlayDesc}>{campaign.description}</p>

          {/* Subjects */}
          {campaign.subjects?.length > 0 && (
            <div className={styles.overlayTags}>
              {campaign.subjects.map(s => <span key={s._id} className={styles.overlaySubject}>{s.label}</span>)}
            </div>
          )}

          {/* Formats */}
          {campaign.formats?.length > 0 && (
            <div className={styles.overlayFormatsSection}>
              <div className={styles.overlaySectionLabel}>Inbegrepen formaten</div>
              <div className={styles.overlayFormats}>
                {campaign.formats.map(f => <span key={f} className={styles.overlayFormat}>{f}</span>)}
              </div>
            </div>
          )}

          {/* Goals */}
          {campaign.goals?.length > 0 && (
            <div className={styles.overlayGoalsSection}>
              <div className={styles.overlaySectionLabel}>Doelstellingen</div>
              <div className={styles.overlayGoals}>
                {campaign.goals.map(g => <span key={g._id} className={styles.overlayGoal}>{g.label}</span>)}
              </div>
            </div>
          )}

          <Link href="/" className={styles.overlayCtaLink}>
            <span>Voeg toe aan pakket</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Campaign card ──────────────────────────────────────────────────────────────
function CampaignCard({ campaign, featured, onClick }: { campaign: Campaign; featured: boolean; onClick: () => void }) {
  const typeColor = TYPE_COLORS[campaign.type] || '#0D2340'
  return (
    <article
      className={`${styles.card} ${featured ? styles.cardFeatured : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardImgWrap}>
        <Image
          src={campaign.thumbnail || `https://picsum.photos/seed/${campaign._id}/800/600`}
          alt={campaign.title}
          fill
          sizes={featured ? '55vw' : '30vw'}
          className={styles.cardImg}
        />
        <div className={styles.cardOverlay} />
        <div className={styles.cardContent}>
          <div className={styles.cardMeta}>
            <span className={styles.cardTypeBadge} style={{ background: typeColor }}>{campaign.type}</span>
            {campaign.visualStyle && <span className={styles.cardStyleBadge}>{campaign.visualStyle.label}</span>}
          </div>
          <div className={styles.cardBottom}>
            {campaign.subjects?.slice(0, 3).map(s => (
              <span key={s._id} className={styles.cardSubject}>{s.label}</span>
            ))}
            <h3 className={styles.cardTitle}>{campaign.title}</h3>
            <p className={styles.cardDesc}>{campaign.description}</p>
            <div className={styles.cardFormats}>
              {campaign.formats?.slice(0, 4).map(f => <span key={f} className={styles.cardFormat}>{f}</span>)}
              {(campaign.formats?.length || 0) > 4 && <span className={styles.cardFormat}>+{(campaign.formats?.length || 0) - 4}</span>}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
interface Props {
  campaigns: Campaign[]
  subjects: Subject[]
}

const ALL_TYPES = ['CAMPAIGN', 'MEDIA KIT', 'MOCKUP', 'LANDING PAGE']

export function LibraryPage({ campaigns, subjects }: Props) {
  const [selSubject, setSelSubject] = useState<string | null>(null)
  const [selType, setSelType]       = useState<string | null>(null)
  const [detail, setDetail]         = useState<Campaign | null>(null)
  const [visible, setVisible]       = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const filtered = campaigns.filter(c => {
    if (selType && c.type !== selType) return false
    if (selSubject && !c.subjects?.some(s => s.label === selSubject)) return false
    return true
  })

  // Active types present in filtered campaigns
  const presentTypes = ALL_TYPES.filter(t => campaigns.some(c => c.type === t))

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}><LogoWhite /></Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Build Your Campaign</Link>
          <span className={`${styles.navLink} ${styles.navLinkActive}`}>Library</span>
        </div>
        <div className={styles.navRight}>
          <Link href="/" className={styles.navCta}>Start campagne →</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className={`${styles.hero} ${visible ? styles.heroVisible : ''}`}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>Campaign Library</div>
          <h1 className={styles.heroTitle}>
            <span>Wat we</span>
            <span className={styles.heroTitleItalic}>voor jou</span>
            <span>kunnen doen.</span>
          </h1>
          <p className={styles.heroSub}>
            Ontdek ons volledige campagne-aanbod. Van sociale media tot stickering, van landingspagina&apos;s tot print — allemaal klaar om te activeren.
          </p>
          <div className={styles.heroCount}>{campaigns.length} campagnes beschikbaar</div>
        </div>
        {/* Decorative grid lines */}
        <div className={styles.heroGrid} aria-hidden="true">
          {[...Array(5)].map((_, i) => <div key={i} className={styles.heroGridLine} style={{ left: `${(i + 1) * 16.66}%` }} />)}
        </div>
      </header>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Type</span>
          <div className={styles.filterChips}>
            <button className={`${styles.chip} ${!selType ? styles.chipActive : ''}`} onClick={() => setSelType(null)}>Alles</button>
            {presentTypes.map(t => (
              <button key={t} className={`${styles.chip} ${selType === t ? styles.chipActive : ''}`} onClick={() => setSelType(t === selType ? null : t)}>
                <span className={styles.chipDot} style={{ background: TYPE_COLORS[t] || '#0D2340' }} />
                {t}
              </button>
            ))}
          </div>
        </div>
        {subjects.length > 0 && (
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Subject</span>
            <div className={styles.filterChips}>
              {subjects.map(s => (
                <button key={s._id} className={`${styles.chip} ${selSubject === s.label ? styles.chipActive : ''}`} onClick={() => setSelSubject(selSubject === s.label ? null : s.label)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className={styles.filterCount}>{filtered.length} resultaten</div>
      </div>

      {/* Grid */}
      <main className={styles.grid} ref={gridRef}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>Geen campagnes gevonden voor deze filters.</div>
        ) : (
          filtered.map((c, i) => (
            <CampaignCard
              key={c._id}
              campaign={c}
              featured={i === 0 || i % 7 === 3}
              onClick={() => setDetail(c)}
            />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <LogoWhite />
        <p className={styles.footerText}>Alle campagnes zijn beschikbaar voor LensOnline opticiens. Neem contact op voor maatwerk.</p>
        <Link href="/" className={styles.footerCta}>Start je campagne →</Link>
      </footer>

      {/* Detail overlay */}
      {detail && <DetailOverlay campaign={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
