import { draftMode } from 'next/headers'
import { getClient } from '@/sanity/lib/client'
import { allTaxonomyQuery, campaignsQuery, campaignsPreviewQuery } from '@/sanity/lib/queries'
import { CampaignCatalog } from '@/components/CampaignCatalog'

export const revalidate = 60 // revalidate every 60s in production

export default async function Page() {
  const { isEnabled: preview } = await draftMode()
  const client = getClient(preview)

  const [taxonomy, campaigns] = await Promise.all([
    client.fetch(allTaxonomyQuery),
    client.fetch(preview ? campaignsPreviewQuery : campaignsQuery),
  ])

  return (
    <CampaignCatalog
      goals={taxonomy.goals}
      actions={taxonomy.actions}
      needs={taxonomy.needs}
      subjects={taxonomy.subjects}
      campaigns={campaigns}
      isDraftMode={preview}
    />
  )
}
