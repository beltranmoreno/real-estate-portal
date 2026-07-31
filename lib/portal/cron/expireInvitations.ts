import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Marks unclaimed invitations as EXPIRED once their `expiresAt` has passed.
 * The status field is what drives access — the magic-link landing already
 * checks `expiresAt < now()` defensively, but flipping the status keeps
 * the admin views accurate (so "Pending invites" count doesn't include
 * stale ones).
 */
export async function expireInvitations() {
  const now = new Date()

  const { count } = await prisma.invitation.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: now },
    },
    data: { status: 'EXPIRED' },
  })

  return { expired: count }
}
