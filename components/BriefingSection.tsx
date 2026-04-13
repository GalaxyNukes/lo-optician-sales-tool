'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { Campaign, Need } from './types'
import { BLOCK_META } from './types'
import type { BriefingInstance, CampaignBriefing, SharedBriefingFields } from './CampaignCatalog'
import { uid, getTypesForCampaign, getPrefillForCampaign } from './CampaignCatalog'
import styles from './BriefingSection.module.css'

interface Props {
  selectedCampaigns: Campaign[]
  selectedNeeds: Need[]
  campaignBriefings: CampaignBriefing[]
  sharedFields: SharedBriefingFields
  onUpdateBriefing: React.Dispatch<React.SetStateAction<CampaignBriefing[]>>
  onUpdateShared: React.Dispatch<React.SetStateAction<SharedBriefingFields>>
}

const ACCENTS = ['#0D2340','#1A6B4A','#8B3A2A','#2A4E8B','#6B2A8B','#8B6B2A','#2A6B6B']

// ── Form primitives ───────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className={styles.field}><label className={styles.fieldLabel}>{label}</label>{children}</div>
}
function Inp({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input className={styles.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
}
function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}><option value="">Kies...</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
}
function CheckList({ platforms, selected, onToggle }: { platforms: string[]; selected: string[]; onToggle: (p: string) => void }) {
  return <div className={styles.checkList}>{platforms.map(p => <label key={p} className={`${styles.checkRow} ${selected.includes(p) ? styles.checked : ''}`} onClick={() => onToggle(p)}><span className={styles.checkBox} /><span className={styles.checkLabel}>{p}</span></label>)}</div>
}
function DimRow({ wVal, hVal, onW, onH, label }: { wVal: string; hVal: string; onW: (v: string) => void; onH: (v: string) => void; label: string }) {
  return <Field label={label}><div className={styles.dimRow}><input className={styles.input} type="number" placeholder="B" value={wVal} onChange={e => onW(e.target.value)} /><span className={styles.dimX}>×</span><input className={styles.input} type="number" placeholder="H" value={hVal} onChange={e => onH(e.target.value)} /><span className={styles.dimUnit}>cm</span></div></Field>
}
function UploadZone() {
  const [previews, setPreviews] = useState<string[]>([])
  const ref = useRef<HTMLInputElement>(null)
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(f => { if (!f.type.startsWith('image/')) return; const r = new FileReader(); r.onload = e => setPreviews(p => [...p, e.target?.result as string]); r.readAsDataURL(f) })
  }
  return <div><div className={styles.uploadZone} onClick={() => ref.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M3 5l4-4 4 4M1 11h12" stroke="var(--navy)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg><span><strong>Klik om te uploaden</strong> of sleep hier naartoe</span><span className={styles.uploadHint}>JPG, PNG — max. 10MB</span></div><input ref={ref} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => handleFiles(e.target.files)} />{previews.length > 0 && <div className={styles.previews}>{previews.map((src,i) => <div key={i} className={styles.preview}><img src={src} alt="" /><button className={styles.previewRm} onClick={() => setPreviews(p => p.filter((_,j) => j!==i))}>✕</button></div>)}</div>}</div>
}

