'use client'

import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from './i18n'
import type { BriefingValue, DimensionEntry, FieldSpec, FieldRow, ShowIf } from './deliverables'
import { getDeliverable, flattenRows, formatPeriod, formatDimensions } from './deliverables'
import { StorefrontMockupModal, MockupPreview, parseMockups, EMPTY_MOCKUP } from './StorefrontMockup'
import type { MockupState } from './StorefrontMockup'
import styles from './BriefingSection.module.css'

// ── Type guards / accessors ───────────────────────────────────────────────────
const EMPTY_DIMENSION: DimensionEntry = { width: '', height: '' }
const EMPTY_PLACEMENT: DimensionEntry = { kind: 'window', width: '', height: '', placement: '', note: '' }

function isDimensionEntry(value: unknown): value is DimensionEntry {
  return typeof value === 'object' && value !== null && 'width' in value && 'height' in value
}
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}
function isDimensionArray(value: unknown): value is DimensionEntry[] {
  return Array.isArray(value) && value.every(isDimensionEntry)
}

function visible(showIf: ShowIf | undefined, data: Record<string, BriefingValue>): boolean {
  if (!showIf) return true
  const v = data[showIf.key]
  return typeof v === 'string' && showIf.in.includes(v)
}

function formatPlacements(entries: DimensionEntry[], doorLabel: string, windowLabel: string) {
  return entries
    .filter(e => e.width || e.height || e.placement)
    .map(e => {
      const which = e.kind === 'door' ? doorLabel : windowLabel
      const size = (e.width || e.height) ? `${e.width || '?'} × ${e.height || '?'} cm` : ''
      return [which, size, e.placement].filter(Boolean).join(' — ')
    })
    .join(' · ')
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

// Segmented pill group (small option sets: yes/no, indoor/outdoor, recto/verso…)
function Pills({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className={styles.pills}>
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          className={`${styles.pill} ${value === o.value ? styles.pillOn : ''}`}
          onClick={() => onChange(value === o.value ? '' : o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
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

export function UploadZone({ accept = 'image' }: { accept?: 'image' | 'pdf' }) {
  const { copy } = useI18n()
  const [previews, setPreviews] = useState<string[]>([])
  const [names, setNames] = useState<string[]>([])
  const ref = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      if (accept === 'image') {
        if (!file.type.startsWith('image/')) return
        const reader = new FileReader()
        reader.onload = event => setPreviews(prev => [...prev, event.target?.result as string])
        reader.readAsDataURL(file)
      } else {
        setNames(prev => [...prev, file.name])
      }
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
        <span className={styles.uploadHint}>{accept === 'pdf' ? 'PDF — max. 25MB' : copy.briefing.uploadHint}</span>
      </div>
      <input ref={ref} type="file" accept={accept === 'pdf' ? 'application/pdf' : 'image/*'} multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
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
      {names.length > 0 && (
        <div className={styles.fileChips}>
          {names.map((name, index) => (
            <span key={index} className={styles.fileChip}>
              📎 {name}
              <button className={styles.fileChipRm} onClick={() => setNames(prev => prev.filter((_, i) => i !== index))} type="button">✕</button>
            </span>
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

function BannerSize({ wKey, hKey, label, data, onChange }: { wKey: string; hKey: string; label: string; data: Record<string, BriefingValue>; onChange: (key: string, value: BriefingValue) => void }) {
  const str = (key: string) => typeof data[key] === 'string' ? data[key] as string : ''
  return (
    <Field label={label}>
      <div className={styles.dimRow}>
        <Inp value={str(wKey)} onChange={v => onChange(wKey, v)} placeholder="B" type="number" />
        <span className={styles.dimX}>×</span>
        <Inp value={str(hKey)} onChange={v => onChange(hKey, v)} placeholder="H" type="number" />
        <span className={styles.dimUnit}>cm</span>
      </div>
    </Field>
  )
}

function PageSize({ spec, data, onChange }: { spec: Extract<FieldSpec, { kind: 'pageSize' }>; data: Record<string, BriefingValue>; onChange: (key: string, value: BriefingValue) => void }) {
  const { copy, briefingOptions } = useI18n()
  const str = (key: string) => typeof data[key] === 'string' ? data[key] as string : ''
  const label = (copy.briefing.fields as Record<string, string>)[spec.labelKey] ?? spec.labelKey
  const value = str(spec.key)
  return (
    <Field label={label}>
      <select className={styles.select} value={value} onChange={e => onChange(spec.key, e.target.value)}>
        <option value="">{copy.common.chooseShort}</option>
        {briefingOptions[spec.options].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {value === 'custom' && (
        <div className={styles.dimRow} style={{ marginTop: '.5rem' }}>
          <Inp value={str(spec.wKey)} onChange={v => onChange(spec.wKey, v)} placeholder="B" type="number" />
          <span className={styles.dimX}>×</span>
          <Inp value={str(spec.hKey)} onChange={v => onChange(spec.hKey, v)} placeholder="H" type="number" />
          <span className={styles.dimUnit}>cm</span>
        </div>
      )}
    </Field>
  )
}

function OrientationIcons({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const shape = (v: string) => {
    if (v === 'portrait') return <rect x="10" y="4" width="12" height="20" rx="1.5" />
    if (v === 'square') return <rect x="6" y="6" width="20" height="20" rx="1.5" />
    return <rect x="4" y="9" width="24" height="14" rx="1.5" />
  }
  return (
    <Field label={label}>
      <div className={styles.orientRow}>
        {options.map(o => (
          <button key={o.value} type="button" className={`${styles.orientBtn} ${value === o.value ? styles.orientOn : ''}`} onClick={() => onChange(value === o.value ? '' : o.value)}>
            <svg width="32" height="30" viewBox="0 0 32 30" fill="none" stroke="currentColor" strokeWidth="1.6">{shape(o.value)}</svg>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </Field>
  )
}

function DesignVariation({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Field label={label}>
      <div className={styles.variationRow}>
        {options.map(o => {
          const navyBg = o.value === 'navyWhite'
          return (
            <button key={o.value} type="button" className={`${styles.variationCard} ${value === o.value ? styles.variationOn : ''}`} onClick={() => onChange(o.value)}>
              <span className={styles.variationSwatch} style={{ background: navyBg ? 'var(--navy)' : '#fff', borderColor: navyBg ? 'var(--navy)' : 'var(--bdr)' }}>
                <span className={styles.variationLogo} style={{ background: navyBg ? '#fff' : 'var(--navy)' }} />
              </span>
              <span className={styles.variationLabel}>{o.label}</span>
            </button>
          )
        })}
      </div>
    </Field>
  )
}

function PlacementGroup({ label, entries, onChange }: { label: string; entries: DimensionEntry[]; onChange: (entries: DimensionEntry[]) => void }) {
  const { copy } = useI18n()
  const rows = entries.length ? entries : [EMPTY_PLACEMENT]
  const update = (index: number, patch: Partial<DimensionEntry>) =>
    onChange(rows.map((e, i) => i === index ? { ...e, ...patch } : e))
  const add = () => onChange([...rows, EMPTY_PLACEMENT])
  const remove = (index: number) => {
    const next = rows.filter((_, i) => i !== index)
    onChange(next.length ? next : [EMPTY_PLACEMENT])
  }
  const doorLabel = (copy.briefing.fields as Record<string, string>).door
  const windowLabel = (copy.briefing.fields as Record<string, string>).window

  return (
    <Field label={label}>
      <div className={styles.placementList}>
        {rows.map((entry, index) => (
          <div key={index} className={styles.placementCard}>
            <div className={styles.placementTop}>
              <div className={styles.pills}>
                <button type="button" className={`${styles.pill} ${(entry.kind ?? 'window') === 'window' ? styles.pillOn : ''}`} onClick={() => update(index, { kind: 'window' })}>{windowLabel}</button>
                <button type="button" className={`${styles.pill} ${entry.kind === 'door' ? styles.pillOn : ''}`} onClick={() => update(index, { kind: 'door' })}>{doorLabel}</button>
              </div>
              {rows.length > 1 && (
                <button type="button" className={styles.dimensionRemove} onClick={() => remove(index)}>✕</button>
              )}
            </div>
            <div className={styles.dimRow}>
              <Inp value={entry.width} onChange={v => update(index, { width: v })} placeholder="B" type="number" />
              <span className={styles.dimX}>×</span>
              <Inp value={entry.height} onChange={v => update(index, { height: v })} placeholder="H" type="number" />
              <span className={styles.dimUnit}>cm</span>
            </div>
            <Inp value={entry.placement ?? ''} onChange={v => update(index, { placement: v })} placeholder={(copy.briefing.fields as Record<string, string>).placementLocation} />
            <Inp value={entry.note ?? ''} onChange={v => update(index, { note: v })} placeholder={(copy.briefing.placeholders as Record<string, string>).extraInfoPh} />
          </div>
        ))}
        <button className={styles.dimensionAdd} onClick={add} type="button">{copy.briefing.addFormat}</button>
      </div>
    </Field>
  )
}

function SocialOwn({ label, data, onChange }: { label: string; data: Record<string, BriefingValue>; onChange: (key: string, value: BriefingValue) => void }) {
  const { copy } = useI18n()
  const str = (key: string) => typeof data[key] === 'string' ? data[key] as string : ''
  const amounts = ['1', '2', '3', '4']

  const Row = ({ idKey, countKey, name, carouselKey }: { idKey: string; countKey: string; name: string; carouselKey?: string }) => {
    const on = str(idKey) === 'yes'
    const carousel = carouselKey ? str(carouselKey) === 'yes' : false
    return (
      <div className={`${styles.socialRow} ${on ? styles.socialRowOn : ''}`}>
        <label className={`${styles.checkRow} ${on ? styles.checked : ''}`} onClick={() => onChange(idKey, on ? '' : 'yes')}>
          <span className={styles.checkBox} />
          <span className={styles.checkLabel}>{name} <span className={styles.socialMax}>{copy.briefing.social.max}</span></span>
        </label>
        {on && (
          <div className={styles.socialControls}>
            <div className={styles.socialField}>
              <span className={styles.periodLabel}>{copy.briefing.social.amount}</span>
              <select className={styles.select} value={carousel ? '4' : (str(countKey) || '1')} disabled={carousel} onChange={e => onChange(countKey, e.target.value)}>
                {amounts.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {carouselKey && (
              <label className={`${styles.checkRow} ${carousel ? styles.checked : ''}`} onClick={() => onChange(carouselKey, carousel ? '' : 'yes')}>
                <span className={styles.checkBox} />
                <span className={styles.checkLabel}>{copy.briefing.social.carousel}</span>
              </label>
            )}
            {carousel && <span className={styles.socialNote}>{copy.briefing.social.carouselNote}</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <Field label={label}>
      <div className={styles.socialList}>
        <Row idKey="feedOn" countKey="feedCount" name={copy.briefing.social.feed} carouselKey="feedCarousel" />
        <Row idKey="storyOn" countKey="storyCount" name={copy.briefing.social.story} />
      </div>
    </Field>
  )
}

const PENCIL = (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none"><path d="M10.8 2.6l2.6 2.6L6 12.6l-3 .4.4-3 7.4-7.4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
)

function MockupField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { copy } = useI18n()
  const m = copy.briefing.mockup
  const mockups = parseMockups(value)
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const commit = (list: MockupState[]) => onChange(JSON.stringify(list.filter(mk => mk.bg)))
  const save = (state: MockupState) => {
    if (editing === 'new') commit([...mockups, state])
    else if (typeof editing === 'number') commit(mockups.map((mk, i) => (i === editing ? state : mk)))
    setEditing(null)
  }
  const remove = (index: number) => commit(mockups.filter((_, i) => i !== index))

  return (
    <Field label={label}>
      <div className={styles.mockupList}>
        {mockups.map((mk, i) => (
          <div key={i} className={styles.mockupCard}>
            <MockupPreview state={mk} className={styles.mockupThumb} />
            <div className={styles.mockupActions}>
              <button type="button" className={styles.mockupIconBtn} onClick={() => setEditing(i)} title={m.edit}>{PENCIL}</button>
              <button type="button" className={styles.mockupIconBtn} onClick={() => remove(i)} title={m.removeMockup}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className={styles.mockupAdd} onClick={() => setEditing('new')}>
          {mockups.length ? m.addMockup : m.open}
        </button>
      </div>
      {editing !== null && (
        <StorefrontMockupModal
          initial={editing === 'new' ? EMPTY_MOCKUP : mockups[editing]}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
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
  deliverableKey,
  data,
  onChange,
}: {
  deliverableKey: string
  data: Record<string, BriefingValue>
  onChange: (key: string, value: BriefingValue) => void
}) {
  const { copy, briefingOptions } = useI18n()
  const def = getDeliverable(deliverableKey)
  const rows = def?.fields ?? []

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
    if (!visible(spec.showIf, data)) return null
    const label = 'labelKey' in spec ? fieldLabel(spec.labelKey) : ''
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
      case 'choice':
        return (
          <Field key={index} label={label}>
            <Pills value={str(spec.key)} onChange={v => onChange(spec.key, v)} options={briefingOptions[spec.options]} />
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
        return <BannerSize key={index} wKey={spec.wKey} hKey={spec.hKey} label={label} data={data} onChange={onChange} />
      case 'pageSize':
        return <PageSize key={index} spec={spec} data={data} onChange={onChange} />
      case 'orientationIcons':
        return <OrientationIcons key={index} label={label} value={str(spec.key)} onChange={v => onChange(spec.key, v)} options={briefingOptions[spec.options]} />
      case 'designVariation':
        return <DesignVariation key={index} label={label} value={str(spec.key)} onChange={v => onChange(spec.key, v)} options={briefingOptions[spec.options]} />
      case 'placementGroup':
        return <PlacementGroup key={index} label={label} entries={dims(spec.key)} onChange={v => onChange(spec.key, v)} />
      case 'socialOwn':
        return <SocialOwn key={index} label={label} data={data} onChange={onChange} />
      case 'storefrontMockup':
        return <MockupField key={index} label={label} value={str(spec.key)} onChange={v => onChange(spec.key, v)} />
      case 'static':
        return (
          <Field key={index} label={label}>
            <div className={styles.staticValue}>{(copy.briefing.values as Record<string, string>)[spec.valueKey] ?? spec.valueKey}</div>
          </Field>
        )
      case 'upload':
        return <Field key={index} label={label}><UploadZone accept={spec.accept ?? 'image'} /></Field>
    }
  }

  return (
    <div>
      {rows.map((row, rowIndex) =>
        row.kind === 'row'
          ? (visible(row.showIf, data)
              ? <div key={rowIndex} className={styles.row2}>{row.cols.map((spec, i) => renderSpec(spec, rowIndex * 100 + i))}</div>
              : null)
          : renderSpec(row, rowIndex)
      )}
    </div>
  )
}

// ── Read-only summary (used by SummaryModal + briefing doc) ────────────────────
export function summarizeAssetFields(
  deliverableKey: string,
  data: Record<string, BriefingValue>,
  copy: ReturnType<typeof useI18n>['copy'],
  translateBriefingValue: ReturnType<typeof useI18n>['translateBriefingValue'],
): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = []
  const str = (key: string) => typeof data[key] === 'string' ? data[key] as string : ''
  const arr = (key: string) => isStringArray(data[key]) ? data[key] : []
  const dims = (key: string) => isDimensionArray(data[key]) ? data[key] : []
  const fieldLabel = (k: string) => (copy.briefing.fields as Record<string, string>)[k] ?? k
  const def = getDeliverable(deliverableKey)
  if (!def) return out
  const doorLabel = (copy.briefing.fields as Record<string, string>).door
  const windowLabel = (copy.briefing.fields as Record<string, string>).window

  for (const spec of flattenRows(def.fields)) {
    if (!visible(spec.showIf, data)) continue
    const label = 'labelKey' in spec ? fieldLabel(spec.labelKey) : ''
    if (spec.kind === 'select' || spec.kind === 'choice' || spec.kind === 'orientationIcons' || spec.kind === 'designVariation') {
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
    } else if (spec.kind === 'pageSize') {
      const v = str(spec.key)
      if (v === 'custom') {
        if (str(spec.wKey) || str(spec.hKey)) out.push({ label, value: `${str(spec.wKey) || '?'} × ${str(spec.hKey) || '?'} cm` })
      } else if (v) {
        out.push({ label, value: translateBriefingValue(spec.options, v) })
      }
    } else if (spec.kind === 'placementGroup') {
      const value = formatPlacements(dims(spec.key), doorLabel, windowLabel)
      if (value) out.push({ label, value })
    } else if (spec.kind === 'socialOwn') {
      const parts: string[] = []
      if (str('feedOn') === 'yes') {
        const n = str('feedCarousel') === 'yes' ? `4 (${copy.briefing.social.carousel})` : (str('feedCount') || '1')
        parts.push(`${copy.briefing.social.feed} ×${n}`)
      }
      if (str('storyOn') === 'yes') parts.push(`${copy.briefing.social.story} ×${str('storyCount') || '1'}`)
      if (parts.length) out.push({ label, value: parts.join(', ') })
    } else if (spec.kind === 'storefrontMockup') {
      const list = parseMockups(str(spec.key))
      if (list.length) {
        const total = list.reduce((n, mk) => n + mk.decals.length, 0)
        out.push({ label, value: `${copy.briefing.mockup.count(list.length)} · ${copy.briefing.mockup.placed(total)}` })
      }
    } else if (spec.kind === 'static') {
      out.push({ label, value: (copy.briefing.values as Record<string, string>)[spec.valueKey] ?? spec.valueKey })
    } else if (spec.kind !== 'upload') {
      if (str(spec.key)) out.push({ label, value: str(spec.key) })
    }
  }
  return out
}
