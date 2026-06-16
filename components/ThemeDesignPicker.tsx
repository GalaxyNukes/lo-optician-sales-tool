'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useI18n } from './i18n'
import type { Theme, Subject } from './types'
import type { DesignPick } from './deliverables'
import { FALLBACK_IMAGE_DATA_URI } from './imageFallback'
import styles from './AssetBriefing.module.css'

const CHECK = (
  <svg viewBox="0 0 11 9" fill="none" width="11" height="9">
    <path d="M1 4L4.2 7.5L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type Frame = 'social' | 'phone' | 'flat'

function frameFor(deliverableKey: string): Frame {
  if (deliverableKey === 'social') return 'social'
  if (deliverableKey === 'email') return 'phone'
  return 'flat'
}

interface Props {
  deliverableKey: string
  mode: 'single' | 'multi'
  sides: string[] | null          // ['front','back'] when recto/verso = double
  themes: Theme[]
  selSubjects: Subject[]
  designs: DesignPick[]
  isCustom: boolean
  customNote: string
  onSetDesigns: (designs: DesignPick[]) => void
  onToggleCustom: () => void
  onCustomNote: (note: string) => void
}

export function ThemeDesignPicker({
  deliverableKey,
  mode,
  sides,
  themes,
  selSubjects,
  designs,
  isCustom,
  customNote,
  onSetDesigns,
  onToggleCustom,
  onCustomNote,
}: Props) {
  const { copy } = useI18n()
  const frame = frameFor(deliverableKey)

  const filtered = selSubjects.length
    ? themes.filter(theme => theme.subjects?.some(s => selSubjects.some(ss => ss._id === s._id)))
    : themes

  const firstPickThemeId = designs[0]?.themeId ?? null
  const initialTheme = (firstPickThemeId ?? filtered[0]?._id) ?? null
  const [activeId, setActiveId] = useState<string | null>(initialTheme)
  const [activeSlot, setActiveSlot] = useState<string>(sides ? sides[0] : 'main')
  const activeTheme = filtered.find(theme => theme._id === activeId) ?? filtered[0] ?? null

  const slotLabel = (slot: string) =>
    slot === 'front' ? copy.briefing.designSideFront : slot === 'back' ? copy.briefing.designSideBack : ''

  // Is this design currently selected (in the relevant context)?
  const isSelected = (designId: string) => {
    if (mode === 'multi') return designs.some(d => d.designId === designId)
    if (sides) return designs.some(d => d.slot === activeSlot && d.designId === designId)
    return designs.some(d => d.designId === designId)
  }

  const pick = (themeId: string, designId: string, title: string) => {
    if (mode === 'multi') {
      const present = designs.some(d => d.designId === designId)
      onSetDesigns(present
        ? designs.filter(d => d.designId !== designId)
        : [...designs, { slot: designId, themeId, designId, designTitle: title }])
      return
    }
    if (sides) {
      const existing = designs.find(d => d.slot === activeSlot)
      const next = existing && existing.designId === designId
        ? designs.filter(d => d.slot !== activeSlot)                          // toggle off
        : [...designs.filter(d => d.slot !== activeSlot), { slot: activeSlot, themeId, designId, designTitle: title }]
      onSetDesigns(next)
      return
    }
    // single
    const present = designs.some(d => d.designId === designId)
    onSetDesigns(present ? [] : [{ slot: 'main', themeId, designId, designTitle: title }])
  }

  const slotPick = (slot: string) => designs.find(d => d.slot === slot)

  return (
    <div className={styles.designWrap}>
      {mode === 'multi' && <div className={styles.designHint}>{copy.briefing.designMultiHint}</div>}

      {sides && (
        <div className={styles.slotRow}>
          {sides.map(slot => {
            const p = slotPick(slot)
            return (
              <button
                key={slot}
                type="button"
                className={`${styles.slotTab} ${activeSlot === slot ? styles.slotTabOn : ''}`}
                onClick={() => setActiveSlot(slot)}
              >
                <span className={styles.slotName}>{slotLabel(slot)}</span>
                <span className={styles.slotPick}>{p ? p.designTitle : '—'}</span>
              </button>
            )
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.emptyDesigns}>{copy.briefing.designNoThemes}</div>
      ) : (
        <>
          <div className={styles.themeRow}>
            <span className={styles.themeLabel}>{copy.briefing.designTheme}</span>
            {filtered.map(theme => (
              <button
                key={theme._id}
                type="button"
                className={`${styles.themeChip} ${activeTheme?._id === theme._id ? styles.themeChipOn : ''}`}
                onClick={() => setActiveId(theme._id)}
              >
                {theme.title}
              </button>
            ))}
          </div>

          {activeTheme && (activeTheme.designs?.length ? (
            <div className={styles.designGrid}>
              {activeTheme.designs.map(design => {
                const on = !isCustom && isSelected(design._id)
                return (
                  <div
                    key={design._id}
                    className={`${styles.designCard} ${on ? styles.designCardOn : ''}`}
                    onClick={() => pick(activeTheme._id, design._id, design.title)}
                  >
                    {frame === 'social' && (
                      <div className={styles.frameSocialHead}><span className={styles.frameAvatar} /><span className={styles.frameLines} /></div>
                    )}
                    {frame === 'phone' && (
                      <div className={styles.framePhoneHead}><span className={styles.framePhoneNotch} /></div>
                    )}
                    <div className={styles.designThumb}>
                      <Image src={design.image || FALLBACK_IMAGE_DATA_URI} alt={design.title} fill sizes="200px" style={{ objectFit: 'cover' }} />
                      {on && <span className={styles.designCheck}>{CHECK}</span>}
                    </div>
                    {frame === 'social' && (
                      <div className={styles.frameSocialFoot}><span className={styles.frameLineShort} /></div>
                    )}
                    <div className={styles.designTitle}>{design.title}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyDesigns}>{copy.briefing.designNoDesigns}</div>
          ))}
        </>
      )}

      <div>
        <div className={`${styles.customCard} ${isCustom ? styles.customCardOn : ''}`} onClick={onToggleCustom}>
          <span className={styles.customPlus}>✎</span>
          <span className={styles.customLabel}>{copy.briefing.designCustom}</span>
        </div>
        {isCustom && (
          <textarea
            className={styles.customNote}
            value={customNote}
            placeholder={copy.briefing.designCustomPlaceholder}
            onChange={e => onCustomNote(e.target.value)}
          />
        )}
      </div>
    </div>
  )
}
