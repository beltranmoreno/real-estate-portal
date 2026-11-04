import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { renderConciergePdf } from '@/lib/admin/conciergePdf'
import { toLocale } from '@/lib/i18n'

export const runtime = 'nodejs'

/**
 * GET /api/admin/bookings/[id]/concierge-pdf[?lang=en|es]
 *
 * Downloads the booking's concierge plan as a PDF — every live service
 * request by day, with the guest's details. Defaults to the guest's
 * language so it can be sent straight to them.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireStaffOrAbove({ throwOnFail: true })
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      primaryGuest: { select: { firstName: true, lastName: true, email: true, locale: true } },
      serviceRequests: true,
    },
  })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const lang = new URL(req.url).searchParams.get('lang')
  const locale = toLocale(lang ?? booking.primaryGuest.locale)
  const g = booking.primaryGuest
  const guestName = [g.firstName, g.lastName].filter(Boolean).join(' ') || g.email || ''

  const pdf = await renderConciergePdf({
    propertyTitle: booking.propertyTitle,
    guestName,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    requests: booking.serviceRequests,
    locale,
  })

  const slug = `${booking.propertyTitle}-${guestName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="concierge-${slug || booking.id}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
