'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Goal, Action, Subject, Campaign, AssetType, Theme } from './types'
import type { BlockKey, DesignPick } from './deliverables'
import { BLOCKS, deliverablesForBlock, getDeliverable, designSides, LEGACY_KEY_MAP } from './deliverables'
import { useI18n } from './i18n'
import { Nav } from './Nav'
import { ClientStep } from './ClientStep'
import { SelectionStep } from './SelectionStep'
import { SubjectFilters } from './SubjectFilters'
import { AssetBriefingSection } from './AssetBriefingSection'
import { BottomBar } from './BottomBar'
import { SummaryModal } from './SummaryModal'

// Re-export the shared value shapes (kept here historically; defined in deliverables).
export type { DimensionEntry, BriefingValue, DesignPick } from './deliverables'
import type { BriefingValue } from './deliverables'

export interface SharedBriefingFields {
  title: string
  deadline: string
  liveDate: string
  mainMessage: string
  owner: string
  audience: string
  logoRequired: string   // 'yes' | 'no' | ''
  refUrl: string
  bgInfo: string
}

// ── Per-asset briefing state (Step-3 redesign) ────────────────────────────────
// One group per asset BLOCK; each block holds a mix of deliverable instances.
export interface AssetBriefingInstance {
  id: string
  deliverableKey: string
  data: Record<string, BriefingValue>
  designs: DesignPick[]
  designIsCustom: boolean
  customDesignNote: string
}

export interface AssetBriefing {
  blockKey: BlockKey
  accentColor: string
  instances: AssetBriefingInstance[]
}

let _counter = 0
export const uid = () => `i${_counter++}`

export function newAssetInstance(deliverableKey: string): AssetBriefingInstance {
  return {
    id: uid(),
    deliverableKey,
    data: {},
    designs: [],
    designIsCustom: false,
    customDesignNote: '',
  }
}

// ── Library "start briefing" handoff ───────────────────────────────────────────
export interface SeedAsset {
  assetTypeId: string
  designId?: string | null
  designTitle?: string | null
}

export interface CampaignSeed {
  client?: { name: string; city: string; country: string }
  goalId?: string | null
  action?: { id: string; custom?: string; validUntil?: string; scope?: 'store' | 'online' | 'na' } | null
  prefill?: Campaign['prefill']
  assets: SeedAsset[]
}

// ── Main component ────────────────────────────────────────────────────────────
const ACCENTS = ['#0D2340', '#1A6B4A', '#8B3A2A', '#2A4E8B', '#6B2A8B', '#8B6B2A', '#2A6B6B']

interface Props {
  goals: Goal[]
  actions: Action[]
  assetTypes: AssetType[]
  themes: Theme[]
  subjects: Subject[]
  isDraftMode: boolean
}

const EMPTY_SHARED: SharedBriefingFields = {
  title: '', deadline: '', liveDate: '', mainMessage: '', owner: '', audience: '', logoRequired: '', refUrl: '', bgInfo: '',
}

