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

  // Themes are active by default; toggling a chip switches it off/on. Multiple
  // themes can be active at once — their designs are shown together below.
  const [offIds, setOffIds] = useState<Set<string>>(new Set())
  const [activeSlot, setActiveSlot] = useState<string>(sides ? sides[0] : 'main')
  const toggleTheme = (id: string) =>
    setOffIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })

  const activeThemes = filtered.filter(t => !offIds.has(t._id))
  const showThemeLabels = activeThemes.length > 1

  // The bucket designs land in: a side (front/back) when recto/verso, else "main".
  const currentSlot = sides ? activeSlot : 'main'
  const slotPicks = (slot: string) => designs.filter(d => d.slot === slot)

  const slotLabel = (slot: string) =>
    slot === 'front' ? copy.briefing.designSideFront : slot === 'back' ? copy.briefing.designSideBack : ''

  const isSelected = (designId: string) =>
    !isCustom && designs.some(d => d.slot === currentSlot && d.designId === designId)

  const toggle = (themeId: string, designId: string, title: string) => {
    const present = designs.some(d => d.slot === currentSlot && d.designId === designId)
    onSetDesigns(present
      ? designs.filter(d => !(d.slot === currentSlot && d.designId === designId))
      : [...designs, { slot: currentSlot, themeId, designId, designTitle: title }])
  }

  return (
    <div className={styles.designWrap}>
      <div className={styles.designHint}>{copy.briefing.designMultiHint}</div>

      {sides && (
        <div className={styles.slotRow}>
          {sides.map(slot => {
            const picks = slotPicks(slot)
            const summary = picks.length ? picks.map(p => p.designTitle).join(', ') : '—'
            return (
              <button
                key={slot}
                type="button"
                className={`${styles.slotTab} ${activeSlot === slot ? styles.slotTabOn : ''}`}
                onClick={() => setActiveSlot(slot)}
              >
                <span className={styles.slotName}>{slotLabel(slot)}{picks.length ? ` · ${picks.length}` : ''}</span>
                <span className={styles.slotPick}>{summary}</span>
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
                className={`${styles.themeChip} ${!offIds.has(theme._id) ? styles.themeChipOn : ''}`}
                onClick={() => toggleTheme(theme._id)}
              >
                {theme.title}
              </button>
            ))}
          </div>

          {activeThemes.length === 0 ? (
            <div className={styles.emptyDesigns}>{copy.briefing.designActivateTheme}</div>
          ) : (
            activeThemes.map(theme => (
              <div key={theme._id} className={styles.themeGroup}>
                {showThemeLabels && <div className={styles.themeGroupLabel}>{theme.title}</div>}
                {theme.designs?.length ? (
                  <div className={styles.designGrid}>
                    {theme.designs.map(design => {
                      const on = isSelected(design._id)
                      return (
                        <div
                          key={`${theme._id}-${design._id}`}
                          className={`${styles.designCard} ${on ? styles.designCardOn : ''}`}
                          onClick={() => toggle(theme._id, design._id, design.title)}
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
                )}
              </div>
            ))
          )}
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
