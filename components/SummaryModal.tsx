'use client'

import { useState } from 'react'
import type { Goal, Action, Subject, Theme } from './types'
import { useI18n } from './i18n'
import { getLogoSvgMarkup } from './Logo'
import { summarizeAssetFields } from './assetFields'
import { getBlock, getDeliverable, designSides } from './deliverables'
import type { BlockKey } from './deliverables'
import { parseMockup, mockupDocHtml } from './StorefrontMockup'
import type { AssetBriefing, AssetBriefingInstance, SharedBriefingFields } from './CampaignCatalog'
import styles from './SummaryModal.module.css'

const ACCENTS = ['#0D2340', '#1A6B4A', '#8B3A2A', '#2A4E8B', '#6B2A8B', '#8B6B2A', '#2A6B6B']

interface Props {
  clientName: string
  clientCity: string
  clientCountry: string
  selGoal: Goal | null
  selAction: Action | null
  customAction: string
  actionValidUntil: string
  actionScope: string
  selSubjects: Subject[]
  assetBriefings: AssetBriefing[]
  themes: Theme[]
  sharedFields: SharedBriefingFields
  onRemoveBlock: (blockKey: BlockKey) => void
  onClose: () => void
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function SummaryModal({
  clientName,
  clientCity,
  clientCountry,
  selGoal,
  selAction,
  customAction,
  actionValidUntil,
  actionScope,
  selSubjects,
  assetBriefings,
  themes,
  sharedFields,
  onRemoveBlock,
  onClose,
}: Props) {
  const { copy, lang, formatDateLocale, translateCountry, translateScope, translateBriefingValue } = useI18n()
  const [extraNote, setExtraNote] = useState('')
  const core = copy.briefing.core

  const blockLabel = (key: BlockKey) => (copy.briefing.blocks as Record<string, { label: string }>)[key]?.label ?? key
  const blockIcon = (key: BlockKey) => getBlock(key)?.icon ?? '🧩'
  const deliverableLabel = (key: string) => (copy.briefing.deliverables as Record<string, string>)[key] ?? key

  const designSummary = (inst: AssetBriefingInstance): { label: string; note?: string } | null => {
    if (inst.designIsCustom) return { label: copy.summary.customDesign, note: inst.customDesignNote || undefined }
    if (!inst.designs.length) return null
    const def = getDeliverable(inst.deliverableKey)
    const sides = def ? designSides(def, inst.data) : null
    if (sides) {
      const parts = sides.map(slot => {
        const picks = inst.designs.filter(d => d.slot === slot)
        const slotName = slot === 'front' ? copy.briefing.designSideFront : copy.briefing.designSideBack
        return picks.length ? `${slotName}: ${picks.map(p => p.designTitle).join(', ')}` : null
      }).filter(Boolean) as string[]
      return parts.length ? { label: parts.join(' · ') } : null
    }
    const titles = inst.designs.map(d => d.designTitle).filter(Boolean)
    return titles.length ? { label: titles.join(', ') } : null
  }

  const logoLabel = sharedFields.logoRequired ? translateBriefingValue('yesNo', sharedFields.logoRequired) : ''

  const rows = [
    sharedFields.title && { label: sharedFields.title, cat: core.title },
    selGoal && { label: selGoal.label, cat: copy.summary.goal },
    selAction && { label: selAction.isCustom && customAction ? customAction : selAction.label, cat: copy.summary.action },
    actionValidUntil && { label: actionValidUntil, cat: copy.summary.validUntil },
    actionScope && { label: translateScope(actionScope), cat: copy.summary.scope },
    assetBriefings.length > 0 && { label: assetBriefings.map(b => blockLabel(b.blockKey)).join(', '), cat: copy.summary.assetsCat },
    selSubjects.length > 0 && { label: selSubjects.map(subject => subject.label).join(', '), cat: copy.summary.subjects },
    sharedFields.deadline && { label: sharedFields.deadline, cat: copy.summary.deadline },
    sharedFields.liveDate && { label: sharedFields.liveDate, cat: copy.summary.liveDate },
    sharedFields.mainMessage && { label: sharedFields.mainMessage, cat: core.mainMessage },
    sharedFields.owner && { label: sharedFields.owner, cat: core.owner },
    sharedFields.audience && { label: sharedFields.audience, cat: core.audience },
    logoLabel && { label: logoLabel, cat: core.logoRequired },
  ].filter(Boolean) as { label: string; cat: string }[]

  function openBriefingDoc() {
    const dateStr = new Date().toLocaleDateString(formatDateLocale, { day: '2-digit', month: 'long', year: 'numeric' })

    const assetSections = assetBriefings.map((group, index) => {
      const accent = group.accentColor || ACCENTS[index % ACCENTS.length]
      const instancesHtml = group.instances.map((inst) => {
        const fields = summarizeAssetFields(inst.deliverableKey, inst.data, copy, translateBriefingValue)
        const fieldsHtml = fields.length
          ? fields.map(field => `<tr><td class="doc-lbl">${escapeHtml(field.label)}</td><td class="doc-val">${escapeHtml(field.value)}</td></tr>`).join('')
          : `<tr><td colspan="2" class="doc-empty">${escapeHtml(copy.summary.noDetails)}</td></tr>`
        const design = designSummary(inst)
        const designHtml = design
          ? `<div class="design-row"><span class="design-tag">${escapeHtml(copy.summary.designLabel)}</span> ${escapeHtml(design.label)}${design.note ? ` — ${escapeHtml(design.note)}` : ''}</div>`
          : ''
        const mk = typeof inst.data['mockup'] === 'string' ? parseMockup(inst.data['mockup'] as string) : null
        const mockupHtml = mk?.bg ? mockupDocHtml(mk, escapeHtml) : ''
        return `<div class="block">
          <div class="block-head" style="background:${accent}">
            <span class="block-icon">${escapeHtml(getDeliverable(inst.deliverableKey)?.icon ?? '🧩')}</span> ${escapeHtml(deliverableLabel(inst.deliverableKey))}
          </div>
          <table class="block-table">${fieldsHtml}</table>
          ${designHtml}
          ${mockupHtml}
        </div>`
      }).join('')

      return `
      <div class="campaign-section" style="border-left:4px solid ${accent}">
        <div class="campaign-section-head">
          <div class="campaign-index" style="background:${accent}">${index + 1}</div>
          <div>
            <div class="campaign-type-badge">${escapeHtml(copy.summary.assetsCat)}</div>
            <div class="campaign-name">${escapeHtml(blockIcon(group.blockKey))} ${escapeHtml(blockLabel(group.blockKey))}</div>
          </div>
          <div class="asset-count">${group.instances.length}×</div>
        </div>
        <div class="blocks-list">${instancesHtml}</div>
      </div>`
    }).join('')

    const logoSvg = getLogoSvgMarkup('white', 26)

    const ctxItems = [
      { label: copy.summary.goal, value: selGoal?.label || copy.common.noData, big: true },
      { label: copy.summary.action, value: selAction?.isCustom && customAction ? customAction : selAction?.label || copy.common.noData },
      { label: copy.summary.assetsCat, value: assetBriefings.map(b => blockLabel(b.blockKey)).join(', ') || copy.common.noData },
      { label: copy.summary.validUntil, value: actionValidUntil || copy.common.noData },
      { label: copy.summary.scope, value: actionScope ? translateScope(actionScope) : copy.common.noData },
      { label: core.owner, value: sharedFields.owner || copy.common.noData },
      { label: core.audience, value: sharedFields.audience || copy.common.noData },
      { label: core.logoRequired, value: logoLabel || copy.common.noData },
    ]
    const ctxHtml = ctxItems.map(i => `<div class="ctx-item"><span class="ctx-label">${escapeHtml(i.label)}</span><span class="ctx-val${i.big ? ' big' : ''}">${escapeHtml(i.value)}</span></div>`).join('')

    const html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<title>${escapeHtml(copy.briefing.title)} — ${escapeHtml(sharedFields.title || clientName || copy.summary.unknown)}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#F3F0EC;color:#1A1612;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.wrap{max-width:860px;margin:2rem auto;padding:0 1.5rem 4rem}
.doc-header{background:#0D2340;border-radius:14px;padding:2rem 2.5rem;margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between}
.doc-header-right{text-align:right}
.doc-label{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:.2rem}
.doc-title{font-size:1.35rem;font-weight:700;color:#fff}
.doc-date{font-size:.72rem;color:rgba(255,255,255,.45);margin-top:.25rem}
.client-strip{background:#fff;border-radius:10px;padding:1rem 1.4rem;margin-bottom:1.1rem;display:flex;gap:2.5rem;border:1px solid #E0DDD6}
.ci{display:flex;flex-direction:column;gap:.15rem}
.ci-label{font-size:.58rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884}
.ci-val{font-size:.88rem;font-weight:600;color:#0D2340}
.section{background:#fff;border-radius:10px;margin-bottom:1.1rem;border:1px solid #E0DDD6;overflow:hidden}
.section-head{background:#F3F0EC;padding:.7rem 1.25rem;border-bottom:1px solid #E0DDD6;font-size:.6rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884}
.section-body{padding:1.1rem 1.25rem}
.ctx-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem;margin-bottom:1rem}
.ctx-item{display:flex;flex-direction:column;gap:.18rem}
.ctx-label{font-size:.58rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#888884}
.ctx-val{font-size:.84rem;font-weight:500;color:#1A1612}
.ctx-val.big{font-size:.95rem;font-weight:600;color:#0D2340}
.timing-row{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;margin-top:.85rem}
.timing-box{border:1px solid #E0DDD6;border-radius:8px;padding:.7rem 1rem}
.timing-label{font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:#888884;margin-bottom:.25rem;font-weight:600}
.timing-date{font-size:1rem;font-weight:700;color:#0D2340}
.divider{height:1px;background:#E0DDD6;margin:.85rem 0}
.note{font-size:.83rem;color:#1A1612;line-height:1.65}
.campaign-section{background:#fff;border-radius:10px;margin-bottom:1.1rem;overflow:hidden;border:1px solid #E0DDD6}
.campaign-section-head{display:flex;align-items:center;gap:1rem;padding:1.1rem 1.25rem;border-bottom:1px solid #E0DDD6}
.campaign-index{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:#fff;flex-shrink:0}
.campaign-type-badge{font-size:.58rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884;margin-bottom:.2rem}
.campaign-name{font-size:1rem;font-weight:700;color:#0D2340;line-height:1.2}
.asset-count{margin-left:auto;font-size:.78rem;font-weight:700;color:#0D2340;background:#F3F0EC;border:1px solid #E0DDD6;border-radius:100px;padding:.2rem .7rem}
.blocks-list{padding:1rem 1.25rem;display:flex;flex-direction:column;gap:.7rem}
.block{border:1px solid #E0DDD6;border-radius:8px;overflow:hidden}
.block-head{padding:.6rem .9rem;font-size:.82rem;font-weight:600;color:#fff;display:flex;align-items:center;gap:.45rem}
.block-icon{font-size:.95rem}
.block-table{width:100%;border-collapse:collapse}
.doc-lbl{font-size:.66rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#888884;padding:.45rem .9rem;width:160px;vertical-align:top;border-right:1px solid #E0DDD6;border-bottom:1px solid #F3F0EC}
.doc-val{font-size:.8rem;color:#1A1612;padding:.45rem .9rem;border-bottom:1px solid #F3F0EC;line-height:1.5}
.block-table tr:last-child .doc-lbl,.block-table tr:last-child .doc-val{border-bottom:none}
.doc-empty{font-size:.75rem;color:#888884;font-style:italic;padding:.6rem .9rem}
.design-row{font-size:.78rem;color:#1A1612;padding:.55rem .9rem;border-top:1px solid #E0DDD6;background:#F9F8F6}
.design-tag{font-size:.6rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#888884;margin-right:.4rem}
.mockup{padding:.7rem .9rem;border-top:1px solid #E0DDD6;background:#F9F8F6}
.mockup-canvas{position:relative;max-width:360px;border:1px solid #E0DDD6;border-radius:6px;overflow:hidden}
.doc-footer{text-align:center;padding:1.5rem 0 .5rem;font-size:.7rem;color:#888884}
.print-btn{position:fixed;bottom:1.5rem;right:1.5rem;background:#0D2340;color:#fff;border:none;padding:.75rem 1.5rem;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(13,35,64,.25)}
@media print{.print-btn{display:none}.wrap{margin:0;padding:0}}
</style></head><body>
<div class="wrap">
  <div class="doc-header">
    <div>${logoSvg}</div>
    <div class="doc-header-right">
      <div class="doc-label">${escapeHtml(copy.summary.docTitle)}</div>
      <div class="doc-title">${escapeHtml(sharedFields.title || clientName || copy.summary.unknown)}</div>
      <div class="doc-date">${escapeHtml(copy.summary.createdOn)} ${escapeHtml(dateStr)}</div>
    </div>
  </div>

  <div class="client-strip">
    <div class="ci"><span class="ci-label">${escapeHtml(copy.summary.shopName)}</span><span class="ci-val">${escapeHtml(clientName || copy.common.noData)}</span></div>
    <div class="ci"><span class="ci-label">${escapeHtml(copy.summary.city)}</span><span class="ci-val">${escapeHtml(clientCity || copy.common.noData)}</span></div>
    <div class="ci"><span class="ci-label">${escapeHtml(copy.summary.region)}</span><span class="ci-val">${escapeHtml(clientCountry ? translateCountry(clientCountry) : copy.common.noData)}</span></div>
  </div>

  <div class="section">
    <div class="section-head">${escapeHtml(copy.summary.campaignContext)}</div>
    <div class="section-body">
      <div class="ctx-grid">${ctxHtml}</div>
      ${(sharedFields.deadline || sharedFields.liveDate) ? `<div class="timing-row">${sharedFields.deadline ? `<div class="timing-box"><div class="timing-label">${escapeHtml(core.deadline)}</div><div class="timing-date">${escapeHtml(sharedFields.deadline)}</div></div>` : ''}${sharedFields.liveDate ? `<div class="timing-box"><div class="timing-label">${escapeHtml(core.liveDate)}</div><div class="timing-date">${escapeHtml(sharedFields.liveDate)}</div></div>` : ''}</div>` : ''}
      ${sharedFields.mainMessage ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">${escapeHtml(core.mainMessage)}</span><p class="note" style="margin-top:.35rem">${escapeHtml(sharedFields.mainMessage)}</p></div>` : ''}
      ${sharedFields.bgInfo ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">${escapeHtml(core.background)}</span><p class="note" style="margin-top:.35rem">${escapeHtml(sharedFields.bgInfo)}</p></div>` : ''}
      ${sharedFields.refUrl ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">${escapeHtml(core.reference)}</span><a href="${escapeHtml(sharedFields.refUrl)}" style="font-size:.82rem;color:#0D2340">${escapeHtml(sharedFields.refUrl)}</a></div>` : ''}
    </div>
  </div>

  <div class="section-head" style="background:#F3F0EC;border-radius:10px 10px 0 0;border:1px solid #E0DDD6;border-bottom:none;padding:.7rem 1.25rem;font-size:.6rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884;margin-bottom:0">
    ${escapeHtml(copy.summary.assetBriefingCount(assetBriefings.length))}
  </div>
  ${assetSections}

  ${extraNote ? `<div class="section"><div class="section-head">${escapeHtml(copy.summary.extraNotesDoc)}</div><div class="section-body"><p class="note">${escapeHtml(extraNote)}</p></div></div>` : ''}
  <div class="doc-footer">${escapeHtml(copy.summary.generatedVia)} · marketing@lensonline.nl</div>
</div>
<button class="print-btn" onclick="window.print()">${escapeHtml(copy.summary.print)}</button>
</body></html>`

    const popup = window.open('about:blank', '_blank')
    if (popup) {
      popup.document.open()
      popup.document.write(html)
      popup.document.close()
      popup.focus()
    }
  }

  return (
    <div className={styles.bg} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>{copy.summary.title}</div>
            <div className={styles.sub}>{copy.summary.selectedAssets(assetBriefings.reduce((sum, b) => sum + b.instances.length, 0))}</div>
            {clientName && <div className={styles.client}>{clientName}{clientCity ? `, ${clientCity}` : ''}{clientCountry ? ` — ${translateCountry(clientCountry)}` : ''}</div>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.sectionLabel}>{copy.summary.campaignFilters}</div>
          <div className={styles.rows}>
            {rows.map((row, index) => (
              <div key={index} className={styles.row}>
                <div className={styles.dot} />
                <span className={styles.rowText}>{row.label}</span>
                <span className={styles.rowCat}>{row.cat}</span>
              </div>
            ))}
            {rows.length === 0 && <div className={styles.empty}>{copy.summary.noFilters}</div>}
          </div>

          <div className={styles.divider} />

          <div className={styles.sectionLabel}>{copy.summary.selectedAssetsLabel}</div>
          <div className={styles.assets}>
            {assetBriefings.map(group => (
              <div key={group.blockKey} className={styles.asset}>
                <div className={styles.assetImg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', background: 'var(--surface)' }}>
                  {blockIcon(group.blockKey)}
                </div>
                <div className={styles.assetInfo}>
                  <div className={styles.assetTitle}>{blockLabel(group.blockKey)}</div>
                  <div className={styles.assetType}>{copy.bar.chosenAssets(group.instances.length)}</div>
                </div>
                <button className={styles.removeBtn} onClick={() => onRemoveBlock(group.blockKey)}>✕ {copy.common.remove}</button>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.sectionLabel}>{copy.summary.briefingPerAsset}</div>
          {assetBriefings.map((group, index) => {
            const accent = group.accentColor || ACCENTS[index % ACCENTS.length]

            return (
              <div key={group.blockKey} className={styles.campaignPreview} style={{ borderLeftColor: accent }}>
                <div className={styles.campaignPreviewHead}>
                  <span className={styles.campaignPreviewDot} style={{ background: accent }}>{index + 1}</span>
                  <span className={styles.campaignPreviewTitle}>{blockIcon(group.blockKey)} {blockLabel(group.blockKey)}</span>
                  <span className={styles.campaignPreviewCount}>{group.instances.length}×</span>
                </div>
                {group.instances.map((inst) => {
                  const fields = summarizeAssetFields(inst.deliverableKey, inst.data, copy, translateBriefingValue)
                  const design = designSummary(inst)

                  return (
                    <div key={inst.id} className={styles.previewBlock}>
                      <div className={styles.previewBlockHead}><span>{getDeliverable(inst.deliverableKey)?.icon ?? '🧩'}</span> {deliverableLabel(inst.deliverableKey)}</div>
                      {fields.map(field => (
                        <div key={`${field.label}-${field.value}`} className={styles.previewBlockRow}>
                          <span className={styles.previewBlockLabel}>{field.label}</span>
                          <span className={styles.previewBlockVal}>{field.value}</span>
                        </div>
                      ))}
                      {design && (
                        <div className={styles.previewBlockRow}>
                          <span className={styles.previewBlockLabel}>{copy.summary.designLabel}</span>
                          <span className={styles.previewBlockVal}>{design.label}{design.note ? ` — ${design.note}` : ''}</span>
                        </div>
                      )}
                      {fields.length === 0 && !design && <div className={styles.previewBlockEmpty}>{copy.summary.noFields}</div>}
                    </div>
                  )
                })}
              </div>
            )
          })}

          <div className={styles.divider} />

          <div className={styles.sectionLabel}>
            {copy.summary.extraNotes} <span className={styles.optional}>({copy.common.optional})</span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder={copy.summary.extraNotesPlaceholder}
            value={extraNote}
            onChange={e => setExtraNote(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.secBtn} onClick={onClose}>{copy.common.adjust}</button>
          <button className={styles.priBtn} onClick={openBriefingDoc}>{copy.summary.generate}</button>
        </div>
      </div>
    </div>
  )
}
