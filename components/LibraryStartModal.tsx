'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useI18n } from './i18n'
import type { Campaign, Goal, Action } from './types'
import type { CampaignSeed } from './CampaignCatalog'
import { FALLBACK_IMAGE_DATA_URI } from './imageFallback'
import styles from './LibraryStartModal.module.css'

const NA_ID = '__not_applicable__'
const COUNTRIES = ['VL', 'WA', 'NL', 'LU', 'FR', 'DE'] as const

interface Props {
  campaign: Campaign
  goals: Goal[]
  actions: Action[]
  onClose: () => void
}

// Collects optician details + Step 1 (goal) + Step 2 (action), then seeds a fully
// populated briefing from the campaign's asset+design pairs and navigates to it.
export function LibraryStartModal({ campaign, goals, actions, onClose }: Props) {
  const { copy, translateCountry } = useI18n()
  const router = useRouter()

  const naAction: Action = { _id: NA_ID, label: copy.common.notApplicable, icon: 'c' }
  const actionList = [...actions, naAction]

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [goalId, setGoalId] = useState<string | null>(campaign.goals?.[0]?._id ?? null)
  const [action, setAction] = useState<Action | null>(null)
  const [customAction, setCustomAction] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [scope, setScope] = useState<'store' | 'online' | ''>('')

  const isNA = action?._id === NA_ID
  const clientOk = Boolean(country && name.trim() && city.trim())
  const actionOk = Boolean(action && (!action.isCustom || customAction.trim()) && (isNA || (validUntil && scope)))
  const ready = clientOk && Boolean(goalId) && actionOk

  const pickAction = (a: Action) => {
    setAction(a)
    setCustomAction('')
    setValidUntil('')
    setScope('')
  }

  const submit = () => {
    if (!ready) return
    const seed: CampaignSeed = {
      client: { name: name.trim(), city: city.trim(), country },
      goalId,
      action: isNA
        ? { id: NA_ID, scope: 'na' }
        : { id: action!._id, custom: action!.isCustom ? customAction.trim() : undefined, validUntil, scope: scope as 'store' | 'online' },
      prefill: campaign.prefill,
      assets: (campaign.assets || []).map(a => ({
        assetTypeId: a.assetType._id,
        designId: a.design?._id ?? null,
        designTitle: a.design?.title ?? null,
      })),
    }
    try { sessionStorage.setItem('lo-seed-campaign', JSON.stringify(seed)) } catch { /* ignore */ }
    router.push('/')
  }

  return (
    <div className={styles.bg} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headThumb}>
            <Image src={campaign.thumbnail || FALLBACK_IMAGE_DATA_URI} alt={campaign.title} fill sizes="48px" style={{ objectFit: 'cover' }} />
          </div>
          <div className={styles.headText}>
            <div className={styles.title}>{copy.library.startBriefing}</div>
            <div className={styles.sub}>{campaign.title}</div>
          </div>
          <button className={styles.close} onClick={onClose} aria-label={copy.common.close}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Optician details */}
          <div className={styles.sectionLabel}>{copy.client.title}</div>
          <div className={styles.clientGrid}>
            <div className={styles.field}>
              <label className={styles.label}>{copy.client.region}</label>
              <select className={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
                <option value="">{copy.common.chooseOne}</option>
                {COUNTRIES.map(code => <option key={code} value={code}>{translateCountry(code)}</option>)}
              </select>
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>{copy.client.shopName}</label>
                <input className={styles.input} type="text" placeholder={copy.client.shopNamePlaceholder} value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{copy.client.shopCity}</label>
                <input className={styles.input} type="text" placeholder={copy.client.shopCityPlaceholder} value={city} onChange={e => setCity(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Goal */}
          <div className={styles.sectionLabel}>{copy.steps.goalQuestion}</div>
          <div className={styles.chips}>
            {goals.map(g => (
              <button key={g._id} type="button" className={`${styles.chip} ${goalId === g._id ? styles.chipOn : ''}`} onClick={() => setGoalId(g._id)}>
                {g.label}
              </button>
            ))}
          </div>

          {/* Action */}
          <div className={styles.sectionLabel}>{copy.steps.actionQuestion}</div>
          <div className={styles.chips}>
            {actionList.map(a => (
              <button key={a._id} type="button" className={`${styles.chip} ${action?._id === a._id ? styles.chipOn : ''}`} onClick={() => pickAction(a)}>
                {a.label}
              </button>
            ))}
          </div>

          {action?.isCustom && (
            <input className={styles.input} style={{ marginTop: '.6rem' }} type="text" placeholder={copy.steps.customActionPlaceholder} value={customAction} onChange={e => setCustomAction(e.target.value)} />
          )}

          {action && !isNA && (
            <div className={styles.row2} style={{ marginTop: '.6rem' }}>
              <div className={styles.field}>
                <label className={styles.label}>{copy.steps.validUntil}</label>
                <input className={styles.input} type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{copy.steps.scopeQuestion}</label>
                <select className={styles.select} value={scope} onChange={e => setScope(e.target.value as 'store' | 'online')}>
                  <option value="">{copy.common.chooseOne}</option>
                  <option value="store">{copy.steps.scope.store}</option>
                  <option value="online">{copy.steps.scope.online}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>{copy.common.close}</button>
          <button className={styles.submit} disabled={!ready} onClick={submit}>{copy.library.toBriefing}</button>
        </div>
      </div>
    </div>
  )
}
