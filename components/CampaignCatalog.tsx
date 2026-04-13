'use client'

import { useState, useCallback } from 'react'
import type { Goal, Action, Need, Subject, Campaign } from './types'
import { Nav } from './Nav'
import { ClientStep } from './ClientStep'
import { SelectionStep } from './SelectionStep'
import { SubjectFilters } from './SubjectFilters'
import { CampaignGrid } from './CampaignGrid'
import { BriefingSection } from './BriefingSection'
import { BottomBar } from './BottomBar'
import { SummaryModal } from './SummaryModal'
import { DetailOverlay } from './DetailOverlay'

interface Props {
  goals: Goal[]
  actions: Action[]
  needs: Need[]
  subjects: Subject[]
  campaigns: Campaign[]
  isDraftMode: boolean
}

export function CampaignCatalog({ goals, actions, needs, subjects, campaigns, isDraftMode }: Props) {
  // ── Client info ────────────────────────────────────
  const [clientReady, setClientReady] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientCity, setClientCity] = useState('')
  const [clientCountry, setClientCountry] = useState('')

  // ── Step selections ────────────────────────────────
  const [selGoal, setSelGoal] = useState<Goal | null>(null)
  const [selAction, setSelAction] = useState<Action | null>(null)
  const [customAction, setCustomAction] = useState('')
  const [selNeeds, setSelNeeds] = useState<Need[]>([])
  const [selSubjects, setSelSubjects] = useState<Subject[]>([])

  // ── Campaign selection ─────────────────────────────
  const [selCampaigns, setSelCampaigns] = useState<Record<string, Campaign>>({})

  // ── UI state ───────────────────────────────────────
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)

  // ── Computed ───────────────────────────────────────
  const showCampaignGrid = selNeeds.length > 0
  const selectedCount = Object.keys(selCampaigns).length

  // Campaigns filtered by both selected needs AND subject filters
  const filteredCampaigns = campaigns.filter(c => {
    // Filter by needs — show campaign if it matches any selected need's asset filters
    // If no needs are selected, show nothing (grid is hidden anyway)
    // If a need has no linkedAssetFilters set, fall back to showing all campaigns for that need
    if (selNeeds.length > 0) {
      const allLinkedFilters = selNeeds.flatMap(n => n.linkedAssetFilters ?? [])
      // If all selected needs have no linkedAssetFilters configured yet, show all campaigns
      // (graceful fallback until CMS is configured)
      const hasAnyLinks = selNeeds.some(n => (n.linkedAssetFilters ?? []).length > 0)
      if (hasAnyLinks) {
        const campaignFilters = c.assetFilters ?? []
        const matches = allLinkedFilters.some(f => campaignFilters.includes(f))
        if (!matches) return false
      }
    }

    // Filter by subject chips
    if (selSubjects.length > 0) {
      return c.subjects.some(s => selSubjects.some(ss => ss._id === s._id))
    }

    return true
  })

  // ── Handlers ───────────────────────────────────────
  const toggleCampaign = useCallback((campaign: Campaign) => {
    setSelCampaigns(prev => {
      const next = { ...prev }
      if (next[campaign._id]) delete next[campaign._id]
      else next[campaign._id] = campaign
      return next
    })
  }, [])

  const removeCampaign = useCallback((id: string) => {
    setSelCampaigns(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setSelCampaigns({})
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
        {/* Client info */}
        <ClientStep
          ready={clientReady}
          onComplete={(name, city, country) => {
            setClientName(name)
            setClientCity(city)
            setClientCountry(country)
            setClientReady(true)
          }}
        />

        {/* Step 1 — Goal */}
        {clientReady && (
          <SelectionStep
            stepNumber={1}
            question="Wat is het doel van de marketing?"
            items={goals.map(g => ({ id: g._id, label: g.label, icon: g.icon }))}
            selected={selGoal ? [selGoal._id] : []}
            multiSelect={false}
            answeredLabel={selGoal?.label}
            onSelect={(id) => {
              const g = goals.find(g => g._id === id) || null
              setSelGoal(g)
              setSelAction(null)
              setSelNeeds([])
              setSelSubjects([])
              setSelCampaigns({})
            }}
          />
        )}

        {/* Step 2 — Action */}
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
              if (!a?.isCustom) {
                setSelNeeds([])
                setSelSubjects([])
                setSelCampaigns({})
              }
            }}
          />
        )}

        {/* Step 3 — Needs */}
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
                  (n.briefingBlockType === 'af-social' && (af === 'Meta ADS' || af === 'Google ADS')) ||
                  (n.briefingBlockType === 'af-print' && af === 'Flyer') ||
                  (n.briefingBlockType === 'af-sticker' && af === 'Stickering') ||
                  (n.briefingBlockType === 'af-banner' && af === 'Banner')
                )
              ).length])
            )}
            onSelect={(id) => {
              const need = needs.find(n => n._id === id)!
              setSelNeeds(prev =>
                prev.some(n => n._id === id)
                  ? prev.filter(n => n._id !== id)
                  : [...prev, need]
              )
            }}
          />
        )}

        {/* Subject filters */}
        {showCampaignGrid && (
          <SubjectFilters
            subjects={subjects}
            selected={selSubjects}
            onToggle={(s) =>
              setSelSubjects(prev =>
                prev.some(x => x._id === s._id)
                  ? prev.filter(x => x._id !== s._id)
                  : [...prev, s]
              )
            }
          />
        )}

        {/* Campaign grid */}
        {showCampaignGrid && (
          <CampaignGrid
            campaigns={filteredCampaigns}
            selected={selCampaigns}
            onToggle={toggleCampaign}
            onOpen={setDetailCampaign}
          />
        )}

        {/* Briefing section */}
        {selectedCount > 0 && (
          <BriefingSection
            selectedCampaigns={Object.values(selCampaigns)}
            selectedNeeds={selNeeds}
          />
        )}
      </div>

      {/* Bottom bar */}
      <BottomBar
        count={selectedCount}
        onSummarise={() => setSummaryOpen(true)}
        onReset={resetAll}
      />

      {/* Detail overlay */}
      {detailCampaign && (
        <DetailOverlay
          campaign={detailCampaign}
          isSelected={!!selCampaigns[detailCampaign._id]}
          onToggle={() => toggleCampaign(detailCampaign)}
          onClose={() => setDetailCampaign(null)}
        />
      )}

      {/* Summary modal */}
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
          onRemove={removeCampaign}
          onClose={() => setSummaryOpen(false)}
        />
      )}
    </>
  )
}
