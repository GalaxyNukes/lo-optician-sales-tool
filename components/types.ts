export interface Goal {
  _id: string
  label: string
  labelNL?: string
  icon: string
}

export interface Action {
  _id: string
  label: string
  icon: string
  isCustom?: boolean
}

export interface Need {
  _id: string
  label: string
  icon: string
  briefingBlockType?: string
  linkedAssetFilters?: string[]
}

export interface Subject {
  _id: string
  label: string
}

// ── Asset-type docs = campaign-package deliverables (Library handoff) ──────────
// Step 3 itself is driven by the code registry (components/deliverables.ts).
// These docs only let a Campaign reference deliverables via `key`.
export interface AssetType {
  _id: string
  label: string
  subtitle?: string
  key: string          // matches a deliverable key in deliverables.ts
  blockType?: string   // legacy grouping bucket — no longer used by the UI
  icon?: string
  heroImage?: string   // optional inspiration banner (resolved URL)
}

export interface Design {
  _id: string
  title: string
  image: string         // resolved URL
  previewVideo?: string // resolved URL — landing scroll preview (mp4)
}

// Curated decal library for the storefront mockup tool (transparent PNGs).
export type DecalCategory = 'logo' | 'quote' | 'badge' | 'special'
export type DecalLang = 'nl' | 'fr' | 'both'
export interface Decal {
  _id: string
  label: string
  category: DecalCategory
  lang?: DecalLang      // 'both'/undefined = language-neutral, always shown
  image: string         // resolved URL (transparent PNG)
}

export interface Theme {
  _id: string
  title: string
  season?: string
  subjects: { _id: string; label: string }[]
  designs: Design[]
}

export interface CampaignAsset {
  assetType: AssetType
  design?: Design
}

export interface CampaignGoal {
  _id: string
  label: string
}

export interface CampaignType {
  _id: string
  label: string
  color?: string
}

export interface Campaign {
  _id: string
  title: string
  type: CampaignType | null
  description: string
  formats: string[]
  status: 'published' | 'draft' | 'internal'
  season?: string
  thumbnail: string
  mockups: string[]
  goals: CampaignGoal[]
  visualStyle?: { _id: string; label: string }
  subjects: { _id: string; label: string }[]
  assets: CampaignAsset[]
  prefill?: {
    printPaper?: string
    printQty?: number
    socialPlatforms?: string[]
    bannerMaterial?: string
    videoType?: string
    videoDuration?: string
    stickerNotes?: string
  }
}

export interface BlockInstance {
  instId: string
  typeId: string
}

export interface BriefingField {
  label: string
  value: string
}

export interface BriefingBlock {
  typeId: string
  instId: string
  title: string
  icon: string
  fields: BriefingField[]
}

export const BLOCK_META: Record<string, { icon: string; title: string; desc: string }> = {
  'af-sticker': { icon: '🪟', title: 'Partnerbranding',                desc: "Etalageformaten, deurmaten en winkelbeelden" },
  'af-banner':  { icon: '🚩', title: 'Banners, lightboxes & Vlaggen',  desc: 'Formaten, materiaal en designwensen' },
  'af-print':   { icon: '🖨️',  title: 'Print & Drukwerk',              desc: 'Papier, oriëntatie en designwensen' },
  'af-social':  { icon: '📱', title: 'Socialmediacampagne',            desc: 'Platforms, campagneperiode en inspiratie' },
  'af-landing': { icon: '🌐', title: 'Landingspagina',                 desc: 'URL en gewenste subpagina' },
  'af-email':   { icon: '✉️',  title: 'E-mailcampagne',                desc: 'Campagneperiode en extra context' },
  'af-video':   { icon: '🎬', title: 'Video',                          desc: 'Oriëntatie, duur en weergavecontext' },
  'af-other':   { icon: '🧩', title: 'Anderen',                        desc: 'Overige deliverables en extra informatie' },
}

export const ASSET_FIELD_MAP: Record<string, string> = {
  'mockup': 'af-sticker',
  'pos':    'af-sticker',
  'print':  'af-print',
  'social': 'af-social',
  'landing':'af-landing',
  'google': 'af-social',
}
