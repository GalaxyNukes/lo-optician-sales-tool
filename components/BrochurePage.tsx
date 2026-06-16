'use client'

import type React from 'react'
import { useI18n } from './i18n'
import styles from './BrochurePage.module.css'

export interface CategoryValues {
  budgetMin?: string
  budgetMax?: string
  budgetNote?: string
  runningTime?: string
}

export interface PartnerBlock {
  _id: string
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: string
  description: string
  deliverables?: string[]
  warning?: string
  images?: Array<{ _key: string; url: string; caption?: string; lang?: string; dimensions?: { width: number; height: number } }>
  timing?: string
  // Legacy flat budget — retained until the A/B/C migration; superseded by categoryA/B/C.
  budgetMin?: string
  budgetMax?: string
  budgetNote?: string
  minCategory?: 'A' | 'B' | 'C'
  categoryA?: CategoryValues
  categoryB?: CategoryValues
  categoryC?: CategoryValues
  noVisualAssets?: boolean
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

const ALWAYS_TIMINGS = new Set(['always', 'ongoing', 'seasonal'])

function BlockBento({ images, noVisualAssets }: { images: PartnerBlock['images']; noVisualAssets?: boolean }) {
  const { lang } = useI18n()
  const all = images ?? []
  // Filter images to the active language; untagged images show in every language.
  // If nothing is tagged for this language yet, fall back to the full set (never an empty gallery).
  const langFiltered = all.filter(img => !img.lang || img.lang === lang)
  const shown = langFiltered.length ? langFiltered : all

  if (shown.length === 0) {
    if (noVisualAssets) {
      return (
        <div className={styles.bentoEmpty}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12h6" />
          </svg>
          <span>Geen visuele assets</span>
          <span className={styles.bentoEmptySub}>voor deze activatie</span>
        </div>
      )
    }
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

  const count = Math.min(shown.length, 4)
  const pattern = BENTO_PATTERNS[count - 1]

  return (
    <div className={styles.bento}>
      {shown.slice(0, count).map((img, i) => (
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

// Always / optional index — two grouped jump-link lists above the per-block sections.
function GroupedIndex({ blocks }: { blocks: PartnerBlock[] }) {
  if (blocks.length === 0) return null
  const always = blocks.filter(b => ALWAYS_TIMINGS.has(b.timing || ''))
  const optional = blocks.filter(b => !ALWAYS_TIMINGS.has(b.timing || ''))

  const renderGroup = (title: string, items: PartnerBlock[]) => {
    if (items.length === 0) return null
    return (
      <div className={styles.indexGroup}>
        <h3 className={styles.indexTitle}>{title}</h3>
        <div className={styles.indexLinks}>
          {items.map(b => (
            <a key={b._id} href={`#block-${b._id}`} className={styles.indexLink}>
              <span className={styles.indexDot} style={{ background: b.badgeColor || '#0D2340' }} />
              <span>{b.title}</span>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className={styles.indexBand}>
      <div className={styles.container}>
        <div className={styles.indexGrid}>
          {renderGroup('Wat we altijd voor je doen', always)}
          {renderGroup('Wat je kan activeren op aanvraag', optional)}
        </div>
      </div>
    </section>
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
            <BlockBento images={block.images} noVisualAssets={block.noVisualAssets} />
          </div>
        </div>
      </div>
    </section>
  )
}

// Body section divider — strong navy band marking always-on vs on-request.
function SectionHeader({ variant, kicker, title, subtitle }: { variant: 'always' | 'optional'; kicker: string; title: string; subtitle: string }) {
  const isOpt = variant === 'optional'
  return (
    <section className={`${styles.bodySectionHeader} ${isOpt ? styles.bodySectionHeaderOpt : ''}`}>
      <div className={styles.container}>
        <span className={`${styles.bodySectionKicker} ${isOpt ? styles.bodySectionKickerOpt : ''}`}>{kicker}</span>
        <h2 className={styles.bodySectionTitle}>{title}</h2>
        <p className={styles.bodySectionSub}>{subtitle}</p>
      </div>
    </section>
  )
}

export function BrochurePage({ blocks }: Props) {
  // Split into the two body sections (mirrors GroupedIndex). filter() is a stable partition,
  // so the Studio orderRank is preserved within each group; `ordered` drives the hero index
  // and block numbering so the numbers stay consistent with the grouped body below.
  const alwaysBlocks = blocks.filter(b => ALWAYS_TIMINGS.has(b.timing || ''))
  const optionalBlocks = blocks.filter(b => !ALWAYS_TIMINGS.has(b.timing || ''))
  const ordered = [...alwaysBlocks, ...optionalBlocks]

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
                {ordered.map((b, i) => (
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

      <GroupedIndex blocks={blocks} />

      {blocks.length > 0 ? (
        <>
          {alwaysBlocks.length > 0 && (
            <>
              <SectionHeader
                variant="always"
                kicker="Inbegrepen — altijd actief"
                title="Wat we altijd voor je doen"
                subtitle="Deze activaties zetten we automatisch in voor elke partner. Je hoeft er niets voor aan te vragen."
              />
              {alwaysBlocks.map((block, i) => (
                <BlockSection key={block._id} block={block} index={i} />
              ))}
            </>
          )}
          {optionalBlocks.length > 0 && (
            <>
              <SectionHeader
                variant="optional"
                kicker="Op aanvraag — jij beslist"
                title="Wat je kan activeren op aanvraag"
                subtitle="Extra activaties die je samen met je account manager inschakelt wanneer ze passen bij jouw winkel en doelgroep."
              />
              {optionalBlocks.map((block, i) => (
                <BlockSection key={block._id} block={block} index={alwaysBlocks.length + i} />
              ))}
            </>
          )}
        </>
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
