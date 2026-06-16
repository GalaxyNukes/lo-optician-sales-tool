'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useI18n } from './i18n'
import type { Theme, Subject } from './types'
import type { AssetBriefing, SharedBriefingFields } from './CampaignCatalog'
import { AssetBriefingGroup } from './AssetBriefingGroup'
import { UploadZone } from './assetFields'
import styles from './BriefingSection.module.css'

const ACCENTS = ['#0D2340', '#1A6B4A', '#8B3A2A', '#2A4E8B', '#6B2A8B', '#8B6B2A', '#2A6B6B']

interface Props {
  assetBriefings: AssetBriefing[]
  sharedFields: SharedBriefingFields
  themes: Theme[]
  selSubjects: Subject[]
  onUpdateBriefings: Dispatch<SetStateAction<AssetBriefing[]>>
  onUpdateShared: Dispatch<SetStateAction<SharedBriefingFields>>
}

export function AssetBriefingSection({ assetBriefings, sharedFields, themes, selSubjects, onUpdateBriefings, onUpdateShared }: Props) {
  const { copy, briefingOptions } = useI18n()
  const setShared = (key: keyof SharedBriefingFields) => (value: string) => onUpdateShared(prev => ({ ...prev, [key]: value }))
  const totalInstances = assetBriefings.reduce((sum, b) => sum + b.instances.length, 0)
  const core = copy.briefing.core

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg viewBox="0 0 11 11" fill="none" width="11" height="11">
            <path d="M1 3h9M1 6h6M1 9h4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.headerTitle}>{copy.briefing.title}</div>
        <div className={styles.headerSub}>{copy.bar.chosenAssets(totalInstances)}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{copy.briefing.coreTitle}</div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{core.title}</label>
          <input className={styles.input} type="text" value={sharedFields.title} onChange={e => setShared('title')(e.target.value)} placeholder={core.titlePh} />
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{core.deadline} <span className={styles.optional}>{copy.briefing.optionalHint}</span></label>
            <input className={styles.input} type="date" value={sharedFields.deadline} onChange={e => setShared('deadline')(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{core.liveDate} <span className={styles.optional}>{copy.briefing.optionalHint}</span></label>
            <input className={styles.input} type="date" value={sharedFields.liveDate} onChange={e => setShared('liveDate')(e.target.value)} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{core.mainMessage}</label>
          <input className={styles.input} type="text" value={sharedFields.mainMessage} onChange={e => setShared('mainMessage')(e.target.value)} placeholder={core.mainMessagePh} />
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{core.owner}</label>
            <input className={styles.input} type="text" value={sharedFields.owner} onChange={e => setShared('owner')(e.target.value)} placeholder={core.ownerPh} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{core.audience}</label>
            <input className={styles.input} type="text" value={sharedFields.audience} onChange={e => setShared('audience')(e.target.value)} placeholder={core.audiencePh} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{core.logoRequired}</label>
          <div className={styles.pills}>
            {briefingOptions.yesNo.map(o => (
              <button
                key={o.value}
                type="button"
                className={`${styles.pill} ${sharedFields.logoRequired === o.value ? styles.pillOn : ''}`}
                onClick={() => setShared('logoRequired')(sharedFields.logoRequired === o.value ? '' : o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{core.reference}</label>
          <input className={styles.input} type="url" value={sharedFields.refUrl} onChange={e => setShared('refUrl')(e.target.value)} placeholder="https://..." />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>{core.background}</label>
          <textarea className={styles.textarea} value={sharedFields.bgInfo} onChange={e => setShared('bgInfo')(e.target.value)} placeholder={core.backgroundPh} />
        </div>
      </div>

      <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>{copy.briefing.perAsset}</div>
      <div className={styles.campaignGroups}>
        {assetBriefings.map((b, index) => (
          <AssetBriefingGroup
            key={b.blockKey}
            briefing={b}
            accent={b.accentColor || ACCENTS[index % ACCENTS.length]}
            themes={themes}
            selSubjects={selSubjects}
            onUpdate={onUpdateBriefings}
          />
        ))}
      </div>

      <div className={styles.section} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionTitle}>{copy.briefing.generalReferences}</div>
        <UploadZone />
      </div>
    </div>
  )
}
