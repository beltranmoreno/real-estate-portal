import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

/**
 * Post-Clerk-signup landing. Reconciles the freshly-authenticated Clerk
 * user with the invitation token they came in with:
 *
 *   1. Verify the Clerk session email matches the invitation email
 *   2. Mark the invitation ACCEPTED
 *   3. Re-link the Booking's primaryGuestUserId to the real (now Clerk-backed) User
 *      (was a placeholder during invitation creation)
 *   4. Mark the booking CONFIRMED
 *   5. Redirect into the portal
 */
export default async function AcceptInviteComplete({ searchParams }: PageProps) {
  const { token } = await searchParams
  const user = await requireCurrentUser()

  if (!token) {
    return <Mismatch message="Missing invitation token." />
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { resultingBooking: true },
  })

  if (!invitation) return <Mismatch message="Invitation not found." />
  if (invitation.status === 'REVOKED') {
    return <Mismatch message="This invitation has been revoked." />
  }
  if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
    return <Mismatch message="This invitation has expired." />
  }
  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    return (
      <Mismatch
        message={`This invitation is for ${invitation.email}, but you signed in as ${user.email}. Please sign out and use the right account.`}
      />
    )
  }

  // The booking's primaryGuestUserId was set to a placeholder User row
  // (with clerkId="pending:<email>"). Now that the real Clerk-authenticated
  // User exists, we point the booking at it and clean up the placeholder.
  if (invitation.status === 'PENDING' && invitation.resultingBookingId) {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: invitation.resultingBookingId! },
      })
      if (!booking) return

      // If the placeholder is a different row than the real user, re-point.
      if (booking.primaryGuestUserId !== user.id) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { primaryGuestUserId: user.id, status: 'CONFIRMED' },
        })

        // Best-effort cleanup of the placeholder row, only if it has no
        // other bookings or relations referencing it.
        const placeholder = await tx.user.findUnique({
          where: { id: booking.primaryGuestUserId },
        })
        if (
          placeholder &&
          placeholder.clerkId.startsWith('pending:') &&
          placeholder.id !== user.id
        ) {
          const stillReferenced = await tx.booking.count({
            where: { primaryGuestUserId: placeholder.id },
          })
          if (stillReferenced === 0) {
            await tx.user.delete({ where: { id: placeholder.id } })
          }
        }
      } else {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED' },
        })
      }

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      })

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          entity: 'invitation',
          entityId: invitation.id,
          action: 'accepted',
        },
      })
    })
  }

  redirect(`/portal/stays/${invitation.resultingBookingId}`)
}

function Mismatch({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-stone-50">
      <div className="w-full max-w-lg bg-white border border-stone-200 p-10 rounded-xs text-center">
        <h1 className="text-2xl font-light text-stone-900 tracking-tight mb-3">
          We can't link this invitation
        </h1>
        <p className="text-stone-600 font-light leading-relaxed">{message}</p>
      </div>
    </div>
  )
}
