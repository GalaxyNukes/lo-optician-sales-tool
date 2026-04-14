export const dynamic = 'force-dynamic'

import { getClient }          from '@/sanity/lib/client'
import { partnerBlocksQuery } from '@/sanity/lib/queries'
import { Nav }                from '@/components/Nav'
import { BrochurePage }       from '@/components/BrochurePage'
import type { PartnerBlock }  from '@/components/BrochurePage'

export default async function Brochure() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return <div style={{ padding: '4rem', color: '#888', fontFamily: 'sans-serif' }}>Configure Sanity environment variables first.</div>
  }
  try {
    const client = getClient(false)
    const blocks = await client.fetch(partnerBlocksQuery, {}, { cache: 'no-store' as const }) as unknown as PartnerBlock[]
    return (
      <>
        <Nav activePage="brochure" />
        <BrochurePage blocks={blocks ?? []} />
      </>
    )
  } catch {
    return (
      <>
        <Nav activePage="brochure" />
        <BrochurePage blocks={[]} />
      </>
    )
  }
}
