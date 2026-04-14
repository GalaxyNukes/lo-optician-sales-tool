export const dynamic = 'force-dynamic'

import { getClient }          from '@/sanity/lib/client'
import { partnerBlocksQuery } from '@/sanity/lib/queries'
import { Nav }                from '@/components/Nav'
import { MenuPage }           from '@/components/MenuPage'
import type { PartnerBlock }  from '@/components/BrochurePage'

export default async function Menu() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return <div style={{ padding: '4rem', color: '#888', fontFamily: 'sans-serif' }}>Configure Sanity environment variables first.</div>
  }
  try {
    const client = getClient(false)
    const blocks = await client.fetch(partnerBlocksQuery, {}, { cache: 'no-store' as const }) as unknown as PartnerBlock[]
    return (
      <>
        <Nav activePage="menu" />
        <MenuPage blocks={blocks ?? []} />
      </>
    )
  } catch {
    return (
      <>
        <Nav activePage="menu" />
        <MenuPage blocks={[]} />
      </>
    )
  }
}
