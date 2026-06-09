'use client'

import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from './i18n'
import type { BriefingOptionKey } from './i18n'
import type { BriefingValue, DimensionEntry } from './CampaignCatalog'
import styles from './BriefingSection.module.css'

// ── Field-set registry ────────────────────────────────────────────────────────
// One spec drives both the editable form (AssetFields) and the read-only summary
// (summarizeAssetFields). Labels/placeholders reference existing i18n keys, so no
// new field-label translations are required. `key` values match the legacy data
// keys so the summary doc and field shapes stay compatible.

type FieldSpec =
  | { kind: 'text' | 'number' | 'url'; key: string; labelKey: string; phKey?: string }
  | { kind: 'textarea'; key: string; labelKey: string; phKey?: string }
  | { kind: 'select'; key: string; labelKey: string; options: BriefingOptionKey }
  | { kind: 'checklist'; key: string; labelKey: string; options: BriefingOptionKey }
  | { kind: 'period'; startKey: string; endKey: string; labelKey: string }
  | { kind: 'dimensions'; key: string; labelKey: string }
  | { kind: 'bannerSize'; wKey: string; hKey: string; labelKey: string }
  | { kind: 'upload'; labelKey: string }

type FieldRow = FieldSpec | { kind: 'row'; cols: FieldSpec[] }

const bannerRow: FieldRow[] = [
  { kind: 'row', cols: [
    { kind: 'bannerSize', wKey: 'banW', hKey: 'banH', labelKey: 'bannerSize' },
    { kind: 'select', key: 'material', labelKey: 'material', options: 'bannerMaterials' },
  ] },
  { kind: 'textarea', key: 'designWishes', labelKey: 'designWishes', phKey: 'bannerDesignWishes' },
]

const printRow = (withRefs: boolean): FieldRow[] => [
  { kind: 'row', cols: [
    { kind: 'select', key: 'paper', labelKey: 'paper', options: 'printPaper' },
    { kind: 'number', key: 'qty', labelKey: 'quantity', phKey: 'printQuantity' },
  ] },
  { kind: 'row', cols: [
    { kind: 'select', key: 'orientation', labelKey: 'orientation', options: 'orientation' },
  ] },
  { kind: 'textarea', key: 'designWishes', labelKey: 'designWishes', phKey: 'printDesignWishes' },
  ...(withRefs ? [{ kind: 'upload', labelKey: 'references' } as FieldSpec] : []),
]

export const ASSET_FIELDS: Record<string, FieldRow[]> = {
  'social-meta': [
    { kind: 'checklist', key: 'platforms', labelKey: 'platforms', options: 'socialPlatforms' },
    { kind: 'period', startKey: 'periodStart', endKey: 'periodEnd', labelKey: 'campaignPeriod' },
    { kind: 'upload', labelKey: 'references' },
  ],
  'social-google': [
    { kind: 'period', startKey: 'periodStart', endKey: 'periodEnd', labelKey: 'campaignPeriod' },
    { kind: 'textarea', key: 'designWishes', labelKey: 'designWishes', phKey: 'bannerDesignWishes' },
    { kind: 'upload', labelKey: 'references' },
  ],
  'print-flyer': printRow(true),
  'print-poster': printRow(false),
  'print-dm': [
    { kind: 'row', cols: [
      { kind: 'select', key: 'paper', labelKey: 'paper', options: 'printPaper' },
      { kind: 'number', key: 'qty', labelKey: 'quantity', phKey: 'printQuantity' },
    ] },
    { kind: 'textarea', key: 'designWishes', labelKey: 'designWishes', phKey: 'printDesignWishes' },
    { kind: 'upload', labelKey: 'references' },
  ],
  'banner-outdoor': [...bannerRow, { kind: 'upload', labelKey: 'locationPhotos' }],
  'banner-lightbox': [...bannerRow, { kind: 'upload', labelKey: 'locationPhotos' }],
  'banner-vlag': bannerRow,
  'sticker-etalage': [
    { kind: 'upload', labelKey: 'storefrontPhotos' },
    { kind: 'dimensions', key: 'windowSizes', labelKey: 'window' },
    { kind: 'textarea', key: 'designWishes', labelKey: 'designWishes', phKey: 'bannerDesignWishes' },
    { kind: 'textarea', key: 'notes', labelKey: 'notes', phKey: 'stickerNotes' },
  ],
  'pos': [
    { kind: 'textarea', key: 'request', labelKey: 'describeNeed', phKey: 'otherNeed' },
    { kind: 'row', cols: [
      { kind: 'number', key: 'qty', labelKey: 'quantity', phKey: 'printQuantity' },
    ] },
    { kind: 'textarea', key: 'notes', labelKey: 'notes', phKey: 'stickerNotes' },
  ],
  'email': [
    { kind: 'period', startKey: 'periodStart', endKey: 'periodEnd', labelKey: 'campaignPeriod' },
  ],
  'landing': [
    { kind: 'row', cols: [
      { kind: 'url', key: 'website', labelKey: 'websiteUrl' },
      { kind: 'text', key: 'domain', labelKey: 'subpage', phKey: 'landingSubpage' },
    ] },
  ],
  'video': [
    { kind: 'row', cols: [
      { kind: 'select', key: 'vtype', labelKey: 'videoType', options: 'videoTypes' },
      { kind: 'select', key: 'vlen', labelKey: 'duration', options: 'videoDurations' },
    ] },
    { kind: 'row', cols: [
      { kind: 'select', key: 'orientation', labelKey: 'screenOrientation', options: 'orientation' },
      { kind: 'text', key: 'specialFormats', labelKey: 'specialFormats', phKey: 'specialFormats' },
    ] },
    { kind: 'text', key: 'placement', labelKey: 'whereShown', phKey: 'videoPlacement' },
  ],
  'partner-branding': [
    { kind: 'upload', labelKey: 'storefrontPhotos' },
    { kind: 'dimensions', key: 'windowSizes', labelKey: 'window' },
    { kind: 'dimensions', key: 'doorSizes', labelKey: 'door' },
    { kind: 'textarea', key: 'notes', labelKey: 'notes', phKey: 'stickerNotes' },
  ],
  'other': [
    { kind: 'textarea', key: 'request', labelKey: 'describeNeed', phKey: 'otherNeed' },
    { kind: 'upload', labelKey: 'examples' },
    { kind: 'textarea', key: 'extraInfo', labelKey: 'extraInfo', phKey: 'otherExtraInfo' },
  ],
}

