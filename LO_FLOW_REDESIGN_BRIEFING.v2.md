# LO Sales Tool — Flow Redesign Briefing (v2, code‑verified)

> This supersedes `LO_FLOW_REDESIGN_BRIEFING.md`. Every file path, type, and helper
> below was checked against the actual codebase. Changes from v1 are flagged with **[Δ v1]**.
> Decisions from the review round are flagged **[decided]**.

## Overview

Full rethink of the tool **from Step 3 onwards**. Core shift: **briefing is organized
per asset type, not per campaign**, and the account manager **builds** a campaign by
choosing assets and linking a **design** (from a **theme**) to each. Steps 1–2 and the
Library page are untouched.

---

## Decisions locked in this round

1. **Fields are tailored per asset type**, kept lean ("max flexibility without overwhelming"). **[decided]**
2. **Partner branding** and **Other** are kept as asset types → **15 asset types total**, not 13. **[decided]**
3. **Designs become first‑class CMS objects** with their own creation flow; pre‑made campaigns
   no longer drive the main flow (Library keeps them). **[decided]**
4. **Designs are grouped under a Theme**; the user picks a specific design inside a theme.
   **Designs are NOT tagged by asset type** — asset type is already fixed by the briefing block. **[decided]**
5. On design pick, **fill empty fields only** (never overwrite typed values). Source for any
   defaults is the **asset type**, not the design (designs are asset‑agnostic). **[decided]**

---

## Corrections to v1 (verified against code)

| # | v1 said | Reality |
|---|---|---|
| C1 | `fields: Partial<BriefingBlockFields>` | No such type. Real shape: `Record<string, BriefingValue>`, `BriefingValue = string \| string[] \| DimensionEntry[]` |
| C2 | new types/helpers go in `types.ts` | `CampaignBriefing`, `BriefingInstance`, `uid()`, `getPrefillForCampaign()`, `campaignMatchesBlockType()`, `getTypesForCampaign()` all live in **`CampaignCatalog.tsx`** |
| C3 | (i18n not mentioned) | `components/i18n.tsx` is the central copy file and is **trilingual (nl/fr/en)** — every new string needs 3 entries |
| C4 | BottomBar label changes to "X assets" | Label is already `copy.bar.chosenAssets` → "X gekozen assets". Only the **count source** changes |
| C5 | `designs[assetTypes match $blockType]` + fetch raw `image` | Design filtering is dropped (C4 decision). Any image must resolve `"image": image.asset->url` like every other query |
| C6 | reuse `SelectionStep` as‑is for the asset grid | `SelectionStep` renders abstract icon + label only — **no subtitle, no emoji**. The look you screenshotted is the **add‑block grid** (`BriefingSection` `addGrid`). Extend SelectionStep or base the selector on that markup |
| C7 | `DetailOverlay` "retained for library only" | `DetailOverlay` is a **main‑flow** component (used by `CampaignCatalog`); LibraryPage does **not** import it. Verify before touching |
| C8 | "fix logoSvg (pending issue #1)" | `getLogoSvgMarkup()` is a legit HTML‑string helper, not an inline‑SVG violation. Issue #1 was never described — out of scope unless defined |

---

## Data model (corrected)

### 15 asset types (CMS `assetType` docs)
Each carries a stable `key` (slug) that selects its field set on the frontend.
`blockType` is retained only for accent color / grouping (no longer drives fields).

| # | Label (NL) | key | blockType |
|---|---|---|---|
| 1 | Social media advertenties | `social-meta` | `af-social` |
| 2 | Google advertenties | `social-google` | `af-social` |
| 3 | Flyer (A4/A5/A6) | `print-flyer` | `af-print` |
| 4 | Poster (A1–A3) | `print-poster` | `af-print` |
| 5 | Spandoek / banner buiten | `banner-outdoor` | `af-banner` |
| 6 | Etalage stickering | `sticker-etalage` | `af-sticker` |
| 7 | POS materiaal | `pos` | `af-sticker` |
| 8 | E‑mailcampagne | `email` | `af-email` |
| 9 | Landingspagina | `landing` | `af-landing` |
| 10 | Videoadvertentie | `video` | `af-video` |
| 11 | Direct mail | `print-dm` | `af-print` |
| 12 | Lichtbak / reboard | `banner-lightbox` | `af-banner` |
| 13 | Vlag | `banner-vlag` | `af-banner` |
| 14 | **Partner branding** **[Δ v1]** | `partner-branding` | `af-sticker` |
| 15 | **Other / Andere** **[Δ v1]** | `other` | `af-other` |

> Note: `af-sticker` now backs three asset types (Partner branding, Etalage stickering, POS)
> with **different** fields — which is exactly why fields must key off `key`, not `blockType`.

### Theme + Design (replaces campaign‑as‑selection) **[Δ v1]**
```ts
// theme document
{
  name: 'theme', type: 'document',
  fields: [
    orderRankField, // @sanity/orderable-document-list
    { label: 'Titel' },
    { season?: 'Q1..Q4 | Year-round' },
    { subjects: reference[] -> subject },   // for the subject filter chips in the Design tab
    { thumbnail?: image },
    { designs: array of {                   // the picfrom list
        _key, title, image (hotspot)        // NO assetTypes tag — decoupled
    }},
    { active: boolean (default true) }
  ]
}
```
A single Studio flow: create a Theme, add its design images inside. The Design tab lists
themes (narrowed by subject chips), and inside a chosen theme the user picks one design.

