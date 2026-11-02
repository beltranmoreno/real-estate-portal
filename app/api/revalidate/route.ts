import { NextResponse, type NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { parseBody } from 'next-sanity/webhook'
import { SANITY_TAG } from '@/lib/sanity/cache'

/**
 * Sanity → site cache refresh. Configured at sanity.io/manage:
 *   API → Webhooks → Create webhook
 *     URL:     https://<your-site>/api/revalidate
 *     Dataset: production · Trigger on: create, update, delete
 *     Secret:  same value as SANITY_REVALIDATE_SECRET (Vercel env)
 *
 * Every publish expires all Sanity data (see SANITY_TAG), so the next visit
 * to any page renders with the new content — no rebuild.
 *
 * Security: parseBody checks the request's signature against the secret, so
 * only Sanity can trigger it. It also waits for Sanity's eventual consistency,
 * so the re-render can't fetch the old version.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    console.error('[revalidate] missing SANITY_REVALIDATE_SECRET')
    return new NextResponse('Server misconfigured', { status: 500 })
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string; _id?: string }>(req, secret, true)
    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    // expire: 0 — drop it now, so the next visitor gets fresh content rather
    // than one more stale page while it refreshes in the background.
    revalidateTag(SANITY_TAG, { expire: 0 })
    return NextResponse.json({ revalidated: true, type: body?._type ?? null, id: body?._id ?? null })
  } catch (err) {
    console.error('[revalidate] failed', err)
    return new NextResponse('Error', { status: 500 })
  }
}
