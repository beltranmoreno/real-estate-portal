import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * POST /api/portal/feedback
 *
 * The signed-in guest submits (or updates) private, internal feedback for one
 * of their own bookings. Only allowed once the booking is marked completed.
 * All fields are optional free-text; nothing is ever auto-published.
 *
 * Body: { bookingId, reviewLeticia?, reviewAgents?, noteHouse?,
 *         noteServices?, general?, rating? }
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { bookingId } = body ?? {}
  if (!bookingId || typeof bookingId !== 'string') {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
  }

  // Must be the guest's own booking, and it must be completed.
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, primaryGuestUserId: user.id },
    select: { id: true, completedAt: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (!booking.completedAt) {
    return NextResponse.json({ error: 'Booking is not completed yet' }, { status: 403 })
  }

  // Normalize: trim strings, drop empties to null; clamp rating to 1–5.
  const clean = (v: unknown) => {
    if (typeof v !== 'string') return null
    const t = v.trim()
    return t.length ? t.slice(0, 5000) : null
  }
  const ratingRaw = Number(body.rating)
  const rating =
    Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null

  const data = {
    reviewLeticia: clean(body.reviewLeticia),
    reviewAgents: clean(body.reviewAgents),
    noteHouse: clean(body.noteHouse),
    noteServices: clean(body.noteServices),
    general: clean(body.general),
    rating,
  }

  const feedback = await prisma.bookingFeedback.upsert({
    where: { bookingId: booking.id },
    create: { bookingId: booking.id, ...data },
    update: data,
  })

  return NextResponse.json({ ok: true, id: feedback.id })
}
