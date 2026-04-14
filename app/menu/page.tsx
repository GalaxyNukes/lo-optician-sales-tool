export const dynamic = 'force-dynamic'

import { client }             from '@/sanity/lib/client'
import { partnerBlocksQuery } from '@/sanity/lib/queries'
import { Nav }                from '@/components/Nav'
import { MenuPage }           from '@/components/MenuPage'
import type { PartnerBlock }  from '@/components/BrochurePage'

export default async function Menu() {
  const blocks: PartnerBlock[] = await client.fetch(partnerBlocksQuery, {}, { cache: 'no-store' })

  return (
    <>
      <Nav activePage="menu" />
      <MenuPage blocks={blocks} />
    </>
  )
}
