import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/serverClient'
import { getPropertyByCompletionToken } from '@/lib/listingCompletion'

/**
 * POST /api/listings/draft
 * Body: { token: string, draft: object }
 *
 * Saves the owner's in-progress form state as JSON on the property.
 * No data lands in the real amenities/pricing/etc fields until the
 * owner hits "Submit" (see /api/listings/complete).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, draft } = body ?? {}

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }
    if (!draft || typeof draft !== 'object') {
      return NextResponse.json({ error: 'Missing draft' }, { status: 400 })
    }

    const property = await getPropertyByCompletionToken(token)
    if (!property) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Serialize the draft so Sanity can store it in a single text field.
    // We intentionally use a text blob rather than the real schema fields
    // so partial/invalid data can be saved without failing validation.
    const serialized = JSON.stringify(draft)

    // Sanity limits field sizes. ~256KB should be more than enough here,
    // but guard against abuse.
    if (serialized.length > 256 * 1024) {
      return NextResponse.json(
        { error: 'Draft too large' },
        { status: 413 }
      )
    }

    await serverClient
      .patch(property._id)
      .set({
        completionDraft: {
          data: serialized,
          lastSavedAt: new Date().toISOString(),
        },
      })
      .commit()

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[listings/draft] error', err)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}
