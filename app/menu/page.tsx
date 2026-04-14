export const dynamic = 'force-dynamic'

import { client }             from '@/sanity/lib/client'
import { partnerBlocksQuery } from '@/sanity/lib/queries'
import { Nav }                from '@/components/Nav'
import { MenuPage }           from '@/components/MenuPage'
import type { PartnerBlock }  from '@/components/BrochurePage'

export default async function Menu() {
  const blocks = await client.fetch(partnerBlocksQuery, {}, { cache: 'no-store' }) as unknown as PartnerBlock[]

  return (
    <>
      <Nav activePage="menu" />
      <MenuPage blocks={blocks} />
    </>
  )
}
