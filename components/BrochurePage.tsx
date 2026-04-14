'use client'

import { useState, useCallback } from 'react'
import { Logo } from './Logo'
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

// Bento grid patterns — cycles per block
const BENTO_PATTERNS = [
  // 1 image
  [{ gridColumn: '1 / -1', gridRow: '1' }],
  // 2 images
  [{ gridColumn: '1 / 2', gridRow: '1' }, { gridColumn: '2 / 3', gridRow: '1' }],
  // 3 images
  [{ gridColumn: '1 / 2', gridRow: '1 / 3' }, { gridColumn: '2 / 3', gridRow: '1' }, { gridColumn: '2 / 3', gridRow: '2' }],
  // 4 images
  [{ gridColumn: '1 / 2', gridRow: '1' }, { gridColumn: '2 / 3', gridRow: '1' }, { gridColumn: '1 / 2', gridRow: '2' }, { gridColumn: '2 / 3', gridRow: '2' }],
]

function BlockImageBento({ images }: { images: PartnerBlock['images'] }) {
  if (!images || images.length === 0) {
    return (
      <div className={styles.bentoPlaceholder}>
        <div className={styles.bentoPlaceholderInner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
          </svg>
          <span>Asset mockups</span>
        </div>
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
          <img src={`${img.url}?w=480&auto=format`} alt={img.caption || `Asset ${i + 1}`} className={styles.bentoImg} />
          {img.caption && <span className={styles.bentoCaption}>{img.caption}</span>}
        </div>
      ))}
    </div>
  )
}

function CoverPage({ blocks }: { blocks: PartnerBlock[] }) {
  // Pull up to 3 images from the first blocks for the cover mosaic
  const coverImgs = blocks.flatMap(b => b.images || []).slice(0, 3)

  return (
    <div className={styles.cover}>
      <div className={styles.coverMosaic}>
        {coverImgs.length > 0 ? (
          coverImgs.map((img, i) => (
            <div key={img._key} className={`${styles.coverCell} ${styles[`coverCell${i}`]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${img.url}?w=480&auto=format`} alt={img.caption || ''} className={styles.coverCellImg} />
              {img.caption && <span className={styles.coverCellTag}>{img.caption}</span>}
            </div>
          ))
        ) : (
          <>
            <div className={`${styles.coverCell} ${styles.coverCell0} ${styles.coverCellEmpty}`}><span>Campagne visual</span></div>
            <div className={`${styles.coverCell} ${styles.coverCell1} ${styles.coverCellEmpty}`}><span>Social post</span></div>
            <div className={`${styles.coverCell} ${styles.coverCell2} ${styles.coverCellEmpty}`}><span>In-store POS</span></div>
          </>
        )}
      </div>
      <div className={styles.coverBottom}>
        <div className={styles.coverEyebrow}>Partner Activatiegids 2025</div>
        <div className={styles.coverHeadline}>
          Samen groeien<br />met <em>LensOnline</em>
        </div>
        <p className={styles.coverSub}>Alles wat we het hele jaar door voor jou en jouw klanten in beweging zetten.</p>
        <div className={styles.coverFoot}>
          <Logo fill="#fff" height={20} />
          <span className={styles.coverYear}>2025 — Partnerbrochure</span>
        </div>
      </div>
    </div>
  )
}

