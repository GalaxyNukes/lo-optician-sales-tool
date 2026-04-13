'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Goal, Action, Need, Subject, Campaign } from './types'
import { BLOCK_META } from './types'
import type { CampaignBriefing, SharedBriefingFields } from './CampaignCatalog'
import styles from './SummaryModal.module.css'

const ACCENTS = ['#0D2340','#1A6B4A','#8B3A2A','#2A4E8B','#6B2A8B','#8B6B2A','#2A6B6B']

interface Props {
  clientName: string; clientCity: string; clientCountry: string
  selGoal: Goal | null; selAction: Action | null; customAction: string
  selNeeds: Need[]; selSubjects: Subject[]
  selCampaigns: Campaign[]
  campaignBriefings: CampaignBriefing[]
  sharedFields: SharedBriefingFields
  onRemove: (id: string) => void
  onClose: () => void
}

// Collect readable field values from a briefing instance
function collectFields(inst: { typeId: string; data: Record<string, string | string[]> }) {
  const fields: { label: string; value: string }[] = []
  const d = inst.data
  const str = (k: string) => (d[k] as string) || ''
  const arr = (k: string) => (d[k] as string[]) || []
  if (inst.typeId === 'af-print') {
    if (str('paper')) fields.push({ label: 'Papierformaat', value: str('paper') })
    if (str('qty'))   fields.push({ label: 'Oplage', value: str('qty') })
  }
  if (inst.typeId === 'af-social' && arr('platforms').length) fields.push({ label: 'Platformen', value: arr('platforms').join(', ') })
  if (inst.typeId === 'af-banner') {
    if (str('material')) fields.push({ label: 'Materiaal', value: str('material') })
    if (str('banW') && str('banH')) fields.push({ label: 'Formaat', value: `${str('banW')} × ${str('banH')} cm` })
  }
  if (inst.typeId === 'af-email') {
    if (str('platform')) fields.push({ label: 'Platform', value: str('platform') })
    if (str('type'))     fields.push({ label: 'Type', value: str('type') })
  }
  if (inst.typeId === 'af-video') {
    if (str('vtype')) fields.push({ label: 'Type', value: str('vtype') })
    if (str('vlen'))  fields.push({ label: 'Duur', value: str('vlen') })
    if (str('vref'))  fields.push({ label: 'Referentie', value: str('vref') })
  }
  if (inst.typeId === 'af-sticker') {
    if (str('winW') && str('winH')) fields.push({ label: 'Raam', value: `${str('winW')} × ${str('winH')} cm` })
    if (str('doorW') && str('doorH')) fields.push({ label: 'Deur', value: `${str('doorW')} × ${str('doorH')} cm` })
    if (str('notes')) fields.push({ label: 'Opmerkingen', value: str('notes') })
  }
  if (inst.typeId === 'af-landing') {
    if (str('website')) fields.push({ label: 'URL', value: str('website') })
    if (str('domain'))  fields.push({ label: 'Subpagina', value: str('domain') })
  }
  return fields
}

