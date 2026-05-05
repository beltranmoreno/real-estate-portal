import Link from 'next/link'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import type { BookingStatus } from '@prisma/client'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

const STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED']

export default async function BookingsListPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const filter = status && STATUSES.includes(status as BookingStatus)
    ? (status as BookingStatus)
    : null

  const bookings = await prisma.booking.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: [{ status: 'asc' }, { checkIn: 'asc' }],
    take: 100,
    include: {
      primaryGuest: { select: { firstName: true, lastName: true, email: true } },
      _count: { select: { requests: true, documents: true } },
    },
  })

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
            Bookings
          </p>
          <h1 className="text-3xl font-light text-stone-900 tracking-tight">
            All bookings
          </h1>
        </div>
        <Link
          href="/admin/bookings/new"
          className="inline-flex items-center px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
        >
          + New booking
        </Link>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill label="All" href="/admin/bookings" active={!filter} />
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            label={s.charAt(0) + s.slice(1).toLowerCase()}
            href={`/admin/bookings?status=${s}`}
            active={filter === s}
          />
        ))}
      </div>

      {/* List */}
      {bookings.length === 0 ? (
        <div className="bg-white border border-stone-200 p-12 text-center">
          <p className="text-stone-500 font-light">No bookings to show.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <Th>Guest</Th>
                <Th>Property</Th>
                <Th>Dates</Th>
                <Th>Status</Th>
                <Th>Pending</Th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                >
                  <Td>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-stone-900 hover:underline"
                    >
                      {b.primaryGuest.firstName ?? ''}{' '}
                      {b.primaryGuest.lastName ?? ''}
                      <br />
                      <span className="text-xs text-stone-500 font-light">
                        {b.primaryGuest.email}
                      </span>
                    </Link>
                  </Td>
                  <Td>{b.propertyTitle}</Td>
                  <Td>
                    {format(b.checkIn, 'MMM d')} – {format(b.checkOut, 'MMM d, yyyy')}
                  </Td>
                  <Td>
                    <span className="text-xs uppercase tracking-wider text-stone-500">
                      {b.status}
                    </span>
                  </Td>
                  <Td>
                    {b._count.requests > 0 ? (
                      <span className="text-stone-700">
                        {b._count.requests} request{b._count.requests === 1 ? '' : 's'}
                      </span>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FilterPill({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs font-light tracking-wide rounded-sm border transition-colors ${
        active
          ? 'bg-stone-800 text-white border-stone-800'
          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
      }`}
    >
      {label}
    </Link>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone-500 font-light">
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 font-light text-stone-700">{children}</td>
}