function IntroPage({ blocks }: { blocks: PartnerBlock[] }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <div className={styles.tag}>Onze aanpak</div>
        <h1 className={styles.pageTitle}>Meer dan je denkt.<br />Altijd in actie.</h1>
        <p className={styles.pageBody}>
          Als LensOnline partner ben je nooit alleen. We zetten het hele jaar door acties op die klanten jouw richting uit sturen — van dag één tot de langetermijnopvolging.
        </p>
        <div className={styles.statRow}>
          <div className={styles.stat}><span className={styles.statN}>{blocks.length || 6}</span><span className={styles.statL}>Activatie­blokken</span></div>
          <div className={styles.stat}><span className={styles.statN}>365</span><span className={styles.statL}>Dagen zichtbaar­heid</span></div>
          <div className={styles.stat}><span className={styles.statN}>100%</span><span className={styles.statL}>Lokaal gericht</span></div>
        </div>
        <div className={styles.miniGrid}>
          {blocks.map(b => (
            <div key={b._id} className={styles.miniTile}>
              <div className={styles.miniDot} style={{ background: b.badgeColor || '#0D2340' }} />
              <span className={styles.miniName}>{b.title}</span>
              {b.subtitle && <span className={styles.miniDesc}>{b.subtitle}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BlockPage({ block }: { block: PartnerBlock }) {
  const accent = block.badgeColor || '#0D2340'

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <div className={styles.tag} style={{ color: accent }}>Activatieblok</div>
        <div className={styles.blockCard} style={{ borderLeftColor: accent }}>
          <div className={styles.blockHead}>
            <span className={styles.blockTitle}>{block.title}</span>
            {block.badge && (
              <span className={styles.blockBadge} style={{ background: accent }}>{block.badge}</span>
            )}
          </div>
          <BlockImageBento images={block.images} />
          <p className={styles.blockDesc}>{block.description}</p>
          {block.deliverables && block.deliverables.length > 0 && (
            <div className={styles.tagRow}>
              {block.deliverables.map((d, i) => <span key={i} className={styles.delivTag}>{d}</span>)}
            </div>
          )}
          {block.warning && (
            <div className={styles.warningNote} style={{ color: accent, background: `${accent}12` }}>
              {block.warning}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BackPage({ blocks }: { blocks: PartnerBlock[] }) {
  const backImgs = blocks.flatMap(b => b.images || []).slice(-3)

  return (
    <div className={styles.backCover}>
      <div className={styles.backImgRow}>
        {backImgs.length > 0 ? backImgs.map((img, i) => (
          <div key={img._key || i} className={styles.backImgCell}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${img.url}?w=300&auto=format`} alt={img.caption || ''} className={styles.backImgCellImg} />
          </div>
        )) : (
          <>
            <div className={styles.backImgCell} /><div className={styles.backImgCell} /><div className={styles.backImgCell} />
          </>
        )}
      </div>
      <div className={styles.backBody}>
        <h2 className={styles.backHeadline}>Klaar om meer te <em>groeien</em>?</h2>
        <p className={styles.backBodyText}>Neem contact op met je account manager en ontdek welke activaties perfect passen bij jouw winkel, locatie en doelgroep.</p>
        <p className={styles.backContact}>partner@lensonline.be · lensonline.be/partner</p>
      </div>
      <div className={styles.backFoot}>
        <Logo fill="#fff" height={18} />
        <span className={styles.backUrl}>lensonline.be</span>
      </div>
    </div>
  )
}

export function BrochurePage({ blocks }: Props) {
  // Pages: cover, intro, one per block, back
  const totalPages = blocks.length + 3
  const [page, setPage] = useState(0)

  const prev = useCallback(() => setPage(p => Math.max(0, p - 1)), [])
  const next = useCallback(() => setPage(p => Math.min(totalPages - 1, p + 1)), [totalPages])

  function getPageLabel() {
    if (page === 0) return 'Cover'
    if (page === 1) return 'Onze aanpak'
    if (page === totalPages - 1) return 'Achterkant'
    return blocks[page - 2]?.title || `Blok ${page - 1}`
  }

  function renderPage() {
    if (page === 0) return <CoverPage blocks={blocks} />
    if (page === 1) return <IntroPage blocks={blocks} />
    if (page === totalPages - 1) return <BackPage blocks={blocks} />
    return <BlockPage block={blocks[page - 2]} />
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Partnergids — Interactieve brochure</h2>
        <p className={styles.headerSub}>Gebruik de pijltjes om door de pagina's te bladeren</p>
      </div>

      <div className={styles.viewer}>
        <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={prev} disabled={page === 0} aria-label="Vorige pagina">
          ←
        </button>

        <div className={styles.bookWrap}>
          <div className={styles.bookShadow} />
          <div className={styles.book}>
            {renderPage()}
          </div>
          <div className={styles.spine} />
        </div>

        <button className={`${styles.navBtn} ${styles.navNext}`} onClick={next} disabled={page === totalPages - 1} aria-label="Volgende pagina">
          →
        </button>
      </div>

      <div className={styles.footer}>
        <div className={styles.dots}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === page ? styles.dotActive : ''}`}
              onClick={() => setPage(i)}
              aria-label={`Ga naar pagina ${i + 1}`}
            />
          ))}
        </div>
        <span className={styles.pageLabel}>{page + 1} / {totalPages} — {getPageLabel()}</span>
      </div>

      {blocks.length === 0 && (
        <p className={styles.emptyNote}>
          Nog geen activatieblokken in de CMS. Voeg ze toe via <a href="/studio" target="_blank">Studio → Partner Blocks</a>.
        </p>
      )}
    </div>
  )
}
