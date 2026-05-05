import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { urlFor } from '@/sanity/lib/image'

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
    },
  })

  if (!booking) notFound()

  // Renter scope: must own this booking. Admins/agents view bookings
  // through /admin/bookings/[id], not through the portal route.
  if (booking.primaryGuestUserId !== user.id) {
    redirect('/portal')
  }

  const property = await getPropertyForPortal(booking.propertySanityId)

  const pendingRequests = booking.requests.filter((r) => r.status === 'PENDING')
  const fulfilledRequests = booking.requests.filter((r) => r.status === 'FULFILLED')
  const docsFromAgent = booking.documents.filter((d) => d.kind === 'AGENT_UPLOAD')
  const docsFromYou = booking.documents.filter((d) => d.kind !== 'AGENT_UPLOAD')

  return (
    <ClerkProvider>
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-4 max-w-5xl flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
            Casa de Campo · Portal
          </p>
          <UserButton />
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
              Your stay
            </p>
            <h1 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight leading-tight mb-4">
              {booking.propertyTitle}
            </h1>
            <p className="text-stone-600 font-light text-lg mb-6">
              {format(booking.checkIn, 'EEEE, MMM d')} – {format(booking.checkOut, 'EEEE, MMM d, yyyy')}
            </p>

            {booking.keyCode && booking.keyReleasedAt && (
              <div className="bg-stone-100 border border-stone-200 px-4 py-3 rounded-xs">
                <p className="text-xs uppercase tracking-wider text-stone-500 font-light mb-1">
                  Check-in code
                </p>
                <p className="text-2xl font-light tracking-widest text-stone-900">
                  {booking.keyCode}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pending requests — most important call-to-action */}
        {pendingRequests.length > 0 && (
          <Section
            eyebrow="Action needed"
            title={`${pendingRequests.length} thing${pendingRequests.length === 1 ? '' : 's'} we need from you`}
          >
            <ul className="border-t border-stone-200">
              {pendingRequests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between py-4 border-b border-stone-200 gap-4"
                >
                  <div>
                    <p className="text-sm font-light text-stone-900">{r.title}</p>
                    {r.description && (
                      <p className="text-xs text-stone-500 font-light mt-1">
                        {r.description}
                      </p>
                    )}
                    {r.dueAt && (
                      <p className="text-xs text-stone-500 font-light mt-1">
                        Needed by {format(r.dueAt, 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <a
                    href={`/portal/stays/${booking.id}/requests/${r.id}`}
                    className="text-sm font-light text-stone-900 hover:underline whitespace-nowrap"
                  >
                    {r.expectsDocument ? 'Upload →' : 'Respond →'}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Documents from Leticia */}
        {docsFromAgent.length > 0 && (
          <Section eyebrow="From Leticia" title="Shared with you">
            <DocList docs={docsFromAgent} />
          </Section>
        )}

        {/* Your uploads */}
        {docsFromYou.length > 0 && (
          <Section eyebrow="Your uploads" title="Submitted">
            <DocList docs={docsFromYou} />
          </Section>
        )}

        {/* Fulfilled requests (audit trail) */}
        {fulfilledRequests.length > 0 && (
          <Section eyebrow="History" title="Completed requests">
            <ul className="border-t border-stone-200">
              {fulfilledRequests.map((r) => (
                <li
                  key={r.id}
                  className="py-3 border-b border-stone-200 text-sm font-light text-stone-700 flex justify-between"
                >
                  <span>{r.title}</span>
                  <span className="text-stone-400 text-xs uppercase tracking-wider">
                    {r.fulfilledAt ? format(r.fulfilledAt, 'MMM d') : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* House info — pulled from Sanity */}
        {property && (
          <Section eyebrow="House info" title="Good to know">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-light">
              {property.location?.street && !property.location.isPrivateAddress && (
                <Pair label="Address" value={property.location.street} />
              )}
              {property.location?.city && (
                <Pair label="City" value={property.location.city} />
              )}
              {property.contactInfo?.hostName && (
                <Pair label="Host" value={property.contactInfo.hostName} />
              )}
              {property.contactInfo?.phone && (
                <Pair label="Phone" value={property.contactInfo.phone} />
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

function DocList({ docs }: { docs: Array<{ id: string; filename: string; kind: string; uploadedAt: Date; label?: string | null }> }) {
  return (
    <ul className="border-t border-stone-200">
      {docs.map((d) => (
        <li
          key={d.id}
          className="py-3 border-b border-stone-200 text-sm font-light flex justify-between"
        >
          <span className="text-stone-900">{d.label || d.filename}</span>
          <span className="text-stone-500 text-xs uppercase tracking-wider">
            {format(d.uploadedAt, 'MMM d')}
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