function BlockContent({ typeId, data, onChange }: { typeId: string; data: Record<string, string | string[]>; onChange: (k: string, v: string | string[]) => void }) {
  const str = (k: string) => (data[k] as string) || ''
  const arr = (k: string) => (data[k] as string[]) || []
  const set = (k: string) => (v: string) => onChange(k, v)
  const togglePlatform = (p: string) => { const cur = arr('platforms'); onChange('platforms', cur.includes(p) ? cur.filter(x => x!==p) : [...cur,p]) }
  if (typeId === 'af-sticker') return <div className={styles.blockBody}><Field label="Foto's etalage / winkelgevel"><UploadZone /></Field><div className={styles.row2}><DimRow label="Etalageraam (cm)" wVal={str('winW')} hVal={str('winH')} onW={set('winW')} onH={set('winH')} /><DimRow label="Deur (cm)" wVal={str('doorW')} hVal={str('doorH')} onW={set('doorW')} onH={set('doorH')} /></div><Field label="Opmerkingen"><textarea className={styles.textarea} value={str('notes')} onChange={e => onChange('notes',e.target.value)} placeholder="Bijv. raam is gebogen..." /></Field></div>
  if (typeId === 'af-banner') return <div className={styles.blockBody}><div className={styles.row2}><DimRow label="Formaat (cm)" wVal={str('banW')} hVal={str('banH')} onW={set('banW')} onH={set('banH')} /><Field label="Materiaal"><Sel value={str('material')} onChange={set('material')} options={['Spandoek PVC','Textiel banner','Vlag (wimpel)','Lichtbak folie','Nog niet bepaald']} /></Field></div><Field label="Locatiefoto's"><UploadZone /></Field></div>
  if (typeId === 'af-print') return <div className={styles.blockBody}><div className={styles.row2}><Field label="Papierformaat"><Sel value={str('paper')} onChange={set('paper')} options={['A6 (flyer)','A5','A4','A3','A2','A1','Aangepast formaat']} /></Field><Field label="Oplage"><Inp value={str('qty')} onChange={set('qty')} placeholder="Bijv. 500" type="number" /></Field></div><Field label="Referentieafbeeldingen"><UploadZone /></Field></div>
  if (typeId === 'af-social') return <div className={styles.blockBody}><Field label="Platformen"><CheckList platforms={['Instagram (post + story)','Facebook','LinkedIn','TikTok','Google Display Ads']} selected={arr('platforms')} onToggle={togglePlatform} /></Field><Field label="Referentieafbeeldingen"><UploadZone /></Field></div>
  if (typeId === 'af-landing') return <div className={styles.blockBody}><div className={styles.row2}><Field label="Website URL"><Inp value={str('website')} onChange={set('website')} placeholder="https://..." type="url" /></Field><Field label="Subpagina"><Inp value={str('domain')} onChange={set('domain')} placeholder="/zomer-actie" /></Field></div></div>
  if (typeId === 'af-email') return <div className={styles.blockBody}><div className={styles.row2}><Field label="Platform"><Sel value={str('platform')} onChange={set('platform')} options={['Mailchimp','HubSpot','Klaviyo','Sendgrid','Geen / niet van toepassing','Ander']} /></Field><Field label="Type"><Sel value={str('type')} onChange={set('type')} options={['Nieuwsbrief','Promotioneel','Opstart samenwerking','Event uitnodiging','Ander']} /></Field></div></div>
  if (typeId === 'af-video') return <div className={styles.blockBody}><div className={styles.row2}><Field label="Type video"><Sel value={str('vtype')} onChange={set('vtype')} options={['Campagnevideo (winkel)','Lifestyle / algemeen','Product showcase','Social media Reel']} /></Field><Field label="Duur"><Sel value={str('vlen')} onChange={set('vlen')} options={['15 seconden','30 seconden','60 seconden','+1 minuut']} /></Field></div><Field label="Referentielink"><Inp value={str('vref')} onChange={set('vref')} placeholder="https://youtu.be/..." type="url" /></Field></div>
  return null
}

