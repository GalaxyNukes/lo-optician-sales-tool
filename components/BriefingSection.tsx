'use client'

import { useState, useRef, useCallback } from 'react'
import type { Campaign, Need } from './types'
import { BLOCK_META } from './types'
import styles from './BriefingSection.module.css'

interface BriefingInstance {
  id: string
  typeId: string
  data: Record<string, string | string[]>
}

interface Props {
  selectedCampaigns: Campaign[]
  selectedNeeds: Need[]
}

let instanceCounter = 0
function nextId() { return `inst-${instanceCounter++}` }

function getNeededTypes(campaigns: Campaign[], needs: Need[]): string[] {
  const needed = new Set<string>()
  needs.forEach(n => { if (n.briefingBlockType && n.briefingBlockType !== 'none') needed.add(n.briefingBlockType) })
  campaigns.forEach(c => {
    if (c.type === 'LANDING PAGE') needed.add('af-landing')
    if (c.type === 'MEDIA KIT') needed.add('af-print')
    if (c.assetFilters?.includes('Stickering')) needed.add('af-sticker')
    if (c.assetFilters?.includes('Banner')) needed.add('af-banner')
    if (c.assetFilters?.includes('Flyer')) needed.add('af-print')
    if (c.assetFilters?.includes('Meta ADS') || c.assetFilters?.includes('Google ADS')) needed.add('af-social')
    if (c.formats?.join(' ').toLowerCase().includes('email')) needed.add('af-email')
    if (c.title?.toLowerCase().includes('video')) needed.add('af-video')
  })
  return Array.from(needed)
}

function getPrefill(typeId: string, campaigns: Campaign[]): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {}
  campaigns.forEach(c => {
    const pf = c.prefill
    if (!pf) return
    if (typeId === 'af-print') { if (pf.printPaper && !result.paper) result.paper = pf.printPaper; if (pf.printQty && !result.qty) result.qty = String(pf.printQty) }
    if (typeId === 'af-social' && pf.socialPlatforms?.length) { const cur = (result.platforms as string[]) || []; result.platforms = [...new Set([...cur, ...pf.socialPlatforms])] }
    if (typeId === 'af-banner' && pf.bannerMaterial && !result.material) result.material = pf.bannerMaterial
    if (typeId === 'af-email') { if (pf.emailPlatform && !result.platform) result.platform = pf.emailPlatform; if (pf.emailType && !result.type) result.type = pf.emailType }
    if (typeId === 'af-video') { if (pf.videoType && !result.vtype) result.vtype = pf.videoType; if (pf.videoDuration && !result.vlen) result.vlen = pf.videoDuration }
    if (typeId === 'af-sticker' && pf.stickerNotes && !result.notes) result.notes = pf.stickerNotes
  })
  return result
}

// ── Individual block field components ───────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

