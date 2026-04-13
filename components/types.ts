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

export interface CampaignGoal {
  _id: string
  label: string
}

export interface Campaign {
  _id: string
  title: string
  type: string
  description: string
  formats: string[]
  status: 'published' | 'draft' | 'internal'
  season?: string
  thumbnail: string
  mockups: string[]
  goals: CampaignGoal[]
  visualStyle?: { _id: string; label: string }
  subjects: { _id: string; label: string }[]
  assetFilters: string[]
  prefill?: {
    printPaper?: string
    printQty?: number
    socialPlatforms?: string[]
    bannerMaterial?: string
    emailPlatform?: string
    emailType?: string
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
  'af-sticker': { icon: '🪟', title: 'Stickering & Artist Impression', desc: "Raamdimensies, gevelfoto's en mockups" },
  'af-banner':  { icon: '🚩', title: 'Banners & Vlaggen',              desc: "Afmetingen, materiaal en locatiefoto's" },
  'af-print':   { icon: '🖨️',  title: 'Print & Drukwerk',              desc: 'Papierformaat, oplage en referenties' },
  'af-social':  { icon: '📱', title: 'Social Media',                   desc: 'Platforms, formaten en inspiratie' },
  'af-landing': { icon: '🌐', title: 'Landingspagina',                 desc: 'URL en gewenste subpagina' },
  'af-email':   { icon: '✉️',  title: 'E-mailcampagne',                desc: 'Platform, type en doelgroep' },
  'af-video':   { icon: '🎬', title: 'Video',                          desc: 'Type, duur en referentielinks' },
}

export const ASSET_FIELD_MAP: Record<string, string> = {
  'mockup': 'af-sticker',
  'pos':    'af-sticker',
  'print':  'af-print',
  'social': 'af-social',
  'landing':'af-landing',
  'google': 'af-social',
}