---

## Segment 1 — Step 3: Asset Type selector

- Replace the "Needs" step with a **15‑card asset selector**, multi‑select.
- Visual target = the current **add‑block grid** (emoji icon + label + subtitle + count badge),
  *not* the minimalist Step‑3 cards. **[C6]** Either extend `SelectionStep` (add `subtitle` to
  `Item`, emoji icon support, keep the existing `campaignCountPerItem` badge) or build the
  selector from the `addGrid` markup. Keep navy `#0D2340` selected state.
- Red badge per selected card = number of **instances** of that asset added below.
- Step stays open (no collapse), same as today.
- Driven by `assetType` CMS docs (labels/subtitles/icons/order editable without code).

**Files:** `SelectionStep.tsx` (extend), `CampaignCatalog.tsx` (state), `assetType.ts` (new),
`queries.ts` (`assetTypesQuery`), `i18n.tsx` (any non‑CMS strings), `types.ts` (`AssetType`).

---

## Segment 2 — Per‑asset briefing

### State (lives in `CampaignCatalog.tsx`, alongside existing state) **[C2]**
```ts
interface AssetBriefingInstance {
  id: string                              // uid()
  data: Record<string, BriefingValue>     // real field shape [C1]
  selectedThemeId: string | null
  selectedDesignKey: string | null        // _key inside theme.designs[]
  selectedDesignTitle: string | null
  customDesignNote: string
}
interface AssetBriefing {
  assetTypeId: string
  assetKey: string                        // slug → field set
  blockType: string                       // legacy / accent only
  label: string
  accentColor: string                     // cycles ACCENTS per group
  instances: AssetBriefingInstance[]      // min 1
}
// replaces campaignBriefings: assetBriefings: AssetBriefing[]
```

