'use client'

import { useState, useCallback } from 'react'
import type { Goal, Action, Need, Subject, Campaign } from './types'
import { BLOCK_META } from './types'
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
export interface BriefingInstance {
  id: string
  typeId: string
  data: Record<string, string | string[]>
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

export function getTypesForCampaign(campaign: Campaign, needs: Need[]): string[] {
  const needed: string[] = []
  const add = (t: string) => { if (!needed.includes(t)) needed.push(t) }
  needs.forEach(n => {
    if (!n.briefingBlockType || n.briefingBlockType === 'none') return
    const linked = n.linkedAssetFilters ?? []
    if (linked.length === 0 || campaign.assetFilters?.some(f => linked.includes(f))) add(n.briefingBlockType)
  })
  if (campaign.type === 'LANDING PAGE') add('af-landing')
  if (campaign.type === 'MEDIA KIT') add('af-print')
  if (campaign.assetFilters?.includes('Stickering')) add('af-sticker')
  if (campaign.assetFilters?.some(f => ['Banner','Vlag','Spandoek'].includes(f))) add('af-banner')
  if (campaign.assetFilters?.some(f => f.includes('Flyer') || f.includes('Poster') || f === 'DM')) add('af-print')
  if (campaign.assetFilters?.some(f => ['Meta ADS','Google ADS'].includes(f))) add('af-social')
  if (campaign.assetFilters?.includes('Email')) add('af-email')
  if (campaign.assetFilters?.includes('Video')) add('af-video')
  if (campaign.assetFilters?.includes('Landing Page')) add('af-landing')
  return needed
}

export function getPrefillForCampaign(typeId: string, campaign: Campaign): Record<string, string | string[]> {
  const pf = campaign.prefill
  if (!pf) return {}
  const result: Record<string, string | string[]> = {}
  if (typeId === 'af-print')  { if (pf.printPaper) result.paper = pf.printPaper; if (pf.printQty) result.qty = String(pf.printQty) }
  if (typeId === 'af-social'  && pf.socialPlatforms?.length) result.platforms = pf.socialPlatforms
  if (typeId === 'af-banner'  && pf.bannerMaterial) result.material = pf.bannerMaterial
  if (typeId === 'af-email')  { if (pf.emailPlatform) result.platform = pf.emailPlatform; if (pf.emailType) result.type = pf.emailType }
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
  // Client info
  const [clientReady, setClientReady] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientCity, setClientCity] = useState('')
  const [clientCountry, setClientCountry] = useState('')

  // Step selections
  const [selGoal, setSelGoal] = useState<Goal | null>(null)
  const [selAction, setSelAction] = useState<Action | null>(null)
  const [customAction, setCustomAction] = useState('')
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
  const showCampaignGrid = selNeeds.length > 0
  const selectedCount = Object.keys(selCampaigns).length

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
          📝 Draft preview mode — <a href="/api/exit-draft" style={{ color: '#000', textDecoration: 'underline' }}>Exit preview</a>
        </div>
      )}

      <Nav />

      <div className="page">
        <ClientStep
          ready={clientReady}
          onComplete={(name, city, country) => { setClientName(name); setClientCity(city); setClientCountry(country); setClientReady(true) }}
        />

        {clientReady && (
          <SelectionStep
            stepNumber={1}
            question="Wat is het doel van de marketing?"
            items={goals.map(g => ({ id: g._id, label: g.label, icon: g.icon }))}
            selected={selGoal ? [selGoal._id] : []}
            multiSelect={false}
            answeredLabel={selGoal?.label}
            onSelect={(id) => {
              setSelGoal(goals.find(g => g._id === id) || null)
              setSelAction(null); setSelNeeds([]); setSelSubjects([]); setSelCampaigns({}); setCampaignBriefings([])
            }}
          />
        )}

        {selGoal && (
          <SelectionStep
            stepNumber={2}
            question="Welke acties zijn hier aan verbonden?"
            items={actions.map(a => ({ id: a._id, label: a.label, icon: a.icon, isCustom: a.isCustom }))}
            selected={selAction ? [selAction._id] : []}
            multiSelect={false}
            answeredLabel={selAction?.isCustom && customAction ? customAction : selAction?.label}
            customAction={selAction?.isCustom ? { value: customAction, onChange: setCustomAction, onContinue: () => {} } : undefined}
            onSelect={(id) => {
              const a = actions.find(a => a._id === id) || null
              setSelAction(a)
              if (!a?.isCustom) { setSelNeeds([]); setSelSubjects([]); setSelCampaigns({}); setCampaignBriefings([]) }
            }}
          />
        )}

        {selAction && (!selAction.isCustom || customAction) && (
          <SelectionStep
            stepNumber={3}
            question="Wat heb je nodig?"
            items={needs.map(n => ({ id: n._id, label: n.label, icon: n.icon }))}
            selected={selNeeds.map(n => n._id)}
            multiSelect={true}
            answeredLabel={selNeeds.map(n => n.label).join(', ')}
            campaignCountPerItem={Object.fromEntries(
              needs.map(n => [n._id, Object.values(selCampaigns).filter(c =>
                n.briefingBlockType && c.assetFilters?.some(af =>
                  (n.briefingBlockType === 'af-social' && ['Meta ADS','Google ADS'].includes(af)) ||
                  (n.briefingBlockType === 'af-print' && (af.includes('Flyer') || af.includes('Poster'))) ||
                  (n.briefingBlockType === 'af-sticker' && af === 'Stickering') ||
                  (n.briefingBlockType === 'af-banner' && ['Banner','Vlag','Spandoek'].includes(af))
                )
              ).length])
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
            selectedNeeds={selNeeds}
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
