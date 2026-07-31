import Link from 'next/link'
import { addDays, format } from 'date-fns'
import { prisma } from '@/lib/db'

export default async function AdminDashboard() {
  // Quick at-a-glance counts. These are cheap queries; we run them in
  // parallel rather than blocking sequentially.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in7Days = addDays(today, 7)

  const [
    upcomingArrivals,
    pendingInvites,
    pendingRequests,
    activeBookings,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: {
        checkIn: { gte: today, lte: in7Days },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      orderBy: { checkIn: 'asc' },
      take: 10,
      include: {
        primaryGuest: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.invitation.count({ where: { status: 'PENDING' } }),
    prisma.request.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({
      where: { status: { in: ['CONFIRMED', 'ACTIVE'] } },
    }),
  ])

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
        Dashboard
      </p>
      <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-10">
        Welcome back.
      </h1>

      {/* Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <Stat
          label="Active bookings"
          value={activeBookings}
          href="/admin/bookings?status=CONFIRMED"
        />
        <Stat
          label="Arriving in 7 days"
          value={upcomingArrivals.length}
          href="/admin/calendar"
        />
        <Stat
          label="Pending invites"
          value={pendingInvites}
          href="/admin/bookings?status=PENDING"
        />
        <Stat
          label="Pending requests"
          value={pendingRequests}
          href="/admin/bookings"
        />
      </div>

      {/* Upcoming arrivals */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-light text-stone-900 tracking-tight">
            Upcoming arrivals
          </h2>
          <Link
            href="/admin/bookings/new"
            className="text-sm font-light text-stone-700 hover:text-stone-900 underline underline-offset-4"
          >
            + New booking
          </Link>
        </div>
        <div className="border-t border-stone-200">
          {upcomingArrivals.length === 0 ? (
            <p className="py-6 text-sm font-light text-stone-500">
              No arrivals in the next 7 days.
            </p>
          ) : (
            upcomingArrivals.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center justify-between py-4 border-b border-stone-200 hover:bg-white px-2 -mx-2 transition-colors"
              >
                <div>
                  <p className="text-sm font-light text-stone-900">
                    {b.propertyTitle}
                  </p>
                  <p className="text-xs text-stone-500 font-light">
                    {b.primaryGuest.firstName ?? ''}{' '}
                    {b.primaryGuest.lastName ?? ''} · {b.primaryGuest.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-700 font-light">
                    {format(b.checkIn, 'MMM d')} – {format(b.checkOut, 'MMM d')}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-light">
                    {b.status}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  href,
}: {
  label: string
  value: number
  href: string
}) {
  return (
    <Link
      href={href}
      className="block bg-white border border-stone-200 p-6 hover:border-stone-400 transition-colors"
    >
      <div className="text-3xl font-light text-stone-900 tracking-tight">
        {value}
      </div>
      <div className="text-xs uppercase tracking-[0.15em] text-stone-500 font-light mt-2">
        {label}
      </div>
    </Link>
  )
}