### UI
- One collapsible `<AssetBriefingGroup>` per selected asset type.
- Each **instance** has two tabs: **Velden** and **Design** (CSS‑module tabs, no new libs).
- `+ Nog een [asset label] toevoegen` appends an empty instance (same type only — this is the
  feedback's core ask: no more "add any block"). `×` removes; min 1 remains.
- `SharedBriefingFields` (deadline / liveDate / desc4 / bgInfo / refUrl) stay above all groups, unchanged.

### Fields per asset type (lean; reuse existing field components) **[decided]**
Reuse `DimensionList`, `PeriodFields`, `CheckList`, `UploadZone`, `Sel`, `Inp`. Replace the
7 `blockType` branches in `BlockContent` with a registry keyed by `assetKey`. Lean defaults
(finalize exact fields with the account managers):

| key | fields |
|---|---|
| `social-meta` | platforms (Meta/IG presets), campagneperiode, referenties (upload) |
| `social-google` | advertentietype (Search/Display/PMax), campagneperiode, referenties |
| `print-flyer` | papier, oplage, oriëntatie, designwensen, referenties |
| `print-poster` | formaat (A1–A3), oplage, oriëntatie, designwensen |
| `print-dm` | papier, oplage, verspreidingsgebied/notitie, designwensen |
| `banner-outdoor` | afmeting (B×H), materiaal, designwensen, locatiefoto's |
| `banner-lightbox` | afmeting (B×H), type (lichtbak/reboard), designwensen, locatiefoto's |
| `banner-vlag` | formaat/type, materiaal, designwensen |
| `sticker-etalage` | etalage‑afmetingen, dekking %, etalagefoto's, designwensen |
| `pos` | POS‑type (toonbank/vloer/schap), aantal, afmeting, notitie |
| `email` | campagneperiode |
| `landing` | website‑URL, subpagina |
| `video` | type, duur, oriëntatie, speciale formaten, plaatsing |
| `partner-branding` | etalagefoto's, raamafmetingen, deurafmetingen, notities (today's `af-sticker` set, unchanged) |
| `other` | beschrijf de behoefte, voorbeelden (upload), extra info (today's `af-other` set, unchanged) |

**Files:** `BriefingSection.tsx` → rebuild as `AssetBriefingSection.tsx` + `AssetBriefingGroup.tsx`
+ `assetFields.tsx` (the registry); `CampaignCatalog.tsx`; `types.ts`; `i18n.tsx` (all field labels, 3 langs).

---

## Segment 3 — Design tab (theme → design) **[Δ v1: fully rewritten]**

- Inside each instance, the **Design** tab shows **themes** (narrowed by the subject filter chips),
  each revealing its `designs[]` thumbnails. Pick one (single‑select, checkmark overlay).
- No asset‑type filtering — designs are asset‑agnostic. **[decided]**
- "Clear, not overwhelming": collapse themes by default (or a theme selector first), then its designs.
- Below: **"Vraag een custom design aan"** card → deselects any design, shows a custom‑note input.
- If a theme has no designs, show only the custom option.

### GROQ (no blockType filter) **[C5]**
```groq
*[_type == "theme" && active != false] | order(orderRank asc) {
  _id, title, season,
  "subjects": subjects[]->{ _id, label },
  "designs": designs[]{ _key, title, "image": image.asset->url }
}
```

**Files:** new `ThemeDesignPicker.tsx` (single‑select, inside tab); `theme.ts` (new schema);
`queries.ts` (`themesQuery`); `structure.ts` (add Themes); `i18n.tsx`.
`CampaignGrid.tsx` / `DetailOverlay.tsx` stay for the **Library** page — **do not repurpose**
without checking, `DetailOverlay` is used by the main flow today. **[C7]**

---

## Segment 4 — BottomBar & Summary

- **BottomBar:** label already `chosenAssets` **[C4]**; change count source to **total instances**
  across all groups. Reset clears `assetBriefings` + selected asset types.
- **SummaryModal:** group by asset type → instances; each instance shows its field summary +
  the linked **theme + design** title (or "Custom design" + note). The generated HTML doc mirrors
  this. Keep `getLogoSvgMarkup()` as‑is **[C8]**. All summary strings trilingual.

**Files:** `BottomBar.tsx`, `SummaryModal.tsx`, `i18n.tsx`.

---

## Segment 5 — Sanity CMS

- **New `assetType.ts`** — fields: `label`, `subtitle`, `key` (slug), `blockType`
  (list must include **`af-other`** — v1 omitted it), `icon`, `linkedAssetFilters`,
  `orderRankField`, `active`. Seed the 15 rows above. Register in `index.ts`, add to `structure.ts` (orderable).
- **New `theme.ts`** — as modeled above, with nested `designs[]`. Register + add to `structure.ts` (orderable).
- **`campaign.ts`** — **unchanged** (no `designs[]` field — v1's plan is dropped). Campaigns remain Library‑only.
- **`need.ts`** — keep intact (Library/legacy), no longer surfaced in the tool.
- **`queries.ts`** — add `assetTypesQuery`, `themesQuery`. Keep `active != false`,
  `{ cache: 'no-store' }`, campaign `status == "published" || status == null`.

**Files:** `assetType.ts` (new), `theme.ts` (new), `index.ts`, `structure.ts`, `queries.ts`.

---

## Segment 6 — `types.ts`

Add (do not remove existing types — Library uses them):
```ts
export interface AssetType { _id: string; label: string; subtitle: string; key: string; blockType: string; icon: string; linkedAssetFilters: string[] }
export interface ThemeDesign { _key: string; title: string; image: string }
export interface Theme { _id: string; title: string; season?: string; subjects: { _id: string; label: string }[]; designs: ThemeDesign[] }
```
(`AssetBriefing` / `AssetBriefingInstance` live in `CampaignCatalog.tsx` with the rest of the
state types, mirroring the current architecture.)

---

## Segment 7 — Implementation order (safe sequence)

1. **CMS only** (no frontend impact): `assetType.ts` (+`af-other`, +`key`, seed 15), `theme.ts`
   (+designs[]), register + structure, `assetTypesQuery` / `themesQuery`.
2. **types.ts** — additive.
3. **New components in isolation:** `ThemeDesignPicker`, `AssetBriefingGroup`, `AssetBriefingSection`, `assetFields` registry.
4. **CampaignCatalog state migration** — add `selectedAssetTypes` + `assetBriefings`; keep old
   state until new components verified; then remove `selNeeds` / `campaignBriefings`.
5. **Step 3 → asset selector** (extend SelectionStep per C6).
6. **Remove campaign grid from main flow** (Library keeps `CampaignGrid` + `DetailOverlay` — verify, C7).
7. **BottomBar** — count = total instances.
8. **SummaryModal** — regroup + HTML doc + trilingual strings.
9. **i18n sweep** — every new string in nl/fr/en.
10. **End‑to‑end smoke test** before pushing to `main`.

---

## Invariants — never break

- `<Logo fill="#0D2340" />` / `<Logo fill="#fff" />` in React; `getLogoSvgMarkup()` only for the generated HTML doc.
- All GROQ: `active != false`, `{ cache: 'no-store' }`, campaigns `status == "published" || status == null`.
- Lazy Sanity client — never `createClient()` at module level.
- All state in `CampaignCatalog.tsx`, passed as props.
- Font: Plus Jakarta Sans. Trilingual (nl/fr/en) everywhere.
- Library page: no hero, no "toevoegen aan pakket", overlay `height: 70vh`. Don't restructure files Library depends on.

---

## Minor open items (sensible defaults applied; flag if wrong)

- **Prefill source:** campaign‑sourced prefill is gone (campaigns no longer selected). Default:
  optional per‑**assetType** defaults applied on instance creation, empty‑fields‑only. If you don't
  want any prefill, it simply doesn't fire. `campaign.prefill` stays for Library/legacy.
- **Subject chips:** now filter **themes** in the Design tab (their nearest equivalent role).
- **Exact field lists** per asset type: the table above is a lean default — finalize with the AMs.
