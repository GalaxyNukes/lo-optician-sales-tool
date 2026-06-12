'use client'

import { useState } from 'react'
import { Logo } from './Logo'
import type { PartnerBlock, CategoryValues } from './BrochurePage'
import styles from './MenuPage.module.css'

type Cat = 'a' | 'b' | 'c'

const TIMING_LABELS: Record<string, string> = {
  always:      'Always-on',
  start:       'Bij start',
  seasonal:    'Seizoens­gebonden',
  conditional: 'Conditioneel',
  request:     'Op aanvraag',
  ongoing:     'Doorlopend',
}

const TIMING_CLASS: Record<string, string> = {
  always:      'timingAlways',
  start:       'timingStart',
  seasonal:    'timingAlways',
  conditional: 'timingCond',
  request:     'timingCond',
  ongoing:     'timingAlways',
}

const ALWAYS_TIMINGS = new Set(['always', 'ongoing', 'seasonal'])

const CAT_LABELS: Record<Cat, string> = { a: 'Categorie A', b: 'Categorie B', c: 'Categorie C' }

function normCat(value?: string): Cat {
  return value === 'a' || value === 'b' ? value : 'c'
}

// Cascade visibility: A sees everything, B sees B+C, C sees only C.
function visibleInCategory(cat: Cat, block: PartnerBlock): boolean {
  const mc = block.minCategory || 'C'
  if (cat === 'a') return true
  if (cat === 'b') return mc === 'B' || mc === 'C'
  return mc === 'C'
}

// Per-category budget + running time, falling back to legacy flat budget until the
// A/B/C migration has run (so the menu never looks empty mid-transition).
function categoryValues(cat: Cat, block: PartnerBlock): CategoryValues {
  const obj = cat === 'a' ? block.categoryA : cat === 'b' ? block.categoryB : block.categoryC
  return {
    budgetMin: obj?.budgetMin ?? block.budgetMin,
    budgetMax: obj?.budgetMax ?? block.budgetMax,
    budgetNote: obj?.budgetNote ?? block.budgetNote,
    runningTime: obj?.runningTime,
  }
}

function ImpactDots({ level }: { level?: number }) {
  const filled = Math.min(Math.max(level || 0, 0), 5)
  return (
    <div className={styles.dots}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`${styles.dot} ${i < filled ? styles.dotOn : ''}`} />
      ))}
    </div>
  )
}

function BudgetDisplay({ values }: { values: CategoryValues }) {
  if (!values.budgetMin) return <span className={styles.budgetEmpty}>—</span>

  const isLabel = !values.budgetMax
  const range = isLabel ? values.budgetMin : `${values.budgetMin} – ${values.budgetMax}`
  const isFree = isLabel && (values.budgetMin === 'Inbegrepen' || values.budgetMin === 'Op kostprijs')

  return (
    <div className={styles.budgetWrap}>
      <span className={`${styles.budget} ${isFree ? styles.budgetFree : ''}`}>{range}</span>
      {values.budgetNote && <span className={styles.budgetNote}>{values.budgetNote}</span>}
    </div>
  )
}