// ── Type guards / accessors ───────────────────────────────────────────────────
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

function flattenRows(rows: FieldRow[]): FieldSpec[] {
  return rows.flatMap(row => (row.kind === 'row' ? row.cols : [row]))
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

// ── Reusable field primitives ─────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: ReactNode }) {
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

function CheckList({ platforms, selected, onToggle }: { platforms: { value: string; label: string }[]; selected: string[]; onToggle: (p: string) => void }) {
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

export function UploadZone() {
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
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v8M3 5l4-4 4 4M1 11h12" stroke="var(--navy)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span><strong>{copy.briefing.uploadTitle}</strong>{copy.briefing.uploadRest}</span>
        <span className={styles.uploadHint}>{copy.briefing.uploadHint}</span>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
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

function PeriodFields({ label, startValue, endValue, onStart, onEnd }: { label: string; startValue: string; endValue: string; onStart: (v: string) => void; onEnd: (v: string) => void }) {
  const { copy } = useI18n()
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

function DimensionList({ label, entries, onChange }: { label: string; entries: DimensionEntry[]; onChange: (entries: DimensionEntry[]) => void }) {
  const { copy } = useI18n()
  const rows = entries.length ? entries : [EMPTY_DIMENSION]

  const updateEntry = (index: number, key: keyof DimensionEntry, value: string) => {
    onChange(rows.map((entry, rowIndex) => rowIndex === index ? { ...entry, [key]: value } : entry))
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
              <button className={styles.dimensionRemove} onClick={() => removeEntry(index)} type="button">✕</button>
            )}
          </div>
        ))}
        <button className={styles.dimensionAdd} onClick={addEntry} type="button">{copy.briefing.addFormat}</button>
      </div>
    </Field>
  )
}

