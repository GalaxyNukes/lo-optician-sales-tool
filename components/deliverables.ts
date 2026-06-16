// ── Deliverable registry ───────────────────────────────────────────────────────
// Single source of truth for the Step-3 redesign: 5 asset BLOCKS (categories),
// each holding a set of DELIVERABLES, each deliverable carrying its own conditional
// field spec + design-tab behaviour. This is product structure (with conditional
// logic), so it lives in code — not the CMS. Field labels/options resolve through
// i18n keys so everything stays trilingual.

import type { BriefingOptionKey } from './i18n'

// ── Value shapes (shared briefing state) ───────────────────────────────────────
// A dimension entry is extensible: plain W×H for most lists; the storefront
// "placement group" also uses kind (door/window) + placement + note per row.
export interface DimensionEntry {
  width: string
  height: string
  kind?: string
  placement?: string
  note?: string
}

export type BriefingValue = string | string[] | DimensionEntry[]

// A picked design, per slot. single → ['main']; sides → ['front','back'];
// multi → one entry per chosen design (slot = designId).
export interface DesignPick {
  slot: string
  themeId: string | null
  designId: string
  designTitle: string
}

// ── Field spec ─────────────────────────────────────────────────────────────────
export type ShowIf = { key: string; in: string[] }

export type FieldSpec =
  | { kind: 'text' | 'number' | 'url'; key: string; labelKey: string; phKey?: string; showIf?: ShowIf }
  | { kind: 'textarea'; key: string; labelKey: string; phKey?: string; showIf?: ShowIf }
  | { kind: 'select'; key: string; labelKey: string; options: BriefingOptionKey; showIf?: ShowIf }
  | { kind: 'choice'; key: string; labelKey: string; options: BriefingOptionKey; showIf?: ShowIf }
  | { kind: 'checklist'; key: string; labelKey: string; options: BriefingOptionKey; showIf?: ShowIf }
  | { kind: 'period'; startKey: string; endKey: string; labelKey: string; showIf?: ShowIf }
  | { kind: 'dimensions'; key: string; labelKey: string; showIf?: ShowIf }
  | { kind: 'bannerSize'; wKey: string; hKey: string; labelKey: string; showIf?: ShowIf }
  | { kind: 'pageSize'; key: string; wKey: string; hKey: string; labelKey: string; options: BriefingOptionKey; showIf?: ShowIf }
  | { kind: 'orientationIcons'; key: string; labelKey: string; options: BriefingOptionKey; showIf?: ShowIf }
  | { kind: 'designVariation'; key: string; labelKey: string; options: BriefingOptionKey; showIf?: ShowIf }
  | { kind: 'placementGroup'; key: string; labelKey: string; showIf?: ShowIf }
  | { kind: 'socialOwn'; labelKey: string; showIf?: ShowIf }
  | { kind: 'static'; key: string; labelKey: string; valueKey: string; showIf?: ShowIf }
  | { kind: 'upload'; labelKey: string; accept?: 'image' | 'pdf'; showIf?: ShowIf }

export type FieldRow = FieldSpec | { kind: 'row'; cols: FieldSpec[]; showIf?: ShowIf }

// ── Block + deliverable definitions ─────────────────────────────────────────────
export type BlockKey = 'print' | 'pos' | 'outdoor' | 'social' | 'email' | 'other'
export type DesignMode = 'single' | 'multi' | 'none'

export interface BlockDef {
  key: BlockKey
  labelKey: string      // i18n: briefing.blocks[key].label
  subtitleKey: string   // i18n: briefing.blocks[key].subtitle
  icon: string
}

export interface DeliverableDef {
  key: string
  block: BlockKey
  labelKey: string      // i18n: briefing.deliverables[key]
  icon: string
  fields: FieldRow[]
  design: DesignMode
  sidesFrom?: string    // when this field key === 'double', the design tab splits front/back
}

export const BLOCKS: BlockDef[] = [
  { key: 'print',   labelKey: 'print',   subtitleKey: 'print',   icon: '🖨️' },
  { key: 'pos',     labelKey: 'pos',     subtitleKey: 'pos',     icon: '🛒' },
  { key: 'outdoor', labelKey: 'outdoor', subtitleKey: 'outdoor', icon: '🌆' },
  { key: 'social',  labelKey: 'social',  subtitleKey: 'social',  icon: '📱' },
  { key: 'email',   labelKey: 'email',   subtitleKey: 'email',   icon: '✉️' },
  { key: 'other',   labelKey: 'other',   subtitleKey: 'other',   icon: '🧩' },
]

