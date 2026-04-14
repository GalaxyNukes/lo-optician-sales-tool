'use client'

import type React from 'react'
import styles from './BrochurePage.module.css'

export interface PartnerBlock {
  _id: string
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: string
  description: string
  deliverables?: string[]
  warning?: string
  images?: Array<{ _key: string; url: string; caption?: string; dimensions?: { width: number; height: number } }>
  timing?: string
  budgetMin?: string
  budgetMax?: string
  budgetNote?: string
  impactLevel?: number
}

interface Props {
  blocks: PartnerBlock[]
}

const BENTO_PATTERNS: Array<Array<React.CSSProperties>> = [
  [{ gridColumn: '1 / -1', gridRow: '1 / 3' }],
  [{ gridColumn: '1 / 2', gridRow: '1 / 3' }, { gridColumn: '2 / 3', gridRow: '1 / 3' }],
  [{ gridColumn: '1 / 2', gridRow: '1 / 3' }, { gridColumn: '2 / 3', gridRow: '1' }, { gridColumn: '2 / 3', gridRow: '2' }],
  [{ gridColumn: '1 / 2', gridRow: '1' }, { gridColumn: '2 / 3', gridRow: '1' }, { gridColumn: '1 / 2', gridRow: '2' }, { gridColumn: '2 / 3', gridRow: '2' }],
]

function BlockBento({ images }: { images: PartnerBlock['images'] }) {
  if (!images || images.length === 0) {
    return (
      <div className={styles.bentoEmpty}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span>Campagne mockups</span>
        <span className={styles.bentoEmptySub}>Voeg visuals toe via Studio</span>
      </div>
    )
  }

  const count = Math.min(images.length, 4)
  const pattern = BENTO_PATTERNS[count - 1]

  return (
    <div className={styles.bento}>
      {images.slice(0, count).map((img, i) => (
        <div key={img._key} className={styles.bentoCell} style={pattern[i]}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${img.url}?w=800&auto=format&q=80`}
            alt={img.caption || `Asset ${i + 1}`}
            className={styles.bentoImg}
          />
          {img.caption && <span className={styles.bentoLabel}>{img.caption}</span>}
        </div>
      ))}
    </div>
  )
}

function BlockSection({ block, index }: { block: PartnerBlock; index: number }) {
  const accent = block.badgeColor || '#0D2340'
  const num = String(index + 1).padStart(2, '0')

  return (
    <section
      id={`block-${block._id}`}
      className={`${styles.blockSection} ${index % 2 === 1 ? styles.blockSectionAlt : ''}`}
    >
      <div className={styles.container}>
        <div className={styles.blockGrid}>
          <div className={styles.blockContent}>
            <div className={styles.blockMeta}>
              <span className={styles.blockNum} style={{ color: accent }}>{num}</span>
              {block.badge && (
                <span className={styles.blockBadge} style={{ background: accent }}>{block.badge}</span>
              )}
            </div>
            <h2 className={styles.blockTitle}>{block.title}</h2>
            {block.subtitle && (
              <p className={styles.blockSubtitle}>{block.subtitle}</p>
            )}
            <div className={styles.blockDivider} style={{ background: accent }} />
            <p className={styles.blockDesc}>{block.description}</p>
            {block.deliverables && block.deliverables.length > 0 && (
              <div className={styles.tagsWrap}>
                {block.deliverables.map((d, i) => (
                  <span key={i} className={styles.tag}>{d}</span>
                ))}
              </div>
            )}
            {block.warning && (
              <div
                className={styles.warningNote}
                style={{ color: accent, background: `${accent}12`, borderColor: `${accent}30` }}
              >
                {block.warning}
              </div>
            )}
          </div>
          <div className={styles.blockImages}>
            <BlockBento images={block.images} />
          </div>
        </div>
      </div>
    </section>
  )
}

export function BrochurePage({ blocks }: Props) {
  return (
    <div className={styles.root}>

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <span className={styles.heroEyebrow}>Partner Activatiegids 2025</span>
              <h1 className={styles.heroTitle}>
                Meer dan je denkt.<br />
                <em>Altijd in actie.</em>
              </h1>
              <p className={styles.heroSub}>
                Als LensOnline partner ben je nooit alleen. We zetten het hele jaar door acties op die klanten jouw richting uit sturen — van dag één tot de langetermijnopvolging.
              </p>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statN}>{blocks.length || 6}</span>
                  <span className={styles.statL}>Activatie&shy;blokken</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statN}>365</span>
                  <span className={styles.statL}>Dagen zichtbaar&shy;heid</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statN}>100%</span>
                  <span className={styles.statL}>Lokaal gericht</span>
                </div>
              </div>
            </div>

            {blocks.length > 0 && (
              <nav className={styles.heroNav} aria-label="Blokkenindex">
                {blocks.map((b, i) => (
                  <a key={b._id} href={`#block-${b._id}`} className={styles.heroNavItem}>
                    <span className={styles.heroNavDot} style={{ background: b.badgeColor || '#0D2340' }} />
                    <span className={styles.heroNavNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.heroNavTitle}>{b.title}</span>
                    <svg className={styles.heroNavArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      </section>

      {blocks.length > 0 ? (
        blocks.map((block, index) => (
          <BlockSection key={block._id} block={block} index={index} />
        ))
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Nog geen activatieblokken</p>
          <p className={styles.emptySub}>
            Voeg blokken toe via{' '}
            <a href="/studio" target="_blank" rel="noopener noreferrer">Studio → Partner Blocks</a>
          </p>
        </div>
      )}

      {blocks.length > 0 && (
        <section className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaInner}>
              <div>
                <h2 className={styles.ctaTitle}>Klaar om meer te groeien?</h2>
                <p className={styles.ctaSub}>Neem contact op met je account manager en ontdek welke activaties perfect passen bij jouw winkel, locatie en doelgroep.</p>
              </div>
              <div className={styles.ctaLinks}>
                <span className={styles.ctaContact}>partner@lensonline.be</span>
                <span className={styles.ctaUrl}>lensonline.be/partner</span>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