export function SummaryModal({
  clientName, clientCity, clientCountry,
  selGoal, selAction, customAction, selNeeds, selSubjects,
  selCampaigns, campaignBriefings, sharedFields,
  onRemove, onClose,
}: Props) {
  const [extraNote, setExtraNote] = useState('')
  const sf = sharedFields

  const rows = [
    selGoal && { label: selGoal.label, cat: 'Doel' },
    selAction && { label: selAction.isCustom && customAction ? customAction : selAction.label, cat: 'Actie' },
    selNeeds.length && { label: selNeeds.map(n => n.label).join(', '), cat: 'Behoefte' },
    selSubjects.length && { label: selSubjects.map(s => s.label).join(', '), cat: 'Subjects' },
    sf.deadline && { label: sf.deadline, cat: 'Deadline' },
    sf.liveDate && { label: sf.liveDate, cat: 'Live datum' },
    sf.desc4    && { label: sf.desc4,    cat: 'Omschrijving' },
  ].filter(Boolean) as { label: string; cat: string }[]

  function openBriefingDoc() {
    const dateStr = new Date().toLocaleDateString('nl-BE', { day: '2-digit', month: 'long', year: 'numeric' })

    // Build per-campaign HTML sections
    const campaignSections = selCampaigns.map((c, i) => {
      const briefing = campaignBriefings.find(b => b.campaignId === c._id)
      const accent = ACCENTS[i % ACCENTS.length]
      const blocksHtml = briefing?.instances.map(inst => {
        const meta = BLOCK_META[inst.typeId]
        if (!meta) return ''
        const fields = collectFields(inst)
        const fieldsHtml = fields.length
          ? fields.map(f => `<tr><td class="doc-lbl">${f.label}</td><td class="doc-val">${f.value}</td></tr>`).join('')
          : '<tr><td colspan="2" class="doc-empty">Geen aanvullende details opgegeven</td></tr>'
        return `<div class="block">
          <div class="block-head" style="background:${accent}">
            <span class="block-icon">${meta.icon}</span> ${meta.title}
          </div>
          <table class="block-table">${fieldsHtml}</table>
        </div>`
      }).join('') || '<div class="empty-blocks">Geen briefing blokken voor deze campagne.</div>'

      const formatsHtml = c.formats?.slice(0, 8).map(f => `<span class="fmt-tag">${f}</span>`).join('') || ''

      return `
      <div class="campaign-section" style="border-left:4px solid ${accent}">
        <div class="campaign-section-head">
          <div class="campaign-index" style="background:${accent}">${i + 1}</div>
          <div>
            <div class="campaign-type-badge">${c.type}</div>
            <div class="campaign-name">${c.title}</div>
            ${c.visualStyle ? `<div class="campaign-style">${c.visualStyle.label}</div>` : ''}
          </div>
          ${c.thumbnail ? `<img class="campaign-thumb" src="${c.thumbnail}" alt="${c.title}">` : ''}
        </div>
        ${c.formats?.length ? `<div class="formats-row">${formatsHtml}</div>` : ''}
        <div class="blocks-list">${blocksHtml}</div>
      </div>`
    }).join('')

    const logoSvg = `<svg viewBox="0 0 826.4 132.4" style="height:26px;fill:white;display:block"><polygon points="403.1,120.6 403.1,120.6 403.1,120.6"/><path d="M356.1,51c-1.2-3.3-3.1-6.3-5.6-9c-2.7-2.8-6.3-4.9-10.4-6.4c-4.3-1.5-9.2-2.2-14.8-2.2c-6.2,0-11.8,0.5-16.8,1.5c-5,1-9.4,2.5-13.5,4.4l-0.7,0.3l-2,0.9l0,81.1l22.3,0V52.2c1-0.3,1.9-0.6,2.8-0.8c1.6-0.3,4-0.6,7-0.5c2.7,0,4.7,0.4,6.1,0.9c1.6,0.6,2.5,1.4,3.1,2.1c0.8,1,1.3,1.9,1.6,3c0.4,1.3,0.5,2.7,0.5,4.4l0,60.3h22.3l0-60.6C357.8,57.6,357.2,54.2,356.1,51z"/><path d="M416.6,79.6c-1.7-2.5-4-4.7-6.8-6.6c-2.7-1.9-5.9-3.5-9.5-4.9l-0.1-0.1l-0.2-0.1c-3.9-1.5-6.7-3.1-8.4-4.6c-0.7-0.7-1.1-1.2-1.4-1.9c-0.3-0.7-0.5-1.5-0.5-2.6c0-1.2,0.2-2.2,0.5-3.1c0.3-0.9,0.8-1.6,1.6-2.4c0.6-0.7,1.3-1.1,2.3-1.5c1-0.4,2.2-0.6,3.9-0.6c2.2,0,4,0.4,5.6,1c1.9,0.7,3.4,1.6,4.5,2.4l4.7,3.6l7.2-16.6l-3.2-2.2c-2.7-1.8-5.8-3.2-9.2-4.4c-3.6-1.2-7.4-1.7-11.5-1.7h-0.1c-3.9,0-7.6,0.6-11,1.8c-3.4,1.2-6.4,3.1-9,5.6c-2.5,2.4-4.5,5.3-5.8,8.4c-1.3,3.1-2,6.5-2,10v0.1c0,2.5,0.3,4.9,0.8,7.2c0.6,2.5,1.7,5,3.2,7.2c1.6,2.5,3.9,4.7,6.6,6.7c2.8,2.1,6.2,3.8,10,5.3c4.1,1.6,7,3.3,8.4,4.7c0.6,0.6,1,1.2,1.3,2c0.3,0.8,0.5,1.9,0.5,3.2c0,1.4-0.2,2.5-0.6,3.5c-0.4,1-1,1.8-1.9,2.7c-0.9,0.9-1.9,1.4-3,1.9c-1.1,0.4-2.5,0.7-4.2,0.7c-2.8,0-5.2-0.4-7.3-1.1c-2.3-0.8-3.9-1.7-4.8-2.4l-4.9-4l-7.2,17.4l2.8,2.2c2.7,2.1,6.1,3.6,10,4.7c3.9,1.1,8.2,1.6,12.7,1.6c4.3,0,8.5-0.7,12.3-2.2c3.7-1.4,7-3.4,9.8-6c2.7-2.5,4.8-5.4,6.3-8.7c1.5-3.3,2.3-6.8,2.3-10.3v-0.2C421.5,89.7,419.9,84.2,416.6,79.6z"/><polygon points="178.8,13.4 156.5,13.4 156.5,121.7 208.9,121.7 208.9,103.7 178.8,103.7"/><path d="M282,76.3c0-6.8-0.7-12.8-2.1-18.1c-1.4-5.3-3.6-9.9-6.7-13.7c-3-3.7-6.7-6.5-11-8.4c-4.3-1.9-9.1-2.7-14.3-2.7h-0.1c-5.3,0-10.2,1-14.6,3c-4.5,2-8.3,5.1-11.6,9c-3.3,4-5.7,8.8-7.3,14.3c-1.6,5.5-2.3,11.5-2.3,18.3v0.1c0,7,0.8,13.3,2.6,18.9c1.7,5.6,4.4,10.4,8,14.4c3.6,3.9,7.8,6.9,12.6,8.8c4.8,1.9,10.2,2.9,15.9,2.9h0.1c5.3,0,10.2-0.6,14.6-1.7c4.3-1.1,8-2.5,11.1-4.3l0.9-0.6l2.5-1.5L273.7,98l-4.7,2.7c-1.8,1.1-4.2,2.1-7.1,2.8c-2.7,0.7-6,1.1-9.7,1.1c-3.2,0-5.9-0.6-8.1-1.6c-2.3-1-4.1-2.4-5.8-4.5c-1.5-1.8-2.8-4.5-3.8-8c-0.7-2.7-1.2-5.9-1.5-9.6l49,0V76.3z M234,64.1c0.4-1.6,0.8-3.1,1.3-4.3c0.9-2.3,1.9-4,3-5.3c1.3-1.5,2.7-2.5,4.1-3.2c1.5-0.7,3.1-1,5-1c2.3,0,4.1,0.4,5.6,1c1.5,0.7,2.8,1.6,4,3.1c1,1.2,1.9,2.9,2.6,5.1c0.4,1.3,0.7,2.9,1,4.6L234,64.1z"/><g><path d="M122.9,32.8C111.5,13.6,90.6,0.7,66.6,0.7C32.7,0.7,4.9,26.4,1.4,59.3C25.3,46.7,57.2,29,88,29C99.6,29,111.2,30,122.9,32.8z"/><path d="M8.9,97.2c11.1,20.5,32.7,34.5,57.7,34.5c17.2,0,32.8-6.6,44.5-17.4C80.5,94.9,55.2,88.7,8.9,97.2z"/><path d="M132.1,64.3c-5.6-3-34.1-17.4-63.6-17.4c-32.1,0-62.5,16.6-67.3,19.3c0,0.1,0,9.2,0,9.3c7-2,42.5-9.9,62-9.9c23.5,0,40.9,5.5,56.6,13.6c4.5-8.9,7.1-19,7.1-29.6C132.1,65.6,132.1,64.9,132.1,64.3z"/></g></svg>`

    const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">
<title>Briefing — ${clientName}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#F3F0EC;color:#1A1612;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.wrap{max-width:860px;margin:2rem auto;padding:0 1.5rem 4rem}
/* Header */
.doc-header{background:#0D2340;border-radius:14px;padding:2rem 2.5rem;margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between}
.doc-header-right{text-align:right}
.doc-label{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:.2rem}
.doc-title{font-size:1.35rem;font-weight:700;color:#fff}
.doc-date{font-size:.72rem;color:rgba(255,255,255,.45);margin-top:.25rem}
/* Client strip */
.client-strip{background:#fff;border-radius:10px;padding:1rem 1.4rem;margin-bottom:1.1rem;display:flex;gap:2.5rem;border:1px solid #E0DDD6}
.ci{display:flex;flex-direction:column;gap:.15rem}
.ci-label{font-size:.58rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884}
.ci-val{font-size:.88rem;font-weight:600;color:#0D2340}
/* Section */
.section{background:#fff;border-radius:10px;margin-bottom:1.1rem;border:1px solid #E0DDD6;overflow:hidden}
.section-head{background:#F3F0EC;padding:.7rem 1.25rem;border-bottom:1px solid #E0DDD6;font-size:.6rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884}
.section-body{padding:1.1rem 1.25rem}
/* Context grid */
.ctx-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem;margin-bottom:1rem}
.ctx-item{display:flex;flex-direction:column;gap:.18rem}
.ctx-label{font-size:.58rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#888884}
.ctx-val{font-size:.84rem;font-weight:500;color:#1A1612}
.ctx-val.big{font-size:.95rem;font-weight:600;color:#0D2340}
/* Timing */
.timing-row{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;margin-top:.85rem}
.timing-box{border:1px solid #E0DDD6;border-radius:8px;padding:.7rem 1rem}
.timing-label{font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:#888884;margin-bottom:.25rem;font-weight:600}
.timing-date{font-size:1rem;font-weight:700;color:#0D2340}
.divider{height:1px;background:#E0DDD6;margin:.85rem 0}
.note{font-size:.83rem;color:#1A1612;line-height:1.65}
/* Campaign sections */
.campaign-section{background:#fff;border-radius:10px;margin-bottom:1.1rem;overflow:hidden;border:1px solid #E0DDD6}
.campaign-section-head{display:flex;align-items:center;gap:1rem;padding:1.1rem 1.25rem;border-bottom:1px solid #E0DDD6}
.campaign-index{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:#fff;flex-shrink:0}
.campaign-type-badge{font-size:.58rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884;margin-bottom:.2rem}
.campaign-name{font-size:1rem;font-weight:700;color:#0D2340;line-height:1.2}
.campaign-style{font-size:.72rem;color:#888884;margin-top:.15rem}
.campaign-thumb{width:72px;height:52px;object-fit:cover;border-radius:7px;margin-left:auto;flex-shrink:0;border:1px solid #E0DDD6}
/* Formats */
.formats-row{display:flex;flex-wrap:wrap;gap:.3rem;padding:.75rem 1.25rem;border-bottom:1px solid #E0DDD6;background:#F9F8F6}
.fmt-tag{font-size:.7rem;padding:.22rem .6rem;border-radius:4px;background:#E8E4DC;color:#444}
/* Blocks */
.blocks-list{padding:1rem 1.25rem;display:flex;flex-direction:column;gap:.7rem}
.block{border:1px solid #E0DDD6;border-radius:8px;overflow:hidden}
.block-head{padding:.6rem .9rem;font-size:.82rem;font-weight:600;color:#fff;display:flex;align-items:center;gap:.45rem}
.block-icon{font-size:.95rem}
.block-table{width:100%;border-collapse:collapse}
.doc-lbl{font-size:.66rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#888884;padding:.45rem .9rem;width:120px;vertical-align:top;border-right:1px solid #E0DDD6;border-bottom:1px solid #F3F0EC}
.doc-val{font-size:.8rem;color:#1A1612;padding:.45rem .9rem;border-bottom:1px solid #F3F0EC;line-height:1.5}
.block-table tr:last-child .doc-lbl,.block-table tr:last-child .doc-val{border-bottom:none}
.doc-empty{font-size:.75rem;color:#888884;font-style:italic;padding:.6rem .9rem}
.empty-blocks{font-size:.75rem;color:#aaa;font-style:italic;padding:.5rem 0}
/* Footer */
.doc-footer{text-align:center;padding:1.5rem 0 .5rem;font-size:.7rem;color:#888884}
.print-btn{position:fixed;bottom:1.5rem;right:1.5rem;background:#0D2340;color:#fff;border:none;padding:.75rem 1.5rem;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(13,35,64,.25)}
@media print{.print-btn{display:none}.wrap{margin:0;padding:0}}
</style></head><body>
<div class="wrap">
  <div class="doc-header">
    <div>${logoSvg}</div>
    <div class="doc-header-right">
      <div class="doc-label">Campagne briefing</div>
      <div class="doc-title">${clientName || 'Onbekend'}</div>
      <div class="doc-date">Aangemaakt op ${dateStr}</div>
    </div>
  </div>

  <div class="client-strip">
    <div class="ci"><span class="ci-label">Naam winkel</span><span class="ci-val">${clientName || '—'}</span></div>
    <div class="ci"><span class="ci-label">Stad</span><span class="ci-val">${clientCity || '—'}</span></div>
    <div class="ci"><span class="ci-label">Land</span><span class="ci-val">${clientCountry || '—'}</span></div>
  </div>

  <div class="section">
    <div class="section-head">Campagne context</div>
    <div class="section-body">
      <div class="ctx-grid">
        <div class="ctx-item"><span class="ctx-label">Doel</span><span class="ctx-val big">${selGoal?.label || '—'}</span></div>
        <div class="ctx-item"><span class="ctx-label">Actie</span><span class="ctx-val">${selAction?.isCustom && customAction ? customAction : selAction?.label || '—'}</span></div>
        <div class="ctx-item"><span class="ctx-label">Behoefte</span><span class="ctx-val">${selNeeds.map(n => n.label).join(', ') || '—'}</span></div>
      </div>
      ${(sf.deadline || sf.liveDate) ? `<div class="timing-row">${sf.deadline ? `<div class="timing-box"><div class="timing-label">Deadline taak</div><div class="timing-date">${sf.deadline}</div></div>` : ''}${sf.liveDate ? `<div class="timing-box"><div class="timing-label">Live datum</div><div class="timing-date">${sf.liveDate}</div></div>` : ''}</div>` : ''}
      ${sf.desc4 ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">Omschrijving</span><p class="note" style="margin-top:.35rem">${sf.desc4}</p></div>` : ''}
      ${sf.bgInfo ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">Achtergrond</span><p class="note" style="margin-top:.35rem">${sf.bgInfo}</p></div>` : ''}
      ${sf.refUrl ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">Referentie</span><a href="${sf.refUrl}" style="font-size:.82rem;color:#0D2340">${sf.refUrl}</a></div>` : ''}
    </div>
  </div>

  <div class="section-head" style="background:#F3F0EC;border-radius:10px 10px 0 0;border:1px solid #E0DDD6;border-bottom:none;padding:.7rem 1.25rem;font-size:.6rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884;margin-bottom:0">
    Briefing per campagne (${selCampaigns.length})
  </div>
  ${campaignSections}

  ${extraNote ? `<div class="section"><div class="section-head">Extra opmerkingen</div><div class="section-body"><p class="note">${extraNote}</p></div></div>` : ''}
  <div class="doc-footer">Gegenereerd via LensOnline Campaign Catalog · marketing@lensonline.nl</div>
</div>
<button class="print-btn" onclick="window.print()">Afdrukken / Opslaan als PDF →</button>
</body></html>`

    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  return (
    <div className={styles.bg} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Jouw campagnepakket</div>
            <div className={styles.sub}>{selCampaigns.length} asset{selCampaigns.length !== 1 ? 's' : ''} geselecteerd</div>
            {clientName && <div className={styles.client}>{clientName}{clientCity ? `, ${clientCity}` : ''}{clientCountry ? ` — ${clientCountry}` : ''}</div>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Campagne & filters */}
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

          {/* Gekozen assets */}
          <div className={styles.sectionLabel}>Geselecteerde assets</div>
          <div className={styles.assets}>
            {selCampaigns.map(c => (
              <div key={c._id} className={styles.asset}>
                <div className={styles.assetImg}>
                  <Image src={c.thumbnail || `https://picsum.photos/seed/${c._id}/400/260`} alt={c.title} fill sizes="50px" style={{ objectFit:'cover' }} />
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

          {/* Briefing per campagne — preview */}
          <div className={styles.sectionLabel}>Briefing details per campagne</div>
          {selCampaigns.map((c, i) => {
            const briefing = campaignBriefings.find(b => b.campaignId === c._id)
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <div key={c._id} className={styles.campaignPreview} style={{ borderLeftColor: accent }}>
                <div className={styles.campaignPreviewHead}>
                  <span className={styles.campaignPreviewDot} style={{ background: accent }}>{i + 1}</span>
                  <span className={styles.campaignPreviewTitle}>{c.title}</span>
                  <span className={styles.campaignPreviewCount}>{briefing?.instances.length || 0} blokken</span>
                </div>
                {briefing?.instances.map(inst => {
                  const meta = BLOCK_META[inst.typeId]
                  const fields = collectFields(inst)
                  return (
                    <div key={inst.id} className={styles.previewBlock}>
                      <div className={styles.previewBlockHead}><span>{meta?.icon}</span> {meta?.title}</div>
                      {fields.length > 0 ? fields.map(f => (
                        <div key={f.label} className={styles.previewBlockRow}>
                          <span className={styles.previewBlockLabel}>{f.label}</span>
                          <span className={styles.previewBlockVal}>{f.value}</span>
                        </div>
                      )) : <div className={styles.previewBlockEmpty}>Nog geen velden ingevuld</div>}
                    </div>
                  )
                })}
                {(!briefing?.instances.length) && <div className={styles.previewBlockEmpty}>Geen briefing blokken.</div>}
              </div>
            )
          })}

          <div className={styles.divider} />

          <div className={styles.sectionLabel}>
            Extra opmerkingen <span className={styles.optional}>(optioneel)</span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder="Voeg hier eventuele extra opmerkingen toe voor het marketingteam..."
            value={extraNote}
            onChange={e => setExtraNote(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.secBtn} onClick={onClose}>Aanpassen</button>
          <button className={styles.priBtn} onClick={openBriefingDoc}>Briefing genereren →</button>
        </div>
      </div>
    </div>
  )
}
