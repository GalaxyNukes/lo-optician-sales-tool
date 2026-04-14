export const dynamic = 'force-dynamic'

import { client }             from '@/sanity/lib/client'
import { partnerBlocksQuery } from '@/sanity/lib/queries'
import { Nav }                from '@/components/Nav'
import { BrochurePage }       from '@/components/BrochurePage'
import type { PartnerBlock }  from '@/components/BrochurePage'

export default async function Brochure() {
  const blocks = await client.fetch(partnerBlocksQuery, {}, { cache: 'no-store' }) as unknown as PartnerBlock[]

  return (
    <>
      <Nav activePage="brochure" />
      <BrochurePage blocks={blocks} />
    </>
  )
}
