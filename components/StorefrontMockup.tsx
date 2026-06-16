'use client'

import { createContext, useContext, useRef, useState } from 'react'
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
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.decals)) return parsed as MockupState
  } catch { /* ignore */ }
  return EMPTY_MOCKUP
}

export function hasMockup(value: string | undefined): boolean {
  const m = parseMockup(value)
  return Boolean(m.bg)
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
  const [selected, setSelected] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const bgInput = useRef<HTMLInputElement>(null)

  const selectedDecal = decals.find(d => d.id === selected) ?? null
  const cats = CATEGORY_ORDER.filter(c => library.some(d => d.category === c))
  const visibleLibrary = cat === 'all' ? library : library.filter(d => d.category === cat)

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
                <div className={styles.catChips}>
                  <button type="button" className={`${styles.catChip} ${cat === 'all' ? styles.catChipOn : ''}`} onClick={() => setCat('all')}>{m.categories.all}</button>
                  {cats.map(c => (
                    <button key={c} type="button" className={`${styles.catChip} ${cat === c ? styles.catChipOn : ''}`} onClick={() => setCat(c)}>{m.categories[c]}</button>
                  ))}
                </div>
                <div className={styles.decalsHint}>{bg ? m.libraryHint : m.noBgYet}</div>
                <div className={styles.palette}>
                  {visibleLibrary.map(d => (
                    <button key={d._id} type="button" className={styles.paletteItem} onClick={() => bg && addDecal(d.image)} disabled={!bg} title={d.label}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.image} alt={d.label} />
                    </button>
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
