import { draftMode } from 'next/headers'
import { allTaxonomyQuery, campaignsQuery, campaignsPreviewQuery } from '@/sanity/lib/queries'
import { CampaignCatalog } from '@/components/CampaignCatalog'

export const dynamic = 'force-dynamic'

function SetupScreen() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '4rem auto', padding: '0 2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0D2340' }}>
        ⚙️ Sanity not configured
      </h1>
      <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Add your Sanity environment variables in Vercel to get started:
      </p>
      <ol style={{ color: '#333', lineHeight: 2.2, paddingLeft: '1.5rem' }}>
        <li>Go to <strong>Vercel → Project → Settings → Environment Variables</strong></li>
        <li>Add <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>NEXT_PUBLIC_SANITY_PROJECT_ID</code> — from sanity.io/manage</li>
        <li>Add <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>NEXT_PUBLIC_SANITY_DATASET</code> = <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>production</code></li>
        <li>Add <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>SANITY_API_READ_TOKEN</code> — Editor token from sanity.io/manage → API</li>
        <li>Add <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>SANITY_REVALIDATE_SECRET</code> — any random string</li>
        <li>Click <strong>Redeploy</strong></li>
      </ol>
    </div>
  )
}

export default async function Page() {
  // Check env vars before attempting any Sanity calls
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return <SetupScreen />
  }

  try {
    const { getClient } = await import('@/sanity/lib/client')
    const { isEnabled: preview } = await draftMode()
    const sanityClient = getClient(preview)

    const [taxonomy, campaigns] = await Promise.all([
      sanityClient.fetch(allTaxonomyQuery),
      sanityClient.fetch(preview ? campaignsPreviewQuery : campaignsQuery),
    ])

    return (
      <CampaignCatalog
        goals={taxonomy?.goals ?? []}
        actions={taxonomy?.actions ?? []}
        needs={taxonomy?.needs ?? []}
        subjects={taxonomy?.subjects ?? []}
        campaigns={campaigns ?? []}
        isDraftMode={preview}
      />
    )
  } catch (err) {
    console.error('Sanity fetch error:', err)
    return <SetupScreen />
  }
}
