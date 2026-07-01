'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { useI18n } from './i18n'
import type { Decal, DecalCategory } from './types'
import styles from './StorefrontMockup.module.css'

// Decals come from a curated CMS library (logos, quotes, badges, specials) — provided
// once at the briefing root and consumed by the mockup editor, wherever it opens.
const DecalsContext = createContext<Decal[]>([])
export function DecalsProvider({ decals, children }: { decals: Decal[]; children: ReactNode }) {
  return <DecalsContext.Provider value={decals}>{children}</DecalsContext.Provider>
}
function useDecals() { return useContext(DecalsContext) }

const CATEGORY_ORDER: DecalCategory[] = ['logo', 'quote', 'badge', 'special']

// A storefront mockup = a background photo + PNG decals placed on it. Positions are
// stored as percentages of the canvas so the preview/doc render at any size.
export interface MockupDecal { id: string; src: string; xPct: number; yPct: number; wPct: number }
export interface MockupState { bg: string | null; decals: MockupDecal[] }

export const EMPTY_MOCKUP: MockupState = { bg: null, decals: [] }

export function parseMockup(value: string | undefined): MockupState {
  if (!value) return EMPTY_MOCKUP
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return (parsed[0] as MockupState) ?? EMPTY_MOCKUP
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.decals)) return parsed as MockupState
  } catch { /* ignore */ }
  return EMPTY_MOCKUP
}

// A storefront deliverable can hold several mockups. Back-compatible with the old
// single-object shape.
export function parseMockups(value: string | undefined): MockupState[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.filter((m): m is MockupState => m && Array.isArray(m.decals) && Boolean(m.bg))
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.decals) && parsed.bg) return [parsed as MockupState]
  } catch { /* ignore */ }
  return []
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('not an image')); return }
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Decal tone detection (white decals → navy tile, dark decals → white tile) ────
type Tone = 'light' | 'dark'
const toneCache = new Map<string, Tone>()

function useDecalTone(src: string): Tone | null {
  const [tone, setTone] = useState<Tone | null>(() => toneCache.get(src) ?? null)
  useEffect(() => {
    if (toneCache.has(src)) { setTone(toneCache.get(src)!); return }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const size = 24
        const c = document.createElement('canvas')
        c.width = size; c.height = size
        const ctx = c.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)
        let lum = 0, weight = 0
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3] / 255
          if (a < 0.1) continue
          lum += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * a
          weight += a
        }
        const avg = weight ? lum / weight : 255
        const t: Tone = avg >= 140 ? 'light' : 'dark'
        toneCache.set(src, t)
        if (!cancelled) setTone(t)
      } catch { /* cross-origin taint — keep default tile */ }
    }
    img.src = src
    return () => { cancelled = true }
  }, [src])
  return tone
}

