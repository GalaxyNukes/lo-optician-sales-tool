import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }

  const dm = await draftMode()
  dm.enable()

  // Redirect back to the main page in draft mode
  redirect('/?preview=true')
}
