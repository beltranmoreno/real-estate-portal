import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { CreateRequestButton } from './RequestActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      primaryGuest: true,
      invitation: true,
      guests: { orderBy: { createdAt: 'asc' } },
      requests: {
        orderBy: { createdAt: 'desc' },
        include: { documents: true },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
        include: { request: true, guest: true },
      },
      notifications: {
        orderBy: { sentAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!booking) notFound()

  // Pull live property data from Sanity for context (image, contact info).
  const property = await getPropertyForPortal(booking.propertySanityId)

  const inviteAccepted = booking.invitation?.status === 'ACCEPTED'

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href="/admin/bookings"
        className="text-xs uppercase tracking-[0.25em] text-stone-500 hover:text-stone-700"
      >
        ← All bookings
      </Link>

      {/* Header */}
      <div className="mt-3 mb-10">
        <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-2">
          {booking.propertyTitle}
        </h1>
        <p className="text-stone-600 font-light">
          {format(booking.checkIn, 'MMM d')} – {format(booking.checkOut, 'MMM d, yyyy')}
          {' · '}
          <span className="uppercase tracking-wider text-xs">
            {booking.status}
          </span>
        </p>
      </div>

      {/* Status banner */}
      {!inviteAccepted && booking.invitation && (
        <div className="bg-amber-50 border border-amber-200 px-5 py-4 mb-8 rounded-xs text-sm">
          <p className="font-light text-amber-900">
            Invitation sent on{' '}
            {format(booking.invitation.createdAt, 'MMM d, yyyy')}, awaiting
            acceptance.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-8">
          <Section title="Primary guest">
            <Pair
              label="Name"
              value={
                [booking.primaryGuest.firstName, booking.primaryGuest.lastName]
                  .filter(Boolean)
                  .join(' ') || '—'
              }
            />
            <Pair label="Email" value={booking.primaryGuest.email} />
            {booking.primaryGuest.phone && (
              <Pair label="Phone" value={booking.primaryGuest.phone} />
            )}
            <Pair label="Status" value={booking.primaryGuest.role} />
          </Section>

          <Section title="Stay">
            <Pair label="Check-in" value={format(booking.checkIn, 'EEEE, MMM d, yyyy')} />
            <Pair label="Check-out" value={format(booking.checkOut, 'EEEE, MMM d, yyyy')} />
            {booking.guestCount && (
              <Pair label="Guest count" value={String(booking.guestCount)} />
            )}
            {booking.totalAmount && (
              <Pair
                label="Total"
                value={`$${booking.totalAmount.toString()} ${booking.currency}`}
              />
            )}
            {booking.balanceDue && (
              <Pair
                label="Balance due"
                value={`$${booking.balanceDue.toString()} ${booking.currency}`}
              />
            )}
            {booking.keyCode && (
              <Pair
                label="Key code"
                value={
                  booking.keyReleasedAt
                    ? `${booking.keyCode} (released ${format(booking.keyReleasedAt, 'MMM d')})`
                    : `${booking.keyCode} (not yet released)`
                }
              />
            )}
          </Section>

          <Section title={`Requests (${booking.requests.length})`}>
            <div className="flex items-center justify-end mb-3">
              <CreateRequestButton bookingId={booking.id} />
            </div>
            {booking.requests.length === 0 ? (
              <p className="text-stone-500 font-light text-sm">
                No requests yet. Click &ldquo;+ Request something&rdquo; above to ask the
                guest for documents or info.
              </p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {booking.requests.map((r) => (
                  <li key={r.id} className="py-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-light text-stone-900">{r.title}</p>
                      <p className="text-xs text-stone-500 font-light">
                        {r.kind.replace('_', ' ').toLowerCase()} · {r.documents.length} doc(s)
                        {r.fulfilledAt && ` · fulfilled ${format(r.fulfilledAt, 'MMM d')}`}
                      </p>
                      {r.textResponse && (
                        <p className="text-sm text-stone-700 font-light mt-2 whitespace-pre-wrap">
                          {r.textResponse}
                        </p>
                      )}
                    </div>
                    <span className="text-xs uppercase tracking-wider text-stone-500">
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Documents (${booking.documents.length})`}>
            {booking.documents.length === 0 ? (
              <p className="text-stone-500 font-light text-sm">
                No documents uploaded yet.
              </p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {booking.documents.map((d) => (
                  <li key={d.id} className="py-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-light text-stone-900">
                        {d.label || d.filename}
                      </p>
                      <p className="text-xs text-stone-500 font-light">
                        {d.kind} · {format(d.uploadedAt, 'MMM d, yyyy')}
                        {d.guest && ` · for ${d.guest.firstName}`}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-stone-500">
                      {(d.fileSize / 1024).toFixed(0)} KB
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {booking.internalNotes && (
            <Section title="Internal notes">
              <p className="text-sm font-light text-stone-700 whitespace-pre-wrap">
                {booking.internalNotes}
              </p>
            </Section>
          )}
        </div>

        {/* Right: sidebar */}
        <aside className="space-y-6">
          {property && (
            <Section title="Property">
              <p className="text-sm font-light text-stone-700">
                {property.propertyCode}
              </p>
              {property.contactInfo?.hostName && (
                <Pair label="Host" value={property.contactInfo.hostName} />
              )}
              {property.contactInfo?.phone && (
                <Pair label="Phone" value={property.contactInfo.phone} />
              )}
              {property.contactInfo?.whatsapp && (
                <Pair label="WhatsApp" value={property.contactInfo.whatsapp} />
              )}
            </Section>
          )}

          <Section title="Recent notifications">
            {booking.notifications.length === 0 ? (
              <p className="text-stone-500 font-light text-sm">None.</p>
            ) : (
              <ul className="space-y-2 text-xs font-light">
                {booking.notifications.map((n) => (
                  <li key={n.id} className="flex justify-between">
                    <span className="text-stone-700">{n.kind}</span>
                    <span className="text-stone-500">
                      {format(n.sentAt, 'MMM d')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </aside>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-stone-200 rounded-xs p-6">
      <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light mb-4">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-stone-500 font-light">{label}</span>
      <span className="text-stone-900 font-light text-right">{value}</span>
    </div>
  )
}
