/**
 * One-off migration (Phase 4): campaign.assetFilters (strings) → campaign.assets
 * (references to asset types).
 *
 * Maps each legacy filter string to the asset type whose linkedAssetFilters contained
 * it. (linkedAssetFilters was removed from the assetType schema, but the data is still
 * stored on the documents, so this read still works.) Designs are NOT auto-assigned —
 * pair a design with each asset in Studio afterward.
 *
 * Idempotent: skips campaigns that already have assets. Requires the asset types to be
 * seeded (with their linkedAssetFilters) for the mapping to resolve.
 *
 *   DRY_RUN=1 npx sanity exec sanity/seed/migrate-campaign-assets.ts --with-user-token
 *   npx sanity exec sanity/seed/migrate-campaign-assets.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient()
const DRY_RUN = process.env.DRY_RUN === '1'

async function migrate() {
  const assetTypes: { _id: string; linkedAssetFilters?: string[] }[] = await client.fetch(
    `*[_type == "assetType"]{ _id, linkedAssetFilters }`
  )
  const campaigns: { _id: string; assetFilters?: string[]; assets?: unknown[] }[] = await client.fetch(
    `*[_type == "campaign"]{ _id, assetFilters, assets }`
  )
  console.log(`${assetTypes.length} asset type(s), ${campaigns.length} campaign(s)${DRY_RUN ? ' (dry run)' : ''}\n`)

  const filterToTypes = new Map<string, string[]>()
  for (const at of assetTypes) {
    for (const f of at.linkedAssetFilters || []) {
      filterToTypes.set(f, [...(filterToTypes.get(f) || []), at._id])
    }
  }

  let patched = 0
  for (const c of campaigns) {
    if (c.assets && c.assets.length > 0) continue // already migrated

    const typeIds = new Set<string>()
    for (const f of c.assetFilters || []) {
      for (const id of filterToTypes.get(f) || []) typeIds.add(id)
    }
    if (typeIds.size === 0) continue

    const assets = [...typeIds].map((id, i) => ({
      _key: `a${i}`,
      _type: 'campaignAsset',
      assetType: { _type: 'reference', _ref: id },
    }))

    if (DRY_RUN) {
      console.log(`  → ${c._id}: would add ${assets.length} asset(s)`)
    } else {
      await client.patch(c._id).set({ assets }).commit()
      console.log(`  ✓ ${c._id}: added ${assets.length} asset(s)`)
    }
    patched++
  }

  console.log(`\nDone. ${DRY_RUN ? 'Would patch' : 'Patched'} ${patched} campaign(s).`)
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
