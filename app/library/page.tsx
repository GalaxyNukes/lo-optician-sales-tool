import { getClient } from '@/sanity/lib/client'
import { campaignsPreviewQuery, allTaxonomyQuery } from '@/sanity/lib/queries'
import { LibraryPage } from '@/components/LibraryPage'

export const dynamic = 'force-dynamic'

export default async function Library() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return <div style={{ padding: '4rem', color: '#888', fontFamily: 'sans-serif' }}>Configure Sanity environment variables first.</div>
  }
  try {
    const client = getClient(false)
    const [campaigns, taxonomy] = await Promise.all([
      client.fetch(campaignsPreviewQuery, {}, { cache: 'no-store' as const }),
      client.fetch(allTaxonomyQuery, {}, { cache: 'no-store' as const }),
    ])
    return <LibraryPage campaigns={campaigns ?? []} subjects={taxonomy?.subjects ?? []} />
  } catch {
    return <div style={{ padding: '4rem', color: '#888', fontFamily: 'sans-serif' }}>Failed to load library.</div>
  }
}
