'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Goal, Action, Need, Subject, Campaign, AssetType, Theme } from './types'
import { useI18n } from './i18n'
import { Nav } from './Nav'
import { ClientStep } from './ClientStep'
import { SelectionStep } from './SelectionStep'
import { SubjectFilters } from './SubjectFilters'
import { AssetBriefingSection } from './AssetBriefingSection'
import { BottomBar } from './BottomBar'
import { SummaryModal } from './SummaryModal'

// ── Shared types for lifted briefing state ────────────────────────────────────
export interface DimensionEntry {
  width: string
  height: string
}

export type BriefingValue = string | string[] | DimensionEntry[]

export interface BriefingInstance {
  id: string
  typeId: string
  data: Record<string, BriefingValue>
}

export interface CampaignBriefing {
  campaignId: string
  instances: BriefingInstance[]
}

export interface SharedBriefingFields {
  deadline: string
  liveDate: string
  desc4: string
  bgInfo: string
  refUrl: string
}

// ── Per-asset briefing state (Step 3 redesign) ───────────────────────────────
export interface AssetBriefingInstance {
  id: string
  data: Record<string, BriefingValue>
  selectedThemeId: string | null
  selectedDesignKey: string | null
  selectedDesignTitle: string | null
  customDesignNote: string
}

export interface AssetBriefing {
  assetTypeId: string
  assetKey: string             // selects the field set
  blockType: string            // accent / grouping
  label: string
  icon: string                 // emoji from the asset type
  accentColor: string
  instances: AssetBriefingInstance[]
}

let _counter = 0
export const uid = () => `i${_counter++}`

export function newAssetInstance(): AssetBriefingInstance {
  return {
    id: uid(),
    data: {},
    selectedThemeId: null,
    selectedDesignKey: null,
    selectedDesignTitle: null,
    customDesignNote: '',
  }
}

// ── Legacy campaign helpers (still used by the Library briefing utilities) ─────
export function campaignMatchesBlockType(campaign: Campaign, typeId: string): boolean {
  if (typeId === 'af-sticker') return Boolean(campaign.assetFilters?.includes('Stickering') || ['MOCKUP', 'POS'].includes(campaign.type))
  if (typeId === 'af-banner') return campaign.assetFilters?.some(f => ['Banner', 'Vlag', 'Spandoek', 'Lightbox'].includes(f)) || false
  if (typeId === 'af-print') return Boolean(campaign.type === 'MEDIA KIT' || campaign.assetFilters?.some(f => f.includes('Flyer') || f.includes('Poster') || f === 'DM'))
  if (typeId === 'af-social') return campaign.assetFilters?.some(f => ['Meta ADS', 'Google ADS'].includes(f)) || false
  if (typeId === 'af-email') return campaign.assetFilters?.includes('Email') || false
  if (typeId === 'af-video') return campaign.assetFilters?.includes('Video') || false
  if (typeId === 'af-landing') return Boolean(campaign.type === 'LANDING PAGE' || campaign.assetFilters?.includes('Landing Page'))
  return false
}

export function campaignMatchesNeed(campaign: Campaign, need: Need): boolean {
  if (!need.briefingBlockType || need.briefingBlockType === 'none') return false

  const linkedFilters = need.linkedAssetFilters ?? []
  if (linkedFilters.length > 0) return campaign.assetFilters?.some(filter => linkedFilters.includes(filter)) || false

  return campaignMatchesBlockType(campaign, need.briefingBlockType)
}

export function getTypesForCampaign(campaign: Campaign, needs: Need[]): string[] {
  const needed: string[] = []
  const add = (typeId: string) => { if (!needed.includes(typeId)) needed.push(typeId) }

  needs.forEach(need => {
    if (need.briefingBlockType && need.briefingBlockType !== 'none' && campaignMatchesNeed(campaign, need)) {
      add(need.briefingBlockType)
    }
  })

  ;['af-sticker', 'af-banner', 'af-print', 'af-social', 'af-email', 'af-video', 'af-landing'].forEach(typeId => {
    if (campaignMatchesBlockType(campaign, typeId)) add(typeId)
  })

  return needed
}

