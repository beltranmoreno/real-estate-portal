import Link from 'next/link'
import {
  addMonths,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parse,
} from 'date-fns'
import { prisma } from '@/lib/db'

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

/**
 * Admin calendar — month view of every active booking across all
 * properties. Status drives the bar color so at-a-glance you can see
 * which weeks are fully booked, which have pending invitations, etc.
 *
 * URL `?month=YYYY-MM` controls the visible month; arrows nav adjusts.
 */
export default async function AdminCalendarPage({ searchParams }: PageProps) {
  const { month } = await searchParams
  const today = new Date()
  const focused = month
    ? parse(`${month}-01`, 'yyyy-MM-dd', new Date())
    : new Date(today.getFullYear(), today.getMonth(), 1)

  const monthStart = startOfMonth(focused)
  const monthEnd = endOfMonth(focused)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Fetch any booking that overlaps the visible window.
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
      AND: [
        { checkIn: { lte: gridEnd } },
        { checkOut: { gte: gridStart } },
      ],
    },
    orderBy: { checkIn: 'asc' },
    include: {
      primaryGuest: { select: { firstName: true, lastName: true, email: true } },
    },
  })

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
            Calendar
          </p>
          <h1 className="text-3xl font-light text-stone-900 tracking-tight">
            {format(focused, 'MMMM yyyy')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            label="←"
            target={addMonths(focused, -1)}
            current={focused}
          />
          <Link
            href="/admin/calendar"
            className="px-3 py-1.5 text-xs font-light tracking-wide rounded-sm border border-stone-300 text-stone-700 hover:bg-stone-100"
          >
            Today
          </Link>
          <NavLink
            label="→"
            target={addMonths(focused, 1)}
            current={focused}
          />
        </div>
      </div>

      {/* Day-of-week headers (Mon-first) */}
      <div className="grid grid-cols-7 gap-px bg-stone-200 border border-stone-200 mb-px">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div
            key={d}
            className="bg-stone-50 px-3 py-2 text-xs uppercase tracking-wider text-stone-500 font-light"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-px bg-stone-200 border border-stone-200">
        {days.map((day) => {
          const inMonth = day.getMonth() === focused.getMonth()
          const isToday = isSameDay(day, today)
          const dayBookings = bookings.filter(
            (b) =>
              !isAfter(b.checkIn, day) && !isBefore(b.checkOut, day)
          )

          return (
            <div
              key={day.toISOString()}
              className={`bg-white min-h-[110px] p-2 ${
                inMonth ? '' : 'bg-stone-50/60 text-stone-400'
              }`}
            >
              <div
                className={`text-sm font-light mb-1.5 ${
                  isToday
                    ? 'inline-flex w-7 h-7 items-center justify-center rounded-full bg-stone-800 text-white'
                    : 'text-stone-700'
                }`}
              >
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((b) => {
                  const isStart = isSameDay(b.checkIn, day)
                  const isEnd = isSameDay(b.checkOut, day)
                  const guestLabel =
                    [b.primaryGuest.firstName, b.primaryGuest.lastName]
                      .filter(Boolean)
                      .join(' ') || b.primaryGuest.email

                  const tone =
                    b.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : b.status === 'ACTIVE'
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'bg-stone-100 text-stone-800 border-stone-200'

                  return (
                    <Link
                      key={b.id}
                      href={`/admin/bookings/${b.id}`}
                      className={`block text-[11px] leading-tight px-1.5 py-1 rounded-sm border truncate ${tone}`}
                      title={`${b.propertyTitle} — ${guestLabel}`}
                    >
                      {isStart && '▸ '}
                      {isEnd && '◂ '}
                      <span className="font-medium">{guestLabel}</span>
                      <span className="hidden sm:inline">
                        {' · '}
                        {b.propertyTitle}
                      </span>
                    </Link>
                  )
                })}
                {dayBookings.length > 3 && (
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-light">
                    +{dayBookings.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-light text-stone-600 mt-6">
        <Legend className="bg-stone-100 border-stone-200" label="Confirmed" />
        <Legend className="bg-amber-100 border-amber-200" label="Pending" />
        <Legend className="bg-stone-800 border-stone-800" label="Active" />
      </div>
    </div>
  )
}

function NavLink({
  label,
  target,
  current,
}: {
  label: string
  target: Date
  current: Date
}) {
  const isCurrent = format(target, 'yyyy-MM') === format(current, 'yyyy-MM')
  return (
    <Link
      href={`/admin/calendar?month=${format(target, 'yyyy-MM')}`}
      className={`w-9 h-9 inline-flex items-center justify-center rounded-sm border text-stone-700 hover:bg-stone-100 ${
        isCurrent ? 'border-stone-800' : 'border-stone-300'
      }`}
    >
      {label}
    </Link>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 border ${className}`} />
      {label}
    </span>
  )
}