function BriefingBlock({ inst, meta, onChange, onDelete }: { inst: BriefingInstance; meta: typeof BLOCK_META[string]; onChange: (k: string, v: string | string[]) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={styles.block}>
      <div className={styles.blockHead} onClick={() => setOpen(o => !o)}>
        <div className={styles.blockIcon}>{meta.icon}</div>
        <div className={styles.blockMeta}><div className={styles.blockTitle}>{meta.title}</div><div className={styles.blockDesc}>{meta.desc}</div></div>
        <button className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`} onClick={e => { e.stopPropagation(); setOpen(o => !o) }}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); onDelete() }} title="Verwijder blok">✕</button>
      </div>
      {open && <BlockContent typeId={inst.typeId} data={inst.data} onChange={onChange} />}
    </div>
  )
}

function CampaignBriefingGroup({ campaign, needs, accent, briefing, onUpdateBriefing }: {
  campaign: Campaign; needs: Need[]; accent: string; briefing: CampaignBriefing
  onUpdateBriefing: React.Dispatch<React.SetStateAction<CampaignBriefing[]>>
}) {
  const [collapsed, setCollapsed] = useState(false)
  const updateBlock = (instId: string, key: string, val: string | string[]) => {
    onUpdateBriefing(prev => prev.map(b => b.campaignId !== campaign._id ? b : { ...b, instances: b.instances.map(i => i.id !== instId ? i : { ...i, data: { ...i.data, [key]: val } }) }))
  }
  const deleteBlock = (instId: string) => {
    onUpdateBriefing(prev => prev.map(b => b.campaignId !== campaign._id ? b : { ...b, instances: b.instances.filter(i => i.id !== instId) }))
  }
  const addBlock = (typeId: string) => {
    onUpdateBriefing(prev => prev.map(b => b.campaignId !== campaign._id ? b : { ...b, instances: [...b.instances, { id: uid(), typeId, data: getPrefillForCampaign(typeId, campaign) }] }))
  }

  return (
    <div className={styles.campaignGroup} style={{ '--accent': accent } as React.CSSProperties}>
      <div className={styles.campaignHeader} style={{ background: accent }} onClick={() => setCollapsed(c => !c)}>
        <div className={styles.campaignThumb}>
          {campaign.thumbnail && <Image src={campaign.thumbnail} alt={campaign.title} fill sizes="52px" style={{ objectFit:'cover' }} />}
        </div>
        <div className={styles.campaignHeaderText}>
          <div className={styles.campaignType}>{campaign.type}</div>
          <div className={styles.campaignTitle}>{campaign.title}</div>
        </div>
        <div className={styles.campaignBlockCount}>{briefing.instances.length} blok{briefing.instances.length !== 1 ? 'ken' : ''}</div>
        <div className={`${styles.campaignArrow} ${collapsed ? styles.campaignArrowCollapsed : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4.5L7 9.5L12 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      {!collapsed && (
        <div className={styles.campaignBody}>
          {briefing.instances.length === 0 && <div className={styles.emptyBlocks}>Geen blokken. Voeg er een toe hieronder.</div>}
          {briefing.instances.map(inst => {
            const meta = BLOCK_META[inst.typeId]
            if (!meta) return null
            return <BriefingBlock key={inst.id} inst={inst} meta={meta} onChange={(k,v) => updateBlock(inst.id,k,v)} onDelete={() => deleteBlock(inst.id)} />
          })}
          <div className={styles.addPanel}>
            <div className={styles.addLabel}>Blok toevoegen</div>
            <div className={styles.addGrid}>
              {Object.entries(BLOCK_META).map(([typeId, meta]) => {
                const count = briefing.instances.filter(i => i.typeId === typeId).length
                return <button key={typeId} className={styles.addBtn} onClick={() => addBlock(typeId)}><span className={styles.addIcon}>{meta.icon}</span><span><span className={styles.addTitle}>{meta.title}{count > 0 && <span className={styles.addCount}>{count}</span>}</span><span className={styles.addDesc}>{meta.desc}</span></span></button>
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function BriefingSection({ selectedCampaigns, selectedNeeds, campaignBriefings, sharedFields, onUpdateBriefing, onUpdateShared }: Props) {
  const sf = sharedFields
  const setSF = (k: keyof SharedBriefingFields) => (v: string) => onUpdateShared(prev => ({ ...prev, [k]: v }))

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerIcon}><svg viewBox="0 0 11 11" fill="none" width="11" height="11"><path d="M1 3h9M1 6h6M1 9h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg></div>
        <div className={styles.headerTitle}>Briefing</div>
        <div className={styles.headerSub}>{selectedCampaigns.length} campagne{selectedCampaigns.length !== 1 ? 's' : ''}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Timing & Omschrijving</div>
        <div className={styles.row2}>
          <Field label="Deadline taak *"><input className={styles.input} type="date" value={sf.deadline} onChange={e => setSF('deadline')(e.target.value)} /></Field>
          <Field label="Live datum *"><input className={styles.input} type="date" value={sf.liveDate} onChange={e => setSF('liveDate')(e.target.value)} /></Field>
        </div>
        <Field label="Beschrijf in max. 4 woorden *"><input className={styles.input} type="text" value={sf.desc4} onChange={e => setSF('desc4')(e.target.value)} placeholder="Bijv. Zomercampagne sportbrillen" /></Field>
        <Field label="Meer achtergrondinformatie"><textarea className={styles.textarea} value={sf.bgInfo} onChange={e => setSF('bgInfo')(e.target.value)} placeholder="Bijv. scherm hangt achter de balie..." /></Field>
        <Field label="Referentie naar gelijkaardige taak"><input className={styles.input} type="url" value={sf.refUrl} onChange={e => setSF('refUrl')(e.target.value)} placeholder="https://..." /></Field>
      </div>

      <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Briefing per campagne</div>
      <div className={styles.campaignGroups}>
        {selectedCampaigns.map((c, i) => {
          const briefing = campaignBriefings.find(b => b.campaignId === c._id)
          if (!briefing) return null
          return <CampaignBriefingGroup key={c._id} campaign={c} needs={selectedNeeds} accent={ACCENTS[i % ACCENTS.length]} briefing={briefing} onUpdateBriefing={onUpdateBriefing} />
        })}
      </div>

      <div className={styles.section} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionTitle}>Algemene referentieafbeeldingen</div>
        <UploadZone />
      </div>
    </div>
  )
}
