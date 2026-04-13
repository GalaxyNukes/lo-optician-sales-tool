import { groq } from 'next-sanity'

// ── Taxonomy queries ──────────────────────────────────────────
// Use `active != false` instead of `active == true`
// Sanity stores boolean defaults as null until explicitly toggled,
// so `== true` excludes documents where active was never set.

export const goalsQuery = groq`
  *[_type == "goal" && active != false] | order(order asc) {
    _id, label, labelNL, icon
  }
`

export const actionsQuery = groq`
  *[_type == "action" && active != false] | order(order asc) {
    _id, label, icon, isCustom
  }
`

export const needsQuery = groq`
  *[_type == "need" && active != false] | order(order asc) {
    _id, label, icon, briefingBlockType
  }
`

export const subjectsQuery = groq`
  *[_type == "subject" && active != false] | order(order asc) {
    _id, label
  }
`

export const visualStylesQuery = groq`
  *[_type == "visualStyle" && active != false] | order(order asc) {
    _id, label
  }
`

// ── Campaign queries ──────────────────────────────────────────

// Published campaigns only (shown to opticians)
// Use `status == "published"` OR status not set yet (null)
export const campaignsQuery = groq`
  *[_type == "campaign" && (status == "published" || status == null)] | order(_createdAt desc) {
    _id,
    title,
    type,
    description,
    formats,
    status,
    season,
    "thumbnail": thumbnail.asset->url,
    "mockups": mockups[].asset->url,
    "goals": goals[]->{ _id, label },
    "visualStyle": visualStyle->{ _id, label },
    "subjects": subjects[]->{ _id, label },
    assetFilters,
    prefill
  }
`

// All campaigns including drafts — used in preview mode
export const campaignsPreviewQuery = groq`
  *[_type == "campaign"] | order(_createdAt desc) {
    _id,
    title,
    type,
    description,
    formats,
    status,
    season,
    "thumbnail": thumbnail.asset->url,
    "mockups": mockups[].asset->url,
    "goals": goals[]->{ _id, label },
    "visualStyle": visualStyle->{ _id, label },
    "subjects": subjects[]->{ _id, label },
    assetFilters,
    prefill
  }
`

// Single campaign by ID
export const campaignByIdQuery = groq`
  *[_type == "campaign" && _id == $id][0] {
    _id,
    title,
    type,
    description,
    formats,
    status,
    season,
    "thumbnail": thumbnail.asset->url,
    "mockups": mockups[].asset->url,
    "goals": goals[]->{ _id, label },
    "visualStyle": visualStyle->{ _id, label },
    "subjects": subjects[]->{ _id, label },
    assetFilters,
    prefill
  }
`

// All taxonomy in one query — efficient single fetch on page load
export const allTaxonomyQuery = groq`{
  "goals":   *[_type == "goal"        && active != false] | order(order asc) { _id, label, labelNL, icon },
  "actions": *[_type == "action"      && active != false] | order(order asc) { _id, label, icon, isCustom },
  "needs":   *[_type == "need"        && active != false] | order(order asc) { _id, label, icon, briefingBlockType },
  "subjects":*[_type == "subject"     && active != false] | order(order asc) { _id, label },
  "styles":  *[_type == "visualStyle" && active != false] | order(order asc) { _id, label }
}`
