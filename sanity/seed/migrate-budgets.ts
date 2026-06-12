/**
 * One-off migration: partnerBlock flat budgets → per-category (A/B/C) values.
 *
 * Copies each block's legacy budgetMin/budgetMax/budgetNote into categoryA, categoryB
 * and categoryC as a starting point, and defaults minCategory to 'C' (so existing
 * blocks stay visible in every Activatiemenu tab until an editor narrows them).
 *
 * Idempotent and non-destructive:
 *   - never overwrites a categoryA/B/C object that already has data
 *   - never overwrites an existing minCategory
 *   - leaves the legacy budgetMin/budgetMax/budgetNote fields in place (remove them
 *     from partnerBlock.ts in a follow-up once the content is reviewed)
 *
 * Run from the project root (uses your Sanity login for write access; reads
 * projectId/dataset from .env.local via sanity.cli.ts):
 *
 *   npx sanity exec sanity/seed/migrate-budgets.ts --with-user-token
 *
 * Dry run first to see what would change without writing:
 *
 *   DRY_RUN=1 npx sanity exec sanity/seed/migrate-budgets.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient()
const DRY_RUN = process.env.DRY_RUN === '1'

interface Block {
  _id: string
  budgetMin?: string
  budgetMax?: string
  budgetNote?: string
  minCategory?: string
  categoryA?: unknown
  categoryB?: unknown
  categoryC?: unknown
}

async function migrate() {
  const blocks: Block[] = await client.fetch(
    `*[_type == "partnerBlock"]{ _id, budgetMin, budgetMax, budgetNote, minCategory, categoryA, categoryB, categoryC }`
  )
  console.log(`Found ${blocks.length} partnerBlock document(s)${DRY_RUN ? ' (dry run)' : ''}\n`)

  let patched = 0
  for (const b of blocks) {
    const patch: Record<string, unknown> = {}

    if (!b.minCategory) patch.minCategory = 'C'

    const catVal: Record<string, string> = {}
    if (b.budgetMin) catVal.budgetMin = b.budgetMin
    if (b.budgetMax) catVal.budgetMax = b.budgetMax
    if (b.budgetNote) catVal.budgetNote = b.budgetNote

    if (Object.keys(catVal).length > 0) {
      if (!b.categoryA) patch.categoryA = { ...catVal }
      if (!b.categoryB) patch.categoryB = { ...catVal }
      if (!b.categoryC) patch.categoryC = { ...catVal }
    }

    if (Object.keys(patch).length === 0) {
      console.log(`  – ${b._id} (already migrated, skipped)`)
      continue
    }

    if (DRY_RUN) {
      console.log(`  → ${b._id} would set: ${Object.keys(patch).join(', ')}`)
    } else {
      await client.patch(b._id).set(patch).commit()
      console.log(`  ✓ ${b._id} set: ${Object.keys(patch).join(', ')}`)
    }
    patched++
  }

  console.log(`\nDone. ${DRY_RUN ? 'Would patch' : 'Patched'} ${patched} of ${blocks.length} document(s).`)
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
