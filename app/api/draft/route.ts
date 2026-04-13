import { draftMode } from 'next/headers'
import { timingSafeEqual } from 'node:crypto'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET
  const encoder = new TextEncoder()

  if (!secret || !expectedSecret) {
    return new Response('Invalid secret', { status: 401 })
  }

  const providedBuffer = encoder.encode(secret)
  const expectedBuffer = encoder.encode(expectedSecret)

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return new Response('Invalid secret', { status: 401 })
  }

  const dm = await draftMode()
  dm.enable()

  // Redirect back to the main page in draft mode
  redirect('/?preview=true')
}
