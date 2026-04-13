'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Goal, Action, Need, Subject, Campaign } from './types'
import { BLOCK_META } from './types'
import { useI18n } from './i18n'
import { getLogoSvgMarkup } from './Logo'
import type { BriefingValue, CampaignBriefing, DimensionEntry, SharedBriefingFields } from './CampaignCatalog'
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
  selNeeds: Need[]
  selSubjects: Subject[]
  selCampaigns: Campaign[]
  campaignBriefings: CampaignBriefing[]
  sharedFields: SharedBriefingFields
  onRemove: (id: string) => void
  onClose: () => void
}

function isDimensionEntry(value: unknown): value is DimensionEntry {
  return typeof value === 'object' && value !== null && 'width' in value && 'height' in value
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isDimensionArray(value: unknown): value is DimensionEntry[] {
  return Array.isArray(value) && value.every(isDimensionEntry)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatPeriod(start: string, end: string) {
  if (start && end) return `${start} t/m ${end}`
  return start || end
}

function formatDimensions(entries: DimensionEntry[]) {
  return entries
    .filter(entry => entry.width || entry.height)
    .map(entry => `${entry.width || '?'} × ${entry.height || '?'} cm`)
    .join(', ')
}

function collectFields(
  inst: { typeId: string; data: Record<string, BriefingValue> },
  copy: ReturnType<typeof useI18n>['copy'],
  translateBriefingValue: ReturnType<typeof useI18n>['translateBriefingValue']
) {
  const fields: { label: string; value: string }[] = []
  const data = inst.data
  const str = (key: string) => typeof data[key] === 'string' ? data[key] as string : ''
  const arr = (key: string) => isStringArray(data[key]) ? data[key] : []
  const dims = (key: string) => isDimensionArray(data[key]) ? data[key] : []
  const legacyDims = (widthKey: string, heightKey: string) => str(widthKey) || str(heightKey) ? [{ width: str(widthKey), height: str(heightKey) }] : []

  if (inst.typeId === 'af-print') {
    if (str('paper')) fields.push({ label: copy.briefing.fields.paper, value: translateBriefingValue('printPaper', str('paper')) })
    if (str('qty')) fields.push({ label: copy.briefing.fields.quantity, value: str('qty') })
    if (str('orientation')) fields.push({ label: copy.briefing.fields.orientation, value: translateBriefingValue('orientation', str('orientation')) })
    if (str('designWishes')) fields.push({ label: copy.briefing.fields.designWishes, value: str('designWishes') })
  }

  if (inst.typeId === 'af-social') {
    if (arr('platforms').length) fields.push({ label: copy.briefing.fields.platforms, value: arr('platforms').map(value => translateBriefingValue('socialPlatforms', value)).join(', ') })
    const period = formatPeriod(str('periodStart'), str('periodEnd'))
    if (period) fields.push({ label: copy.briefing.fields.campaignPeriod, value: period })
  }

  if (inst.typeId === 'af-banner') {
    if (str('material')) fields.push({ label: copy.briefing.fields.material, value: translateBriefingValue('bannerMaterials', str('material')) })
    if (str('banW') || str('banH')) fields.push({ label: copy.briefing.fields.bannerSize, value: `${str('banW') || '?'} × ${str('banH') || '?'} cm` })
    if (str('designWishes')) fields.push({ label: copy.briefing.fields.designWishes, value: str('designWishes') })
  }

  if (inst.typeId === 'af-email') {
    const period = formatPeriod(str('periodStart'), str('periodEnd'))
    if (period) fields.push({ label: copy.briefing.fields.campaignPeriod, value: period })
  }

  if (inst.typeId === 'af-video') {
    if (str('vtype')) fields.push({ label: copy.briefing.fields.videoType, value: translateBriefingValue('videoTypes', str('vtype')) })
    if (str('vlen')) fields.push({ label: copy.briefing.fields.duration, value: translateBriefingValue('videoDurations', str('vlen')) })
    if (str('orientation')) fields.push({ label: copy.briefing.fields.screenOrientation, value: translateBriefingValue('orientation', str('orientation')) })
    if (str('specialFormats')) fields.push({ label: copy.briefing.fields.specialFormats, value: str('specialFormats') })
    if (str('placement')) fields.push({ label: copy.briefing.fields.whereShown, value: str('placement') })
  }

  if (inst.typeId === 'af-sticker') {
    const windowSizes = formatDimensions(dims('windowSizes').length ? dims('windowSizes') : legacyDims('winW', 'winH'))
    const doorSizes = formatDimensions(dims('doorSizes').length ? dims('doorSizes') : legacyDims('doorW', 'doorH'))
    if (windowSizes) fields.push({ label: copy.briefing.fields.window, value: windowSizes })
    if (doorSizes) fields.push({ label: copy.briefing.fields.door, value: doorSizes })
    if (str('notes')) fields.push({ label: copy.briefing.fields.notes, value: str('notes') })
  }

  if (inst.typeId === 'af-landing') {
    if (str('website')) fields.push({ label: copy.briefing.fields.websiteUrl, value: str('website') })
    if (str('domain')) fields.push({ label: copy.briefing.fields.subpage, value: str('domain') })
  }

  if (inst.typeId === 'af-other') {
    if (str('request')) fields.push({ label: copy.briefing.fields.describeNeed, value: str('request') })
    if (str('extraInfo')) fields.push({ label: copy.briefing.fields.extraInfo, value: str('extraInfo') })
  }

  return fields
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
  selNeeds,
  selSubjects,
  selCampaigns,
  campaignBriefings,
  sharedFields,
  onRemove,
  onClose,
}: Props) {
  const { copy, lang, formatDateLocale, translateBlockMeta, translateCampaignType, translateCountry, translateScope, translateBriefingValue } = useI18n()
  const [extraNote, setExtraNote] = useState('')

  const rows = [
    selGoal && { label: selGoal.label, cat: copy.summary.goal },
    selAction && { label: selAction.isCustom && customAction ? customAction : selAction.label, cat: copy.summary.action },
    actionValidUntil && { label: actionValidUntil, cat: copy.summary.validUntil },
    actionScope && { label: translateScope(actionScope), cat: copy.summary.scope },
    selNeeds.length > 0 && { label: selNeeds.map(need => need.label).join(', '), cat: copy.summary.need },
    selSubjects.length > 0 && { label: selSubjects.map(subject => subject.label).join(', '), cat: copy.summary.subjects },
    sharedFields.deadline && { label: sharedFields.deadline, cat: copy.summary.deadline },
    sharedFields.liveDate && { label: sharedFields.liveDate, cat: copy.summary.liveDate },
    sharedFields.desc4 && { label: sharedFields.desc4, cat: copy.summary.description },
  ].filter(Boolean) as { label: string; cat: string }[]

  function openBriefingDoc() {
    const dateStr = new Date().toLocaleDateString(formatDateLocale, { day: '2-digit', month: 'long', year: 'numeric' })

    const campaignSections = selCampaigns.map((campaign, index) => {
      const briefing = campaignBriefings.find(item => item.campaignId === campaign._id)
      const accent = ACCENTS[index % ACCENTS.length]
      const blocksHtml = briefing?.instances.map(inst => {
        const meta = translateBlockMeta(inst.typeId) || BLOCK_META[inst.typeId]
        if (!meta) return ''

        const fields = collectFields(inst, copy, translateBriefingValue)
        const fieldsHtml = fields.length
          ? fields.map(field => `<tr><td class="doc-lbl">${escapeHtml(field.label)}</td><td class="doc-val">${escapeHtml(field.value)}</td></tr>`).join('')
          : `<tr><td colspan="2" class="doc-empty">${escapeHtml(copy.summary.noDetails)}</td></tr>`

        return `<div class="block">
          <div class="block-head" style="background:${accent}">
            <span class="block-icon">${escapeHtml(meta.icon)}</span> ${escapeHtml(meta.title)}
          </div>
          <table class="block-table">${fieldsHtml}</table>
        </div>`
      }).join('') || `<div class="empty-blocks">${escapeHtml(copy.summary.noBlocksDoc)}</div>`

      const formatsHtml = campaign.formats?.slice(0, 8).map(format => `<span class="fmt-tag">${escapeHtml(format)}</span>`).join('') || ''

      return `
      <div class="campaign-section" style="border-left:4px solid ${accent}">
        <div class="campaign-section-head">
          <div class="campaign-index" style="background:${accent}">${index + 1}</div>
          <div>
            <div class="campaign-type-badge">${escapeHtml(translateCampaignType(campaign.type))}</div>
            <div class="campaign-name">${escapeHtml(campaign.title)}</div>
            ${campaign.visualStyle ? `<div class="campaign-style">${escapeHtml(campaign.visualStyle.label)}</div>` : ''}
          </div>
          ${campaign.thumbnail ? `<img class="campaign-thumb" src="${escapeHtml(campaign.thumbnail)}" alt="${escapeHtml(campaign.title)}">` : ''}
        </div>
        ${campaign.formats?.length ? `<div class="formats-row">${formatsHtml}</div>` : ''}
        <div class="blocks-list">${blocksHtml}</div>
      </div>`
    }).join('')

    const logoSvg = getLogoSvgMarkup('white', 26)

    const html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<title>${escapeHtml(copy.briefing.title)} — ${escapeHtml(clientName || copy.summary.unknown)}</title>
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
.campaign-style{font-size:.72rem;color:#888884;margin-top:.15rem}
.campaign-thumb{width:72px;height:52px;object-fit:cover;border-radius:7px;margin-left:auto;flex-shrink:0;border:1px solid #E0DDD6}
.formats-row{display:flex;flex-wrap:wrap;gap:.3rem;padding:.75rem 1.25rem;border-bottom:1px solid #E0DDD6;background:#F9F8F6}
.fmt-tag{font-size:.7rem;padding:.22rem .6rem;border-radius:4px;background:#E8E4DC;color:#444}
.blocks-list{padding:1rem 1.25rem;display:flex;flex-direction:column;gap:.7rem}
.block{border:1px solid #E0DDD6;border-radius:8px;overflow:hidden}
.block-head{padding:.6rem .9rem;font-size:.82rem;font-weight:600;color:#fff;display:flex;align-items:center;gap:.45rem}
.block-icon{font-size:.95rem}
.block-table{width:100%;border-collapse:collapse}
.doc-lbl{font-size:.66rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#888884;padding:.45rem .9rem;width:140px;vertical-align:top;border-right:1px solid #E0DDD6;border-bottom:1px solid #F3F0EC}
.doc-val{font-size:.8rem;color:#1A1612;padding:.45rem .9rem;border-bottom:1px solid #F3F0EC;line-height:1.5}
.block-table tr:last-child .doc-lbl,.block-table tr:last-child .doc-val{border-bottom:none}
.doc-empty{font-size:.75rem;color:#888884;font-style:italic;padding:.6rem .9rem}
.empty-blocks{font-size:.75rem;color:#aaa;font-style:italic;padding:.5rem 0}
.doc-footer{text-align:center;padding:1.5rem 0 .5rem;font-size:.7rem;color:#888884}
.print-btn{position:fixed;bottom:1.5rem;right:1.5rem;background:#0D2340;color:#fff;border:none;padding:.75rem 1.5rem;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(13,35,64,.25)}
@media print{.print-btn{display:none}.wrap{margin:0;padding:0}}
</style></head><body>
<div class="wrap">
  <div class="doc-header">
    <div>${logoSvg}</div>
    <div class="doc-header-right">
      <div class="doc-label">${escapeHtml(copy.summary.docTitle)}</div>
      <div class="doc-title">${escapeHtml(clientName || copy.summary.unknown)}</div>
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
      <div class="ctx-grid">
        <div class="ctx-item"><span class="ctx-label">${escapeHtml(copy.summary.goal)}</span><span class="ctx-val big">${escapeHtml(selGoal?.label || copy.common.noData)}</span></div>
        <div class="ctx-item"><span class="ctx-label">${escapeHtml(copy.summary.action)}</span><span class="ctx-val">${escapeHtml(selAction?.isCustom && customAction ? customAction : selAction?.label || copy.common.noData)}</span></div>
        <div class="ctx-item"><span class="ctx-label">${escapeHtml(copy.summary.need)}</span><span class="ctx-val">${escapeHtml(selNeeds.map(need => need.label).join(', ') || copy.common.noData)}</span></div>
        <div class="ctx-item"><span class="ctx-label">${escapeHtml(copy.summary.validUntil)}</span><span class="ctx-val">${escapeHtml(actionValidUntil || copy.common.noData)}</span></div>
        <div class="ctx-item"><span class="ctx-label">${escapeHtml(copy.summary.scope)}</span><span class="ctx-val">${escapeHtml(actionScope ? translateScope(actionScope) : copy.common.noData)}</span></div>
      </div>
      ${(sharedFields.deadline || sharedFields.liveDate) ? `<div class="timing-row">${sharedFields.deadline ? `<div class="timing-box"><div class="timing-label">${escapeHtml(copy.summary.taskDeadline)}</div><div class="timing-date">${escapeHtml(sharedFields.deadline)}</div></div>` : ''}${sharedFields.liveDate ? `<div class="timing-box"><div class="timing-label">${escapeHtml(copy.summary.liveDate)}</div><div class="timing-date">${escapeHtml(sharedFields.liveDate)}</div></div>` : ''}</div>` : ''}
      ${sharedFields.desc4 ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">${escapeHtml(copy.summary.description)}</span><p class="note" style="margin-top:.35rem">${escapeHtml(sharedFields.desc4)}</p></div>` : ''}
      ${sharedFields.bgInfo ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">${escapeHtml(copy.summary.background)}</span><p class="note" style="margin-top:.35rem">${escapeHtml(sharedFields.bgInfo)}</p></div>` : ''}
      ${sharedFields.refUrl ? `<div class="divider"></div><div class="ctx-item"><span class="ctx-label">${escapeHtml(copy.summary.reference)}</span><a href="${escapeHtml(sharedFields.refUrl)}" style="font-size:.82rem;color:#0D2340">${escapeHtml(sharedFields.refUrl)}</a></div>` : ''}
    </div>
  </div>

  <div class="section-head" style="background:#F3F0EC;border-radius:10px 10px 0 0;border:1px solid #E0DDD6;border-bottom:none;padding:.7rem 1.25rem;font-size:.6rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#888884;margin-bottom:0">
    ${escapeHtml(copy.summary.campaignBriefingCount(selCampaigns.length))}
  </div>
  ${campaignSections}

  ${extraNote ? `<div class="section"><div class="section-head">${escapeHtml(copy.summary.extraNotesDoc)}</div><div class="section-body"><p class="note">${escapeHtml(extraNote)}</p></div></div>` : ''}
  <div class="doc-footer">${escapeHtml(copy.summary.generatedVia)} · marketing@lensonline.nl</div>
</div>
<button class="print-btn" onclick="window.print()">${escapeHtml(copy.summary.print)}</button>
</body></html>`

    const popup = window.open('', '_blank')
    if (popup) {
      popup.document.write(html)
      popup.document.close()
    }
  }

  return (
    <div className={styles.bg} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>{copy.summary.title}</div>
            <div className={styles.sub}>{copy.summary.selectedAssets(selCampaigns.length)}</div>
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
            {selCampaigns.map(campaign => (
              <div key={campaign._id} className={styles.asset}>
                <div className={styles.assetImg}>
                  <Image src={campaign.thumbnail || `https://picsum.photos/seed/${campaign._id}/400/260`} alt={campaign.title} fill sizes="50px" style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.assetInfo}>
                  <div className={styles.assetTitle}>{campaign.title}</div>
                  <div className={styles.assetType}>{translateCampaignType(campaign.type)} · {campaign.visualStyle?.label || ''}</div>
                </div>
                <button className={styles.removeBtn} onClick={() => onRemove(campaign._id)}>✕ {copy.common.remove}</button>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.sectionLabel}>{copy.summary.briefingPerCampaign}</div>
          {selCampaigns.map((campaign, index) => {
            const briefing = campaignBriefings.find(item => item.campaignId === campaign._id)
            const accent = ACCENTS[index % ACCENTS.length]

            return (
              <div key={campaign._id} className={styles.campaignPreview} style={{ borderLeftColor: accent }}>
                <div className={styles.campaignPreviewHead}>
                  <span className={styles.campaignPreviewDot} style={{ background: accent }}>{index + 1}</span>
                  <span className={styles.campaignPreviewTitle}>{campaign.title}</span>
                  <span className={styles.campaignPreviewCount}>{copy.summary.blocks(briefing?.instances.length || 0)}</span>
                </div>
                {briefing?.instances.map(inst => {
                  const meta = translateBlockMeta(inst.typeId) || BLOCK_META[inst.typeId]
                  const fields = collectFields(inst, copy, translateBriefingValue)

                  return (
                    <div key={inst.id} className={styles.previewBlock}>
                      <div className={styles.previewBlockHead}><span>{meta?.icon}</span> {meta?.title}</div>
                      {fields.length > 0 ? fields.map(field => (
                        <div key={`${field.label}-${field.value}`} className={styles.previewBlockRow}>
                          <span className={styles.previewBlockLabel}>{field.label}</span>
                          <span className={styles.previewBlockVal}>{field.value}</span>
                        </div>
                      )) : <div className={styles.previewBlockEmpty}>{copy.summary.noFields}</div>}
                    </div>
                  )
                })}
                {!briefing?.instances.length && <div className={styles.previewBlockEmpty}>{copy.summary.noBlocks}</div>}
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
