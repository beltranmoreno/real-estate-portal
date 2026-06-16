import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { EditBookingForm } from './EditBookingForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditBookingPage({ params }: PageProps) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      primaryGuest: { select: { firstName: true, lastName: true, email: true } },
    },
  })
  if (!booking) notFound()

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
      <Link
        href={`/admin/bookings/${id}`}
        className="text-xs uppercase tracking-[0.25em] text-stone-500 hover:text-stone-700"
      >
        ← Back to booking
      </Link>

      <div className="mt-3 mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2">
          Edit booking
        </p>
        <h1 className="text-3xl font-light text-stone-900 tracking-tight">
          {booking.propertyTitle}
        </h1>
        <p className="text-stone-600 font-light mt-1">
          {[booking.primaryGuest.firstName, booking.primaryGuest.lastName]
            .filter(Boolean)
            .join(' ') || booking.primaryGuest.email}
          {' · '}
          {format(booking.checkIn, 'MMM d')} –{' '}
          {format(booking.checkOut, 'MMM d, yyyy')}
        </p>
      </div>

      <EditBookingForm
        bookingId={booking.id}
        initial={{
          checkIn: format(booking.checkIn, 'yyyy-MM-dd'),
          checkOut: format(booking.checkOut, 'yyyy-MM-dd'),
          guestCount: booking.guestCount?.toString() ?? '',
          status: booking.status,
          totalAmount: booking.totalAmount?.toString() ?? '',
          balanceDue: booking.balanceDue?.toString() ?? '',
          paidInFull: booking.paidInFull,
          arrivalDetails: booking.arrivalDetails ?? '',
          keyCode: booking.keyCode ?? '',
        }}
      />
    </div>
  )
}