export function CampaignCatalog({ goals, actions, assetTypes, themes, subjects, isDraftMode }: Props) {
  const { copy, translateScope } = useI18n()
  const notApplicableAction: Action = { _id: '__not_applicable__', label: copy.common.notApplicable, icon: 'c' }
  const step2Actions = [...actions, notApplicableAction]

  // Client info
  const [clientReady, setClientReady] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientCity, setClientCity] = useState('')
  const [clientCountry, setClientCountry] = useState('')

  // Step selections
  const [selGoal, setSelGoal] = useState<Goal | null>(null)
  const [selAction, setSelAction] = useState<Action | null>(null)
  const [customAction, setCustomAction] = useState('')
  const [actionValidUntil, setActionValidUntil] = useState('')
  const [actionScope, setActionScope] = useState<'store' | 'online' | 'na' | ''>('')
  const [selSubjects, setSelSubjects] = useState<Subject[]>([])

  // ── Lifted briefing state ─────────────────────────────────────────────────
  const [assetBriefings, setAssetBriefings] = useState<AssetBriefing[]>([])
  const [sharedFields, setSharedFields] = useState<SharedBriefingFields>(EMPTY_SHARED)

  // UI state
  const [summaryOpen, setSummaryOpen] = useState(false)

  // Library → briefing seed (held until Steps 1–2 are done; see effects below)
  const seedRef = useRef<CampaignSeed | null>(null)

  // Computed
  const isNotApplicableAction = selAction?._id === notApplicableAction._id
  const isActionChosen = Boolean(selAction && (!selAction.isCustom || customAction.trim()))
  const isActionReady = Boolean(
    isActionChosen && (
      isNotApplicableAction
        ? true
        : Boolean(actionValidUntil && actionScope)
    )
  )
  const showBriefing = isActionReady && assetBriefings.length > 0
  const totalInstances = assetBriefings.reduce((sum, b) => sum + b.instances.length, 0)
  const selectedBlockKeys = assetBriefings.map(b => b.blockKey)

  useEffect(() => {
    if (isActionReady) return
    setSelSubjects([])
    setAssetBriefings([])
    setSummaryOpen(false)
  }, [isActionReady])

  // Read a Library handoff seed once on mount (then clear it).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lo-seed-campaign')
      if (!raw) return
      sessionStorage.removeItem('lo-seed-campaign')
      const seed = JSON.parse(raw) as CampaignSeed
      seedRef.current = seed

      if (seed.client) {
        setClientName(seed.client.name)
        setClientCity(seed.client.city)
        setClientCountry(seed.client.country)
        setClientReady(true)
      }
      if (seed.goalId) {
        const g = goals.find(x => x._id === seed.goalId)
        if (g) setSelGoal(g)
      }
      if (seed.action) {
        const a = step2Actions.find(x => x._id === seed.action!.id)
        if (a) {
          setSelAction(a)
          setCustomAction(seed.action.custom || '')
          setActionValidUntil(seed.action.validUntil || '')
          setActionScope(seed.action.scope || '')
        }
      }
    } catch { /* ignore malformed seed */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply the seed once Step 3 becomes reachable. Maps each campaign asset (legacy
  // assetType key) onto a deliverable, grouped per block.
  useEffect(() => {
    if (!isActionReady || !seedRef.current) return
    const seed = seedRef.current
    seedRef.current = null
    if (!seed.assets?.length) return

    const byBlock = new Map<BlockKey, AssetBriefingInstance[]>()
    for (const sa of seed.assets) {
      const at = assetTypes.find(a => a._id === sa.assetTypeId)
      if (!at) continue
      // Prefer a direct deliverable key; fall back to the legacy assetType-key map.
      const def = getDeliverable(at.key) ?? getDeliverable(LEGACY_KEY_MAP[at.key] ?? '')
      if (!def) continue
      const inst = newAssetInstance(def.key)
      if (sa.designId) {
        const slot = def.design === 'multi' ? sa.designId : (designSides(def, {}) ? 'front' : 'main')
        const themeId = themes.find(t => t.designs?.some(d => d._id === sa.designId))?._id ?? null
        inst.designs = [{ slot, themeId, designId: sa.designId, designTitle: sa.designTitle ?? '' }]
      }
      const list = byBlock.get(def.block) ?? []
      list.push(inst)
      byBlock.set(def.block, list)
    }
    if (byBlock.size === 0) return

    setAssetBriefings([...byBlock.entries()].map(([blockKey, instances], i) => ({
      blockKey,
      accentColor: ACCENTS[i % ACCENTS.length],
      instances,
    })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActionReady, assetTypes, themes])

  const toggleBlock = useCallback((blockKey: BlockKey) => {
    setAssetBriefings(prev => {
      if (prev.some(b => b.blockKey === blockKey)) {
        return prev.filter(b => b.blockKey !== blockKey)
      }
      const deliverables = deliverablesForBlock(blockKey)
      // Single-deliverable blocks (social, email) start with their one instance.
      const instances = deliverables.length === 1 ? [newAssetInstance(deliverables[0].key)] : []
      return [...prev, { blockKey, accentColor: ACCENTS[prev.length % ACCENTS.length], instances }]
    })
  }, [])

  const resetAll = useCallback(() => {
    setAssetBriefings([])
    setSelSubjects([])
    setSharedFields(EMPTY_SHARED)
  }, [])

  return (
    <>
      {isDraftMode && (
        <div style={{ background: '#E8950A', color: '#000', padding: '.5rem 3.5rem', fontSize: '.75rem', fontWeight: 600 }}>
          📝 {copy.preview.banner} — <a href="/api/exit-draft" style={{ color: '#000', textDecoration: 'underline' }}>{copy.preview.exit}</a>
        </div>
      )}

      <Nav activePage="builder" />

      <div className="page">
        <ClientStep
          ready={clientReady}
          onComplete={(name, city, country) => { setClientName(name); setClientCity(city); setClientCountry(country); setClientReady(true) }}
        />

        {clientReady && (
          <SelectionStep
            stepNumber={1}
            question={copy.steps.goalQuestion}
            items={goals.map(g => ({ id: g._id, label: g.label, icon: g.icon }))}
            selected={selGoal ? [selGoal._id] : []}
            multiSelect={false}
            answeredLabel={selGoal?.label}
            onSelect={(id) => {
              setSelGoal(goals.find(g => g._id === id) || null)
              setSelAction(null)
              setCustomAction('')
              setActionValidUntil('')
              setActionScope('')
              setSelSubjects([])
              setAssetBriefings([])
            }}
          />
        )}

        {selGoal && (
          <SelectionStep
            stepNumber={2}
            question={copy.steps.actionQuestion}
            items={step2Actions.map(a => ({ id: a._id, label: a.label, icon: a.icon, isCustom: a.isCustom }))}
            selected={selAction ? [selAction._id] : []}
            multiSelect={false}
            closeOnSelect={false}
            isComplete={isActionReady}
            collapseWhenComplete={true}
            answeredLabel={selAction ? [
              selAction.isCustom && customAction ? customAction : selAction.label,
              !isNotApplicableAction && actionValidUntil ? `${copy.summary.validUntil.toLowerCase()} ${actionValidUntil}` : '',
              !isNotApplicableAction && actionScope ? translateScope(actionScope) : '',
            ].filter(Boolean).join(' / ') : undefined}
            customAction={selAction?.isCustom ? { value: customAction, onChange: setCustomAction } : undefined}
            followUpFields={(() => {
              if (!selAction || isNotApplicableAction) return undefined

              return [
                {
                  label: copy.steps.validUntil,
                  type: 'date' as const,
                  value: actionValidUntil,
                  onChange: setActionValidUntil,
                },
                ...(actionValidUntil ? [{
                  label: copy.steps.scopeQuestion,
                  type: 'select' as const,
                  value: actionScope,
                  options: [
                    { value: 'store', label: copy.steps.scope.store },
                    { value: 'online', label: copy.steps.scope.online },
                  ],
                  onChange: (value: string) => setActionScope(value as 'store' | 'online'),
                }] : []),
              ]
            })()}
            onSelect={(id) => {
              const a = step2Actions.find(action => action._id === id) || null
              const didChange = a?._id !== selAction?._id
              setSelAction(a)
              if (didChange) {
                setCustomAction('')
                setActionValidUntil('')
                setActionScope(a?._id === notApplicableAction._id ? 'na' : '')
              }
            }}
          />
        )}

        {isActionReady && (
          <SelectionStep
            stepNumber={3}
            question={copy.steps.needQuestion}
            items={BLOCKS.map(b => ({
              id: b.key,
              label: (copy.briefing.blocks as Record<string, { label: string; subtitle: string }>)[b.key]?.label ?? b.key,
              icon: b.icon,
              subtitle: (copy.briefing.blocks as Record<string, { label: string; subtitle: string }>)[b.key]?.subtitle,
            }))}
            selected={selectedBlockKeys}
            multiSelect={true}
            variant="rich"
            answeredLabel={selectedBlockKeys.map(k => (copy.briefing.blocks as Record<string, { label: string }>)[k]?.label ?? k).join(', ')}
            campaignCountPerItem={Object.fromEntries(assetBriefings.map(b => [b.blockKey, b.instances.length]))}
            onSelect={(id) => toggleBlock(id as BlockKey)}
          />
        )}

        {showBriefing && (
          <SubjectFilters
            subjects={subjects}
            selected={selSubjects}
            onToggle={(s) => setSelSubjects(prev => prev.some(x => x._id === s._id) ? prev.filter(x => x._id !== s._id) : [...prev, s])}
          />
        )}

        {showBriefing && (
          <AssetBriefingSection
            assetBriefings={assetBriefings}
            sharedFields={sharedFields}
            themes={themes}
            selSubjects={selSubjects}
            onUpdateBriefings={setAssetBriefings}
            onUpdateShared={setSharedFields}
          />
        )}
      </div>

      <BottomBar count={totalInstances} onSummarise={() => setSummaryOpen(true)} onReset={resetAll} />

      {summaryOpen && (
        <SummaryModal
          clientName={clientName}
          clientCity={clientCity}
          clientCountry={clientCountry}
          selGoal={selGoal}
          selAction={selAction}
          customAction={customAction}
          actionValidUntil={actionValidUntil}
          actionScope={actionScope}
          selSubjects={selSubjects}
          assetBriefings={assetBriefings}
          themes={themes}
          sharedFields={sharedFields}
          onRemoveBlock={(blockKey) => toggleBlock(blockKey)}
          onClose={() => setSummaryOpen(false)}
        />
      )}
    </>
  )
}
