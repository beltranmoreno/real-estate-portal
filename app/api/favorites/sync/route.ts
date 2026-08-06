import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPropertiesByIds } from '@/lib/sanity/queries'

/**
 * POST /api/favorites/sync
 *
 * Merge a set of locally-held favorites (from localStorage) into the
 * signed-in user's account. Called once right after sign-in / sign-up.
 * Existing account favorites are kept; local-only ids are added. Returns
 * the merged, Sanity-hydrated list so the client can adopt it immediately.
 */
const schema = z.object({
  propertyIds: z.array(z.string().min(1)).max(200),
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let payload
  try {
    payload = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload', details: (err as z.ZodError).issues },
      { status: 400 }
    )
  }

  // De-dupe incoming ids, then upsert (empty update = keep existing).
  const ids = Array.from(new Set(payload.propertyIds))
  if (ids.length > 0) {
    await prisma.$transaction(
      ids.map((propertyId) =>
        prisma.favorite.upsert({
          where: {
            userId_propertySanityId: { userId: user.id, propertySanityId: propertyId },
          },
          create: { userId: user.id, propertySanityId: propertyId },
          update: {},
        })
      )
    )
  }

  const rows = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: { propertySanityId: true },
  })
  const favorites = await getPropertiesByIds(rows.map((r) => r.propertySanityId))

  return NextResponse.json({ authenticated: true, favorites })
}
