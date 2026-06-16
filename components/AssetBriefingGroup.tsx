'use client'

import { useState } from 'react'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import { useI18n } from './i18n'
import type { Theme, Subject } from './types'
import type { BriefingValue, DesignPick } from './deliverables'
import { getBlock, getDeliverable, deliverablesForBlock, designSides } from './deliverables'
import type { AssetBriefing, AssetBriefingInstance } from './CampaignCatalog'
import { newAssetInstance } from './CampaignCatalog'
import { AssetFields } from './assetFields'
import { ThemeDesignPicker } from './ThemeDesignPicker'
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
  const [picking, setPicking] = useState(briefing.instances.length === 0)
  const blockKey = briefing.blockKey
  const block = getBlock(blockKey)
  const blockLabel = (copy.briefing.blocks as Record<string, { label: string }>)[blockKey]?.label ?? blockKey
  const deliverableLabel = (key: string) => (copy.briefing.deliverables as Record<string, string>)[key] ?? key
  const choices = deliverablesForBlock(blockKey)

  const patchInstance = (instId: string, patch: Partial<AssetBriefingInstance>) =>
    onUpdate(prev => prev.map(b => b.blockKey !== blockKey ? b : {
      ...b,
      instances: b.instances.map(inst => inst.id !== instId ? inst : { ...inst, ...patch }),
    }))

  const setField = (instId: string, key: string, value: BriefingValue) =>
    onUpdate(prev => prev.map(b => b.blockKey !== blockKey ? b : {
      ...b,
      instances: b.instances.map(inst => inst.id !== instId ? inst : { ...inst, data: { ...inst.data, [key]: value } }),
    }))

  const addDeliverable = (deliverableKey: string) => {
    onUpdate(prev => prev.map(b => b.blockKey !== blockKey ? b : { ...b, instances: [...b.instances, newAssetInstance(deliverableKey)] }))
    setPicking(false)
  }

  const removeInstance = (instId: string) =>
    onUpdate(prev => prev.map(b => b.blockKey !== blockKey ? b : {
      ...b,
      instances: b.instances.filter(inst => inst.id !== instId),
    }))

  return (
    <div className={bs.campaignGroup} style={{ '--accent': accent } as CSSProperties}>
      <div className={bs.campaignHeader} style={{ background: accent }} onClick={() => setCollapsed(c => !c)}>
        <div className={styles.groupIcon}>{block?.icon ?? '🧩'}</div>
        <div className={bs.campaignHeaderText}>
          <div className={bs.campaignTitle}>{blockLabel}</div>
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
          {briefing.instances.map(inst => (
            <InstanceCard
              key={inst.id}
              inst={inst}
              title={deliverableLabel(inst.deliverableKey)}
              themes={themes}
              selSubjects={selSubjects}
              onField={(key, value) => setField(inst.id, key, value)}
              onRemove={() => removeInstance(inst.id)}
              onSetDesigns={(designs) => patchInstance(inst.id, { designs, designIsCustom: false })}
              onToggleCustom={() => patchInstance(inst.id, inst.designIsCustom ? { designIsCustom: false } : { designIsCustom: true, designs: [] })}
              onCustomNote={(note) => patchInstance(inst.id, { customDesignNote: note })}
            />
          ))}

          {picking ? (
            <div className={styles.deliverablePicker}>
              <div className={styles.pickerTitle}>{copy.briefing.chooseDeliverableTitle}</div>
              <div className={styles.deliverableGrid}>
                {choices.map(d => (
                  <button key={d.key} type="button" className={styles.deliverableCard} onClick={() => addDeliverable(d.key)}>
                    <span className={styles.deliverableIcon}>{d.icon}</span>
                    <span className={styles.deliverableLabel}>{deliverableLabel(d.key)}</span>
                  </button>
                ))}
              </div>
              {briefing.instances.length > 0 && (
                <button type="button" className={styles.pickerCancel} onClick={() => setPicking(false)}>{copy.common.close}</button>
              )}
            </div>
          ) : (
            <button type="button" className={styles.addInstance} onClick={() => setPicking(true)}>
              {copy.briefing.addDeliverable}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function InstanceCard({
  inst,
  title,
  themes,
  selSubjects,
  onField,
  onRemove,
  onSetDesigns,
  onToggleCustom,
  onCustomNote,
}: {
  inst: AssetBriefingInstance
  title: string
  themes: Theme[]
  selSubjects: Subject[]
  onField: (key: string, value: BriefingValue) => void
  onRemove: () => void
  onSetDesigns: (designs: DesignPick[]) => void
  onToggleCustom: () => void
  onCustomNote: (note: string) => void
}) {
  const { copy } = useI18n()
  const def = getDeliverable(inst.deliverableKey)
  const hasDesignTab = def ? def.design !== 'none' : false
  const [tab, setTab] = useState<'fields' | 'design'>('fields')

  const sides = def ? designSides(def, inst.data) : null

  return (
    <div className={styles.instance}>
      <div className={styles.instanceHead}>
        <span className={styles.instanceIcon}>{def?.icon ?? '🧩'}</span>
        <span className={styles.instanceTitle}>{title}</span>
        <button type="button" className={styles.instanceRemove} onClick={onRemove} title={copy.common.remove}>✕</button>
      </div>
      {hasDesignTab && (
        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${tab === 'fields' ? styles.tabActive : ''}`} onClick={() => setTab('fields')}>
            {copy.briefing.tabFields}
          </button>
          <button type="button" className={`${styles.tab} ${tab === 'design' ? styles.tabActive : ''}`} onClick={() => setTab('design')}>
            {copy.briefing.tabDesign}
          </button>
        </div>
      )}
      <div className={styles.tabPanel}>
        {(!hasDesignTab || tab === 'fields') ? (
          <AssetFields deliverableKey={inst.deliverableKey} data={inst.data} onChange={onField} />
        ) : (
          <ThemeDesignPicker
            deliverableKey={inst.deliverableKey}
            sides={sides}
            themes={themes}
            selSubjects={selSubjects}
            designs={inst.designs}
            isCustom={inst.designIsCustom}
            customNote={inst.customDesignNote}
            onSetDesigns={onSetDesigns}
            onToggleCustom={onToggleCustom}
            onCustomNote={onCustomNote}
          />
        )}
      </div>
    </div>
  )
}
