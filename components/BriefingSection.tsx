'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useI18n } from './i18n'
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
  return typeof value === 'object' && value !== null && 'width' in value && 'height' in value
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

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const { copy } = useI18n()
  return (
    <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{copy.common.chooseShort}</option>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}

function CheckList({
  platforms,
  selected,
  onToggle,
}: {
  platforms: { value: string; label: string }[]
  selected: string[]
  onToggle: (p: string) => void
}) {
  return (
    <div className={styles.checkList}>
      {platforms.map(platform => (
        <label key={platform.value} className={`${styles.checkRow} ${selected.includes(platform.value) ? styles.checked : ''}`} onClick={() => onToggle(platform.value)}>
          <span className={styles.checkBox} />
          <span className={styles.checkLabel}>{platform.label}</span>
        </label>
      ))}
    </div>
  )
}

function UploadZone() {
  const { copy } = useI18n()
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
        <span><strong>{copy.briefing.uploadTitle}</strong>{copy.briefing.uploadRest}</span>
        <span className={styles.uploadHint}>{copy.briefing.uploadHint}</span>
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
  const { copy, briefingOptions } = useI18n()
  return (
    <Field label={label}>
      <div className={styles.periodGrid}>
        <div className={styles.periodField}>
          <span className={styles.periodLabel}>{copy.briefing.from}</span>
          <Inp value={startValue} onChange={onStart} type="date" />
        </div>
        <div className={styles.periodField}>
          <span className={styles.periodLabel}>{copy.briefing.until}</span>
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
  const { copy } = useI18n()
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
          {copy.briefing.addFormat}
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
  const { copy } = useI18n()
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
        <Field label={copy.briefing.fields.storefrontPhotos}><UploadZone /></Field>
        <DimensionList label={copy.briefing.fields.window} entries={dims('windowSizes')} onChange={value => onChange('windowSizes', value)} />
        <DimensionList label={copy.briefing.fields.door} entries={dims('doorSizes')} onChange={value => onChange('doorSizes', value)} />
        <Field label={copy.briefing.fields.notes}>
          <textarea className={styles.textarea} value={str('notes')} onChange={e => onChange('notes', e.target.value)} placeholder={copy.briefing.placeholders.stickerNotes} />
        </Field>
      </div>
    )
  }

  if (typeId === 'af-banner') {
    return (
      <div className={styles.blockBody}>
        <div className={styles.row2}>
          <Field label={copy.briefing.fields.bannerSize}>
            <div className={styles.dimRow}>
              <Inp value={str('banW')} onChange={set('banW')} placeholder="B" type="number" />
              <span className={styles.dimX}>×</span>
              <Inp value={str('banH')} onChange={set('banH')} placeholder="H" type="number" />
              <span className={styles.dimUnit}>cm</span>
            </div>
          </Field>
          <Field label={copy.briefing.fields.material}>
            <Sel value={str('material')} onChange={set('material')} options={briefingOptions.bannerMaterials} />
          </Field>
        </div>
        <Field label={copy.briefing.fields.designWishes}>
          <textarea className={styles.textarea} value={str('designWishes')} onChange={e => onChange('designWishes', e.target.value)} placeholder={copy.briefing.placeholders.bannerDesignWishes} />
        </Field>
        <Field label={copy.briefing.fields.locationPhotos}><UploadZone /></Field>
      </div>
    )
  }

  if (typeId === 'af-print') {
    return (
      <div className={styles.blockBody}>
        <div className={styles.row2}>
          <Field label={copy.briefing.fields.paper}>
            <Sel value={str('paper')} onChange={set('paper')} options={briefingOptions.printPaper} />
          </Field>
          <Field label={copy.briefing.fields.quantity}>
            <Inp value={str('qty')} onChange={set('qty')} placeholder={copy.briefing.placeholders.printQuantity} type="number" />
          </Field>
        </div>
        <div className={styles.row2}>
          <Field label={copy.briefing.fields.orientation}>
            <Sel value={str('orientation')} onChange={set('orientation')} options={briefingOptions.orientation} />
          </Field>
        </div>
        <Field label={copy.briefing.fields.designWishes}>
          <textarea className={styles.textarea} value={str('designWishes')} onChange={e => onChange('designWishes', e.target.value)} placeholder={copy.briefing.placeholders.printDesignWishes} />
        </Field>
        <Field label={copy.briefing.fields.references}><UploadZone /></Field>
      </div>
    )
  }

  if (typeId === 'af-social') {
    return (
      <div className={styles.blockBody}>
        <Field label={copy.briefing.fields.platforms}>
          <CheckList platforms={briefingOptions.socialPlatforms} selected={arr('platforms')} onToggle={togglePlatform} />
        </Field>
        <PeriodFields
          label={copy.briefing.fields.campaignPeriod}
          startValue={str('periodStart')}
          endValue={str('periodEnd')}
          onStart={set('periodStart')}
          onEnd={set('periodEnd')}
        />
        <Field label={copy.briefing.fields.references}><UploadZone /></Field>
      </div>
    )
  }

  if (typeId === 'af-landing') {
    return (
      <div className={styles.blockBody}>
        <div className={styles.row2}>
          <Field label={copy.briefing.fields.websiteUrl}><Inp value={str('website')} onChange={set('website')} placeholder="https://..." type="url" /></Field>
          <Field label={copy.briefing.fields.subpage}><Inp value={str('domain')} onChange={set('domain')} placeholder={copy.briefing.placeholders.landingSubpage} /></Field>
        </div>
      </div>
    )
  }

  if (typeId === 'af-email') {
    return (
      <div className={styles.blockBody}>
        <PeriodFields
          label={copy.briefing.fields.campaignPeriod}
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
          <Field label={copy.briefing.fields.videoType}>
            <Sel value={str('vtype')} onChange={set('vtype')} options={briefingOptions.videoTypes} />
          </Field>
          <Field label={copy.briefing.fields.duration}>
            <Sel value={str('vlen')} onChange={set('vlen')} options={briefingOptions.videoDurations} />
          </Field>
        </div>
        <div className={styles.row2}>
          <Field label={copy.briefing.fields.screenOrientation}>
            <Sel value={str('orientation')} onChange={set('orientation')} options={briefingOptions.orientation} />
          </Field>
          <Field label={copy.briefing.fields.specialFormats}>
            <Inp value={str('specialFormats')} onChange={set('specialFormats')} placeholder={copy.briefing.placeholders.specialFormats} />
          </Field>
        </div>
        <Field label={copy.briefing.fields.whereShown}>
          <Inp value={str('placement')} onChange={set('placement')} placeholder={copy.briefing.placeholders.videoPlacement} />
        </Field>
      </div>
    )
  }

  if (typeId === 'af-other') {
    return (
      <div className={styles.blockBody}>
        <Field label={copy.briefing.fields.describeNeed}>
          <textarea className={styles.textarea} value={str('request')} onChange={e => onChange('request', e.target.value)} placeholder={copy.briefing.placeholders.otherNeed} />
        </Field>
        <Field label={copy.briefing.fields.examples}>
          <UploadZone />
        </Field>
        <Field label={copy.briefing.fields.extraInfo}>
          <textarea className={styles.textarea} value={str('extraInfo')} onChange={e => onChange('extraInfo', e.target.value)} placeholder={copy.briefing.placeholders.otherExtraInfo} />
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
  const { translateBlockMeta, copy } = useI18n()
  const [open, setOpen] = useState(true)
  const localizedMeta = translateBlockMeta(inst.typeId) || meta

  return (
    <div className={styles.block}>
      <div className={styles.blockHead} onClick={() => setOpen(prev => !prev)}>
        <div className={styles.blockIcon}>{localizedMeta.icon}</div>
        <div className={styles.blockMeta}>
          <div className={styles.blockTitle}>{localizedMeta.title}</div>
          <div className={styles.blockDesc}>{localizedMeta.desc}</div>
        </div>
        <button className={`${styles.toggle} ${open ? styles.toggleOpen : ''}`} onClick={e => { e.stopPropagation(); setOpen(prev => !prev) }} type="button">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); onDelete() }} title={copy.briefing.deleteBlock} type="button">✕</button>
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
  const { translateCampaignType, translateBlockMeta, copy } = useI18n()
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
          <div className={styles.campaignType}>{translateCampaignType(campaign.type)}</div>
          <div className={styles.campaignTitle}>{campaign.title}</div>
        </div>
        <div className={styles.campaignBlockCount}>{copy.briefing.blockCount(briefing.instances.length)}</div>
        <div className={`${styles.campaignArrow} ${collapsed ? styles.campaignArrowCollapsed : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4.5L7 9.5L12 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {!collapsed && (
        <div className={styles.campaignBody}>
          {briefing.instances.length === 0 && <div className={styles.emptyBlocks}>{copy.briefing.noBlocks}</div>}
          {briefing.instances.map(instance => {
            const meta = BLOCK_META[instance.typeId]
            if (!meta) return null
            return <BriefingBlock key={instance.id} inst={instance} meta={meta} onChange={(key, value) => updateBlock(instance.id, key, value)} onDelete={() => deleteBlock(instance.id)} />
          })}
          <div className={styles.addPanel}>
            <div className={styles.addLabel}>{copy.briefing.addBlock}</div>
            <div className={styles.addGrid}>
              {Object.entries(BLOCK_META).map(([typeId, meta]) => {
                const count = briefing.instances.filter(instance => instance.typeId === typeId).length
                const localizedMeta = translateBlockMeta(typeId) || meta
                return (
                  <button key={typeId} className={styles.addBtn} onClick={() => addBlock(typeId)} type="button">
                    <span className={styles.addIcon}>{localizedMeta.icon}</span>
                    <span className={styles.addText}>
                      <span className={styles.addTitle}>{localizedMeta.title}{count > 0 && <span className={styles.addCount}>{count}</span>}</span>
                      <span className={styles.addDesc}>{localizedMeta.desc}</span>
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
  const { copy } = useI18n()
  const setSharedField = (key: keyof SharedBriefingFields) => (value: string) => onUpdateShared(prev => ({ ...prev, [key]: value }))

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg viewBox="0 0 11 11" fill="none" width="11" height="11">
            <path d="M1 3h9M1 6h6M1 9h4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.headerTitle}>{copy.briefing.title}</div>
        <div className={styles.headerSub}>{copy.library.campaignCount(selectedCampaigns.length)}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{copy.briefing.timing}</div>
        <div className={styles.row2}>
          <Field label={copy.briefing.deadline}><input className={styles.input} type="date" value={sharedFields.deadline} onChange={e => setSharedField('deadline')(e.target.value)} /></Field>
          <Field label={copy.briefing.liveDate}><input className={styles.input} type="date" value={sharedFields.liveDate} onChange={e => setSharedField('liveDate')(e.target.value)} /></Field>
        </div>
        <Field label={copy.briefing.shortDescription}><input className={styles.input} type="text" value={sharedFields.desc4} onChange={e => setSharedField('desc4')(e.target.value)} placeholder={copy.briefing.shortDescriptionPlaceholder} /></Field>
        <Field label={copy.briefing.backgroundInfo}><textarea className={styles.textarea} value={sharedFields.bgInfo} onChange={e => setSharedField('bgInfo')(e.target.value)} placeholder={copy.briefing.backgroundPlaceholder} /></Field>
        <Field label={copy.briefing.similarReference}><input className={styles.input} type="url" value={sharedFields.refUrl} onChange={e => setSharedField('refUrl')(e.target.value)} placeholder="https://..." /></Field>
      </div>

      <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>{copy.briefing.perCampaign}</div>
      <div className={styles.campaignGroups}>
        {selectedCampaigns.map((campaign, index) => {
          const briefing = campaignBriefings.find(item => item.campaignId === campaign._id)
          if (!briefing) return null
          return <CampaignBriefingGroup key={campaign._id} campaign={campaign} accent={ACCENTS[index % ACCENTS.length]} briefing={briefing} onUpdateBriefing={onUpdateBriefing} />
        })}
      </div>

      <div className={styles.section} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionTitle}>{copy.briefing.generalReferences}</div>
        <UploadZone />
      </div>
    </div>
  )
}
