'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Goal, Action, Need, Subject, Campaign } from './types'
import { useI18n } from './i18n'
import { Nav } from './Nav'
import { ClientStep } from './ClientStep'
import { SelectionStep } from './SelectionStep'
import { SubjectFilters } from './SubjectFilters'
import { CampaignGrid } from './CampaignGrid'
import { BriefingSection } from './BriefingSection'
import { BottomBar } from './BottomBar'
import { SummaryModal } from './SummaryModal'
import { DetailOverlay } from './DetailOverlay'

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

let _counter = 0
export const uid = () => `i${_counter++}`

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
interface Props {
  goals: Goal[]
  actions: Action[]
  needs: Need[]
  subjects: Subject[]
  campaigns: Campaign[]
  isDraftMode: boolean
}

export function CampaignCatalog({ goals, actions, needs, subjects, campaigns, isDraftMode }: Props) {
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
  const [selNeeds, setSelNeeds] = useState<Need[]>([])
  const [selSubjects, setSelSubjects] = useState<Subject[]>([])

  // Campaign selection
  const [selCampaigns, setSelCampaigns] = useState<Record<string, Campaign>>({})

  // ── Lifted briefing state ─────────────────────────────────────────────────
  const [campaignBriefings, setCampaignBriefings] = useState<CampaignBriefing[]>([])
  const [sharedFields, setSharedFields] = useState<SharedBriefingFields>({
    deadline: '', liveDate: '', desc4: '', bgInfo: '', refUrl: '',
  })

  // UI state
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null)
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
  const showCampaignGrid = isActionReady && selNeeds.length > 0
  const selectedCount = Object.keys(selCampaigns).length

  useEffect(() => {
    if (isActionReady) return

    setSelNeeds([])
    setSelSubjects([])
    setSelCampaigns({})
    setCampaignBriefings([])
    setDetailCampaign(null)
    setSummaryOpen(false)
  }, [isActionReady])

  const filteredCampaigns = campaigns.filter(c => {
    if (selNeeds.length > 0) {
      const allLinkedFilters = selNeeds.flatMap(n => n.linkedAssetFilters ?? [])
      const hasAnyLinks = selNeeds.some(n => (n.linkedAssetFilters ?? []).length > 0)
      if (hasAnyLinks) {
        const campaignFilters = c.assetFilters ?? []
        if (!allLinkedFilters.some(f => campaignFilters.includes(f))) return false
      }
    }
    if (selSubjects.length > 0) return c.subjects.some(s => selSubjects.some(ss => ss._id === s._id))
    return true
  })

  const toggleCampaign = useCallback((campaign: Campaign) => {
    setSelCampaigns(prev => {
      const next = { ...prev }
      if (next[campaign._id]) {
        delete next[campaign._id]
        // Remove briefing for this campaign
        setCampaignBriefings(b => b.filter(x => x.campaignId !== campaign._id))
      } else {
        next[campaign._id] = campaign
        // Add briefing for this campaign with prefilled blocks
        const types = getTypesForCampaign(campaign, selNeeds)
        setCampaignBriefings(b => [...b, {
          campaignId: campaign._id,
          instances: types.map(typeId => ({
            id: uid(), typeId, data: getPrefillForCampaign(typeId, campaign),
          })),
        }])
      }
      return next
    })
  }, [selNeeds])

  const removeCampaign = useCallback((id: string) => {
    setSelCampaigns(prev => { const n = { ...prev }; delete n[id]; return n })
    setCampaignBriefings(b => b.filter(x => x.campaignId !== id))
  }, [])

  const resetAll = useCallback(() => {
    setSelCampaigns({})
    setCampaignBriefings([])
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
              setSelNeeds([])
              setSelSubjects([])
              setSelCampaigns({})
              setCampaignBriefings([])
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
            items={needs.map(n => ({ id: n._id, label: n.label, icon: n.icon }))}
            selected={selNeeds.map(n => n._id)}
            multiSelect={true}
            answeredLabel={selNeeds.map(n => n.label).join(', ')}
            campaignCountPerItem={Object.fromEntries(
              needs.map(n => [n._id, Object.values(selCampaigns).filter(c => campaignMatchesNeed(c, n)).length])
            )}
            onSelect={(id) => {
              const need = needs.find(n => n._id === id)!
              setSelNeeds(prev => prev.some(n => n._id === id) ? prev.filter(n => n._id !== id) : [...prev, need])
            }}
          />
        )}

        {showCampaignGrid && (
          <SubjectFilters
            subjects={subjects}
            selected={selSubjects}
            onToggle={(s) => setSelSubjects(prev => prev.some(x => x._id === s._id) ? prev.filter(x => x._id !== s._id) : [...prev, s])}
          />
        )}

        {showCampaignGrid && (
          <CampaignGrid
            campaigns={filteredCampaigns}
            selected={selCampaigns}
            onToggle={toggleCampaign}
            onOpen={setDetailCampaign}
          />
        )}

        {selectedCount > 0 && (
          <BriefingSection
            selectedCampaigns={Object.values(selCampaigns)}
            campaignBriefings={campaignBriefings}
            sharedFields={sharedFields}
            onUpdateBriefing={setCampaignBriefings}
            onUpdateShared={setSharedFields}
          />
        )}
      </div>

      <BottomBar count={selectedCount} onSummarise={() => setSummaryOpen(true)} onReset={resetAll} />

      {detailCampaign && (
        <DetailOverlay
          campaign={detailCampaign}
          isSelected={!!selCampaigns[detailCampaign._id]}
          onToggle={() => toggleCampaign(detailCampaign)}
          onClose={() => setDetailCampaign(null)}
        />
      )}

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
            selNeeds={selNeeds}
            selSubjects={selSubjects}
            selCampaigns={Object.values(selCampaigns)}
            campaignBriefings={campaignBriefings}
            sharedFields={sharedFields}
            onRemove={removeCampaign}
            onClose={() => setSummaryOpen(false)}
          />
      )}
    </>
  )
}
