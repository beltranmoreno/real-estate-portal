import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { resolveStayAccess } from '@/lib/portal/stayAccess'
import { StayCosts, type StayCostLine } from '@/components/portal/StayCosts'
import { getPortalPlaylists, SPOTIFY_PROFILE_URL } from '@/lib/portal/playlists'
import { PlaylistGrid } from '@/components/portal/PlaylistGrid'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { getConciergeServices } from '@/lib/portal/conciergeServices'
import { getDiningForBooking } from '@/lib/portal/presetMenus'
import { getRestaurantOptions } from '@/lib/portal/restaurants'
import { DiningSection } from './DiningSection'
import { ItineraryCalendar, type ItineraryEvent } from '@/components/portal/ItineraryCalendar'
import { ProfileCompletionBanner } from '@/components/portal/ProfileCompletionBanner'
import { formatTime } from '@/lib/formatTime'
import PropertyMap from '@/components/PropertyMap'
import { MapLinks } from '@/components/MapLinks'
import { ScrollToLink } from '@/components/portal/ScrollToLink'
import { getGroceryItems } from '@/lib/portal/groceryItems'
import { urlFor } from '@/sanity/lib/image'
import { DocumentLink } from '@/components/portal/DocumentLink'
import { PortalLocaleSwitcher } from '@/components/portal/PortalLocaleSwitcher'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalFooter } from '@/components/portal/PortalFooter'
import Link from 'next/link'
import { ConciergeSection, type SerializedServiceRequest } from './ConciergeSection'
import { WhatsOn, type WhatsOnDay, type WhatsOnItem } from '@/components/portal/WhatsOn'
import { StaySectionNav, type StaySectionLink } from '@/components/portal/StaySectionNav'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StayDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireCurrentUser()

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      primaryGuest: { select: { firstName: true, lastName: true, email: true } },
      feedback: true,
      charges: {
        orderBy: [{ incurredOn: 'asc' }, { createdAt: 'asc' }],
        include: { document: { select: { id: true, filename: true } } },
      },
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

  // Who's looking: the booking's guest (full access), an extra guest with
  // portal access (read-only, no prices, no paperwork), or an admin/agent
  // previewing (read-only, sees everything). The portal APIs only accept
  // writes from the primary guest, so read-only is enforced server-side too.
  const access = await resolveStayAccess(booking, user)
  if (!access) redirect('/portal')
  const isPreview = access === 'staff'
  const isAdditional = access === 'additional'
  const readOnly = access !== 'primary'
  // To-dos, documents, costs and feedback belong to the booking's guest.
  const showPrivate = !isAdditional
  // Whose stay this is — the guest, even when an admin is previewing.
  const guest = booking.primaryGuest

  const property = await getPropertyForPortal(booking.propertySanityId)
  const conciergeServices = await getConciergeServices()
  const dining = await getDiningForBooking({
    offeredMenuSanityIds: booking.offeredMenuSanityIds,
    offeredPlateSanityIds: booking.offeredPlateSanityIds,
  })
  const restaurantOptions = await getRestaurantOptions()
  const groceryItems = await getGroceryItems()
  const playlists = await getPortalPlaylists()
  // Portal-only house details live on the Sanity property doc.
  const guestInfo = property?.guestInfo ?? null
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
      // Extra guests never see prices.
      quotedAmount: s.quotedAmount && !isAdditional ? s.quotedAmount.toString() : null,
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
      time: formatTime(s.preferredTime),
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

  // ── What's on: today + tomorrow, in villa-local (Dominican) time ─────────
  // Dates are compared as UTC calendar days ("YYYY-MM-DD"), the same way the
  // itinerary calendar reads them.
  const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10)
  const addDays = (key: string, n: number) => {
    const d = new Date(`${key}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + n)
    return dayKey(d)
  }
  const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santo_Domingo' }).format(new Date())
  const tomorrowKey = addDays(todayKey, 1)
  const checkInKey = dayKey(booking.checkIn)
  const checkOutKey = dayKey(booking.checkOut)
  // Show from the day before arrival through check-out day.
  const showWhatsOn = tomorrowKey >= checkInKey && todayKey <= checkOutKey

  const itemsFor = (key: string): WhatsOnItem[] => {
    const markers: WhatsOnItem[] = []
    if (key === checkInKey)
      markers.push({ id: 'check-in', label: t('Check-in', 'Entrada'), time: formatTime(guestInfo?.checkInTime), marker: true })
    if (key === checkOutKey)
      markers.push({ id: 'check-out', label: t('Check-out', 'Salida'), time: formatTime(guestInfo?.checkOutTime), marker: true })

    const planned = serializedServiceRequests
      .filter((s) => {
        if (!s.preferredDate || s.status === 'CANCELLED' || s.status === 'DECLINED') return false
        const start = dayKey(s.preferredDate)
        const end = s.endDate ? dayKey(s.endDate) : start
        return start <= key && key <= end
      })
      .sort((a, b) => (a.preferredTime || '99').localeCompare(b.preferredTime || '99'))
      .map((s) => ({
        id: s.id,
        label:
          s.venueName ||
          (s.kind === 'MENU' ? s.menuName || s.serviceName : s.serviceName) ||
          t('Request', 'Solicitud'),
        time: formatTime(s.preferredTime),
        place: s.attractionName,
        status: s.status,
      }))

    return [...markers, ...planned]
  }

  const whatsOnDays: WhatsOnDay[] = [
    { key: todayKey, label: t('Today', 'Hoy') },
    { key: tomorrowKey, label: t('Tomorrow', 'Mañana') },
  ].map((d) => ({
    ...d,
    dateLabel: fmt(new Date(`${d.key}T12:00:00Z`), FULL_DAY),
    items: itemsFor(d.key),
  }))

  const diningRequests = serializedServiceRequests.filter(
    (r) => r.kind === 'MENU' || r.kind === 'PLATE'
  )
  const showDining =
    dining.menus.length > 0 || dining.plates.length > 0 || diningRequests.length > 0
  const hasDocuments = showPrivate && (docsFromAgent.length > 0 || docsFromYou.length > 0)

  // Running costs: extras Leticia logged (with receipts) + confirmed or
  // completed concierge quotes. Primary guest and staff only.
  const costLines: StayCostLine[] = showPrivate
    ? [
        ...booking.charges.map((c) => ({
          id: c.id,
          date: c.incurredOn ? c.incurredOn.toISOString() : null,
          label: c.description,
          category: c.category as StayCostLine['category'],
          amount: Number(c.amount),
          currency: c.currency,
          receipt: c.document ? { id: c.document.id, filename: c.document.filename } : null,
        })),
        ...booking.serviceRequests
          .filter((r) => r.quotedAmount && (r.status === 'CONFIRMED' || r.status === 'COMPLETED'))
          .map((r) => ({
            id: r.id,
            date: r.preferredDate ? r.preferredDate.toISOString() : null,
            label: r.venueName || (r.kind === 'MENU' ? r.menuName || r.serviceName : r.serviceName) || t('Service', 'Servicio'),
            category: 'SERVICE' as const,
            amount: Number(r.quotedAmount),
            currency: r.currency || 'USD',
            receipt: null,
          })),
      ]
    : []

  const sectionLinks: StaySectionLink[] = [
    showWhatsOn && { id: 'whats-on', label: t('What’s on', 'Qué hay') },
    showPrivate && { id: 'to-do', label: t('To do', 'Pendientes'), count: pendingRequests.length },
    itineraryEvents.length > 0 && { id: 'itinerary', label: t('Itinerary', 'Itinerario') },
    { id: 'concierge', label: t('Concierge', 'Conserjería') },
    showDining && { id: 'dining', label: t('Dining', 'Gastronomía') },
    playlists.length > 0 && { id: 'music', label: t('Music', 'Música') },
    costLines.length > 0 && { id: 'costs', label: t('Extras', 'Extras') },
    hasDocuments && { id: 'documents', label: t('Documents', 'Documentos') },
    property && { id: 'house', label: t('The house', 'La casa') },
  ].filter(Boolean) as StaySectionLink[]

  return (
    <ClerkProvider>
      {/* Top bar */}
      <PortalHeader>
        <PortalLocaleSwitcher current={renterLocale} />
        <UserButton />
      </PortalHeader>

      <main className="container mx-auto px-6 py-10 max-w-5xl">
        <Link
          href="/portal/stays"
          className="inline-block mb-6 text-xs uppercase tracking-[0.2em] text-muted-2 hover:text-ink transition-colors"
        >
          ← {t('Your stays', 'Tus estadías')}
        </Link>

        {isPreview && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-status-pending-border border-l-2 border-l-status-pending bg-status-pending-bg px-5 py-4">
            <div>
              <p className="eyebrow !text-status-pending">{t('Admin preview', 'Vista de administrador')}</p>
              <p className="mt-1 text-[15px] font-light text-body-strong">
                {t(
                  'You’re seeing this stay as the guest does. Read-only: forms and uploads are disabled.',
                  'Estás viendo esta estadía como la ve el huésped. Solo lectura: formularios y archivos desactivados.'
                )}
              </p>
            </div>
            <Link
              href={`/admin/bookings/${booking.id}`}
              className="shrink-0 text-xs uppercase tracking-[0.14em] text-ink border-b border-line pb-1 hover:border-ink transition-colors"
            >
              {t('Back to booking', 'Volver a la reserva')} →
            </Link>
          </div>
        )}

        {isAdditional && (
          <div className="mb-8 border border-line border-l-2 border-l-brand bg-surface px-5 py-4">
            <p className="eyebrow !text-brand">{t('You’re a guest on this stay', 'Eres huésped de esta estadía')}</p>
            <p className="mt-1 text-[15px] font-light text-body-strong">
              {t(
                `Booked by ${[guest.firstName, guest.lastName].filter(Boolean).join(' ') || guest.email}. You can see the plans and house details; requests go through them or Leticia.`,
                `Reservada por ${[guest.firstName, guest.lastName].filter(Boolean).join(' ') || guest.email}. Puedes ver los planes y la información de la casa; las solicitudes pasan por esa persona o por Leticia.`
              )}
            </p>
          </div>
        )}

        {access === 'primary' && (!user.firstName || !user.lastName) && (
          <ProfileCompletionBanner
            locale={renterLocale}
            returnTo={`/portal/stays/${booking.id}`}
          />
        )}

        {/* Stay complete → invite feedback */}
        {booking.completedAt && showPrivate && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-brand-border border-l-2 border-l-brand bg-brand-wash px-5 py-4">
            <div>
              <p className="eyebrow !text-brand">{t('Your stay is complete', 'Tu estadía terminó')}</p>
              <p className="mt-1 text-[15px] font-light text-body-strong">
                {booking.feedback
                  ? t('Thank you for your feedback — you can update it anytime.', 'Gracias por tus comentarios — puedes actualizarlos cuando quieras.')
                  : t('We would love to hear how it went.', 'Nos encantaría saber cómo te fue.')}
              </p>
            </div>
            {!isPreview && (
            <Link
              href={`/portal/stays/${booking.id}/feedback`}
              className="shrink-0 inline-flex items-center gap-2 bg-ink text-surface uppercase tracking-[0.14em] text-xs font-medium rounded-[2px] px-6 h-10 hover:bg-brand transition-colors"
            >
              {booking.feedback
                ? t('Edit feedback', 'Editar comentarios')
                : t('Share feedback', 'Compartir comentarios')}
            </Link>
            )}
          </div>
        )}

        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {property?.mainImage && (
            <div className="relative aspect-[4/3] overflow-hidden bg-sand">
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
            {property?.location?.street ? (
              <p className="text-muted font-light mb-3">
                {property.location.street.split('\n')[0].trim()}
              </p>
            ) : (<p className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-3">
              {t('Your stay', 'Tu estadía')}
            </p>)}

            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-1">
              {booking.propertyTitle}
            </h1>
            <p className="text-muted font-light text-lg mb-4">
              {fmt(booking.checkIn, FULL_DAY)} – {fmt(booking.checkOut, FULL_DAY_YEAR)}
            </p>

            {/* Primary guest — this is the signed-in user (ownership is
                enforced above). */}
            <div className="text-sm text-muted font-light mb-6">
              {[guest.firstName, guest.lastName].filter(Boolean).length > 0 && (
                <p className="text-ink">
                  {[guest.firstName, guest.lastName].filter(Boolean).join(' ')}
                </p>
              )}
              <p className="text-muted-2">{guest.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6">
              {property?.slug && (
                <a
                  href={`/property/${property.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 text-sm font-light text-body-strong hover:text-ink underline underline-offset-4"
                >
                  {t('View property page', 'Ver página de la propiedad')} ↗
                </a>
              )}
              {typeof property?.location?.coordinates?.lat === 'number' &&
                typeof property?.location?.coordinates?.lng === 'number' && (
                  <ScrollToLink
                    targetId="house-map"
                    className="inline-flex items-center gap-1 text-sm font-light text-body-strong hover:text-ink underline underline-offset-4"
                  >
                    {t('Get directions', 'Cómo llegar')} ↓
                  </ScrollToLink>
                )}
            </div>

            {booking.keyCode && booking.keyReleasedAt && (
              <div className="bg-sand border border-line px-4 py-3 rounded-xs">
                <p className="text-xs uppercase tracking-wider text-muted-2 font-light mb-1">
                  {t('Check-in code', 'Código de entrada')}
                </p>
                <p className="text-2xl font-light tracking-widest text-ink">
                  {booking.keyCode}
                </p>
              </div>
            )}
          </div>
        </section>

        <StaySectionNav links={sectionLinks} />

        {/* What's on — today and tomorrow, while the stay is close or underway */}
        {showWhatsOn && (
          <Section
            id="whats-on"
            eyebrow={t('What’s on', 'Qué hay')}
            title={t('Today and tomorrow', 'Hoy y mañana')}
          >
            <WhatsOn days={whatsOnDays} locale={renterLocale} />
          </Section>
        )}

        {showPrivate && (
        <>
        {/* Pending requests — most important call-to-action.
            "Action needed" includes both never-submitted requests AND
            rejected-needs-resubmit (PENDING + reviewNote). */}
        <Section
          id="to-do"
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
            <p className="text-sm text-muted font-light mb-2">
              {t(
                'Nothing needed from you right now.',
                'No necesitamos nada de ti por ahora.'
              )}
            </p>
          )}

          {pendingRequests.length > 0 && (
            <ul className="border-t border-line">
              {pendingRequests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between py-4 border-b border-line gap-4"
                >
                  <div>
                    <p className="text-sm font-light text-ink">
                      {tField(r.title, r.title_es)}
                      {r.reviewNote && (
                        <span className="text-xs text-status-pending ml-2 font-light">
                          {t('(please re-submit)', '(por favor re-envía)')}
                        </span>
                      )}
                    </p>
                    {(r.description || r.description_es) && (
                      <p className="text-xs text-muted-2 font-light mt-1">
                        {tField(r.description ?? '', r.description_es)}
                      </p>
                    )}
                    {r.dueAt && (
                      <p className="text-xs text-muted-2 font-light mt-1">
                        {t('Needed by', 'Para el')} {fmt(r.dueAt, FULL_DATE)}
                      </p>
                    )}
                  </div>
                  {readOnly ? (
                    <span className="text-sm font-light text-muted-2 whitespace-nowrap">
                      {r.expectsDocument ? t('Upload', 'Subir') : t('Respond', 'Responder')}
                    </span>
                  ) : (
                    <a
                      href={`/portal/stays/${booking.id}/requests/${r.id}`}
                      className="text-sm font-light text-ink hover:underline whitespace-nowrap"
                    >
                      {r.expectsDocument
                        ? t('Upload →', 'Subir →')
                        : t('Respond →', 'Responder →')}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Submitted, awaiting Leticia's review — read-only. */}
          {awaitingReviewRequests.length > 0 && (
            <ul className="border-t border-line">
              {awaitingReviewRequests.map((r) => (
                <li
                  key={r.id}
                  className="py-3 border-b border-line text-sm font-light flex justify-between gap-4"
                >
                  <span className="text-body-strong">{tField(r.title, r.title_es)}</span>
                  <span className="text-[11px] uppercase tracking-wider text-status-pending whitespace-nowrap">
                    {t('In review', 'En revisión')}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Completed items — shown as done so the guest sees the full
              checklist, not just outstanding work. */}
          {fulfilledRequests.length > 0 && (
            <ul className="border-t border-line">
              {fulfilledRequests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between py-3 border-b border-line gap-4"
                >
                  <span className="flex items-center gap-2 text-sm font-light text-muted-2">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-status-confirmed-bg text-status-confirmed text-[10px]">
                      ✓
                    </span>
                    <span className="line-through decoration-line">
                      {tField(r.title, r.title_es)}
                    </span>
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-status-confirmed whitespace-nowrap">
                    {t('Done', 'Listo')}
                    {r.fulfilledAt && (
                      <span className="text-muted-2"> · {fmt(r.fulfilledAt, SHORT_DATE)}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        </>
        )}

        {/* Itinerary — every dated request (dining, transport, activities…)
            on one calendar spanning the stay. */}
        {itineraryEvents.length > 0 && (
          <Section
            id="itinerary"
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
        <div id="concierge" className="scroll-mt-16">
        <fieldset disabled={readOnly} className="contents">
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
        </fieldset>
        </div>

        {/* Dining — chef menus + à-la-carte plates for this booking */}
        {showDining && (
          <Section
            id="dining"
            eyebrow={t('Dining', 'Gastronomía')}
            title={t('In-villa dining', 'Gastronomía en la villa')}
          >
            <fieldset disabled={readOnly} className="contents">
              <DiningSection
                bookingId={booking.id}
                menus={dining.menus}
                plates={dining.plates}
                locale={renterLocale}
                requests={diningRequests}
                checkIn={booking.checkIn.toISOString()}
                checkOut={booking.checkOut.toISOString()}
                hidePrices={isAdditional}
              />
            </fieldset>
          </Section>
        )}

        {/* Music — Leticia's Spotify playlists */}
        {playlists.length > 0 && (
          <Section
            id="music"
            eyebrow={t('Music for the house', 'Música para la casa')}
            title={t('Leticia’s playlists', 'Las playlists de Leticia')}
          >
            <PlaylistGrid playlists={playlists} profileUrl={SPOTIFY_PROFILE_URL} locale={renterLocale} />
          </Section>
        )}

        {/* Extras — running costs with receipts */}
        {costLines.length > 0 && (
          <Section
            id="costs"
            eyebrow={t('Extras', 'Extras')}
            title={t('Your extras so far', 'Tus extras hasta ahora')}
          >
            <StayCosts lines={costLines} locale={renterLocale} />
          </Section>
        )}

        {/* Documents — shared by Leticia and uploaded by the guest */}
        {hasDocuments && (
          <Section
            id="documents"
            eyebrow={t('Documents', 'Documentos')}
            title={t('Files for this stay', 'Archivos de esta estadía')}
          >
            {docsFromAgent.length > 0 && (
              <div className="mb-8 last:mb-0">
                <p className="eyebrow mb-3">{t('From Leticia', 'De Leticia')}</p>
                <DocList docs={docsFromAgent} dateLocale={dateLocale} datePattern={SHORT_DATE} />
              </div>
            )}
            {docsFromYou.length > 0 && (
              <div>
                <p className="eyebrow mb-3">{t('Your uploads', 'Tus archivos')}</p>
                <DocList docs={docsFromYou} dateLocale={dateLocale} datePattern={SHORT_DATE} />
              </div>
            )}
          </Section>
        )}

        {/* House info — pulled from Sanity */}
        {property && (
          <Section
            id="house"
            eyebrow={t('House info', 'Información de la casa')}
            title={t('Good to know', 'Bueno saber')}
          >
            {/* Portal-only house details (Wi-Fi, times, instructions) */}
            {guestInfo &&
              (guestInfo.wifiNetwork ||
                guestInfo.wifiPassword ||
                guestInfo.checkInTime ||
                guestInfo.checkOutTime ||
                guestInfo.arrivalInstructions ||
                guestInfo.houseInstructions) && (
                <div className="mb-8 border-t border-line">
                  {(guestInfo.wifiNetwork || guestInfo.wifiPassword) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-5 border-b border-line">
                      {guestInfo.wifiNetwork && (
                        <InfoRow label={t('Wi-Fi network', 'Red Wi-Fi')} value={guestInfo.wifiNetwork} mono />
                      )}
                      {guestInfo.wifiPassword && (
                        <InfoRow label={t('Wi-Fi password', 'Contraseña Wi-Fi')} value={guestInfo.wifiPassword} mono />
                      )}
                    </div>
                  )}
                  {(guestInfo.checkInTime || guestInfo.checkOutTime) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-5 border-b border-line">
                      {guestInfo.checkInTime && (
                        <InfoRow
                          label={t('Check-in', 'Entrada')}
                          value={`${t('From', 'Desde las')} ${formatTime(guestInfo.checkInTime)}`}
                        />
                      )}
                      {guestInfo.checkOutTime && (
                        <InfoRow
                          label={t('Check-out', 'Salida')}
                          value={`${t('By', 'Antes de las')} ${formatTime(guestInfo.checkOutTime)}`}
                        />
                      )}
                    </div>
                  )}
                  {guestInfo.arrivalInstructions && (
                    <div className="py-5 border-b border-line">
                      <p className="eyebrow mb-2">{t('Arriving', 'Al llegar')}</p>
                      <p className="text-[15px] font-light text-body-strong leading-relaxed whitespace-pre-line">
                        {guestInfo.arrivalInstructions}
                      </p>
                    </div>
                  )}
                  {guestInfo.houseInstructions && (
                    <div className="py-5 border-b border-line">
                      <p className="eyebrow mb-2">{t('House notes', 'Notas de la casa')}</p>
                      <p className="text-[15px] font-light text-body-strong leading-relaxed whitespace-pre-line">
                        {guestInfo.houseInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

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
                <div className="mt-6 flex items-start gap-4 p-4 bg-canvas border border-line rounded-sm">
                  {property.agent.photo && (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-sand flex-shrink-0">
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
                      <p className="text-sm font-medium text-ink mt-1">
                        {property.agent.name}
                      </p>
                    )}
                    {(renterLocale === 'es'
                      ? property.agent.positionTitle_es
                      : property.agent.positionTitle_en) && (
                        <p className="text-xs text-muted-2 font-light">
                          {renterLocale === 'es'
                            ? property.agent.positionTitle_es
                            : property.agent.positionTitle_en}
                        </p>
                      )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                      {property.agent.phone && (
                        <a
                          href={`tel:${property.agent.phone}`}
                          className="text-body-strong hover:text-ink underline underline-offset-4"
                        >
                          {t('Call', 'Llamar')}
                        </a>
                      )}
                      {property.agent.whatsapp && (
                        <a
                          href={`https://wa.me/${property.agent.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body-strong hover:text-ink underline underline-offset-4"
                        >
                          WhatsApp
                        </a>
                      )}
                      {property.agent.email && (
                        <a
                          href={`mailto:${property.agent.email}`}
                          className="text-body-strong hover:text-ink underline underline-offset-4"
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
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-16">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-2">
        {eyebrow}
      </p>
      <h2 className="font-title text-2xl text-ink mb-6 leading-tight">
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
    <ul className="border-t border-line">
      {docs.map((d) => (
        <li
          key={d.id}
          className="py-3 border-b border-line text-sm font-light flex justify-between gap-4"
        >
          <DocumentLink
            documentId={d.id}
            scope="renter"
            filename={d.filename}
          >
            {d.label || d.filename}
          </DocumentLink>
          <span className="text-muted-2 text-xs uppercase tracking-wider shrink-0">
            {format(d.uploadedAt, datePattern, { locale: dateLocale })}
          </span>
        </li>
      ))}
    </ul>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      <p className={`text-ink ${mono ? 'font-mono text-[15px] tracking-wide select-all' : 'text-[15px] font-light'}`}>
        {value}
      </p>
    </div>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-2 font-light mb-1">
        {label}
      </p>
      <p className="text-ink">{value}</p>
    </div>
  )
}
