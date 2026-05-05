import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { getConciergeServices } from '@/lib/portal/conciergeServices'
import { CreateRequestButton } from './RequestActions'
import { AdminUploadButton } from './AdminUploadButton'
import { RequestReviewActions } from './RequestReviewActions'
import { InternalNotesEditor } from './InternalNotesEditor'
import { RequestStatusControl } from './RequestStatusControl'
import { DocumentKindControl } from './DocumentKindControl'
import { ServiceRequestStatusControl } from './ServiceRequestStatusControl'
import { AddServiceRequestButton } from './AddServiceRequestButton'
import { DocumentLink } from '@/components/portal/DocumentLink'

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
      serviceRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
          requestedBy: { select: { firstName: true, lastName: true, role: true } },
        },
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
  const conciergeServices = await getConciergeServices()

  const inviteAccepted = booking.invitation?.status === 'ACCEPTED'

  // Previous stays by the same renter — past bookings (any status) on
  // any property. Helps the admin see context: returning guest? what
  // happened last time? Excludes the booking we're currently viewing.
  const previousBookings = await prisma.booking.findMany({
    where: {
      primaryGuestUserId: booking.primaryGuestUserId,
      id: { not: booking.id },
    },
    orderBy: { checkIn: 'desc' },
    take: 10,
    select: {
      id: true,
      propertyTitle: true,
      checkIn: true,
      checkOut: true,
      status: true,
      _count: { select: { documents: true, requests: true } },
    },
  })

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
      <div className="mt-3 mb-10 flex items-start justify-between gap-4">
        <div>
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
        <Link
          href={`/admin/bookings/${booking.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors whitespace-nowrap"
        >
          Edit booking
        </Link>
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
            {booking.primaryGuest.notes && (
              <div className="pt-3 mt-3 border-t border-stone-100">
                <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-2">
                  Notes about this guest
                </p>
                <p className="text-sm text-stone-700 font-light whitespace-pre-wrap leading-relaxed">
                  {booking.primaryGuest.notes}
                </p>
              </div>
            )}
            <div className="pt-3 mt-3 border-t border-stone-100">
              <Link
                href={`/admin/users/${booking.primaryGuest.id}`}
                className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 underline underline-offset-4"
              >
                View full guest profile →
              </Link>
            </div>
          </Section>

          {/* Previous stays — only shown when this guest has a history. */}
          {previousBookings.length > 0 && (
            <Section title={`Previous stays (${previousBookings.length})`}>
              <ul className="divide-y divide-stone-200">
                {previousBookings.map((b) => (
                  <li key={b.id} className="py-3">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="block hover:bg-stone-50 -mx-2 px-2 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-light text-stone-900">
                            {b.propertyTitle}
                          </p>
                          <p className="text-xs text-stone-500 font-light">
                            {format(b.checkIn, 'MMM d')} – {format(b.checkOut, 'MMM d, yyyy')}
                            {b._count.documents > 0 &&
                              ` · ${b._count.documents} doc${b._count.documents === 1 ? '' : 's'}`}
                          </p>
                        </div>
                        <span className="text-xs uppercase tracking-wider text-stone-500 whitespace-nowrap">
                          {b.status}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

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

          {/* Pending review — surfaced to the top so admin sees what's
              awaiting their action without scrolling. */}
          {booking.requests.some((r) => r.status === 'PENDING_REVIEW') && (
            <Section title="Awaiting your review">
              <ul className="divide-y divide-stone-200">
                {booking.requests
                  .filter((r) => r.status === 'PENDING_REVIEW')
                  .map((r) => (
                    <li key={r.id} className="py-4">
                      <p className="text-sm font-light text-stone-900">{r.title}</p>
                      <p className="text-xs text-stone-500 font-light">
                        {r.kind.replace('_', ' ').toLowerCase()} · {r.documents.length} doc(s)
                      </p>
                      {r.textResponse && (
                        <p className="text-sm text-stone-700 font-light mt-2 whitespace-pre-wrap bg-stone-50 border border-stone-200 rounded-xs p-3">
                          {r.textResponse}
                        </p>
                      )}
                      {r.documents.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {r.documents.map((d) => (
                            <li key={d.id} className="text-sm font-light">
                              <DocumentLink
                                documentId={d.id}
                                scope="admin"
                                filename={d.filename}
                              >
                                {d.label || d.filename}
                              </DocumentLink>
                            </li>
                          ))}
                        </ul>
                      )}
                      <RequestReviewActions requestId={r.id} />
                    </li>
                  ))}
              </ul>
            </Section>
          )}

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
                  <li key={r.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-light text-stone-900">{r.title}</p>
                      <p className="text-xs text-stone-500 font-light">
                        {r.kind.replace('_', ' ').toLowerCase()} · {r.documents.length} doc(s)
                        {r.fulfilledAt && ` · fulfilled ${format(r.fulfilledAt, 'MMM d')}`}
                      </p>
                      {r.reviewNote && r.status === 'PENDING' && (
                        <p className="text-xs text-amber-700 font-light mt-1">
                          Sent back for re-upload — note: {r.reviewNote}
                        </p>
                      )}
                      {r.textResponse && r.status !== 'PENDING_REVIEW' && (
                        <p className="text-sm text-stone-700 font-light mt-2 whitespace-pre-wrap">
                          {r.textResponse}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <RequestStatusControl
                        requestId={r.id}
                        initialStatus={r.status}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Documents (${booking.documents.length})`}>
            <AdminUploadButton bookingId={booking.id} />
            {booking.documents.length === 0 ? (
              <p className="text-stone-500 font-light text-sm mt-4">
                No documents uploaded yet.
              </p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {booking.documents.map((d) => (
                  <li key={d.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-light">
                        <DocumentLink
                          documentId={d.id}
                          scope="admin"
                          filename={d.filename}
                        >
                          {d.label || d.filename}
                        </DocumentLink>
                      </p>
                      <p className="text-xs text-stone-500 font-light">
                        {format(d.uploadedAt, 'MMM d, yyyy')}
                        {d.guest && ` · for ${d.guest.firstName}`}
                        {d.expiresAt &&
                          ` · auto-purges ${format(d.expiresAt, 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <DocumentKindControl
                        documentId={d.id}
                        initialKind={d.kind}
                      />
                      <span className="text-xs uppercase tracking-wider text-stone-500">
                        {(d.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Concierge services (${booking.serviceRequests.length})`}>
            <div className="flex items-center justify-end mb-3">
              <AddServiceRequestButton
                bookingId={booking.id}
                services={conciergeServices}
              />
            </div>
            {booking.serviceRequests.length === 0 ? (
              <p className="text-stone-500 font-light text-sm">
                No service requests yet. Use &ldquo;Add service&rdquo; if a guest
                asked for something via WhatsApp or in person.
              </p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {booking.serviceRequests.map((s) => (
                  <li
                    key={s.id}
                    className="py-3 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-light text-stone-900">
                        {s.serviceName}
                        {s.addedManually && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                            Added by staff
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500 font-light">
                        {[
                          s.serviceCategory,
                          s.preferredDate &&
                            `for ${format(s.preferredDate, 'MMM d')}`,
                          s.preferredTime,
                          s.partySize && `${s.partySize} guests`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <p className="text-[11px] text-stone-400 font-light mt-1">
                        Requested by{' '}
                        {[
                          s.requestedBy?.firstName,
                          s.requestedBy?.lastName,
                        ]
                          .filter(Boolean)
                          .join(' ') || '—'}
                        {' · '}
                        {format(s.createdAt, 'MMM d, h:mm a')}
                      </p>
                      {s.notes && (
                        <p className="text-sm text-stone-700 font-light mt-2 whitespace-pre-wrap leading-relaxed">
                          {s.notes}
                        </p>
                      )}
                      {s.internalNotes && (
                        <p className="text-xs text-amber-700 font-light mt-2 whitespace-pre-wrap leading-relaxed bg-amber-50 border border-amber-200 px-3 py-2 rounded-sm">
                          <span className="uppercase tracking-wider text-[10px] mr-1">
                            Internal:
                          </span>
                          {s.internalNotes}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <ServiceRequestStatusControl
                        serviceRequestId={s.id}
                        initialStatus={s.status}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Internal notes">
            <InternalNotesEditor
              bookingId={booking.id}
              initialValue={booking.internalNotes ?? ''}
            />
          </Section>
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
              {/* Sanity Studio deep link — opens the property document in
                  the embedded Studio. URL format mirrors structureTool's
                  default: /studio/structure/<schemaType>;<docId>. Strip
                  drafts. prefix because Studio resolves draft/published
                  itself based on the document id. */}
              <div className="pt-3 mt-3 border-t border-stone-100">
                <Link
                  href={`/studio/structure/property;${property._id.replace(/^drafts\./, '')}`}
                  target="_blank"
                  rel="noopener"
                  className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 underline underline-offset-4"
                >
                  Open in Studio →
                </Link>
              </div>
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
