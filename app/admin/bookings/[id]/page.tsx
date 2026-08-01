import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { getConciergeServices } from '@/lib/portal/conciergeServices'
import { getRestaurantOptions } from '@/lib/portal/restaurants'
import { getAttractionOptions } from '@/lib/portal/attractions'
import {
  getAllActiveMenusFull,
  getPropertyDiningDefaults,
} from '@/lib/portal/presetMenus'
import { getAllActivePlatesFull } from '@/lib/portal/presetPlates'
import { AdminDiningPanel, type AdminDiningRequest } from './AdminDiningPanel'
import { ItineraryCalendar, type ItineraryEvent } from '@/components/portal/ItineraryCalendar'
import { ServiceOfferingEditor } from './ServiceOfferingEditor'
import { CreateRequestButton } from './RequestActions'
import { AdminUploadButton } from './AdminUploadButton'
import { RequestReviewActions } from './RequestReviewActions'
import { InternalNotesEditor } from './InternalNotesEditor'
import { RequestStatusControl } from './RequestStatusControl'
import { DocumentKindControl } from './DocumentKindControl'
import { ServiceRequestStatusControl } from './ServiceRequestStatusControl'
import { AddServiceRequestButton } from './AddServiceRequestButton'
import { GroceryItemsList } from './GroceryItemsList'
import { ServiceRequestActionsButton } from './ServiceRequestActionsButton'
import { formatTime } from '@/lib/formatTime'
import { DocumentLink } from '@/components/portal/DocumentLink'
import { InvitationActions } from './InvitationActions'
import type { GroceryLineItem } from '@/lib/portal/groceryItems.types'
import type { PlateLineItem } from '@/lib/portal/presetPlates'
import { toLocale, tFor } from '@/lib/i18n'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

interface PageProps {
  params: Promise<{ id: string }>
}

