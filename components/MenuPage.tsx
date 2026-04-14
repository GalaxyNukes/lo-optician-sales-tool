'use client'

import { useState } from 'react'
import { Logo } from './Logo'
import type { PartnerBlock } from './BrochurePage'
import styles from './MenuPage.module.css'

interface Props {
  blocks: PartnerBlock[]
}

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

function BudgetDisplay({ block }: { block: PartnerBlock }) {
  if (!block.budgetMin) return <span className={styles.budgetEmpty}>—</span>

  const isLabel = !block.budgetMax
  const range = isLabel ? block.budgetMin : `${block.budgetMin} – ${block.budgetMax}`
  const isFree = isLabel && (block.budgetMin === 'Inbegrepen' || block.budgetMin === 'Op kostprijs')

  return (
    <div className={styles.budgetWrap}>
      <span className={`${styles.budget} ${isFree ? styles.budgetFree : ''}`}>{range}</span>
      {block.budgetNote && <span className={styles.budgetNote}>{block.budgetNote}</span>}
    </div>
  )
}

export function MenuPage({ blocks }: Props) {
  const [printMode, setPrintMode] = useState(false)

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

      <div className={styles.sheet}>
        {/* Header */}
        <div className={styles.sheetHeader}>
          <Logo fill="#fff" height={20} />
          <div className={styles.sheetHeaderRight}>
            <div className={styles.sheetHeaderTitle}>Partner Activatie Overzicht</div>
            <div className={styles.sheetHeaderSub}>Account Manager Referentieblad — 2025</div>
          </div>
        </div>

        {/* Intro band */}
        <div className={styles.introBand}>
          <p className={styles.introText}>
            <strong>Wat wij voor jou doen</strong> — Volledig overzicht van alle campagnes, assets en activaties die wij als LensOnline voor jou inzetten, van onboarding tot community events.
          </p>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colActivatie}>Activatie</th>
                <th className={styles.colLevering}>Wat we leveren</th>
                <th className={styles.colTiming}>Timing</th>
                <th className={styles.colBudget}>Budget</th>
                <th className={styles.colImpact}>Impact</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => {
                const timingKey = block.timing || ''
                const timingClass = TIMING_CLASS[timingKey] || ''

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
                    <td><BudgetDisplay block={block} /></td>
                    <td className={styles.impactCell}><ImpactDots level={block.impactLevel} /></td>
                  </tr>
                )
              })}

              {blocks.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    Nog geen activatieblokken. Voeg ze toe via <a href="/studio" target="_blank">Studio → Partner Blocks</a>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
