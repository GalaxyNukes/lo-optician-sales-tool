'use client'

import { useState } from 'react'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import { useI18n } from './i18n'
import type { Theme, Subject } from './types'
import type { AssetBriefing, AssetBriefingInstance, BriefingValue } from './CampaignCatalog'
import { newAssetInstance } from './CampaignCatalog'
import { AssetFields } from './assetFields'
import { ThemeDesignPicker, CUSTOM_DESIGN } from './ThemeDesignPicker'
import bs from './BriefingSection.module.css'
import styles from './AssetBriefing.module.css'

interface Props {
  briefing: AssetBriefing
  accent: string
  themes: Theme[]
  selSubjects: Subject[]
  onUpdate: Dispatch<SetStateAction<AssetBriefing[]>>
}

export function AssetBriefingGroup({ briefing, accent, themes, selSubjects, onUpdate }: Props) {
  const { copy } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const id = briefing.assetTypeId

  const patchInstance = (instId: string, patch: Partial<AssetBriefingInstance>) =>
    onUpdate(prev => prev.map(b => b.assetTypeId !== id ? b : {
      ...b,
      instances: b.instances.map(inst => inst.id !== instId ? inst : { ...inst, ...patch }),
    }))

  const setField = (instId: string, key: string, value: BriefingValue) =>
    onUpdate(prev => prev.map(b => b.assetTypeId !== id ? b : {
      ...b,
      instances: b.instances.map(inst => inst.id !== instId ? inst : { ...inst, data: { ...inst.data, [key]: value } }),
    }))

  const addInstance = () =>
    onUpdate(prev => prev.map(b => b.assetTypeId !== id ? b : { ...b, instances: [...b.instances, newAssetInstance()] }))

  const removeInstance = (instId: string) =>
    onUpdate(prev => prev.map(b => b.assetTypeId !== id ? b : {
      ...b,
      instances: b.instances.length <= 1 ? b.instances : b.instances.filter(inst => inst.id !== instId),
    }))

  return (
    <div className={bs.campaignGroup} style={{ '--accent': accent } as CSSProperties}>
      <div className={bs.campaignHeader} style={{ background: accent }} onClick={() => setCollapsed(c => !c)}>
        <div className={styles.groupIcon}>{briefing.icon}</div>
        <div className={bs.campaignHeaderText}>
          <div className={bs.campaignTitle}>{briefing.label}</div>
        </div>
        <div className={bs.campaignBlockCount}>{briefing.instances.length}×</div>
        <div className={`${bs.campaignArrow} ${collapsed ? bs.campaignArrowCollapsed : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4.5L7 9.5L12 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {!collapsed && (
        <div className={bs.campaignBody}>
          {briefing.instances.map((inst, index) => (
            <InstanceCard
              key={inst.id}
              inst={inst}
              index={index + 1}
              total={briefing.instances.length}
              assetKey={briefing.assetKey}
              themes={themes}
              selSubjects={selSubjects}
              onField={(key, value) => setField(inst.id, key, value)}
              onRemove={() => removeInstance(inst.id)}
              onPickDesign={(themeId, key, title) => patchInstance(inst.id, { selectedThemeId: themeId, selectedDesignKey: key, selectedDesignTitle: title })}
              onPickCustom={() => patchInstance(inst.id, { selectedThemeId: CUSTOM_DESIGN, selectedDesignKey: null, selectedDesignTitle: null })}
              onCustomNote={note => patchInstance(inst.id, { customDesignNote: note })}
            />
          ))}
          <button type="button" className={styles.addInstance} onClick={addInstance}>
            {copy.briefing.addAnother(briefing.label)}
          </button>
        </div>
      )}
    </div>
  )
}

function InstanceCard({
  inst,
  index,
  total,
  assetKey,
  themes,
  selSubjects,
  onField,
  onRemove,
  onPickDesign,
  onPickCustom,
  onCustomNote,
}: {
  inst: AssetBriefingInstance
  index: number
  total: number
  assetKey: string
  themes: Theme[]
  selSubjects: Subject[]
  onField: (key: string, value: BriefingValue) => void
  onRemove: () => void
  onPickDesign: (themeId: string, designKey: string, designTitle: string) => void
  onPickCustom: () => void
  onCustomNote: (note: string) => void
}) {
  const { copy } = useI18n()
  const [tab, setTab] = useState<'fields' | 'design'>('fields')

  return (
    <div className={styles.instance}>
      <div className={styles.instanceHead}>
        <span className={styles.instanceTitle}>{copy.briefing.instance(index)}</span>
        {total > 1 && (
          <button type="button" className={styles.instanceRemove} onClick={onRemove} title={copy.common.remove}>✕</button>
        )}
      </div>
      <div className={styles.tabs}>
        <button type="button" className={`${styles.tab} ${tab === 'fields' ? styles.tabActive : ''}`} onClick={() => setTab('fields')}>
          {copy.briefing.tabFields}
        </button>
        <button type="button" className={`${styles.tab} ${tab === 'design' ? styles.tabActive : ''}`} onClick={() => setTab('design')}>
          {copy.briefing.tabDesign}
        </button>
      </div>
      <div className={styles.tabPanel}>
        {tab === 'fields' ? (
          <AssetFields assetKey={assetKey} data={inst.data} onChange={onField} />
        ) : (
          <ThemeDesignPicker
            themes={themes}
            selSubjects={selSubjects}
            selectedThemeId={inst.selectedThemeId}
            selectedDesignKey={inst.selectedDesignKey}
            customNote={inst.customDesignNote}
            onPickDesign={onPickDesign}
            onPickCustom={onPickCustom}
            onCustomNote={onCustomNote}
          />
        )}
      </div>
    </div>
  )
}
