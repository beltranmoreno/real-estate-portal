import 'server-only'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'

/**
 * Resolves the currently signed-in user from Clerk → Postgres.
 *
 * Belt-and-suspenders pattern: the Clerk webhook is the *primary* User
 * sync (handles updates/deletes), but we also lazily create the row here
 * if the webhook hasn't fired yet (race on first sign-up). This way the
 * portal never breaks because of webhook lag.
 *
 * Returns null when no Clerk session is present.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  let user = await prisma.user.findUnique({ where: { clerkId } })
  if (user) return user

  // Lazy-create from Clerk profile when webhook hasn't fired yet.
  const client = await clerkClient()
  const clerkUser = await client.users.getUser(clerkId)
  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!primaryEmail) {
    throw new Error('Clerk user has no email address')
  }

  user = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    },
    update: {
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    },
  })

  return user
}

/**
 * Same as getCurrentUser but throws if not authenticated. Use in routes
 * that are wrapped by the auth middleware (so this should never happen
 * in practice; the throw is to satisfy TypeScript).
 */
export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  return user
}
