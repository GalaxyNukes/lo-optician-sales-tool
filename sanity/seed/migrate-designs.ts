/**
 * One-off migration (Phase 4): theme inline designs → standalone `design` documents.
 *
 * Only needed if you created Themes with inline designs under the OLD nested schema.
 * For each theme, every inline design becomes a `design` document (reusing the same
 * image/video asset), and theme.designs[] is rewritten as references.
 *
 * Idempotent + non-destructive: skips themes whose designs[] are already references;
 * preserves any references already present.
 *
 *   DRY_RUN=1 npx sanity exec sanity/seed/migrate-designs.ts --with-user-token   # preview
 *   npx sanity exec sanity/seed/migrate-designs.ts --with-user-token             # apply
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient()
const DRY_RUN = process.env.DRY_RUN === '1'

interface InlineDesign {
  _key?: string
  _type?: string
  _ref?: string
  title?: string
  image?: unknown
  previewVideo?: unknown
}

async function migrate() {
  const themes: { _id: string; designs?: InlineDesign[] }[] = await client.fetch(
    `*[_type == "theme"]{ _id, designs }`
  )
  console.log(`Found ${themes.length} theme(s)${DRY_RUN ? ' (dry run)' : ''}\n`)

  let migrated = 0
  for (const theme of themes) {
    const designs = theme.designs || []
    const inline = designs.filter(d => d && !d._ref && d._type !== 'reference' && (d.title || d.image))
    const existingRefs = designs.filter(d => d && (d._ref || d._type === 'reference'))
    if (inline.length === 0) continue

    const newRefs: { _type: 'reference'; _ref: string; _key: string }[] = []
    for (const d of inline) {
      if (DRY_RUN) {
        console.log(`  → ${theme._id}: would create design "${d.title || 'Design'}"`)
        continue
      }
      const created = await client.create({
        _type: 'design',
        title: d.title || 'Design',
        image: d.image,
        previewVideo: d.previewVideo,
        active: true,
      })
      newRefs.push({ _type: 'reference', _ref: created._id, _key: d._key || created._id })
    }

    if (!DRY_RUN) {
      await client.patch(theme._id).set({ designs: [...existingRefs, ...newRefs] }).commit()
      console.log(`  ✓ ${theme._id}: migrated ${inline.length} design(s)`)
    }
    migrated++
  }

  console.log(`\nDone. ${DRY_RUN ? 'Would migrate' : 'Migrated'} ${migrated} theme(s).`)
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
