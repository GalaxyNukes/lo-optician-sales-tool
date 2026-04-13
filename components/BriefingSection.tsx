'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { Campaign } from './types'
import { BLOCK_META } from './types'
import type {
  BriefingInstance,
  BriefingValue,
  CampaignBriefing,
  DimensionEntry,
  SharedBriefingFields,
} from './CampaignCatalog'
import { uid, getPrefillForCampaign } from './CampaignCatalog'
import styles from './BriefingSection.module.css'

interface Props {
  selectedCampaigns: Campaign[]
  campaignBriefings: CampaignBriefing[]
  sharedFields: SharedBriefingFields
  onUpdateBriefing: React.Dispatch<React.SetStateAction<CampaignBriefing[]>>
  onUpdateShared: React.Dispatch<React.SetStateAction<SharedBriefingFields>>
}

const ACCENTS = ['#0D2340', '#1A6B4A', '#8B3A2A', '#2A4E8B', '#6B2A8B', '#8B6B2A', '#2A6B6B']
const EMPTY_DIMENSION: DimensionEntry = { width: '', height: '' }

function isDimensionEntry(value: unknown): value is DimensionEntry {
  return Boolean(value) && typeof value === 'object' && 'width' in value && 'height' in value
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isDimensionArray(value: unknown): value is DimensionEntry[] {
  return Array.isArray(value) && value.every(isDimensionEntry)
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className={styles.field}><label className={styles.fieldLabel}>{label}</label>{children}</div>
}

function Inp({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input className={styles.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Kies...</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  )
}

function CheckList({ platforms, selected, onToggle }: { platforms: string[]; selected: string[]; onToggle: (p: string) => void }) {
  return (
    <div className={styles.checkList}>
      {platforms.map(platform => (
        <label key={platform} className={`${styles.checkRow} ${selected.includes(platform) ? styles.checked : ''}`} onClick={() => onToggle(platform)}>
          <span className={styles.checkBox} />
          <span className={styles.checkLabel}>{platform}</span>
        </label>
      ))}
    </div>
  )
}

function UploadZone() {
  const [previews, setPreviews] = useState<string[]>([])
  const ref = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = event => setPreviews(prev => [...prev, event.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  return (
    <div>
      <div
        className={styles.uploadZone}
        onClick={() => ref.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v8M3 5l4-4 4 4M1 11h12" stroke="var(--navy)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span><strong>Klik om te uploaden</strong> of sleep hier naartoe</span>
        <span className={styles.uploadHint}>JPG, PNG — max. 10MB</span>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
      {previews.length > 0 && (
        <div className={styles.previews}>
          {previews.map((src, index) => (
            <div key={index} className={styles.preview}>
              <img src={src} alt="" />
              <button className={styles.previewRm} onClick={() => setPreviews(prev => prev.filter((_, i) => i !== index))} type="button">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PeriodFields({
  label,
  startValue,
  endValue,
  onStart,
  onEnd,
}: {
  label: string
  startValue: string
  endValue: string
  onStart: (value: string) => void
  onEnd: (value: string) => void
}) {
  return (
    <Field label={label}>
      <div className={styles.periodGrid}>
        <div className={styles.periodField}>
          <span className={styles.periodLabel}>Van</span>
          <Inp value={startValue} onChange={onStart} type="date" />
        </div>
        <div className={styles.periodField}>
          <span className={styles.periodLabel}>Tot</span>
          <Inp value={endValue} onChange={onEnd} type="date" />
        </div>
      </div>
    </Field>
  )
}

function DimensionList({
  label,
  entries,
  onChange,
}: {
  label: string
  entries: DimensionEntry[]
  onChange: (entries: DimensionEntry[]) => void
}) {
  const rows = entries.length ? entries : [EMPTY_DIMENSION]

  const updateEntry = (index: number, key: keyof DimensionEntry, value: string) => {
    const next = rows.map((entry, rowIndex) => rowIndex === index ? { ...entry, [key]: value } : entry)
    onChange(next)
  }

  const addEntry = () => onChange([...rows, EMPTY_DIMENSION])

  const removeEntry = (index: number) => {
    const next = rows.filter((_, rowIndex) => rowIndex !== index)
    onChange(next.length ? next : [EMPTY_DIMENSION])
  }

  return (
    <Field label={label}>
      <div className={styles.dimensionList}>
        {rows.map((entry, index) => (
          <div key={index} className={styles.dimensionRow}>
            <Inp value={entry.width} onChange={value => updateEntry(index, 'width', value)} placeholder="B" type="number" />
            <span className={styles.dimX}>×</span>
            <Inp value={entry.height} onChange={value => updateEntry(index, 'height', value)} placeholder="H" type="number" />
            <span className={styles.dimUnit}>cm</span>
            {rows.length > 1 && (
              <button className={styles.dimensionRemove} onClick={() => removeEntry(index)} type="button">
                ✕
              </button>
            )}
          </div>
        ))}
        <button className={styles.dimensionAdd} onClick={addEntry} type="button">
          + Voeg formaat toe
        </button>
      </div>
    </Field>
  )
}

function BlockContent({
  typeId,
  data,
  onChange,
}: {
  typeId: string
  data: Record<string, BriefingValue>
  onChange: (key: string, value: BriefingValue) => void
}) {
  const str = (key: string) => typeof data[key] === 'string' ? data[key] as string : ''
  const arr = (key: string) => isStringArray(data[key]) ? data[key] : []
  const dims = (key: string) => isDimensionArray(data[key]) ? data[key] : []
  const set = (key: string) => (value: string) => onChange(key, value)
  const togglePlatform = (platform: string) => {
    const current = arr('platforms')
    onChange('platforms', current.includes(platform) ? current.filter(item => item !== platform) : [...current, platform])
  }

  if (typeId === 'af-sticker') {
    return (
      <div className={styles.blockBody}>
        <Field label="Foto's etalage / winkelgevel"><UploadZone /></Field>
        <DimensionList label="Etalageraam" entries={dims('windowSizes')} onChange={value => onChange('windowSizes', value)} />
        <DimensionList label="Deur" entries={dims('doorSizes')} onChange={value => onChange('doorSizes', value)} />
        <Field label="Opmerkingen">
          <textarea className={styles.textarea} value={str('notes')} onChange={e => onChange('notes', e.target.value)} placeholder="Bijv. raam is gebogen of deurlijst is zichtbaar..." />
        </Field>
      </div>
    )
  }

  if (typeId === 'af-banner') {
    return (
      <div className={styles.blockBody}>
        <div className={styles.row2}>
          <Field label="Formaat (cm)">
            <div className={styles.dimRow}>
              <Inp value={str('banW')} onChange={set('banW')} placeholder="B" type="number" />
              <span className={styles.dimX}>×</span>
              <Inp value={str('banH')} onChange={set('banH')} placeholder="H" type="number" />
              <span className={styles.dimUnit}>cm</span>
            </div>
          </Field>
          <Field label="Materiaal">
            <Sel value={str('material')} onChange={set('material')} options={['Spandoek PVC', 'Textiel banner', 'Vlag (wimpel)', 'Lichtbak folie', 'Nog niet bepaald']} />
          </Field>
        </div>
        <Field label="Wat zijn je design wensen (niet)?">
          <textarea className={styles.textarea} value={str('designWishes')} onChange={e => onChange('designWishes', e.target.value)} placeholder="Bijv. strak en minimalistisch, geen drukke achtergronden..." />
        </Field>
        <Field label="Locatiefoto's"><UploadZone /></Field>
      </div>
    )
  }

  if (typeId === 'af-print') {
    return (
      <div className={styles.blockBody}>
        <div className={styles.row2}>
          <Field label="Papierformaat">
            <Sel value={str('paper')} onChange={set('paper')} options={['A6 (flyer)', 'A5', 'A4', 'A3', 'A2', 'A1', 'Aangepast formaat']} />
          </Field>
          <Field label="Oplage">
            <Inp value={str('qty')} onChange={set('qty')} placeholder="Bijv. 500" type="number" />
          </Field>
        </div>
        <div className={styles.row2}>
          <Field label="Oriëntatie">
            <Sel value={str('orientation')} onChange={set('orientation')} options={['Verticaal', 'Horizontaal']} />
          </Field>
        </div>
        <Field label="Wat zijn je design wensen (niet)?">
          <textarea className={styles.textarea} value={str('designWishes')} onChange={e => onChange('designWishes', e.target.value)} placeholder="Bijv. veel witruimte, zeker geen prijsexplosies..." />
        </Field>
        <Field label="Referentieafbeeldingen"><UploadZone /></Field>
      </div>
    )
  }

  if (typeId === 'af-social') {
    return (
      <div className={styles.blockBody}>
        <Field label="Platformen">
          <CheckList platforms={['Instagram (post + story)', 'Facebook', 'LinkedIn', 'TikTok', 'Google Display Ads']} selected={arr('platforms')} onToggle={togglePlatform} />
        </Field>
        <PeriodFields
          label="Wat is de periode van de campagne?"
          startValue={str('periodStart')}
          endValue={str('periodEnd')}
          onStart={set('periodStart')}
          onEnd={set('periodEnd')}
        />
        <Field label="Referentieafbeeldingen"><UploadZone /></Field>
      </div>
    )
  }

  if (typeId === 'af-landing') {
    return (
      <div className={styles.blockBody}>
        <div className={styles.row2}>
          <Field label="Website URL"><Inp value={str('website')} onChange={set('website')} placeholder="https://..." type="url" /></Field>
          <Field label="Subpagina"><Inp value={str('domain')} onChange={set('domain')} placeholder="/zomer-actie" /></Field>
        </div>
      </div>
    )
  }

  if (typeId === 'af-email') {
    return (
      <div className={styles.blockBody}>
        <PeriodFields
          label="Wat is de periode van de campagne?"
          startValue={str('periodStart')}
          endValue={str('periodEnd')}
          onStart={set('periodStart')}
          onEnd={set('periodEnd')}
        />
      </div>
    )
  }

  if (typeId === 'af-video') {
    return (
      <div className={styles.blockBody}>
        <div className={styles.row2}>
          <Field label="Type video">
            <Sel value={str('vtype')} onChange={set('vtype')} options={['Campagnevideo (winkel)', 'Lifestyle / algemeen', 'Product showcase', 'Social media Reel']} />
          </Field>
          <Field label="Duur">
            <Sel value={str('vlen')} onChange={set('vlen')} options={['15 seconden', '30 seconden', '60 seconden', '+1 minuut']} />
          </Field>
        </div>
        <div className={styles.row2}>
          <Field label="Scherm oriëntatie">
            <Sel value={str('orientation')} onChange={set('orientation')} options={['Verticaal', 'Horizontaal']} />
          </Field>
          <Field label="Speciale formaten">
            <Inp value={str('specialFormats')} onChange={set('specialFormats')} placeholder="Indien van toepassing" />
          </Field>
        </div>
        <Field label="Waar zal de video getoond worden">
          <Inp value={str('placement')} onChange={set('placement')} placeholder="Bijv. etalagescherm, wachtzaal, social ads..." />
        </Field>
      </div>
    )
  }

  if (typeId === 'af-other') {
    return (
      <div className={styles.blockBody}>
        <Field label="Beschrijf wat je nodig hebt">
          <textarea className={styles.textarea} value={str('request')} onChange={e => onChange('request', e.target.value)} placeholder="Controleer eerst of de deliverable niet in het keuzemenu staat." />
        </Field>
        <Field label="Indien je voorbeelden of foto's hebt, voeg deze dan toe aan de taak">
          <UploadZone />
        </Field>
        <Field label="Geef meer informatie">
          <textarea className={styles.textarea} value={str('extraInfo')} onChange={e => onChange('extraInfo', e.target.value)} placeholder="Extra context, plaatsing, timing of aandachtspunten..." />
        </Field>
      </div>
    )
  }

  return null
}

function BriefingBlock({
  inst,
  meta,
  onChange,
  onDelete,
}: {
  inst: BriefingInstance
  meta: typeof BLOCK_META[string]
  onChange: (key: string, value: BriefingValue) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className={styles.block}>
      <div className={styles.blockHead} onClick={() => setOpen(prev => !prev)}>
        <div className={styles.blockIcon}>{meta.icon}</div>
        <div className={styles.blockMeta}>
          <div className={styles.blockTitle}>{meta.title}</div>
          <div className={styles.blockDesc}>{meta.desc}</div>
        </div>
        <button className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`} onClick={e => { e.stopPropagation(); setOpen(prev => !prev) }} type="button">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); onDelete() }} title="Verwijder blok" type="button">✕</button>
      </div>
      {open && <BlockContent typeId={inst.typeId} data={inst.data} onChange={onChange} />}
    </div>
  )
}

function CampaignBriefingGroup({
  campaign,
  accent,
  briefing,
  onUpdateBriefing,
}: {
  campaign: Campaign
  accent: string
  briefing: CampaignBriefing
  onUpdateBriefing: React.Dispatch<React.SetStateAction<CampaignBriefing[]>>
}) {
  const [collapsed, setCollapsed] = useState(false)

  const updateBlock = (instId: string, key: string, value: BriefingValue) => {
    onUpdateBriefing(prev => prev.map(item => item.campaignId !== campaign._id ? item : {
      ...item,
      instances: item.instances.map(instance => instance.id !== instId ? instance : {
        ...instance,
        data: { ...instance.data, [key]: value },
      }),
    }))
  }

  const deleteBlock = (instId: string) => {
    onUpdateBriefing(prev => prev.map(item => item.campaignId !== campaign._id ? item : {
      ...item,
      instances: item.instances.filter(instance => instance.id !== instId),
    }))
  }

  const addBlock = (typeId: string) => {
    onUpdateBriefing(prev => prev.map(item => item.campaignId !== campaign._id ? item : {
      ...item,
      instances: [...item.instances, { id: uid(), typeId, data: getPrefillForCampaign(typeId, campaign) }],
    }))
  }

  return (
    <div className={styles.campaignGroup} style={{ '--accent': accent } as React.CSSProperties}>
      <div className={styles.campaignHeader} style={{ background: accent }} onClick={() => setCollapsed(prev => !prev)}>
        <div className={styles.campaignThumb}>
          {campaign.thumbnail && <Image src={campaign.thumbnail} alt={campaign.title} fill sizes="52px" style={{ objectFit: 'cover' }} />}
        </div>
        <div className={styles.campaignHeaderText}>
          <div className={styles.campaignType}>{campaign.type}</div>
          <div className={styles.campaignTitle}>{campaign.title}</div>
        </div>
        <div className={styles.campaignBlockCount}>{briefing.instances.length} blok{briefing.instances.length !== 1 ? 'ken' : ''}</div>
        <div className={`${styles.campaignArrow} ${collapsed ? styles.campaignArrowCollapsed : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4.5L7 9.5L12 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {!collapsed && (
        <div className={styles.campaignBody}>
          {briefing.instances.length === 0 && <div className={styles.emptyBlocks}>Geen blokken. Voeg er een toe hieronder.</div>}
          {briefing.instances.map(instance => {
            const meta = BLOCK_META[instance.typeId]
            if (!meta) return null
            return <BriefingBlock key={instance.id} inst={instance} meta={meta} onChange={(key, value) => updateBlock(instance.id, key, value)} onDelete={() => deleteBlock(instance.id)} />
          })}
          <div className={styles.addPanel}>
            <div className={styles.addLabel}>Blok toevoegen</div>
            <div className={styles.addGrid}>
              {Object.entries(BLOCK_META).map(([typeId, meta]) => {
                const count = briefing.instances.filter(instance => instance.typeId === typeId).length
                return (
                  <button key={typeId} className={styles.addBtn} onClick={() => addBlock(typeId)} type="button">
                    <span className={styles.addIcon}>{meta.icon}</span>
                    <span>
                      <span className={styles.addTitle}>{meta.title}{count > 0 && <span className={styles.addCount}>{count}</span>}</span>
                      <span className={styles.addDesc}>{meta.desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function BriefingSection({ selectedCampaigns, campaignBriefings, sharedFields, onUpdateBriefing, onUpdateShared }: Props) {
  const setSharedField = (key: keyof SharedBriefingFields) => (value: string) => onUpdateShared(prev => ({ ...prev, [key]: value }))

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg viewBox="0 0 11 11" fill="none" width="11" height="11">
            <path d="M1 3h9M1 6h6M1 9h4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.headerTitle}>Briefing</div>
        <div className={styles.headerSub}>{selectedCampaigns.length} campagne{selectedCampaigns.length !== 1 ? 's' : ''}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Timing & Omschrijving</div>
        <div className={styles.row2}>
          <Field label="Deadline taak *"><input className={styles.input} type="date" value={sharedFields.deadline} onChange={e => setSharedField('deadline')(e.target.value)} /></Field>
          <Field label="Live datum *"><input className={styles.input} type="date" value={sharedFields.liveDate} onChange={e => setSharedField('liveDate')(e.target.value)} /></Field>
        </div>
        <Field label="Beschrijf in max. 4 woorden *"><input className={styles.input} type="text" value={sharedFields.desc4} onChange={e => setSharedField('desc4')(e.target.value)} placeholder="Bijv. Zomercampagne sportbrillen" /></Field>
        <Field label="Meer achtergrondinformatie"><textarea className={styles.textarea} value={sharedFields.bgInfo} onChange={e => setSharedField('bgInfo')(e.target.value)} placeholder="Bijv. scherm hangt achter de balie..." /></Field>
        <Field label="Referentie naar gelijkaardige taak"><input className={styles.input} type="url" value={sharedFields.refUrl} onChange={e => setSharedField('refUrl')(e.target.value)} placeholder="https://..." /></Field>
      </div>

      <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Briefing per campagne</div>
      <div className={styles.campaignGroups}>
        {selectedCampaigns.map((campaign, index) => {
          const briefing = campaignBriefings.find(item => item.campaignId === campaign._id)
          if (!briefing) return null
          return <CampaignBriefingGroup key={campaign._id} campaign={campaign} accent={ACCENTS[index % ACCENTS.length]} briefing={briefing} onUpdateBriefing={onUpdateBriefing} />
        })}
      </div>

      <div className={styles.section} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionTitle}>Algemene referentieafbeeldingen</div>
        <UploadZone />
      </div>
    </div>
  )
}