export function getPrefillForCampaign(typeId: string, campaign: Campaign): Record<string, BriefingValue> {
  const pf = campaign.prefill
  if (!pf) return {}
  const result: Record<string, BriefingValue> = {}
  if (typeId === 'af-print')  { if (pf.printPaper) result.paper = pf.printPaper; if (pf.printQty) result.qty = String(pf.printQty) }
  if (typeId === 'af-social'  && pf.socialPlatforms?.length) result.platforms = pf.socialPlatforms
  if (typeId === 'af-banner'  && pf.bannerMaterial) result.material = pf.bannerMaterial
  if (typeId === 'af-video')  { if (pf.videoType) result.vtype = pf.videoType; if (pf.videoDuration) result.vlen = pf.videoDuration }
  if (typeId === 'af-sticker' && pf.stickerNotes) result.notes = pf.stickerNotes
  return result
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
  const [selAssetTypes, setSelAssetTypes] = useState<AssetType[]>([])
  const [selSubjects, setSelSubjects] = useState<Subject[]>([])

  // ── Lifted briefing state ─────────────────────────────────────────────────
  const [assetBriefings, setAssetBriefings] = useState<AssetBriefing[]>([])
  const [sharedFields, setSharedFields] = useState<SharedBriefingFields>({
    deadline: '', liveDate: '', desc4: '', bgInfo: '', refUrl: '',
  })

  // UI state
  const [summaryOpen, setSummaryOpen] = useState(false)

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
  const showBriefing = isActionReady && selAssetTypes.length > 0
  const totalInstances = assetBriefings.reduce((sum, b) => sum + b.instances.length, 0)

  useEffect(() => {
    if (isActionReady) return

    setSelAssetTypes([])
    setSelSubjects([])
    setAssetBriefings([])
    setSummaryOpen(false)
  }, [isActionReady])

  const toggleAssetType = useCallback((assetType: AssetType) => {
    setSelAssetTypes(prev => {
      if (prev.some(a => a._id === assetType._id)) {
        setAssetBriefings(b => b.filter(x => x.assetTypeId !== assetType._id))
        return prev.filter(a => a._id !== assetType._id)
      }
      setAssetBriefings(b => [...b, {
        assetTypeId: assetType._id,
        assetKey: assetType.key,
        blockType: assetType.blockType,
        label: assetType.label,
        icon: assetType.icon || '🧩',
        accentColor: ACCENTS[prev.length % ACCENTS.length],
        instances: [newAssetInstance()],
      }])
      return [...prev, assetType]
    })
  }, [])

  const resetAll = useCallback(() => {
    setSelAssetTypes([])
    setAssetBriefings([])
    setSelSubjects([])
    setSharedFields({ deadline: '', liveDate: '', desc4: '', bgInfo: '', refUrl: '' })
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
              setSelAssetTypes([])
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
            items={assetTypes.map(a => ({ id: a._id, label: a.label, icon: a.icon || '🧩', subtitle: a.subtitle }))}
            selected={selAssetTypes.map(a => a._id)}
            multiSelect={true}
            variant="rich"
            answeredLabel={selAssetTypes.map(a => a.label).join(', ')}
            campaignCountPerItem={Object.fromEntries(assetBriefings.map(b => [b.assetTypeId, b.instances.length]))}
            onSelect={(id) => {
              const at = assetTypes.find(a => a._id === id)
              if (at) toggleAssetType(at)
            }}
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
          selAssetTypes={selAssetTypes}
          selSubjects={selSubjects}
          assetBriefings={assetBriefings}
          themes={themes}
          sharedFields={sharedFields}
          onRemove={(assetTypeId) => {
            const at = selAssetTypes.find(a => a._id === assetTypeId)
            if (at) toggleAssetType(at)
          }}
          onClose={() => setSummaryOpen(false)}
        />
      )}
    </>
  )
}
