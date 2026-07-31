import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { PortalLocaleSwitcher } from '@/components/portal/PortalLocaleSwitcher'
import { RequestForm } from './RequestForm'
import { SubmissionView } from './SubmissionView'

interface PageProps {
  params: Promise<{ id: string; reqId: string }>
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id: bookingId, reqId } = await params
  const user = await requireCurrentUser()

  const request = await prisma.request.findUnique({
    where: { id: reqId },
    include: {
      booking: {
        select: {
          id: true,
          propertyTitle: true,
          primaryGuestUserId: true,
        },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  })

  if (!request || request.bookingId !== bookingId) notFound()
  if (request.booking.primaryGuestUserId !== user.id) redirect('/portal')

  const locale: 'en' | 'es' = user.locale === 'es' ? 'es' : 'en'
  const t = (en: string, esStr: string) => (locale === 'es' ? esStr : en)
  const dateLocale = locale === 'es' ? es : undefined
  const FULL_DATE = locale === 'es' ? 'd MMM yyyy' : 'MMM d, yyyy'

  // Pick the locale-matching field from the Request, falling back to EN.
  const localTitle =
    locale === 'es' && request.title_es ? request.title_es : request.title
  const localDescription =
    locale === 'es' && request.description_es
      ? request.description_es
      : request.description

  return (
    <ClerkProvider>
      <header className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-4 max-w-3xl flex items-center justify-between gap-4">
          <Link
            href={`/portal/stays/${request.booking.id}`}
            className="text-xs uppercase tracking-[0.25em] text-stone-500 hover:text-stone-700"
          >
            ← {t('Back to stay', 'Volver a la estadía')}
          </Link>
          <div className="flex items-center gap-5">
            <PortalLocaleSwitcher current={locale} />
            <a
              href="/"
              className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
            >
              {t('Public site', 'Sitio público')}
            </a>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
          {request.booking.propertyTitle}
        </p>
        <h1 className="text-3xl font-light text-stone-900 tracking-tight leading-tight mb-3">
          {localTitle}
        </h1>

        {localDescription && (
          <p className="text-stone-600 font-light leading-relaxed mb-6 max-w-2xl">
            {localDescription}
          </p>
        )}

        {request.dueAt && (
          <p className="text-xs uppercase tracking-wider text-stone-500 font-light mb-8">
            {t('Needed by', 'Para el')}{' '}
            {format(request.dueAt, FULL_DATE, { locale: dateLocale })}
          </p>
        )}

        {/* Rejection note — sits above the form so the renter sees the
            reason before they re-submit. */}
        {request.status === 'PENDING' && request.reviewNote && (
          <div className="bg-amber-50 border border-amber-200 rounded-xs p-4 mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-light mb-2">
              {t('Please re-submit', 'Por favor, vuelve a enviar')}
            </p>
            <p className="text-sm text-amber-900 font-light whitespace-pre-wrap leading-relaxed">
              {request.reviewNote}
            </p>
          </div>
        )}

        {request.status === 'FULFILLED' || request.status === 'PENDING_REVIEW' ? (
          <SubmissionView
            bookingId={request.bookingId}
            requestId={request.id}
            status={request.status}
            expectsDocument={request.expectsDocument}
            documentKind={mapRequestKindToDocKind(request.kind)}
            textResponse={request.textResponse}
            fulfilledAt={
              request.fulfilledAt ? request.fulfilledAt.toISOString() : null
            }
            documents={request.documents.map((d) => ({
              id: d.id,
              filename: d.filename,
              uploadedAt: d.uploadedAt.toISOString(),
            }))}
            locale={locale}
          />
        ) : (
          <RequestForm
            bookingId={request.bookingId}
            requestId={request.id}
            expectsDocument={request.expectsDocument}
            // Map kind → suggested document kind for the upload payload
            documentKind={mapRequestKindToDocKind(request.kind)}
            locale={locale}
          />
        )}
      </main>
    </ClerkProvider>
  )
}

/**
 * Map a Request.kind to the most appropriate Document.kind for uploads.
 * Used as the default `kind` when the renter uploads via this page.
 */
function mapRequestKindToDocKind(
  kind:
    | 'PASSPORT'
    | 'RENTAL_CONTRACT'
    | 'DEPOSIT_RECEIPT'
    | 'ID_PHOTO'
    | 'TRAVEL_INSURANCE'
    | 'PET_DOCUMENTATION'
    | 'ARRIVAL_DETAILS'
    | 'GUEST_LIST'
    | 'DIETARY_PREFERENCES'
    | 'SERVICE_PREFERENCES'
    | 'CUSTOM'
): 'PASSPORT' | 'CONTRACT' | 'RECEIPT' | 'ID' | 'INSURANCE' | 'PET_DOC' | 'OTHER' {
  switch (kind) {
    case 'PASSPORT':
      return 'PASSPORT'
    case 'RENTAL_CONTRACT':
      return 'CONTRACT'
    case 'DEPOSIT_RECEIPT':
      return 'RECEIPT'
    case 'ID_PHOTO':
      return 'ID'
    case 'TRAVEL_INSURANCE':
      return 'INSURANCE'
    case 'PET_DOCUMENTATION':
      return 'PET_DOC'
    default:
      return 'OTHER'
  }
}