// ── Editable form ─────────────────────────────────────────────────────────────
export function AssetFields({
  assetKey,
  data,
  onChange,
}: {
  assetKey: string
  data: Record<string, BriefingValue>
  onChange: (key: string, value: BriefingValue) => void
}) {
  const { copy, briefingOptions } = useI18n()
  const rows = ASSET_FIELDS[assetKey] ?? []

  const str = (key: string) => typeof data[key] === 'string' ? data[key] as string : ''
  const arr = (key: string) => isStringArray(data[key]) ? data[key] : []
  const dims = (key: string) => isDimensionArray(data[key]) ? data[key] : []
  const fieldLabel = (k: string) => (copy.briefing.fields as Record<string, string>)[k] ?? k
  const phText = (k?: string) => k ? (copy.briefing.placeholders as Record<string, string>)[k] : undefined

  const toggleList = (key: string) => (value: string) => {
    const current = arr(key)
    onChange(key, current.includes(value) ? current.filter(item => item !== value) : [...current, value])
  }

  function renderSpec(spec: FieldSpec, index: number) {
    const label = fieldLabel(spec.labelKey)
    switch (spec.kind) {
      case 'text':
      case 'number':
      case 'url':
        return (
          <Field key={index} label={label}>
            <Inp value={str(spec.key)} onChange={v => onChange(spec.key, v)} type={spec.kind === 'text' ? 'text' : spec.kind} placeholder={phText(spec.phKey)} />
          </Field>
        )
      case 'textarea':
        return (
          <Field key={index} label={label}>
            <textarea className={styles.textarea} value={str(spec.key)} onChange={e => onChange(spec.key, e.target.value)} placeholder={phText(spec.phKey)} />
          </Field>
        )
      case 'select':
        return (
          <Field key={index} label={label}>
            <Sel value={str(spec.key)} onChange={v => onChange(spec.key, v)} options={briefingOptions[spec.options]} />
          </Field>
        )
      case 'checklist':
        return (
          <Field key={index} label={label}>
            <CheckList platforms={briefingOptions[spec.options]} selected={arr(spec.key)} onToggle={toggleList(spec.key)} />
          </Field>
        )
      case 'period':
        return (
          <PeriodFields key={index} label={label} startValue={str(spec.startKey)} endValue={str(spec.endKey)} onStart={v => onChange(spec.startKey, v)} onEnd={v => onChange(spec.endKey, v)} />
        )
      case 'dimensions':
        return (
          <DimensionList key={index} label={label} entries={dims(spec.key)} onChange={v => onChange(spec.key, v)} />
        )
      case 'bannerSize':
        return (
          <Field key={index} label={label}>
            <div className={styles.dimRow}>
              <Inp value={str(spec.wKey)} onChange={v => onChange(spec.wKey, v)} placeholder="B" type="number" />
              <span className={styles.dimX}>×</span>
              <Inp value={str(spec.hKey)} onChange={v => onChange(spec.hKey, v)} placeholder="H" type="number" />
              <span className={styles.dimUnit}>cm</span>
            </div>
          </Field>
        )
      case 'upload':
        return <Field key={index} label={label}><UploadZone /></Field>
    }
  }

  return (
    <div>
      {rows.map((row, rowIndex) =>
        row.kind === 'row'
          ? <div key={rowIndex} className={styles.row2}>{row.cols.map((spec, i) => renderSpec(spec, i))}</div>
          : renderSpec(row, rowIndex)
      )}
    </div>
  )
}

// ── Read-only summary (used by SummaryModal + briefing doc) ────────────────────
export function summarizeAssetFields(
  assetKey: string,
  data: Record<string, BriefingValue>,
  copy: ReturnType<typeof useI18n>['copy'],
  translateBriefingValue: ReturnType<typeof useI18n>['translateBriefingValue'],
): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = []
  const str = (key: string) => typeof data[key] === 'string' ? data[key] as string : ''
  const arr = (key: string) => isStringArray(data[key]) ? data[key] : []
  const dims = (key: string) => isDimensionArray(data[key]) ? data[key] : []
  const fieldLabel = (k: string) => (copy.briefing.fields as Record<string, string>)[k] ?? k

  for (const spec of flattenRows(ASSET_FIELDS[assetKey] ?? [])) {
    const label = fieldLabel(spec.labelKey)
    if (spec.kind === 'select') {
      if (str(spec.key)) out.push({ label, value: translateBriefingValue(spec.options, str(spec.key)) })
    } else if (spec.kind === 'checklist') {
      const values = arr(spec.key)
      if (values.length) out.push({ label, value: values.map(v => translateBriefingValue(spec.options, v)).join(', ') })
    } else if (spec.kind === 'period') {
      const period = formatPeriod(str(spec.startKey), str(spec.endKey))
      if (period) out.push({ label, value: period })
    } else if (spec.kind === 'dimensions') {
      const value = formatDimensions(dims(spec.key))
      if (value) out.push({ label, value })
    } else if (spec.kind === 'bannerSize') {
      if (str(spec.wKey) || str(spec.hKey)) out.push({ label, value: `${str(spec.wKey) || '?'} × ${str(spec.hKey) || '?'} cm` })
    } else if (spec.kind !== 'upload') {
      if (str(spec.key)) out.push({ label, value: str(spec.key) })
    }
  }
  return out
}
