import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPropertiesByIds } from '@/lib/sanity/queries'

/**
 * Account-backed favorites (saved properties).
 *
 * GET    → { authenticated, favorites } — favorites hydrated from Sanity.
 *          Always 200 so the client can branch on `authenticated` rather
 *          than handling a 401 (anonymous visitors use localStorage).
 * POST   → add one favorite  { propertyId }
 * DELETE → remove one (?propertyId=) or clear all (no query param)
 */

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ authenticated: false, favorites: [] })
  }

  const rows = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: { propertySanityId: true },
  })

  const favorites = await getPropertiesByIds(rows.map((r) => r.propertySanityId))
  return NextResponse.json({ authenticated: true, favorites })
}

const postSchema = z.object({ propertyId: z.string().min(1) })

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let payload
  try {
    payload = postSchema.parse(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload', details: (err as z.ZodError).issues },
      { status: 400 }
    )
  }

  await prisma.favorite.upsert({
    where: {
      userId_propertySanityId: {
        userId: user.id,
        propertySanityId: payload.propertyId,
      },
    },
    create: { userId: user.id, propertySanityId: payload.propertyId },
    update: {},
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const propertyId = new URL(req.url).searchParams.get('propertyId')

  if (propertyId) {
    await prisma.favorite.deleteMany({
      where: { userId: user.id, propertySanityId: propertyId },
    })
  } else {
    // No id → clear the whole list.
    await prisma.favorite.deleteMany({ where: { userId: user.id } })
  }

  return NextResponse.json({ ok: true })
}
