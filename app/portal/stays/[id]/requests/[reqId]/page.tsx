import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { RequestForm } from './RequestForm'

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

  return (
    <ClerkProvider>
      <header className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-4 max-w-3xl flex items-center justify-between">
          <Link
            href={`/portal/stays/${request.booking.id}`}
            className="text-xs uppercase tracking-[0.25em] text-stone-500 hover:text-stone-700"
          >
            ← Back to stay
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
          {request.booking.propertyTitle}
        </p>
        <h1 className="text-3xl font-light text-stone-900 tracking-tight leading-tight mb-3">
          {request.title}
        </h1>

        {request.description && (
          <p className="text-stone-600 font-light leading-relaxed mb-6 max-w-2xl">
            {request.description}
          </p>
        )}

        {request.dueAt && (
          <p className="text-xs uppercase tracking-wider text-stone-500 font-light mb-8">
            Needed by {format(request.dueAt, 'MMM d, yyyy')}
          </p>
        )}

        {request.status === 'FULFILLED' ? (
          <FulfilledView request={request} />
        ) : (
          <RequestForm
            bookingId={request.bookingId}
            requestId={request.id}
            expectsDocument={request.expectsDocument}
            // Map kind → suggested document kind for the upload payload
            documentKind={mapRequestKindToDocKind(request.kind)}
          />
        )}
      </main>
    </ClerkProvider>
  )
}

function FulfilledView({
  request,
}: {
  request: {
    fulfilledAt: Date | null
    textResponse: string | null
    documents: Array<{ id: string; filename: string; uploadedAt: Date }>
  }
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xs p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light mb-3">
        Submitted{request.fulfilledAt ? ` · ${format(request.fulfilledAt, 'MMM d, yyyy')}` : ''}
      </p>

      {request.textResponse && (
        <p className="text-stone-700 font-light whitespace-pre-wrap leading-relaxed mb-4">
          {request.textResponse}
        </p>
      )}

      {request.documents.length > 0 && (
        <ul className="space-y-2">
          {request.documents.map((d) => (
            <li
              key={d.id}
              className="text-sm font-light text-stone-700 border-t border-stone-100 pt-3"
            >
              {d.filename}
            </li>
          ))}
        </ul>
      )}
    </div>
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