// ── Reusable field fragments ────────────────────────────────────────────────────
const refUpload = (): FieldSpec => ({ kind: 'upload', labelKey: 'referenceImage', accept: 'image' })
const refUploadFrontal = (): FieldSpec => ({ kind: 'upload', labelKey: 'referenceImageFrontal', accept: 'image' })
const specsUpload = (): FieldSpec => ({ kind: 'upload', labelKey: 'specsUpload', accept: 'pdf' })
const extraInfo = (): FieldSpec => ({ kind: 'textarea', key: 'extraInfo', labelKey: 'extraInfo', phKey: 'extraInfoPh' })
const printQty = (): FieldSpec => ({ kind: 'number', key: 'qty', labelKey: 'quantity', phKey: 'printQuantity' })
const indoorOutdoor = (): FieldSpec => ({ kind: 'choice', key: 'indoorOutdoor', labelKey: 'indoorOutdoor', options: 'indoorOutdoor' })
const mounting = (): FieldSpec => ({ kind: 'choice', key: 'mounting', labelKey: 'mounting', options: 'yesNo' })
const mountingMethod = (): FieldSpec => ({ kind: 'select', key: 'mountingMethod', labelKey: 'mountingMethod', options: 'mountingMethods', showIf: { key: 'mounting', in: ['yes'] } })

// Recto/verso choice + the conditional front/back messages it reveals.
const rectoVerso = (): FieldRow[] => [
  { kind: 'choice', key: 'sides', labelKey: 'rectoVerso', options: 'rectoVerso' },
  { kind: 'row', cols: [
    { kind: 'text', key: 'frontMessage', labelKey: 'frontMessage', phKey: 'sideMessage' },
    { kind: 'text', key: 'backMessage', labelKey: 'backMessage', phKey: 'sideMessage' },
  ], showIf: { key: 'sides', in: ['double'] } },
]

const pageSize = (): FieldSpec => ({ kind: 'pageSize', key: 'pageSize', wKey: 'pageW', hKey: 'pageH', labelKey: 'pageSize', options: 'printPaper' })

