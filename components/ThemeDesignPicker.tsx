'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useI18n } from './i18n'
import type { Theme, Subject } from './types'
import { FALLBACK_IMAGE_DATA_URI } from './imageFallback'
import styles from './AssetBriefing.module.css'

export const CUSTOM_DESIGN = '__custom__'

const CHECK = (
  <svg viewBox="0 0 11 9" fill="none" width="11" height="9">
    <path d="M1 4L4.2 7.5L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type Frame = 'social' | 'phone' | 'browser' | 'flat'

// Channel chrome around each design thumbnail — purely presentational, keyed by asset type.
function frameFor(assetKey: string): Frame {
  if (assetKey === 'social-meta' || assetKey === 'social-google') return 'social'
  if (assetKey === 'email') return 'phone'
  if (assetKey === 'landing') return 'browser'
  return 'flat'
}

interface Props {
  assetKey: string
  themes: Theme[]
  selSubjects: Subject[]
  selectedThemeId: string | null
  selectedDesignId: string | null
  customNote: string
  onPickDesign: (themeId: string, designId: string, designTitle: string) => void
  onPickCustom: () => void
  onCustomNote: (note: string) => void
}

export function ThemeDesignPicker({
  assetKey,
  themes,
  selSubjects,
  selectedThemeId,
  selectedDesignId,
  customNote,
  onPickDesign,
  onPickCustom,
  onCustomNote,
}: Props) {
  const { copy } = useI18n()
  const isCustom = selectedThemeId === CUSTOM_DESIGN
  const frame = frameFor(assetKey)

  const filtered = selSubjects.length
    ? themes.filter(theme => theme.subjects?.some(s => selSubjects.some(ss => ss._id === s._id)))
    : themes

  const initialTheme = (selectedThemeId && selectedThemeId !== CUSTOM_DESIGN ? selectedThemeId : filtered[0]?._id) ?? null
  const [activeId, setActiveId] = useState<string | null>(initialTheme)
  const activeTheme = filtered.find(theme => theme._id === activeId) ?? filtered[0] ?? null

  return (
    <div className={styles.designWrap}>
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
                const on = !isCustom && selectedDesignId === design._id
                return (
                  <div
                    key={design._id}
                    className={`${styles.designCard} ${on ? styles.designCardOn : ''}`}
                    onClick={() => onPickDesign(activeTheme._id, design._id, design.title)}
                  >
                    {frame === 'social' && (
                      <div className={styles.frameSocialHead}><span className={styles.frameAvatar} /><span className={styles.frameLines} /></div>
                    )}
                    {frame === 'browser' && (
                      <div className={styles.frameBrowserBar}><span className={styles.frameDot} /><span className={styles.frameDot} /><span className={styles.frameDot} /><span className={styles.frameAddr} /></div>
                    )}
                    {frame === 'phone' && (
                      <div className={styles.framePhoneHead}><span className={styles.framePhoneNotch} /></div>
                    )}
                    <div className={styles.designThumb}>
                      {frame === 'browser' && design.previewVideo ? (
                        <video className={styles.designVideo} src={design.previewVideo} muted loop autoPlay playsInline />
                      ) : (
                        <Image src={design.image || FALLBACK_IMAGE_DATA_URI} alt={design.title} fill sizes="200px" style={{ objectFit: 'cover' }} />
                      )}
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
        <div className={`${styles.customCard} ${isCustom ? styles.customCardOn : ''}`} onClick={onPickCustom}>
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
