'use client'

import { useState } from 'react'
import { Logo } from './Logo'
import type { PartnerBlock, CategoryValues } from './BrochurePage'
import { isAlwaysBlock } from './BrochurePage'
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

const CAT_LABELS: Record<Cat, string> = { a: 'Categorie A', b: 'Categorie B', c: 'Categorie C' }

// Compare view: column order + the two off-white row tints for the category columns
// (Activatie/Effort stay white). A row "differs" when availability isn't the same
// across the compared tiers.
const CMP_ORDER: Cat[] = ['a', 'b', 'c']
const CMP_TIER_BEIGE = 'var(--surface)'
const CMP_TIER_LIGHT = 'var(--bg)'

function cmpAvailabilityDiffers(tiers: Cat[], block: PartnerBlock): boolean {
  const avail = tiers.map((t) => visibleInCategory(t, block))
  return new Set(avail).size > 1
}

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
              <th className={styles.colImpact}>Effort</th>
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

function CompareTable({ title, blocks, tiers }: { title: string; blocks: PartnerBlock[]; tiers: Cat[] }) {
  if (blocks.length === 0) return null

  return (
    <div className={styles.tableSection}>
      <div className={styles.tableSectionTitle}>{title}</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colActivatie}>Activatie</th>
              <th className={styles.colImpact}>Effort</th>
              {tiers.map((t) => (
                <th key={t} className={styles.colCompare}>{CAT_LABELS[t]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blocks.map((block, ri) => {
              const tint = ri % 2 === 1 ? CMP_TIER_BEIGE : CMP_TIER_LIGHT
              return (
                <tr key={block._id}>
                  <td>
                    <div className={styles.blockName}>{block.title}</div>
                    {block.subtitle && <div className={styles.blockSub}>{block.subtitle}</div>}
                    {block.warning && <div className={styles.blockWarning}>{block.warning}</div>}
                  </td>
                  <td className={styles.impactCell}><ImpactDots level={block.impactLevel} /></td>
                  {tiers.map((t) => {
                    const avail = visibleInCategory(t, block)
                    const v = categoryValues(t, block)
                    const budget = v.budgetMin ? (v.budgetMax ? `${v.budgetMin} – ${v.budgetMax}` : v.budgetMin) : null
                    return (
                      <td key={t} style={{ background: tint }}>
                        {avail ? (
                          <div className={styles.cmpCell}>
                            <span className={styles.cmpYes}>✓</span>
                            {budget && <span className={styles.budget}>{budget}</span>}
                          </div>
                        ) : (
                          <span className={styles.cmpNo}>— niet inbegrepen</span>
                        )}
                      </td>
                    )
                  })}
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
  const [compare, setCompare] = useState(initialCategorie === 'compare')
  const [cmpTiers, setCmpTiers] = useState<Record<Cat, boolean>>({ a: true, b: true, c: true })
  const [onlyDiff, setOnlyDiff] = useState(false)
  const [printMode, setPrintMode] = useState(false)

  const selectCat = (next: Cat) => {
    setCompare(false)
    setCat(next)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `?categorie=${next}`)
  }
  const selectCompare = () => {
    setCompare(true)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `?categorie=compare`)
  }
  const toggleCmpTier = (t: Cat) => {
    setCmpTiers((prev) => {
      const activeCount = CMP_ORDER.filter((x) => prev[x]).length
      if (prev[t] && activeCount <= 2) return prev // keep at least two tiers in the comparison
      return { ...prev, [t]: !prev[t] }
    })
  }

  const visible = blocks.filter((block) => visibleInCategory(cat, block))
  const alwaysBlocks = visible.filter(isAlwaysBlock)
  const optionalBlocks = visible.filter((block) => !isAlwaysBlock(block))

  const activeCmpTiers = CMP_ORDER.filter((t) => cmpTiers[t])
  const cmpVisible = blocks.filter((block) => activeCmpTiers.some((t) => visibleInCategory(t, block)))
  const cmpFilter = (b: PartnerBlock) => !onlyDiff || cmpAvailabilityDiffers(activeCmpTiers, b)
  const cmpAlways = cmpVisible.filter(isAlwaysBlock).filter(cmpFilter)
  const cmpOptional = cmpVisible.filter((b) => !isAlwaysBlock(b)).filter(cmpFilter)

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
              aria-selected={!compare && cat === c}
              className={`${styles.tab} ${!compare && cat === c ? styles.tabOn : ''}`}
              onClick={() => selectCat(c)}
            >
              {CAT_LABELS[c]}
            </button>
          ))}
          <button
            role="tab"
            aria-selected={compare}
            className={`${styles.tab} ${compare ? styles.tabOn : ''}`}
            onClick={selectCompare}
          >
            Vergelijken
          </button>
        </div>
      )}

      <div className={styles.sheet}>
        {/* Header */}
        <div className={styles.sheetHeader}>
          <Logo fill="#fff" height={20} />
          <div className={styles.sheetHeaderRight}>
            <div className={styles.sheetHeaderTitle}>Partner Activatie Overzicht — {compare ? 'Vergelijking' : CAT_LABELS[cat]}</div>
            <div className={styles.sheetHeaderSub}>Account Manager Referentieblad — 2025</div>
          </div>
        </div>

        {/* Intro band */}
        <div className={styles.introBand}>
          <p className={styles.introText}>
            <strong>Wat wij voor jou doen</strong> — Volledig overzicht van alle campagnes, assets en activaties die wij als LensOnline voor jou inzetten, van onboarding tot community events.
          </p>
        </div>

        {/* Tables — single category, or the side-by-side comparison */}
        {compare ? (
          <>
            <div className={styles.cmpControls}>
              <div className={styles.cmpPicker}>
                <span className={styles.cmpPickerLabel}>Vergelijk:</span>
                {CMP_ORDER.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={cmpTiers[t]}
                    className={`${styles.cmpChip} ${cmpTiers[t] ? styles.cmpChipOn : ''}`}
                    onClick={() => toggleCmpTier(t)}
                  >
                    {CAT_LABELS[t]}
                  </button>
                ))}
              </div>
              <label className={styles.cmpToggle}>
                <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} />
                Toon enkel verschillen
              </label>
            </div>
            <div className={styles.cmpState}>
              Je vergelijkt {activeCmpTiers.length} categorieën: {activeCmpTiers.map((t) => CAT_LABELS[t]).join(' · ')}
            </div>
            {cmpVisible.length === 0 ? (
              <div className={styles.cmpEmpty}>
                Nog geen activatieblokken. Voeg ze toe via <a href="/studio" target="_blank">Studio → Partner Blocks</a>.
              </div>
            ) : cmpAlways.length === 0 && cmpOptional.length === 0 ? (
              <div className={styles.cmpEmpty}>Geen verschillen tussen de gekozen categorieën.</div>
            ) : (
              <>
                <CompareTable title="Wat we altijd voor je doen" blocks={cmpAlways} tiers={activeCmpTiers} />
                <CompareTable title="Wat je kan activeren" blocks={cmpOptional} tiers={activeCmpTiers} />
              </>
            )}
          </>
        ) : visible.length === 0 ? (
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
            <span>= Maximale effort</span>
          </div>
          {compare ? (
            <>
              <div className={styles.legendItem}>
                <span className={styles.cmpYes}>✓</span>
                <span>= Inbegrepen</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.cmpNo}>—</span>
                <span>= Niet inbegrepen</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.legendItem}>
                <span className={`${styles.timingChip} ${styles.timingAlways}`}>Always-on</span>
                <span>= Automatisch actief</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.timingChip} ${styles.timingCond}`}>Conditioneel</span>
                <span>= Vereist actie of badge</span>
              </div>
            </>
          )}
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
