import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { sendServiceConfirmed } from '@/lib/email/sendServiceConfirmed'

/**
 * POST /api/admin/service-requests/[id]/notify
 *
 * Emails the guest that this service request is confirmed. Triggered by the
 * admin "Notify guest" action (shown once a request is CONFIRMED).
 */
function fmtDay(d: Date, locale: 'en' | 'es'): string {
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
  const { id } = await params

  const sr = await prisma.serviceRequest.findUnique({
    where: { id },
    include: { booking: { include: { primaryGuest: true } } },
  })
  if (!sr) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const booking = sr.booking
  const renter = booking.primaryGuest
  if (!renter?.email) {
    return NextResponse.json(
      { error: 'Guest has no email on file' },
      { status: 400 }
    )
  }

  const locale = (renter.locale ?? 'en') as 'en' | 'es'
  const dateLabel = sr.preferredDate
    ? sr.endDate
      ? `${fmtDay(sr.preferredDate, locale)} – ${fmtDay(sr.endDate, locale)}`
      : fmtDay(sr.preferredDate, locale)
    : null

  try {
    await sendServiceConfirmed({
      booking,
      renter,
      serviceName: sr.venueName
        ? `${sr.serviceName} · ${sr.venueName}`
        : sr.serviceName,
      venueName: sr.venueName,
      dateLabel,
      timeLabel: sr.preferredTime,
      partySize: sr.partySize,
    })
  } catch (err) {
    console.error('[service-requests/notify] send failed', err)
    return NextResponse.json(
      { error: 'Could not send the email. Try again.' },
      { status: 502 }
    )
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'service_request',
      entityId: sr.id,
      action: 'guest_notified',
      payload: { kind: sr.kind, to: renter.email },
    },
  })

  return NextResponse.json({ ok: true })
}