// ── Deliverables ─────────────────────────────────────────────────────────────────
export const DELIVERABLES: Record<string, DeliverableDef> = {
  // PRINT ────────────────────────────────────────────────────────────────────────
  flyer: {
    key: 'flyer', block: 'print', labelKey: 'flyer', icon: '📄', design: 'single', sidesFrom: 'sides',
    fields: [
      pageSize(),
      ...rectoVerso(),
      refUpload(),
      printQty(),
      specsUpload(),
      extraInfo(),
    ],
  },
  leaflet: {
    key: 'leaflet', block: 'print', labelKey: 'leaflet', icon: '📑', design: 'single', sidesFrom: 'sides',
    fields: [
      pageSize(),
      { kind: 'number', key: 'pages', labelKey: 'numberOfPages', phKey: 'numberOfPages' },
      ...rectoVerso(),
      refUpload(),
      printQty(),
      specsUpload(),
      extraInfo(),
    ],
  },
  banner: {
    key: 'banner', block: 'print', labelKey: 'banner', icon: '🎌', design: 'single', sidesFrom: 'sides',
    fields: [
      { kind: 'bannerSize', wKey: 'banW', hKey: 'banH', labelKey: 'bannerSize' },
      ...rectoVerso(),
      refUpload(),
      printQty(),
      specsUpload(),
      indoorOutdoor(),
      mounting(),
      extraInfo(),
    ],
  },
  poster: {
    key: 'poster', block: 'print', labelKey: 'poster', icon: '🖼️', design: 'single', sidesFrom: 'sides',
    fields: [
      pageSize(),
      ...rectoVerso(),
      refUpload(),
      printQty(),
      specsUpload(),
      indoorOutdoor(),
      mounting(),
      mountingMethod(),
      extraInfo(),
    ],
  },
  voucher: {
    key: 'voucher', block: 'print', labelKey: 'voucher', icon: '🎟️', design: 'single', sidesFrom: 'sides',
    fields: [
      pageSize(),
      ...rectoVerso(),
      refUpload(),
      { kind: 'textarea', key: 'promoConditions', labelKey: 'promoConditions', phKey: 'promoConditions' },
      printQty(),
      specsUpload(),
      indoorOutdoor(),
      mounting(),
      mountingMethod(),
      extraInfo(),
    ],
  },
  sticker: {
    key: 'sticker', block: 'print', labelKey: 'sticker', icon: '🏷️', design: 'single',
    fields: [
      { kind: 'bannerSize', wKey: 'banW', hKey: 'banH', labelKey: 'stickerSize' },
      refUpload(),
      printQty(),
      specsUpload(),
      indoorOutdoor(),
      mounting(),
      { kind: 'text', key: 'surface', labelKey: 'surface', phKey: 'surface' },
      extraInfo(),
    ],
  },

  // POS & RETAIL ───────────────────────────────────────────────────────────────────
  storefront: {
    key: 'storefront', block: 'pos', labelKey: 'storefront', icon: '🪟', design: 'single',
    fields: [
      { kind: 'placementGroup', key: 'placements', labelKey: 'dimensions' },
      refUploadFrontal(),
    ],
  },
  reboard: {
    key: 'reboard', block: 'pos', labelKey: 'reboard', icon: '🧱', design: 'single', sidesFrom: 'sides',
    fields: [
      { kind: 'static', key: 'reboardSize', labelKey: 'reboardSize', valueKey: 'sizeA4' },
      ...rectoVerso(),
      refUpload(),
      { kind: 'number', key: 'qtyPerStore', labelKey: 'quantityPerStore', phKey: 'printQuantity' },
      indoorOutdoor(),
      mounting(),
      mountingMethod(),
      extraInfo(),
    ],
  },
  digiscreen: {
    key: 'digiscreen', block: 'pos', labelKey: 'digiscreen', icon: '📺', design: 'single',
    fields: [
      { kind: 'select', key: 'screenDims', labelKey: 'dimensions', options: 'digiScreenDims' },
      { kind: 'orientationIcons', key: 'orientation', labelKey: 'orientation', options: 'screenShapes' },
      refUpload(),
      { kind: 'textarea', key: 'featuredProducts', labelKey: 'featuredProducts', phKey: 'featuredProducts' },
      { kind: 'row', cols: [
        { kind: 'text', key: 'length', labelKey: 'length', phKey: 'length' },
        { kind: 'choice', key: 'loop', labelKey: 'loop', options: 'yesNo' },
      ] },
      { kind: 'choice', key: 'audio', labelKey: 'audioAllowed', options: 'yesNo' },
      { kind: 'choice', key: 'fileFormat', labelKey: 'fileFormat', options: 'fileFormat' },
    ],
  },

  // OUTDOOR & OUT-OF-HOME ───────────────────────────────────────────────────────────
  billboard: {
    key: 'billboard', block: 'outdoor', labelKey: 'billboard', icon: '🪧', design: 'single',
    fields: [
      { kind: 'text', key: 'placement', labelKey: 'placementLocation', phKey: 'placementLocation' },
      { kind: 'bannerSize', wKey: 'banW', hKey: 'banH', labelKey: 'dimensions' },
      refUpload(),
      specsUpload(),
      { kind: 'textarea', key: 'installNotes', labelKey: 'installationNotes', phKey: 'installationNotes' },
      mounting(),
    ],
  },
  flag: {
    key: 'flag', block: 'outdoor', labelKey: 'flag', icon: '🚩', design: 'none',
    fields: [
      { kind: 'bannerSize', wKey: 'banW', hKey: 'banH', labelKey: 'dimensions' },
      { kind: 'designVariation', key: 'variation', labelKey: 'designVariation', options: 'designVariations' },
      { kind: 'text', key: 'placement', labelKey: 'placementLocation', phKey: 'placementLocation' },
      mounting(),
    ],
  },
  lightbox: {
    key: 'lightbox', block: 'outdoor', labelKey: 'lightbox', icon: '💡', design: 'none',
    fields: [
      { kind: 'choice', key: 'sizeMode', labelKey: 'dimensions', options: 'lightboxSizes' },
      { kind: 'bannerSize', wKey: 'banW', hKey: 'banH', labelKey: 'customSize', showIf: { key: 'sizeMode', in: ['custom'] } },
      { kind: 'designVariation', key: 'variation', labelKey: 'designVariation', options: 'designVariations' },
      { kind: 'text', key: 'placement', labelKey: 'placementLocation', phKey: 'placementLocation' },
      mounting(),
    ],
  },

  // SOCIAL ────────────────────────────────────────────────────────────────────────
  social: {
    key: 'social', block: 'social', labelKey: 'social', icon: '📱', design: 'multi',
    fields: [
      { kind: 'choice', key: 'socialType', labelKey: 'socialType', options: 'paidOwn' },
      { kind: 'text', key: 'budget', labelKey: 'runningBudget', phKey: 'runningBudget', showIf: { key: 'socialType', in: ['paid'] } },
      { kind: 'socialOwn', labelKey: 'ownAssets', showIf: { key: 'socialType', in: ['own'] } },
      { kind: 'period', startKey: 'periodStart', endKey: 'periodEnd', labelKey: 'campaignPeriod' },
    ],
  },

  // EMAIL ─────────────────────────────────────────────────────────────────────────
  email: {
    key: 'email', block: 'email', labelKey: 'email', icon: '✉️', design: 'multi',
    fields: [
      { kind: 'static', key: 'emailDims', labelKey: 'dimensions', valueKey: 'size800x508' },
      { kind: 'period', startKey: 'periodStart', endKey: 'periodEnd', labelKey: 'campaignPeriod' },
    ],
  },

  // OTHER / ANDERE (catch-all escape hatch) ─────────────────────────────────────────
  other: {
    key: 'other', block: 'other', labelKey: 'other', icon: '🧩', design: 'single',
    fields: [
      { kind: 'textarea', key: 'request', labelKey: 'describeNeed', phKey: 'otherNeed' },
      { kind: 'upload', labelKey: 'examples', accept: 'image' },
      { kind: 'textarea', key: 'extraInfo', labelKey: 'extraInfo', phKey: 'otherExtraInfo' },
    ],
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────────
export function deliverablesForBlock(block: BlockKey): DeliverableDef[] {
  return Object.values(DELIVERABLES).filter(d => d.block === block)
}

export function getDeliverable(key: string): DeliverableDef | undefined {
  return DELIVERABLES[key]
}

export function getBlock(key: BlockKey): BlockDef | undefined {
  return BLOCKS.find(b => b.key === key)
}

export function flattenRows(rows: FieldRow[]): FieldSpec[] {
  return rows.flatMap(row => (row.kind === 'row' ? row.cols : [row]))
}

// Whether a deliverable's design tab should split into front/back slots, given
// the current field data (recto/verso = double).
export function designSides(def: DeliverableDef, data: Record<string, BriefingValue>): string[] | null {
  if (def.design !== 'single' || !def.sidesFrom) return null
  return data[def.sidesFrom] === 'double' ? ['front', 'back'] : null
}

// Library handoff: map a legacy assetType `key` (campaign.assets references) onto a
// deliverable in the new model. Best-effort — the dataset is empty today.
export const LEGACY_KEY_MAP: Record<string, string> = {
  'print-flyer': 'flyer',
  'print-poster': 'poster',
  'print-dm': 'flyer',
  'social-meta': 'social',
  'social-google': 'social',
  'banner-outdoor': 'banner',
  'banner-lightbox': 'lightbox',
  'banner-vlag': 'flag',
  'sticker-etalage': 'storefront',
  'pos': 'reboard',
  'email': 'email',
  'video': 'digiscreen',
  'partner-branding': 'storefront',
  'other': 'other',
}

// ── Read-only formatters (shared by the summary) ──────────────────────────────────
export function formatPeriod(start: string, end: string) {
  if (start && end) return `${start} t/m ${end}`
  return start || end
}

export function formatDimensions(entries: DimensionEntry[]) {
  return entries
    .filter(entry => entry.width || entry.height)
    .map(entry => `${entry.width || '?'} × ${entry.height || '?'} cm`)
    .join(', ')
}