const srStatusLabel = (t: (en: string, es: string) => string): Record<string, string> => ({
  REQUESTED: t('Requested', 'Solicitado'),
  IN_PROGRESS: t('In progress', 'En proceso'),
  CONFIRMED: t('Confirmed', 'Confirmado'),
  COMPLETED: t('Completed', 'Completado'),
  DECLINED: t('Declined', 'Rechazado'),
  CANCELLED: t('Cancelled', 'Cancelado'),
})

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params

  const admin = await getCurrentUser()
  const locale = toLocale(admin?.locale)
  const t = tFor(locale)
  const SR_STATUS_LABEL = srStatusLabel(t)

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
          documents: {
            select: {
              id: true,
              filename: true,
              label: true,
              uploadedAt: true,
              kind: true,
            },
            orderBy: { uploadedAt: 'desc' },
          },
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
  const restaurantOptions = await getRestaurantOptions()
  const attractionOptions = await getAttractionOptions()

  // Status-change history for the service requests (who changed it to what,
  // when) — built from the audit log so we can attribute each step.
  const serviceRequestIds = booking.serviceRequests.map((s) => s.id)
  const serviceAuditLogs = serviceRequestIds.length
    ? await prisma.auditLog.findMany({
        where: {
          entity: 'service_request',
          entityId: { in: serviceRequestIds },
          action: { in: ['updated', 'guest_notified'] },
        },
        orderBy: { createdAt: 'asc' },
        include: { actor: { select: { firstName: true, lastName: true } } },
      })
    : []
  const statusHistory = new Map<
    string,
    { label: string; actor: string; at: string }[]
  >()
  const notifyHistory = new Map<string, { actor: string; at: string }[]>()
  for (const log of serviceAuditLogs) {
    const actor =
      [log.actor?.firstName, log.actor?.lastName].filter(Boolean).join(' ') ||
      'Staff'
    const at = format(log.createdAt, 'MMM d, h:mm a')
    if (log.action === 'guest_notified') {
      const arr = notifyHistory.get(log.entityId) ?? []
      arr.push({ actor, at })
      notifyHistory.set(log.entityId, arr)
      continue
    }
    const status = (log.payload as { changes?: { status?: string } } | null)
      ?.changes?.status
    if (!status) continue
    const arr = statusHistory.get(log.entityId) ?? []
    arr.push({ label: SR_STATUS_LABEL[status] ?? status, actor, at })
    statusHistory.set(log.entityId, arr)
  }

  // Dining offering picker data: full catalog + this property's always-on
  // defaults so the admin sees what's already available before adding more.
  const [allMenus, allPlates, diningDefaults] = await Promise.all([
    getAllActiveMenusFull(),
    getAllActivePlatesFull(),
    getPropertyDiningDefaults(booking.propertySanityId),
  ])

  // Split dining (MENU/PLATE) requests out of the concierge list — they get
  // their own section with dates + a calendar.
  const conciergeServiceRequests = booking.serviceRequests.filter(
    (s) => s.kind !== 'MENU' && s.kind !== 'PLATE'
  )
  // Itinerary calendar events — every dated request across all kinds.
  const itineraryEvents: ItineraryEvent[] = booking.serviceRequests
    .filter((s) => s.preferredDate)
    .map((s) => ({
      id: s.id,
      label:
        s.venueName ||
        (s.kind === 'MENU' ? s.menuName || s.serviceName : s.serviceName),
      startISO: (s.preferredDate as Date).toISOString(),
      endISO: s.endDate ? s.endDate.toISOString() : null,
      time: formatTime(s.preferredTime),
      category:
        s.kind === 'MENU' || s.kind === 'PLATE' ? 'dining' : s.serviceCategory,
      status: s.status,
      notes: s.notes,
      place: s.attractionName,
    }))

  const diningRequests: AdminDiningRequest[] = booking.serviceRequests
    .filter((s) => s.kind === 'MENU' || s.kind === 'PLATE')
    .map((s) => ({
      id: s.id,
      kind: s.kind as 'MENU' | 'PLATE',
      serviceName: s.serviceName,
      menuName: s.menuName,
      plateNames: Array.isArray(s.plateItems)
        ? (s.plateItems as unknown as PlateLineItem[])
            .map((p) => p.name_en || p.name_es || '')
            .filter(Boolean)
        : [],
      preferredDate: s.preferredDate ? s.preferredDate.toISOString() : null,
      partySize: s.partySize,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      requestedBy:
        [s.requestedBy?.firstName, s.requestedBy?.lastName]
          .filter(Boolean)
          .join(' ') || null,
    }))

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
        ← {t('All bookings', 'Todas las reservas')}
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {property?.slug && (
            <a
              href={`/property/${property.slug}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center px-4 py-2 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors whitespace-nowrap"
            >
              {t('View property', 'Ver propiedad')} ↗
            </a>
          )}
          <Link
            href={`/admin/bookings/${booking.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors whitespace-nowrap"
          >
            {t('Edit booking', 'Editar reserva')}
          </Link>
        </div>
      </div>

      {/* Invitation status + actions */}
      {!inviteAccepted && (
        <div className="bg-amber-50 border border-amber-200 px-5 py-4 mb-8 rounded-xs text-sm">
          <p className="font-light text-amber-900">
            {!booking.invitation
              ? t('Draft — no invitation has been created yet.', 'Borrador — aún no se ha creado ninguna invitación.')
              : booking.invitation.sentAt
                ? t(
                    `Invitation sent on ${format(booking.invitation.sentAt, 'MMM d, yyyy')}, awaiting acceptance.`,
                    `Invitación enviada el ${format(booking.invitation.sentAt, 'MMM d, yyyy')}, esperando aceptación.`
                  )
                : t('Invitation prepared but not sent yet.', 'Invitación preparada pero aún no enviada.')}
          </p>
          <InvitationActions
            bookingId={booking.id}
            hasInvitation={Boolean(booking.invitation)}
            invitationSent={Boolean(booking.invitation?.sentAt)}
            locale={locale}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-8">
          <Section title={t('Primary guest', 'Huésped principal')}>
            <Pair
              label={t('Name', 'Nombre')}
              value={
                [booking.primaryGuest.firstName, booking.primaryGuest.lastName]
                  .filter(Boolean)
                  .join(' ') || '—'
              }
            />
            <Pair label={t('Email', 'Correo electrónico')} value={booking.primaryGuest.email} />
            {booking.primaryGuest.phone && (
              <Pair label={t('Phone', 'Teléfono')} value={booking.primaryGuest.phone} />
            )}
            <Pair label={t('Status', 'Estado')} value={booking.primaryGuest.role} />
            {booking.primaryGuest.notes && (
              <div className="pt-3 mt-3 border-t border-stone-100">
                <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-2">
                  {t('Notes about this guest', 'Notas sobre este huésped')}
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
                {t('View full guest profile', 'Ver perfil completo del huésped')} →
              </Link>
            </div>
          </Section>

          {/* Previous stays — only shown when this guest has a history. */}
          {previousBookings.length > 0 && (
            <Section title={t(`Previous stays (${previousBookings.length})`, `Estancias anteriores (${previousBookings.length})`)}>
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
                              ` · ${b._count.documents} ${t(`doc${b._count.documents === 1 ? '' : 's'}`, `doc${b._count.documents === 1 ? '' : 's'}`)}`}
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

          <Section title={t('Stay', 'Estancia')}>
            <Pair label={t('Check-in', 'Entrada')} value={format(booking.checkIn, 'EEEE, MMM d, yyyy')} />
            <Pair label={t('Check-out', 'Salida')} value={format(booking.checkOut, 'EEEE, MMM d, yyyy')} />
            {booking.guestCount && (
              <Pair label={t('Guest count', 'Número de huéspedes')} value={String(booking.guestCount)} />
            )}
            {booking.totalAmount && (
              <Pair
                label={t('Total', 'Total')}
                value={`$${booking.totalAmount.toString()} ${booking.currency}`}
              />
            )}
            {booking.balanceDue && (
              <Pair
                label={t('Balance due', 'Saldo pendiente')}
                value={`$${booking.balanceDue.toString()} ${booking.currency}`}
              />
            )}
            {booking.keyCode && (
              <Pair
                label={t('Key code', 'Código de acceso')}
                value={
                  booking.keyReleasedAt
                    ? `${booking.keyCode} (${t('released', 'liberado')} ${format(booking.keyReleasedAt, 'MMM d')})`
                    : `${booking.keyCode} (${t('not yet released', 'aún no liberado')})`
                }
              />
            )}
          </Section>

          {/* Pending review — surfaced to the top so admin sees what's
              awaiting their action without scrolling. */}
          {booking.requests.some((r) => r.status === 'PENDING_REVIEW') && (
            <Section title={t('Awaiting your review', 'Esperando tu revisión')}>
              <ul className="divide-y divide-stone-200">
                {booking.requests
                  .filter((r) => r.status === 'PENDING_REVIEW')
                  .map((r) => (
                    <li key={r.id} className="py-4">
                      <p className="text-sm font-light text-stone-900">{r.title}</p>
                      <p className="text-xs text-stone-500 font-light">
                        {r.kind.replace('_', ' ').toLowerCase()} · {r.documents.length} {t('doc(s)', 'doc(s)')}
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
                      <RequestReviewActions requestId={r.id} locale={locale} />
                    </li>
                  ))}
              </ul>
            </Section>
          )}

          <Section title={t(`Requests (${booking.requests.length})`, `Solicitudes (${booking.requests.length})`)}>
            <div className="flex items-center justify-end mb-3">
              <CreateRequestButton bookingId={booking.id} locale={locale} />
            </div>
            {booking.requests.length === 0 ? (
              <p className="text-stone-500 font-light text-sm">
                {t(
                  'No requests yet. Click “+ Request something” above to ask the guest for documents or info.',
                  'Aún no hay solicitudes. Haz clic en “+ Solicitar algo” arriba para pedirle al huésped documentos o información.'
                )}
              </p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {booking.requests.map((r) => (
                  <li key={r.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-light text-stone-900">{r.title}</p>
                      <p className="text-xs text-stone-500 font-light">
                        {r.kind.replace('_', ' ').toLowerCase()} · {r.documents.length} {t('doc(s)', 'doc(s)')}
                        {r.fulfilledAt && ` · ${t('fulfilled', 'completado')} ${format(r.fulfilledAt, 'MMM d')}`}
                      </p>
                      {r.reviewNote && r.status === 'PENDING' && (
                        <p className="text-xs text-amber-700 font-light mt-1">
                          {t('Sent back for re-upload — note:', 'Devuelto para volver a subir — nota:')} {r.reviewNote}
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
                        locale={locale}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={t(`Documents (${booking.documents.length})`, `Documentos (${booking.documents.length})`)}>
            <AdminUploadButton bookingId={booking.id} locale={locale} />
            {booking.documents.length === 0 ? (
              <p className="text-stone-500 font-light text-sm mt-4">
                {t('No documents uploaded yet.', 'Aún no se han subido documentos.')}
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
                        {d.guest && ` · ${t('for', 'para')} ${d.guest.firstName}`}
                        {d.expiresAt &&
                          ` · ${t('auto-purges', 'se elimina automáticamente el')} ${format(d.expiresAt, 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <DocumentKindControl
                        documentId={d.id}
                        initialKind={d.kind}
                        locale={locale}
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

          <Section title={t(`Concierge services (${conciergeServiceRequests.length})`, `Servicios de conserjería (${conciergeServiceRequests.length})`)}>
            <ServiceOfferingEditor
              bookingId={booking.id}
              allServices={conciergeServices}
              initialServiceIds={booking.offeredServiceSanityIds}
              initialOfferGroceries={booking.offerGroceries}
              locale={locale}
            />
            <div className="flex items-center justify-end mb-3">
              <AddServiceRequestButton
                bookingId={booking.id}
                services={conciergeServices}
                restaurants={restaurantOptions}
                attractions={attractionOptions}
                locale={locale}
              />
            </div>
            {conciergeServiceRequests.length === 0 ? (
              <p className="text-stone-500 font-light text-sm">
                {t(
                  'No service requests yet. Use “Add service” if a guest asked for something via WhatsApp or in person.',
                  'Aún no hay solicitudes de servicio. Usa “Agregar servicio” si un huésped pidió algo por WhatsApp o en persona.'
                )}
              </p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {conciergeServiceRequests.map((s) => {
                  const groceryItems =
                    s.kind === 'GROCERY' && Array.isArray(s.groceryItems)
                      ? (s.groceryItems as unknown as GroceryLineItem[])
                      : []
                  return (
                    <li key={s.id} className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-light text-stone-900">
                            {s.serviceName}
                            {s.venueName && (
                              <span className="text-stone-500"> · {s.venueName}</span>
                            )}
                            {s.attractionName && (
                              <span className="text-stone-500"> · 📍 {s.attractionName}</span>
                            )}
                            <span className="ml-2 text-[10px] uppercase tracking-wider bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-sm">
                              {s.kind.toLowerCase()}
                            </span>
                            {s.addedManually && (
                              <span className="ml-2 text-[10px] uppercase tracking-wider text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                                {t('Added by staff', 'Agregado por el personal')}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-stone-500 font-light">
                            {[
                              s.kind !== 'GROCERY' && s.serviceCategory,
                              s.preferredDate &&
                                `${t('for', 'para el')} ${format(s.preferredDate, 'MMM d')}`,
                              formatTime(s.preferredTime),
                              s.partySize && `${s.partySize} ${t('guests', 'huéspedes')}`,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                          <p className="text-[11px] text-stone-400 font-light mt-1">
                            {t('Requested by', 'Solicitado por')}{' '}
                            {[s.requestedBy?.firstName, s.requestedBy?.lastName]
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
                          {s.kind === 'GROCERY' && (
                            <GroceryItemsList items={groceryItems} locale={locale} />
                          )}
                          {s.internalNotes && (
                            <p className="text-xs text-amber-700 font-light mt-2 whitespace-pre-wrap leading-relaxed bg-amber-50 border border-amber-200 px-3 py-2 rounded-sm">
                              <span className="uppercase tracking-wider text-[10px] mr-1">
                                {t('Internal:', 'Interno:')}
                              </span>
                              {s.internalNotes}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <ServiceRequestStatusControl
                            serviceRequestId={s.id}
                            initialStatus={s.status}
                            locale={locale}
                          />
                          <ServiceRequestActionsButton
                            bookingId={booking.id}
                            locale={locale}
                            request={{
                              id: s.id,
                              serviceName: s.serviceName,
                              kind: s.kind,
                              status: s.status,
                              venueName: s.venueName,
                              attractionSanityId: s.attractionSanityId,
                              attractionName: s.attractionName,
                              preferredDate: s.preferredDate
                                ? s.preferredDate.toISOString()
                                : null,
                              endDate: s.endDate ? s.endDate.toISOString() : null,
                              preferredTime: s.preferredTime,
                              partySize: s.partySize,
                              notes: s.notes,
                              internalNotes: s.internalNotes,
                              requestedByName:
                                [s.requestedBy?.firstName, s.requestedBy?.lastName]
                                  .filter(Boolean)
                                  .join(' ') || '—',
                              createdAtLabel: format(s.createdAt, 'MMM d, h:mm a'),
                            }}
                            restaurants={restaurantOptions}
                            attractions={attractionOptions}
                            statusHistory={statusHistory.get(s.id) ?? []}
                            notifyHistory={notifyHistory.get(s.id) ?? []}
                            documents={s.documents.map((d) => ({
                              id: d.id,
                              filename: d.filename,
                              label: d.label,
                              kind: d.kind,
                              uploadedAtLabel: format(d.uploadedAt, 'MMM d'),
                            }))}
                          />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>

          {itineraryEvents.length > 0 && (
            <Section title={t('Itinerary', 'Itinerario')}>
              <ItineraryCalendar
                events={itineraryEvents}
                locale={locale}
                checkIn={booking.checkIn.toISOString()}
                checkOut={booking.checkOut.toISOString()}
              />
            </Section>
          )}

          <Section title={t('Dining', 'Gastronomía')}>
            <AdminDiningPanel
              bookingId={booking.id}
              locale={locale}
              allMenus={allMenus}
              allPlates={allPlates}
              offeredMenuIds={booking.offeredMenuSanityIds}
              offeredPlateIds={booking.offeredPlateSanityIds}
              defaultMenuIds={diningDefaults.menuIds}
              defaultPlateIds={diningDefaults.plateIds}
              requests={diningRequests}
              checkIn={booking.checkIn.toISOString()}
              checkOut={booking.checkOut.toISOString()}
            />
          </Section>

          <Section title={t('Internal notes', 'Notas internas')}>
            <InternalNotesEditor
              bookingId={booking.id}
              initialValue={booking.internalNotes ?? ''}
              locale={locale}
            />
          </Section>
        </div>

        {/* Right: sidebar */}
        <aside className="space-y-6">
          {property && (
            <Section title={t('Property', 'Propiedad')}>
              <p className="text-sm font-light text-stone-700">
                {property.propertyCode}
              </p>
              {property.contactInfo?.hostName && (
                <Pair label={t('Host', 'Anfitrión')} value={property.contactInfo.hostName} />
              )}
              {property.contactInfo?.phone && (
                <Pair label={t('Phone', 'Teléfono')} value={property.contactInfo.phone} />
              )}
              {property.contactInfo?.whatsapp && (
                <Pair label={t('WhatsApp', 'WhatsApp')} value={property.contactInfo.whatsapp} />
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
                  {t('Open in Studio', 'Abrir en Studio')} →
                </Link>
              </div>
            </Section>
          )}

          <Section title={t('Recent notifications', 'Notificaciones recientes')}>
            {booking.notifications.length === 0 ? (
              <p className="text-stone-500 font-light text-sm">{t('None.', 'Ninguna.')}</p>
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