function BlockTable({ title, blocks, cat }: { title: string; blocks: PartnerBlock[]; cat: Cat }) {
  if (blocks.length === 0) return null

  return (
    <div className={styles.tableSection}>
      <div className={styles.tableSectionTitle}>{title}</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colActivatie}>Activatie</th>
              <th className={styles.colLevering}>Wat we leveren</th>
              <th className={styles.colTiming}>Timing</th>
              <th className={styles.colLooptijd}>Looptijd</th>
              <th className={styles.colBudget}>Budget</th>
              <th className={styles.colImpact}>Impact</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => {
              const timingKey = block.timing || ''
              const timingClass = TIMING_CLASS[timingKey] || ''
              const values = categoryValues(cat, block)

              return (
                <tr key={block._id}>
                  <td>
                    <div className={styles.blockName}>{block.title}</div>
                    {block.subtitle && <div className={styles.blockSub}>{block.subtitle}</div>}
                    {block.warning && <div className={styles.blockWarning}>{block.warning}</div>}
                  </td>
                  <td>
                    <div className={styles.tagsWrap}>
                      {(block.deliverables || []).map((d, i) => (
                        <span key={i} className={styles.tag}>{d}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {timingKey && (
                      <span className={`${styles.timingChip} ${styles[timingClass]}`}>
                        {TIMING_LABELS[timingKey]}
                      </span>
                    )}
                  </td>
                  <td><span className={styles.runningTime}>{values.runningTime || '—'}</span></td>
                  <td><BudgetDisplay values={values} /></td>
                  <td className={styles.impactCell}><ImpactDots level={block.impactLevel} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function MenuPage({ blocks, initialCategorie }: { blocks: PartnerBlock[]; initialCategorie?: string }) {
  const [cat, setCat] = useState<Cat>(normCat(initialCategorie))
  const [printMode, setPrintMode] = useState(false)

  const selectCat = (next: Cat) => {
    setCat(next)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `?categorie=${next}`)
  }

  const visible = blocks.filter((block) => visibleInCategory(cat, block))
  const alwaysBlocks = visible.filter((block) => ALWAYS_TIMINGS.has(block.timing || ''))
  const optionalBlocks = visible.filter((block) => !ALWAYS_TIMINGS.has(block.timing || ''))

  return (
    <div className={`${styles.root} ${printMode ? styles.printMode : ''}`}>
      {!printMode && (
        <div className={styles.toolbar}>
          <div>
            <h2 className={styles.toolbarTitle}>Activatiemenu — Account Manager Referentieblad</h2>
            <p className={styles.toolbarSub}>Print of exporteer als PDF voor gebruik tijdens partnerbezoeken</p>
          </div>
          <button className={styles.printBtn} onClick={() => { setPrintMode(true); setTimeout(() => window.print(), 150) }}>
            Afdrukken / PDF →
          </button>
        </div>
      )}

      {!printMode && (
        <div className={styles.tabs} role="tablist">
          {(['a', 'b', 'c'] as Cat[]).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              className={`${styles.tab} ${cat === c ? styles.tabOn : ''}`}
              onClick={() => selectCat(c)}
            >
              {CAT_LABELS[c]}
            </button>
          ))}
        </div>
      )}

      <div className={styles.sheet}>
        {/* Header */}
        <div className={styles.sheetHeader}>
          <Logo fill="#fff" height={20} />
          <div className={styles.sheetHeaderRight}>
            <div className={styles.sheetHeaderTitle}>Partner Activatie Overzicht — {CAT_LABELS[cat]}</div>
            <div className={styles.sheetHeaderSub}>Account Manager Referentieblad — 2025</div>
          </div>
        </div>

        {/* Intro band */}
        <div className={styles.introBand}>
          <p className={styles.introText}>
            <strong>Wat wij voor jou doen</strong> — Volledig overzicht van alle campagnes, assets en activaties die wij als LensOnline voor jou inzetten, van onboarding tot community events.
          </p>
        </div>

        {/* Tables — only the active category renders, so the print is a single sheet */}
        {visible.length === 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    Nog geen activatieblokken in deze categorie. Voeg ze toe via <a href="/studio" target="_blank">Studio → Partner Blocks</a>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <BlockTable title="Wat we altijd voor je doen" blocks={alwaysBlocks} cat={cat} />
            <BlockTable title="Wat je kan activeren" blocks={optionalBlocks} cat={cat} />
          </>
        )}

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <ImpactDots level={5} />
            <span>= Maximale impact</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.timingChip} ${styles.timingAlways}`}>Always-on</span>
            <span>= Automatisch actief</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.timingChip} ${styles.timingCond}`}>Conditioneel</span>
            <span>= Vereist actie of badge</span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.sheetFooter}>
          <span className={styles.footerLeft}>© 2025 LensOnline — Vertrouwelijke partnerinformatie</span>
          <span className={styles.footerRight}>lensonline.be/partner</span>
        </div>
      </div>
    </div>
  )
}
