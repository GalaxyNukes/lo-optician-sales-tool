'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Goal, Action, Need, Subject, Campaign } from './types'
import styles from './SummaryModal.module.css'

interface Props {
  clientName: string
  clientCity: string
  clientCountry: string
  selGoal: Goal | null
  selAction: Action | null
  customAction: string
  selNeeds: Need[]
  selSubjects: Subject[]
  selCampaigns: Campaign[]
  onRemove: (id: string) => void
  onClose: () => void
}

export function SummaryModal({
  clientName, clientCity, clientCountry,
  selGoal, selAction, customAction,
  selNeeds, selSubjects, selCampaigns,
  onRemove, onClose,
}: Props) {
  const [extraNote, setExtraNote] = useState('')

  const rows = [
    selGoal && { label: selGoal.label, cat: 'Doel' },
    selAction && { label: selAction.isCustom && customAction ? customAction : selAction.label, cat: 'Actie' },
    selNeeds.length && { label: selNeeds.map(n => n.label).join(', '), cat: 'Behoefte' },
    selSubjects.length && { label: selSubjects.map(s => s.label).join(', '), cat: 'Subjects' },
  ].filter(Boolean) as { label: string; cat: string }[]

  function openBriefingDoc() {
    const dateStr = new Date().toLocaleDateString('nl-BE', { day: '2-digit', month: 'long', year: 'numeric' })
    const assets = selCampaigns.map(c =>
      `<div class="doc-asset"><img src="${c.thumbnail}" alt="${c.title}"><div class="doc-asset-info"><strong>${c.title}</strong><span>${c.type} · ${c.visualStyle?.label || ''}</span></div></div>`
    ).join('')

    const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">
<title>Briefing — ${clientName}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#F3F0EC;color:#1A1612;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.wrap{max-width:800px;margin:2rem auto;padding:0 1.5rem 4rem}
.header{background:#0D2340;border-radius:14px;padding:2rem 2.5rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between}
.header-logo{display:flex;align-items:center}
.header-right{text-align:right}
.header-label{font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:.25rem}
.header-title{font-size:1.3rem;font-weight:700;color:#fff}
.header-date{font-size:.75rem;color:rgba(255,255,255,.5);margin-top:.3rem}
.client{background:#fff;border-radius:10px;padding:1.1rem 1.5rem;margin-bottom:1.25rem;display:flex;gap:2rem;border:1px solid #E0DDD6}
.ci{display:flex;flex-direction:column;gap:.18rem}
.ci-label{font-size:.6rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884}
.ci-val{font-size:.88rem;font-weight:600;color:#0D2340}
.section{background:#fff;border-radius:10px;margin-bottom:1.1rem;border:1px solid #E0DDD6;overflow:hidden}
.section-head{background:#F3F0EC;padding:.75rem 1.25rem;border-bottom:1px solid #E0DDD6;font-size:.62rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884}
.section-body{padding:1.1rem 1.25rem}
.meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
.mi{display:flex;flex-direction:column;gap:.2rem}
.mi-label{font-size:.6rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884}
.mi-val{font-size:.85rem;color:#1A1612;font-weight:500}
.timing{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;margin-top:1rem}
.timing-box{border:1px solid #E0DDD6;border-radius:8px;padding:.75rem 1rem}
.timing-label{font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:#888884;margin-bottom:.3rem;font-weight:600}
.timing-date{font-size:1rem;font-weight:600;color:#0D2340}
.doc-asset{display:flex;align-items:center;gap:.85rem;padding:.55rem 0;border-bottom:1px solid #E0DDD6}
.doc-asset:last-child{border-bottom:none}
.doc-asset img{width:54px;height:40px;object-fit:cover;border-radius:5px;border:1px solid #E0DDD6}
.doc-asset-info{display:flex;flex-direction:column;gap:.15rem}
.doc-asset-info strong{font-size:.83rem;color:#0D2340;font-weight:600}
.doc-asset-info span{font-size:.7rem;color:#888884}
.divider{height:1px;background:#E0DDD6;margin:.85rem 0}
.note{font-size:.83rem;color:#1A1612;line-height:1.65}
.footer{text-align:center;padding:1.5rem 0 .5rem;font-size:.7rem;color:#888884}
.print-btn{position:fixed;bottom:1.5rem;right:1.5rem;background:#0D2340;color:#fff;border:none;padding:.75rem 1.5rem;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(13,35,64,.25)}
.print-btn:hover{background:#0a1c33}
@media print{.print-btn{display:none}.wrap{margin:0;padding:0}}
</style></head><body>
<div class="wrap">
  <div class="header">
    <div class="header-logo">
      <svg viewBox="0 0 826.4 132.4" style="height:28px;width:auto;fill:white">
        <polygon points="403.1,120.6 403.1,120.6 403.1,120.6"/>
        <path d="M356.1,51c-1.2-3.3-3.1-6.3-5.6-9c-2.7-2.8-6.3-4.9-10.4-6.4c-4.3-1.5-9.2-2.2-14.8-2.2c-6.2,0-11.8,0.5-16.8,1.5c-5,1-9.4,2.5-13.5,4.4l-0.7,0.3l-2,0.9l0,81.1l22.3,0V52.2c1-0.3,1.9-0.6,2.8-0.8c1.6-0.3,4-0.6,7-0.5c2.7,0,4.7,0.4,6.1,0.9c1.6,0.6,2.5,1.4,3.1,2.1c0.8,1,1.3,1.9,1.6,3c0.4,1.3,0.5,2.7,0.5,4.4l0,60.3h22.3l0-60.6C357.8,57.6,357.2,54.2,356.1,51z"/>
        <path d="M416.6,79.6c-1.7-2.5-4-4.7-6.8-6.6c-2.7-1.9-5.9-3.5-9.5-4.9l-0.1-0.1l-0.2-0.1c-3.9-1.5-6.7-3.1-8.4-4.6c-0.7-0.7-1.1-1.2-1.4-1.9c-0.3-0.7-0.5-1.5-0.5-2.6c0-1.2,0.2-2.2,0.5-3.1c0.3-0.9,0.8-1.6,1.6-2.4c0.6-0.7,1.3-1.1,2.3-1.5c1-0.4,2.2-0.6,3.9-0.6c2.2,0,4,0.4,5.6,1c1.9,0.7,3.4,1.6,4.5,2.4l4.7,3.6l7.2-16.6l-3.2-2.2c-2.7-1.8-5.8-3.2-9.2-4.4c-3.6-1.2-7.4-1.7-11.5-1.7h-0.1c-3.9,0-7.6,0.6-11,1.8c-3.4,1.2-6.4,3.1-9,5.6c-2.5,2.4-4.5,5.3-5.8,8.4c-1.3,3.1-2,6.5-2,10v0.1c0,2.5,0.3,4.9,0.8,7.2c0.6,2.5,1.7,5,3.2,7.2c1.6,2.5,3.9,4.7,6.6,6.7c2.8,2.1,6.2,3.8,10,5.3c4.1,1.6,7,3.3,8.4,4.7c0.6,0.6,1,1.2,1.3,2c0.3,0.8,0.5,1.9,0.5,3.2c0,1.4-0.2,2.5-0.6,3.5c-0.4,1-1,1.8-1.9,2.7c-0.9,0.9-1.9,1.4-3,1.9c-1.1,0.4-2.5,0.7-4.2,0.7c-2.8,0-5.2-0.4-7.3-1.1c-2.3-0.8-3.9-1.7-4.8-2.4l-4.9-4l-7.2,17.4l2.8,2.2c2.7,2.1,6.1,3.6,10,4.7c3.9,1.1,8.2,1.6,12.7,1.6c4.3,0,8.5-0.7,12.3-2.2c3.7-1.4,7-3.4,9.8-6c2.7-2.5,4.8-5.4,6.3-8.7c1.5-3.3,2.3-6.8,2.3-10.3v-0.2C421.5,89.7,419.9,84.2,416.6,79.6z"/>
        <polygon points="178.8,13.4 156.5,13.4 156.5,121.7 208.9,121.7 208.9,103.7 178.8,103.7"/>
        <path d="M282,76.3c0-6.8-0.7-12.8-2.1-18.1c-1.4-5.3-3.6-9.9-6.7-13.7c-3-3.7-6.7-6.5-11-8.4c-4.3-1.9-9.1-2.7-14.3-2.7h-0.1c-5.3,0-10.2,1-14.6,3c-4.5,2-8.3,5.1-11.6,9c-3.3,4-5.7,8.8-7.3,14.3c-1.6,5.5-2.3,11.5-2.3,18.3v0.1c0,7,0.8,13.3,2.6,18.9c1.7,5.6,4.4,10.4,8,14.4c3.6,3.9,7.8,6.9,12.6,8.8c4.8,1.9,10.2,2.9,15.9,2.9h0.1c5.3,0,10.2-0.6,14.6-1.7c4.3-1.1,8-2.5,11.1-4.3l0.9-0.6l2.5-1.5L273.7,98l-4.7,2.7c-1.8,1.1-4.2,2.1-7.1,2.8c-2.7,0.7-6,1.1-9.7,1.1c-3.2,0-5.9-0.6-8.1-1.6c-2.3-1-4.1-2.4-5.8-4.5c-1.5-1.8-2.8-4.5-3.8-8c-0.7-2.7-1.2-5.9-1.5-9.6l49,0V76.3z M234,64.1c0.4-1.6,0.8-3.1,1.3-4.3c0.9-2.3,1.9-4,3-5.3c1.3-1.5,2.7-2.5,4.1-3.2c1.5-0.7,3.1-1,5-1c2.3,0,4.1,0.4,5.6,1c1.5,0.7,2.8,1.6,4,3.1c1,1.2,1.9,2.9,2.6,5.1c0.4,1.3,0.7,2.9,1,4.6L234,64.1z"/>
        <path d="M497.7,29.3c-3-5.1-7-9.2-11.9-12.1c-5-3-10.8-4.5-17.4-4.4c-6.4,0-12.3,1.5-17.3,4.4c-4.9,2.9-8.9,7-11.9,12.1c-2.9,5-5.1,10.8-6.4,17.3c-1.4,6.4-2,13.4-2,20.9c0,7.5,0.7,14.5,2,21c1.4,6.5,3.5,12.3,6.5,17.4c3,5.1,7,9.2,11.9,12c4.9,2.9,10.8,4.4,17.2,4.4c6.5,0,12.4-1.4,17.3-4.4c4.9-2.9,8.9-6.9,11.9-12c3-5,5.2-10.8,6.5-17.4c1.3-6.5,2-13.5,2-21c0-7.5-0.7-14.5-2-20.9C502.8,40.1,500.7,34.4,497.7,29.3z M490.2,83.7c-0.7,5-2,9.4-3.7,13.4c-1.7,3.8-4,6.7-7,8.9c-1.4,1.1-3,1.8-4.9,2.4c-1.8,0.5-3.9,0.8-6.2,0.8c-2.3,0-4.4-0.3-6.2-0.8c-1.8-0.5-3.4-1.3-4.8-2.4c-3-2.2-5.3-5.1-6.9-9c-1.7-4-3-8.5-3.7-13.4c-0.7-5-1.1-10.4-1.1-16.2c0-5.7,0.4-11.1,1.2-16.2c0.8-5,2.1-9.6,3.9-13.6c1.8-3.9,4.1-6.9,7-9.1c1.4-1.1,2.9-1.8,4.7-2.4c1.7-0.5,3.7-0.8,5.9-0.8c2.2,0,4.2,0.3,5.9,0.8c1.8,0.5,3.3,1.3,4.7,2.4c3,2.2,5.3,5.2,7.1,9c1.8,4,3.1,8.5,3.9,13.5c0.8,5.1,1.2,10.6,1.2,16.4C491.3,73.2,491,78.7,490.2,83.7z"/>
        <g>
          <path d="M122.9,32.8C111.5,13.6,90.6,0.7,66.6,0.7C32.7,0.7,4.9,26.4,1.4,59.3C25.3,46.7,57.2,29,88,29C99.6,29,111.2,30,122.9,32.8z"/>
          <path d="M8.9,97.2c11.1,20.5,32.7,34.5,57.7,34.5c17.2,0,32.8-6.6,44.5-17.4C80.5,94.9,55.2,88.7,8.9,97.2z"/>
          <path d="M132.1,64.3c-5.6-3-34.1-17.4-63.6-17.4c-32.1,0-62.5,16.6-67.3,19.3c0,0.1,0,9.2,0,9.3c7-2,42.5-9.9,62-9.9c23.5,0,40.9,5.5,56.6,13.6c4.5-8.9,7.1-19,7.1-29.6C132.1,65.6,132.1,64.9,132.1,64.3z"/>
        </g>
      </svg>
    </div>
    <div class="header-right">
      <div class="header-label">Campagne briefing</div>
      <div class="header-title">${clientName || 'Onbekend'}</div>
      <div class="header-date">Aangemaakt op ${dateStr}</div>
    </div>
  </div>

  <div class="client">
    <div class="ci"><span class="ci-label">Naam winkel</span><span class="ci-val">${clientName || '—'}</span></div>
    <div class="ci"><span class="ci-label">Stad</span><span class="ci-val">${clientCity || '—'}</span></div>
    <div class="ci"><span class="ci-label">Land</span><span class="ci-val">${clientCountry || '—'}</span></div>
  </div>

  <div class="section">
    <div class="section-head">Campagne context</div>
    <div class="section-body">
      <div class="meta-grid">
        <div class="mi"><span class="mi-label">Doel</span><span class="mi-val">${selGoal?.label || '—'}</span></div>
        <div class="mi"><span class="mi-label">Actie</span><span class="mi-val">${selAction?.isCustom && customAction ? customAction : selAction?.label || '—'}</span></div>
        <div class="mi"><span class="mi-label">Behoefte</span><span class="mi-val">${selNeeds.map(n => n.label).join(', ') || '—'}</span></div>
      </div>
    </div>
  </div>

  ${selCampaigns.length ? `
  <div class="section">
    <div class="section-head">Gekozen assets (${selCampaigns.length})</div>
    <div class="section-body">${assets}</div>
  </div>` : ''}

  ${extraNote ? `
  <div class="section">
    <div class="section-head">Extra opmerkingen</div>
    <div class="section-body"><p class="note">${extraNote}</p></div>
  </div>` : ''}

  <div class="footer">Gegenereerd via LensOnline Campaign Catalog · marketing@lensonline.nl</div>
</div>
<button class="print-btn" onclick="window.print()">Afdrukken / Opslaan als PDF →</button>
</body></html>`

    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  return (
    <div className={styles.bg} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Jouw campagnepakket</div>
            <div className={styles.sub}>{selCampaigns.length} asset{selCampaigns.length !== 1 ? 's' : ''} geselecteerd</div>
            {clientName && <div className={styles.client}>{clientName}{clientCity ? `, ${clientCity}` : ''}{clientCountry ? ` — ${clientCountry}` : ''}</div>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Campagne filters */}
          <div className={styles.sectionLabel}>Campagne & filters</div>
          <div className={styles.rows}>
            {rows.map((r, i) => (
              <div key={i} className={styles.row}>
                <div className={styles.dot} />
                <span className={styles.rowText}>{r.label}</span>
                <span className={styles.rowCat}>{r.cat}</span>
              </div>
            ))}
            {rows.length === 0 && <div className={styles.empty}>Geen filters geselecteerd.</div>}
          </div>

          <div className={styles.divider} />

          {/* Assets */}
          <div className={styles.sectionLabel}>Geselecteerde assets</div>
          <div className={styles.assets}>
            {selCampaigns.map(c => (
              <div key={c._id} className={styles.asset}>
                <div className={styles.assetImg}>
                  <Image src={c.thumbnail || `https://picsum.photos/seed/${c._id}/400/260`} alt={c.title} fill sizes="50px" style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.assetInfo}>
                  <div className={styles.assetTitle}>{c.title}</div>
                  <div className={styles.assetType}>{c.type} · {c.visualStyle?.label || ''}</div>
                </div>
                <button className={styles.removeBtn} onClick={() => onRemove(c._id)}>✕ Verwijder</button>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          {/* Extra note */}
          <div className={styles.sectionLabel}>
            Extra opmerkingen <span className={styles.optional}>(optioneel)</span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder="Voeg hier eventuele extra opmerkingen, wensen of context toe voor het marketingteam..."
            value={extraNote}
            onChange={e => setExtraNote(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.secBtn} onClick={onClose}>Aanpassen</button>
          <button className={styles.priBtn} onClick={openBriefingDoc}>Briefing genereren →</button>
        </div>
      </div>
    </div>
  )
}
