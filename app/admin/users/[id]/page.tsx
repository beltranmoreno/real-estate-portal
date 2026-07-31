import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { DocumentLink } from '@/components/portal/DocumentLink'
import { UserNotesEditor } from './UserNotesEditor'
import { UserRoleSelect } from '../UserRoleSelect'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: PageProps) {
  const me = await requireAdmin()
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      bookingsAsPrimary: {
        orderBy: { checkIn: 'desc' },
        include: {
          _count: { select: { documents: true, requests: true } },
        },
      },
      uploadedDocs: {
        // Only show docs uploaded by this user across any booking
        orderBy: { uploadedAt: 'desc' },
        include: {
          booking: { select: { id: true, propertyTitle: true } },
        },
      },
    },
  })

  if (!user) notFound()

  const isPlaceholder = user.clerkId.startsWith('pending:')
  const isMe = user.id === me.id

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href="/admin/users"
        className="text-xs uppercase tracking-[0.25em] text-stone-500 hover:text-stone-700"
      >
        ← All users
      </Link>

      <div className="mt-3 mb-10">
        <h1 className="text-3xl font-light text-stone-900 tracking-tight">
          {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
        </h1>
        <p className="text-stone-600 font-light mt-2">
          {user.email}
          {' · '}
          <span className="text-xs uppercase tracking-wider">{user.role}</span>
          {isPlaceholder && (
            <span className="ml-2 text-xs uppercase tracking-wider text-amber-700">
              invited — not yet signed up
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: bookings, documents */}
        <div className="lg:col-span-2 space-y-8">
          <Section
            title={`Bookings (${user.bookingsAsPrimary.length})`}
          >
            {user.bookingsAsPrimary.length === 0 ? (
              <p className="text-stone-500 font-light text-sm">
                No bookings yet.
              </p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {user.bookingsAsPrimary.map((b) => (
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
                            {format(b.checkIn, 'MMM d')} –{' '}
                            {format(b.checkOut, 'MMM d, yyyy')}
                            {b._count.requests > 0 &&
                              ` · ${b._count.requests} request${b._count.requests === 1 ? '' : 's'}`}
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
            )}
          </Section>

          {/* Documents this user has uploaded across all their bookings.
              Useful for spotting patterns, e.g. "they used a different
              passport last time" or pulling up an old contract. */}
          {user.uploadedDocs.length > 0 && (
            <Section
              title={`Documents on file (${user.uploadedDocs.length})`}
            >
              <ul className="divide-y divide-stone-200">
                {user.uploadedDocs.map((d) => (
                  <li
                    key={d.id}
                    className="py-3 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
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
                        {d.kind} ·{' '}
                        <Link
                          href={`/admin/bookings/${d.booking.id}`}
                          className="hover:text-stone-700 underline underline-offset-4"
                        >
                          {d.booking.propertyTitle}
                        </Link>{' '}
                        · {format(d.uploadedAt, 'MMM d, yyyy')}
                        {d.expiresAt &&
                          ` · auto-purges ${format(d.expiresAt, 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-stone-500 ml-3 shrink-0">
                      {(d.fileSize / 1024).toFixed(0)} KB
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Right: contact, role, notes */}
        <aside className="space-y-6">
          <Section title="Contact">
            <Pair label="Email" value={user.email} />
            {user.phone && <Pair label="Phone" value={user.phone} />}
            {user.locale && (
              <Pair
                label="Email language"
                value={user.locale === 'es' ? 'Español' : 'English'}
              />
            )}
            <Pair
              label="Joined"
              value={format(user.createdAt, 'MMM d, yyyy')}
            />
          </Section>

          {!isPlaceholder && !isMe && (
            <Section title="Role">
              <p className="text-xs uppercase tracking-[0.15em] text-stone-500 font-light mb-3">
                Change permissions
              </p>
              <UserRoleSelect userId={user.id} initialRole={user.role} />
            </Section>
          )}

          <Section title="Notes">
            <UserNotesEditor userId={user.id} initialValue={user.notes ?? ''} />
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
      <span className="text-stone-900 font-light text-right break-all">
        {value}
      </span>
    </div>
  )
}