function Inp({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input className={styles.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Kies...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function CheckList({ platforms, selected, onToggle }: { platforms: string[]; selected: string[]; onToggle: (p: string) => void }) {
  return (
    <div className={styles.checkList}>
      {platforms.map(p => (
        <label key={p} className={`${styles.checkRow} ${selected.includes(p) ? styles.checked : ''}`} onClick={() => onToggle(p)}>
          <span className={styles.checkBox} />
          <span className={styles.checkLabel}>{p}</span>
        </label>
      ))}
    </div>
  )
}

function DimRow({ wVal, hVal, onW, onH, label }: { wVal: string; hVal: string; onW: (v: string) => void; onH: (v: string) => void; label: string }) {
  return (
    <Field label={label}>
      <div className={styles.dimRow}>
        <input className={styles.input} type="number" placeholder="Breedte" value={wVal} onChange={e => onW(e.target.value)} />
        <span className={styles.dimX}>×</span>
        <input className={styles.input} type="number" placeholder="Hoogte" value={hVal} onChange={e => onH(e.target.value)} />
        <span className={styles.dimUnit}>cm</span>
      </div>
    </Field>
  )
}

function UploadZone({ id, previewId }: { id: string; previewId: string }) {
  const [previews, setPreviews] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(f => {
      if (!f.type.startsWith('image/')) return
      const r = new FileReader()
      r.onload = e => setPreviews(p => [...p, e.target?.result as string])
      r.readAsDataURL(f)
    })
  }
  return (
    <div>
      <div
        className={styles.uploadZone}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M3 5l4-4 4 4M1 11h12" stroke="var(--navy)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span><strong>Klik om te uploaden</strong> of sleep hier naartoe</span>
        <span className={styles.uploadHint}>JPG, PNG, WEBP — max. 10MB</span>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      {previews.length > 0 && (
        <div className={styles.previews}>
          {previews.map((src, i) => (
            <div key={i} className={styles.preview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
              <button className={styles.previewRm} onClick={() => setPreviews(p => p.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Block content by type ───────────────────────────────────────────────────
function BlockContent({ typeId, data, onChange }: { typeId: string; data: Record<string, string | string[]>; onChange: (key: string, val: string | string[]) => void }) {
  const str = (k: string) => (data[k] as string) || ''
  const arr = (k: string) => (data[k] as string[]) || []
  const set = (k: string) => (v: string) => onChange(k, v)
  const togglePlatform = (p: string) => {
    const cur = arr('platforms')
    onChange('platforms', cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p])
  }

  if (typeId === 'af-sticker') return (
    <div className={styles.blockBody}>
      <Field label="Foto's van de etalage / winkelgevel"><UploadZone id={`storefront`} previewId={`pv-storefront`} /></Field>
      <div className={styles.row2}>
        <DimRow label="Etalageraam — B × H (cm)" wVal={str('winW')} hVal={str('winH')} onW={set('winW')} onH={set('winH')} />
        <DimRow label="Deur — B × H (cm)" wVal={str('doorW')} hVal={str('doorH')} onW={set('doorW')} onH={set('doorH')} />
      </div>
      <Field label="Opmerkingen"><textarea className={styles.textarea} value={str('notes')} onChange={e => onChange('notes', e.target.value)} placeholder="Bijv. raam is gebogen..." /></Field>
    </div>
  )

  if (typeId === 'af-banner') return (
    <div className={styles.blockBody}>
      <div className={styles.row2}>
        <DimRow label="Formaat banner — B × H (cm)" wVal={str('banW')} hVal={str('banH')} onW={set('banW')} onH={set('banH')} />
        <Field label="Type materiaal">
          <Sel value={str('material')} onChange={set('material')} options={['Spandoek PVC','Textiel banner','Vlag (wimpel)','Lichtbak folie','Nog niet bepaald']} />
        </Field>
      </div>
      <Field label="Foto's van de locatie"><UploadZone id="banner" previewId="pv-banner" /></Field>
    </div>
  )

  if (typeId === 'af-print') return (
    <div className={styles.blockBody}>
      <div className={styles.row2}>
        <Field label="Papierformaat">
          <Sel value={str('paper')} onChange={set('paper')} options={['A6 (flyer)','A5','A4','A3','A2','A1','Aangepast formaat']} />
        </Field>
        <Field label="Geschatte oplage">
          <Inp value={str('qty')} onChange={set('qty')} placeholder="Bijv. 500" type="number" />
        </Field>
      </div>
      <Field label="Referentieafbeeldingen"><UploadZone id="print" previewId="pv-print" /></Field>
    </div>
  )

  if (typeId === 'af-social') return (
    <div className={styles.blockBody}>
      <Field label="Welke platformen?">
        <CheckList platforms={['Instagram (post + story)','Facebook','LinkedIn','TikTok','Google Display Ads']} selected={arr('platforms')} onToggle={togglePlatform} />
      </Field>
      <Field label="Referentieafbeeldingen of inspiratie"><UploadZone id="social" previewId="pv-social" /></Field>
    </div>
  )

  if (typeId === 'af-landing') return (
    <div className={styles.blockBody}>
      <div className={styles.row2}>
        <Field label="Bestaande website URL"><Inp value={str('website')} onChange={set('website')} placeholder="https://www.opticajanssen.be" type="url" /></Field>
        <Field label="Gewenst domein / subpagina"><Inp value={str('domain')} onChange={set('domain')} placeholder="Bijv. /zomer-actie" /></Field>
      </div>
    </div>
  )

  if (typeId === 'af-email') return (
    <div className={styles.blockBody}>
      <div className={styles.row2}>
        <Field label="E-mailplatform">
          <Sel value={str('platform')} onChange={set('platform')} options={['Mailchimp','HubSpot','Klaviyo','Sendgrid','Geen / niet van toepassing','Ander']} />
        </Field>
        <Field label="Type e-mail">
          <Sel value={str('type')} onChange={set('type')} options={['Nieuwsbrief','Promotioneel','Opstart samenwerking','Event uitnodiging','Ander']} />
        </Field>
      </div>
    </div>
  )

  if (typeId === 'af-video') return (
    <div className={styles.blockBody}>
      <div className={styles.row2}>
        <Field label="Type video">
          <Sel value={str('vtype')} onChange={set('vtype')} options={['Campagnevideo (winkel)','Lifestyle / algemeen','Product showcase','Social media Reel']} />
        </Field>
        <Field label="Gewenste duur">
          <Sel value={str('vlen')} onChange={set('vlen')} options={['15 seconden','30 seconden','60 seconden','+1 minuut']} />
        </Field>
      </div>
      <Field label="Referentievideo's of inspiratie">
        <Inp value={str('vref')} onChange={set('vref')} placeholder="https://youtu.be/..." type="url" />
      </Field>
    </div>
  )

  return null
}

// ── Single collapsible block ────────────────────────────────────────────────
function BriefingBlock({
  instance, index, total, meta,
  onChange, onDelete,
}: {
  instance: BriefingInstance
  index: number
  total: number
  meta: typeof BLOCK_META[string]
  onChange: (key: string, val: string | string[]) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(true)
  const title = total > 1 ? `${meta.title} (${index + 1})` : meta.title

  return (
    <div className={styles.block}>
      <div className={styles.blockHead} onClick={() => setOpen(o => !o)}>
        <div className={styles.blockIcon}>{meta.icon}</div>
        <div className={styles.blockMeta}>
          <div className={styles.blockTitle}>{title}</div>
          <div className={styles.blockDesc}>{meta.desc}</div>
        </div>
        <button className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`} onClick={e => { e.stopPropagation(); setOpen(o => !o) }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); onDelete() }} title="Verwijder blok">✕</button>
      </div>
      {open && (
        <BlockContent typeId={instance.typeId} data={instance.data} onChange={onChange} />
      )}
    </div>
  )
}

// ── Main BriefingSection ────────────────────────────────────────────────────
export function BriefingSection({ selectedCampaigns, selectedNeeds }: Props) {
  const [instances, setInstances] = useState<BriefingInstance[]>(() => {
    const types = getNeededTypes(selectedCampaigns, selectedNeeds)
    return types.map(typeId => ({
      id: nextId(),
      typeId,
      data: getPrefill(typeId, selectedCampaigns),
    }))
  })

  // Timing + description fields (always shown)
  const [deadline, setDeadline] = useState('')
  const [liveDate, setLiveDate] = useState('')
  const [desc4, setDesc4] = useState('')
  const [bgInfo, setBgInfo] = useState('')
  const [refUrl, setRefUrl] = useState('')

  const addBlock = useCallback((typeId: string) => {
    setInstances(prev => [...prev, { id: nextId(), typeId, data: getPrefill(typeId, selectedCampaigns) }])
  }, [selectedCampaigns])

  const deleteBlock = useCallback((id: string) => {
    setInstances(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateBlock = useCallback((id: string, key: string, val: string | string[]) => {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, data: { ...i.data, [key]: val } } : i))
  }, [])

  const countByType = (typeId: string) => instances.filter(i => i.typeId === typeId).length

  return (
    <div className={styles.wrap}>
      {/* Briefing accordion header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg viewBox="0 0 11 11" fill="none" width="11" height="11"><path d="M1 3h9M1 6h6M1 9h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
        </div>
        <div className={styles.headerTitle}>Briefing</div>
      </div>

      {/* Always-on: Timing */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Timing</div>
        <div className={styles.row2}>
          <Field label="Deadline taak *">
            <input className={styles.input} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </Field>
          <Field label="Live datum *">
            <input className={styles.input} type="date" value={liveDate} onChange={e => setLiveDate(e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Always-on: Description */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Omschrijving</div>
        <Field label="Beschrijf in max. 4 woorden wat er gemaakt moet worden *">
          <Inp value={desc4} onChange={setDesc4} placeholder="Bijv. Zomercampagne sportbrillen" />
        </Field>
        <Field label="Meer achtergrondinformatie">
          <textarea className={styles.textarea} value={bgInfo} onChange={e => setBgInfo(e.target.value)} placeholder="Bv. scherm hangt achter de balie..." />
        </Field>
        <Field label="Referentie naar gelijkaardige taak">
          <Inp value={refUrl} onChange={setRefUrl} placeholder="https://..." type="url" />
        </Field>
      </div>

      {/* Dynamic blocks */}
      {instances.map((inst, i) => {
        const meta = BLOCK_META[inst.typeId]
        if (!meta) return null
        const sameType = instances.filter(x => x.typeId === inst.typeId)
        const indexOfType = sameType.indexOf(inst)
        return (
          <BriefingBlock
            key={inst.id}
            instance={inst}
            index={indexOfType}
            total={sameType.length}
            meta={meta}
            onChange={(k, v) => updateBlock(inst.id, k, v)}
            onDelete={() => deleteBlock(inst.id)}
          />
        )
      })}

      {/* General reference images */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Algemene referentieafbeeldingen</div>
        <UploadZone id="general" previewId="pv-general" />
      </div>

      {/* Add block panel */}
      <div className={styles.addPanel}>
        <div className={styles.addLabel}>Blok toevoegen</div>
        <div className={styles.addGrid}>
          {Object.entries(BLOCK_META).map(([typeId, meta]) => (
            <button key={typeId} className={styles.addBtn} onClick={() => addBlock(typeId)}>
              <span className={styles.addIcon}>{meta.icon}</span>
              <span>
                <span className={styles.addTitle}>
                  {meta.title}
                  {countByType(typeId) > 0 && <span className={styles.addCount}>{countByType(typeId)}</span>}
                </span>
                <span className={styles.addDesc}>{meta.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Export instance data getter for SummaryModal
export type { BriefingInstance }