// ── Read-only composition (field thumbnail + on-screen summary) ─────────────────
export function MockupPreview({ state, className }: { state: MockupState; className?: string }) {
  if (!state.bg) return null
  return (
    <div className={`${styles.preview} ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.previewBg} src={state.bg} alt="" />
      {state.decals.map(d => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={d.id} className={styles.previewDecal} src={d.src} alt="" style={{ left: `${d.xPct}%`, top: `${d.yPct}%`, width: `${d.wPct}%` }} />
      ))}
    </div>
  )
}

// ── Standalone HTML for the generated briefing doc ──────────────────────────────
export function mockupDocHtml(state: MockupState, escapeHtml: (s: string) => string): string {
  if (!state.bg) return ''
  const decals = state.decals.map(d =>
    `<img src="${escapeHtml(d.src)}" style="position:absolute;left:${d.xPct}%;top:${d.yPct}%;width:${d.wPct}%;transform:translate(-50%,-50%)" />`
  ).join('')
  return `<div class="mockup"><div class="mockup-canvas"><img src="${escapeHtml(state.bg)}" style="width:100%;display:block" />${decals}</div></div>`
}

// ── Palette tile (auto-contrast background) ─────────────────────────────────────
function PaletteItem({ decal, disabled, onClick }: { decal: Decal; disabled: boolean; onClick: () => void }) {
  const tone = useDecalTone(decal.image)
  const toned = tone === 'light' ? styles.paletteLight : tone === 'dark' ? styles.paletteDark : ''
  return (
    <button type="button" className={`${styles.paletteItem} ${toned}`} onClick={onClick} disabled={disabled} title={decal.label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={decal.image} alt={decal.label} />
    </button>
  )
}

// ── Editor modal ────────────────────────────────────────────────────────────────
export function StorefrontMockupModal({
  initial,
  onSave,
  onClose,
}: {
  initial: MockupState
  onSave: (state: MockupState) => void
  onClose: () => void
}) {
  const { copy } = useI18n()
  const m = copy.briefing.mockup
  const library = useDecals()
  const [bg, setBg] = useState<string | null>(initial.bg)
  const [decals, setDecals] = useState<MockupDecal[]>(initial.decals)
  const [cat, setCat] = useState<'all' | DecalCategory>('all')
  const [decalLang, setDecalLang] = useState<'nl' | 'fr' | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const bgInput = useRef<HTMLInputElement>(null)

  const selectedDecal = decals.find(d => d.id === selected) ?? null
  const cats = CATEGORY_ORDER.filter(c => library.some(d => d.category === c))
  // Decal-language filter is independent of the site language. Language-neutral
  // decals (lang 'both' or unset — e.g. logos/badges) always show.
  const matchesLang = (d: Decal) => !decalLang || d.lang === decalLang || !d.lang || d.lang === 'both'
  const hasLangDecals = library.some(d => d.lang === 'nl' || d.lang === 'fr')
  const visibleLibrary = library.filter(d => (cat === 'all' || d.category === cat) && matchesLang(d))

  const handleBg = async (files: FileList | null) => {
    if (!files?.[0]) return
    try { setBg(await readImage(files[0])) } catch { /* ignore */ }
  }

  const addDecal = (src: string) => {
    const id = `d${idRef.current++}`
    setDecals(prev => [...prev, { id, src, xPct: 50, yPct: 50, wPct: 22 }])
    setSelected(id)
  }

  const startDrag = (e: ReactPointerEvent, decal: MockupDecal) => {
    e.stopPropagation()
    setSelected(decal.id)
    const sx = e.clientX, sy = e.clientY, ox = decal.xPct, oy = decal.yPct
    const move = (ev: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const xPct = clamp(ox + ((ev.clientX - sx) / rect.width) * 100, 0, 100)
      const yPct = clamp(oy + ((ev.clientY - sy) / rect.height) * 100, 0, 100)
      setDecals(prev => prev.map(d => d.id === decal.id ? { ...d, xPct, yPct } : d))
    }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const resizeSelected = (wPct: number) =>
    setDecals(prev => prev.map(d => d.id === selected ? { ...d, wPct } : d))
  const removeSelected = () => {
    setDecals(prev => prev.filter(d => d.id !== selected))
    setSelected(null)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.head}>
          <div className={styles.title}>{m.title}</div>
          <button type="button" className={styles.close} onClick={onClose} aria-label={copy.common.close}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.canvasWrap}>
            {bg ? (
              <div className={styles.canvas} ref={canvasRef} onPointerDown={() => setSelected(null)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.canvasBg} src={bg} alt="" draggable={false} />
                {decals.map(d => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={d.id}
                    className={`${styles.decal} ${selected === d.id ? styles.decalSel : ''}`}
                    src={d.src}
                    alt=""
                    draggable={false}
                    style={{ left: `${d.xPct}%`, top: `${d.yPct}%`, width: `${d.wPct}%` }}
                    onPointerDown={e => startDrag(e, d)}
                  />
                ))}
                <div className={styles.canvasHint}>{m.addHint}</div>
              </div>
            ) : (
              <button type="button" className={styles.bgDrop} onClick={() => bgInput.current?.click()}>
                <svg width="22" height="22" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M3 5l4-4 4 4M1 11h12" stroke="var(--navy)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span><strong>{m.uploadBg}</strong></span>
                <span className={styles.dropHint}>{m.noBg}</span>
              </button>
            )}
          </div>

          <div className={styles.side}>
            {bg && (
              <button type="button" className={styles.sideBtn} onClick={() => bgInput.current?.click()}>{m.changeBg}</button>
            )}

            <div className={styles.sideLabel}>{m.library}</div>
            {library.length === 0 ? (
              <div className={styles.decalsHint}>{m.noDecals}</div>
            ) : (
              <>
                {hasLangDecals && (
                  <>
                    <div className={styles.sideLabel}>{m.language}</div>
                    <div className={styles.catChips}>
                      <button type="button" className={`${styles.catChip} ${decalLang === null ? styles.catChipOn : ''}`} onClick={() => setDecalLang(null)}>{m.langAll}</button>
                      <button type="button" className={`${styles.catChip} ${decalLang === 'nl' ? styles.catChipOn : ''}`} onClick={() => setDecalLang('nl')}>{copy.nav.languages.nl}</button>
                      <button type="button" className={`${styles.catChip} ${decalLang === 'fr' ? styles.catChipOn : ''}`} onClick={() => setDecalLang('fr')}>{copy.nav.languages.fr}</button>
                    </div>
                  </>
                )}
                <div className={styles.catChips}>
                  <button type="button" className={`${styles.catChip} ${cat === 'all' ? styles.catChipOn : ''}`} onClick={() => setCat('all')}>{m.categories.all}</button>
                  {cats.map(c => (
                    <button key={c} type="button" className={`${styles.catChip} ${cat === c ? styles.catChipOn : ''}`} onClick={() => setCat(c)}>{m.categories[c]}</button>
                  ))}
                </div>
                <div className={styles.decalsHint}>{bg ? m.libraryHint : m.noBgYet}</div>
                <div className={styles.palette}>
                  {visibleLibrary.map(d => (
                    <PaletteItem key={d._id} decal={d} disabled={!bg} onClick={() => bg && addDecal(d.image)} />
                  ))}
                </div>
              </>
            )}

            {selectedDecal && (
              <div className={styles.selPanel}>
                <div className={styles.sideLabel}>{m.selected}</div>
                <label className={styles.sizeLabel}>{m.size}</label>
                <input
                  type="range" min={5} max={80} value={selectedDecal.wPct}
                  onChange={e => resizeSelected(Number(e.target.value))}
                  className={styles.sizeRange}
                />
                <button type="button" className={styles.removeBtn} onClick={removeSelected}>{m.removeDecal}</button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.foot}>
          <button type="button" className={styles.secBtn} onClick={onClose}>{copy.common.close}</button>
          <button type="button" className={styles.priBtn} onClick={() => onSave({ bg, decals })}>{m.save}</button>
        </div>

        <input ref={bgInput} type="file" accept="image/*" hidden onChange={e => handleBg(e.target.files)} />
      </div>
    </div>
  )
}
