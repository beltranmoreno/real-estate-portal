import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { getConciergeServices } from '@/lib/portal/conciergeServices'
import { getGroceryItems } from '@/lib/portal/groceryItems'
import { urlFor } from '@/sanity/lib/image'
import { DocumentLink } from '@/components/portal/DocumentLink'
import { PortalLocaleSwitcher } from '@/components/portal/PortalLocaleSwitcher'
import { ConciergeSection, type SerializedServiceRequest } from './ConciergeSection'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StayDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireCurrentUser()

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
  const groceryItems = await getGroceryItems()
  const renterLocale: 'en' | 'es' = user.locale === 'es' ? 'es' : 'en'

  // `Decimal` and `Date` cannot pass through to a client component as-is.
  const serializedServiceRequests: SerializedServiceRequest[] = booking.serviceRequests.map(
    (s) => ({
      ...s,
      preferredDate: s.preferredDate ? s.preferredDate.toISOString() : null,
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
      <header className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-4 max-w-5xl flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
            Casa de Campo · Portal
          </p>
          <div className="flex items-center gap-5">
            <PortalLocaleSwitcher current={renterLocale} />
            <a
              href="/"
              className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
            >
              ← {t('Back to website', 'Volver al sitio')}
            </a>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-5xl">
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
            <p className="text-stone-600 font-light text-lg mb-6">
              {fmt(booking.checkIn, FULL_DAY)} – {fmt(booking.checkOut, FULL_DAY_YEAR)}
            </p>

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
        {pendingRequests.length > 0 && (
          <Section
            eyebrow={t('Action needed', 'Acción necesaria')}
            title={
              renterLocale === 'es'
                ? `${pendingRequests.length} ${plural(pendingRequests.length, ['', ''], ['cosa que necesitamos de ti', 'cosas que necesitamos de ti'])}`
                : `${pendingRequests.length} thing${pendingRequests.length === 1 ? '' : 's'} we need from you`
            }
          >
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
          </Section>
        )}

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

        {/* Concierge — guest-driven service requests */}
        <ConciergeSection
          bookingId={booking.id}
          locale={renterLocale}
          services={conciergeServices}
          groceryItems={groceryItems}
          initialRequests={serializedServiceRequests}
        />

        {/* House info — pulled from Sanity */}
        {property && (
          <Section
            eyebrow={t('House info', 'Información de la casa')}
            title={t('Good to know', 'Bueno saber')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-light">
              {property.location?.street && !property.location.isPrivateAddress && (
                <Pair label={t('Address', 'Dirección')} value={property.location.street} />
              )}
              {property.location?.city && (
                <Pair label={t('City', 'Ciudad')} value={property.location.city} />
              )}
              {property.contactInfo?.hostName && (
                <Pair label={t('Host', 'Anfitrión')} value={property.contactInfo.hostName} />
              )}
              {property.contactInfo?.phone && (
                <Pair label={t('Phone', 'Teléfono')} value={property.contactInfo.phone} />
              )}
              {property.contactInfo?.whatsapp && (
                <Pair label="WhatsApp" value={property.contactInfo.whatsapp} />
              )}
            </div>
          </Section>
        )}
      </main>
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
