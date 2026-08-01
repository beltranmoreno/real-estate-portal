import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { getConciergeServices } from '@/lib/portal/conciergeServices'
import { getDiningForBooking } from '@/lib/portal/presetMenus'
import { getRestaurantOptions } from '@/lib/portal/restaurants'
import { DiningSection } from './DiningSection'
import { ItineraryCalendar, type ItineraryEvent } from '@/components/portal/ItineraryCalendar'
import { ProfileCompletionBanner } from '@/components/portal/ProfileCompletionBanner'
import PropertyMap from '@/components/PropertyMap'
import { MapLinks } from '@/components/MapLinks'
import { getGroceryItems } from '@/lib/portal/groceryItems'
import { urlFor } from '@/sanity/lib/image'
import { DocumentLink } from '@/components/portal/DocumentLink'
import { PortalLocaleSwitcher } from '@/components/portal/PortalLocaleSwitcher'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalFooter } from '@/components/portal/PortalFooter'
import Link from 'next/link'
import { ConciergeSection, type SerializedServiceRequest } from './ConciergeSection'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StayDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireCurrentUser()

  // How many stays this guest has — drives whether we show the "Your
  // stays" link so they can jump to the others.
  const stayCount = await prisma.booking.count({
    where: { primaryGuestUserId: user.id },
  })

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      requests: {
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
      serviceRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
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
    },
  })

  if (!booking) notFound()

  // Renter scope: must own this booking. Admins/agents view bookings
  // through /admin/bookings/[id], not through the portal route.
  if (booking.primaryGuestUserId !== user.id) {
    redirect('/portal')
  }

  const property = await getPropertyForPortal(booking.propertySanityId)
  const conciergeServices = await getConciergeServices()
  const dining = await getDiningForBooking({
    offeredMenuSanityIds: booking.offeredMenuSanityIds,
    offeredPlateSanityIds: booking.offeredPlateSanityIds,
  })
  const restaurantOptions = await getRestaurantOptions()
  const groceryItems = await getGroceryItems()
  const renterLocale: 'en' | 'es' = user.locale === 'es' ? 'es' : 'en'

  // `Decimal` and `Date` cannot pass through to a client component as-is.
  const serializedServiceRequests: SerializedServiceRequest[] = booking.serviceRequests.map(
    (s) => ({
      ...s,
      preferredDate: s.preferredDate ? s.preferredDate.toISOString() : null,
      endDate: s.endDate ? s.endDate.toISOString() : null,
      confirmedAt: s.confirmedAt ? s.confirmedAt.toISOString() : null,
      completedAt: s.completedAt ? s.completedAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      quotedAmount: s.quotedAmount ? s.quotedAmount.toString() : null,
      documents: s.documents.map((d) => ({
        id: d.id,
        filename: d.filename,
        label: d.label,
        kind: d.kind,
        uploadedAt: d.uploadedAt.toISOString(),
      })),
    })
  )

  // Itinerary calendar events — every dated request across all kinds.
  const itineraryEvents: ItineraryEvent[] = serializedServiceRequests
    .filter((s) => s.preferredDate)
    .map((s) => ({
      id: s.id,
      label:
        s.venueName ||
        (s.kind === 'MENU' ? s.menuName || s.serviceName : s.serviceName),
      startISO: s.preferredDate as string,
      endISO: s.endDate,
      time: s.preferredTime,
      // In-villa dining (menus/plates) is a distinct colour from eating out.
      category:
        s.kind === 'MENU' || s.kind === 'PLATE' ? 'dining' : s.serviceCategory,
      status: s.status,
      notes: s.notes,
      place: s.attractionName,
    }))

  // PENDING includes both "never submitted" and "rejected — please re-submit"
  // (we know the difference by whether reviewNote is set). Both demand action.
  const pendingRequests = booking.requests.filter((r) => r.status === 'PENDING')
  const awaitingReviewRequests = booking.requests.filter(
    (r) => r.status === 'PENDING_REVIEW'
  )
  const fulfilledRequests = booking.requests.filter((r) => r.status === 'FULFILLED')
  const docsFromAgent = booking.documents.filter((d) => d.kind === 'AGENT_UPLOAD')
  const docsFromYou = booking.documents.filter((d) => d.kind !== 'AGENT_UPLOAD')

  // Renter-locale date formatter — uses Spanish month/day names when
  // needed. Date pattern is also locale-specific: ES reads "21 may 2026",
  // EN reads "May 21, 2026".
  const dateLocale = renterLocale === 'es' ? es : undefined
  const fmt = (d: Date, pattern: string) =>
    format(d, pattern, { locale: dateLocale })
  // Compact (no year) and full date patterns, by locale.
  const SHORT_DATE = renterLocale === 'es' ? 'd MMM' : 'MMM d'
  const FULL_DATE = renterLocale === 'es' ? 'd MMM yyyy' : 'MMM d, yyyy'
  const FULL_DAY = renterLocale === 'es' ? 'EEEE, d MMM' : 'EEEE, MMM d'
  const FULL_DAY_YEAR = renterLocale === 'es' ? 'EEEE, d MMM yyyy' : 'EEEE, MMM d, yyyy'
  const t = (en: string, es: string) => (renterLocale === 'es' ? es : en)
  const plural = (n: number, en: [string, string], es: [string, string]) => {
    const pair = renterLocale === 'es' ? es : en
    return n === 1 ? pair[0] : pair[1]
  }
  // Pick the locale-matching field, falling back to EN if ES is empty.
  const tField = (en: string, es: string | null) =>
    renterLocale === 'es' && es ? es : en

  return (
    <ClerkProvider>
      {/* Top bar */}
      <PortalHeader>
        {stayCount > 1 && (
          <Link
            href="/portal/stays"
            className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
          >
            {t('Your stays', 'Tus estadías')}
          </Link>
        )}
        <PortalLocaleSwitcher current={renterLocale} />
        <UserButton />
      </PortalHeader>

      <main className="container mx-auto px-6 py-10 max-w-5xl">
        {(!user.firstName || !user.lastName) && (
          <ProfileCompletionBanner
            locale={renterLocale}
            returnTo={`/portal/stays/${booking.id}`}
          />
        )}

        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {property?.mainImage && (
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
              <Image
                src={urlFor(property.mainImage).width(1200).height(900).url()}
                alt={booking.propertyTitle}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
              {t('Your stay', 'Tu estadía')}
            </p>
            <h1 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight leading-tight mb-4">
              {booking.propertyTitle}
            </h1>
            <p className="text-stone-600 font-light text-lg mb-4">
              {fmt(booking.checkIn, FULL_DAY)} – {fmt(booking.checkOut, FULL_DAY_YEAR)}
            </p>

            {/* Primary guest — this is the signed-in user (ownership is
                enforced above). */}
            <div className="text-sm text-stone-600 font-light mb-6">
              {[user.firstName, user.lastName].filter(Boolean).length > 0 && (
                <p className="text-stone-800">
                  {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                </p>
              )}
              <p className="text-stone-500">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6">
              {property?.slug && (
                <a
                  href={`/property/${property.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 text-sm font-light text-stone-700 hover:text-stone-900 underline underline-offset-4"
                >
                  {t('View property page', 'Ver página de la propiedad')} ↗
                </a>
              )}
              {typeof property?.location?.coordinates?.lat === 'number' &&
                typeof property?.location?.coordinates?.lng === 'number' && (
                  <a
                    href="#house-map"
                    className="inline-flex items-center gap-1 text-sm font-light text-stone-700 hover:text-stone-900 underline underline-offset-4"
                  >
                    {t('Get directions', 'Cómo llegar')} ↓
                  </a>
                )}
            </div>

            {booking.keyCode && booking.keyReleasedAt && (
              <div className="bg-stone-100 border border-stone-200 px-4 py-3 rounded-xs">
                <p className="text-xs uppercase tracking-wider text-stone-500 font-light mb-1">
                  {t('Check-in code', 'Código de entrada')}
                </p>
                <p className="text-2xl font-light tracking-widest text-stone-900">
                  {booking.keyCode}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pending requests — most important call-to-action.
            "Action needed" includes both never-submitted requests AND
            rejected-needs-resubmit (PENDING + reviewNote). */}
        <Section
          eyebrow={t('Action needed', 'Acción necesaria')}
          title={
            pendingRequests.length > 0
              ? renterLocale === 'es'
                ? `${pendingRequests.length} ${plural(pendingRequests.length, ['', ''], ['cosa que necesitamos de ti', 'cosas que necesitamos de ti'])}`
                : `${pendingRequests.length} thing${pendingRequests.length === 1 ? '' : 's'} we need from you`
              : t('You’re all set', 'Todo listo')
          }
        >
          {pendingRequests.length === 0 && (
            <p className="text-sm text-stone-600 font-light mb-2">
              {t(
                'Nothing needed from you right now.',
                'No necesitamos nada de ti por ahora.'
              )}
            </p>
          )}

          {pendingRequests.length > 0 && (
            <ul className="border-t border-stone-200">
              {pendingRequests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between py-4 border-b border-stone-200 gap-4"
                >
                  <div>
                    <p className="text-sm font-light text-stone-900">
                      {tField(r.title, r.title_es)}
                      {r.reviewNote && (
                        <span className="text-xs text-amber-700 ml-2 font-light">
                          {t('(please re-submit)', '(por favor re-envía)')}
                        </span>
                      )}
                    </p>
                    {(r.description || r.description_es) && (
                      <p className="text-xs text-stone-500 font-light mt-1">
                        {tField(r.description ?? '', r.description_es)}
                      </p>
                    )}
                    {r.dueAt && (
                      <p className="text-xs text-stone-500 font-light mt-1">
                        {t('Needed by', 'Para el')} {fmt(r.dueAt, FULL_DATE)}
                      </p>
                    )}
                  </div>
                  <a
                    href={`/portal/stays/${booking.id}/requests/${r.id}`}
                    className="text-sm font-light text-stone-900 hover:underline whitespace-nowrap"
                  >
                    {r.expectsDocument
                      ? t('Upload →', 'Subir →')
                      : t('Respond →', 'Responder →')}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* Completed items — shown as done so the guest sees the full
              checklist, not just outstanding work. */}
          {fulfilledRequests.length > 0 && (
            <ul className="border-t border-stone-200">
              {fulfilledRequests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between py-3 border-b border-stone-200 gap-4"
                >
                  <span className="flex items-center gap-2 text-sm font-light text-stone-500">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
                      ✓
                    </span>
                    <span className="line-through decoration-stone-300">
                      {tField(r.title, r.title_es)}
                    </span>
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-700 whitespace-nowrap">
                    {t('Done', 'Listo')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Awaiting review — items the renter has submitted but admin
            hasn't accepted yet. Read-only here; no actions. */}
        {awaitingReviewRequests.length > 0 && (
          <Section
            eyebrow={t('In review', 'En revisión')}
            title={
              renterLocale === 'es'
                ? `${awaitingReviewRequests.length} ${awaitingReviewRequests.length === 1 ? 'elemento esperando revisión' : 'elementos esperando revisión'}`
                : `${awaitingReviewRequests.length} item${awaitingReviewRequests.length === 1 ? '' : 's'} awaiting review`
            }
          >
            <ul className="border-t border-stone-200">
              {awaitingReviewRequests.map((r) => (
                <li
                  key={r.id}
                  className="py-3 border-b border-stone-200 text-sm font-light flex justify-between gap-4"
                >
                  <span className="text-stone-700">{tField(r.title, r.title_es)}</span>
                  <span className="text-xs uppercase tracking-wider text-stone-500 whitespace-nowrap">
                    {t('Submitted', 'Enviado')}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Documents from Leticia */}
        {docsFromAgent.length > 0 && (
          <Section
            eyebrow={t('From Leticia', 'De Leticia')}
            title={t('Shared with you', 'Compartido contigo')}
          >
            <DocList
              docs={docsFromAgent}
              dateLocale={dateLocale}
              datePattern={SHORT_DATE}
            />
          </Section>
        )}

        {/* Your uploads */}
        {docsFromYou.length > 0 && (
          <Section
            eyebrow={t('Your uploads', 'Tus archivos')}
            title={t('Submitted', 'Enviados')}
          >
            <DocList
              docs={docsFromYou}
              dateLocale={dateLocale}
              datePattern={SHORT_DATE}
            />
          </Section>
        )}

        {/* Fulfilled requests (audit trail) */}
        {fulfilledRequests.length > 0 && (
          <Section
            eyebrow={t('History', 'Historial')}
            title={t('Completed requests', 'Solicitudes completadas')}
          >
            <ul className="border-t border-stone-200">
              {fulfilledRequests.map((r) => (
                <li
                  key={r.id}
                  className="py-3 border-b border-stone-200 text-sm font-light text-stone-700 flex justify-between"
                >
                  <span>{tField(r.title, r.title_es)}</span>
                  <span className="text-stone-400 text-xs uppercase tracking-wider">
                    {r.fulfilledAt ? fmt(r.fulfilledAt, SHORT_DATE) : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Itinerary — every dated request (dining, transport, activities…)
            on one calendar spanning the stay. */}
        {itineraryEvents.length > 0 && (
          <Section
            eyebrow={t('Itinerary', 'Itinerario')}
            title={t('Your stay at a glance', 'Tu estadía de un vistazo')}
          >
            <ItineraryCalendar
              events={itineraryEvents}
              locale={renterLocale}
              checkIn={booking.checkIn.toISOString()}
              checkOut={booking.checkOut.toISOString()}
            />
          </Section>
        )}

        {/* Concierge — guest-driven service requests. Dining (MENU/PLATE)
            requests live in their own section below, so exclude them here. */}
        <ConciergeSection
          bookingId={booking.id}
          locale={renterLocale}
          services={conciergeServices.filter((s) =>
            booking.offeredServiceSanityIds.includes(s._id)
          )}
          groceryItems={groceryItems}
          offerGroceries={booking.offerGroceries}
          restaurants={restaurantOptions}
          initialRequests={serializedServiceRequests.filter(
            (r) => r.kind !== 'MENU' && r.kind !== 'PLATE'
          )}
        />

        {/* Dining — chef menus + à-la-carte plates for this booking */}
        {(() => {
          const diningRequests = serializedServiceRequests.filter(
            (r) => r.kind === 'MENU' || r.kind === 'PLATE'
          )
          const show =
            dining.menus.length > 0 ||
            dining.plates.length > 0 ||
            diningRequests.length > 0
          return show ? (
            <Section
              eyebrow={t('Dining', 'Gastronomía')}
              title={t('In-villa dining', 'Gastronomía en la villa')}
            >
              <DiningSection
                bookingId={booking.id}
                menus={dining.menus}
                plates={dining.plates}
                locale={renterLocale}
                requests={diningRequests}
                checkIn={booking.checkIn.toISOString()}
                checkOut={booking.checkOut.toISOString()}
              />
            </Section>
          ) : null
        })()}

        {/* House info — pulled from Sanity */}
        {property && (
          <Section
            eyebrow={t('House info', 'Información de la casa')}
            title={t('Good to know', 'Bueno saber')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-light">
              {property.location?.street && (
                <Pair label={t('Address', 'Dirección')} value={property.location.street} />
              )}
              {property.location?.city && (
                <Pair label={t('City', 'Ciudad')} value={property.location.city} />
              )}
            </div>

            {/* Agent contact */}
            {property.agent &&
              (property.agent.name ||
                property.agent.phone ||
                property.agent.whatsapp ||
                property.agent.email) && (
                <div className="mt-6 flex items-start gap-4 p-4 bg-stone-50 border border-stone-200 rounded-sm">
                  {property.agent.photo && (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
                      <Image
                        src={urlFor(property.agent.photo).width(112).height(112).fit('crop').url()}
                        alt={property.agent.name || 'Agent'}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    {property.agent.name && (
                      <p className="text-sm font-medium text-stone-900 mt-1">
                        {property.agent.name}
                      </p>
                    )}
                    {(renterLocale === 'es'
                      ? property.agent.positionTitle_es
                      : property.agent.positionTitle_en) && (
                      <p className="text-xs text-stone-500 font-light">
                        {renterLocale === 'es'
                          ? property.agent.positionTitle_es
                          : property.agent.positionTitle_en}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                      {property.agent.phone && (
                        <a
                          href={`tel:${property.agent.phone}`}
                          className="text-stone-700 hover:text-stone-900 underline underline-offset-4"
                        >
                          {t('Call', 'Llamar')}
                        </a>
                      )}
                      {property.agent.whatsapp && (
                        <a
                          href={`https://wa.me/${property.agent.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-700 hover:text-stone-900 underline underline-offset-4"
                        >
                          WhatsApp
                        </a>
                      )}
                      {property.agent.email && (
                        <a
                          href={`mailto:${property.agent.email}`}
                          className="text-stone-700 hover:text-stone-900 underline underline-offset-4"
                        >
                          {t('Email', 'Correo')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Map — only when the property has coordinates */}
            {typeof property.location?.coordinates?.lat === 'number' &&
              typeof property.location?.coordinates?.lng === 'number' && (
                <div id="house-map" className="mt-6 scroll-mt-24">
                  <PropertyMap
                    coordinates={{
                      lat: property.location.coordinates.lat,
                      lng: property.location.coordinates.lng,
                    }}
                    propertyTitle={booking.propertyTitle}
                    className="h-[480px] w-full rounded-sm overflow-hidden"
                  />
                  <MapLinks
                    lat={property.location.coordinates.lat}
                    lng={property.location.coordinates.lng}
                    address={property.location?.street}
                    label={booking.propertyTitle}
                    className="mt-3"
                  />
                </div>
              )}
          </Section>
        )}
      </main>

      <PortalFooter locale={renterLocale} />
    </ClerkProvider>
  )
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-12">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-light text-stone-900 tracking-tight mb-6 leading-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

function DocList({
  docs,
  dateLocale,
  datePattern,
}: {
  docs: Array<{
    id: string
    filename: string
    kind: string
    uploadedAt: Date
    label?: string | null
  }>
  dateLocale: typeof es | undefined
  datePattern: string
}) {
  return (
    <ul className="border-t border-stone-200">
      {docs.map((d) => (
        <li
          key={d.id}
          className="py-3 border-b border-stone-200 text-sm font-light flex justify-between gap-4"
        >
          <DocumentLink
            documentId={d.id}
            scope="renter"
            filename={d.filename}
          >
            {d.label || d.filename}
          </DocumentLink>
          <span className="text-stone-500 text-xs uppercase tracking-wider shrink-0">
            {format(d.uploadedAt, datePattern, { locale: dateLocale })}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-stone-500 font-light mb-1">
        {label}
      </p>
      <p className="text-stone-800">{value}</p>
    </div>
  )
}
