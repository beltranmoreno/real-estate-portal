import { format } from 'date-fns'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

/**
 * Public landing for invitation magic links. Validates the token, shows
 * the stay details, and routes the guest to Clerk sign-up (with their
 * email pre-filled and the token preserved through redirects).
 *
 * After Clerk auth completes, the user lands at /portal/accept-invite/complete
 * which finishes the linking.
 */
export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return <InvalidLink message="Missing invitation token." />
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  })

  if (!invitation) {
    return <InvalidLink message="This invitation link is not valid." />
  }

  if (invitation.status === 'REVOKED') {
    return <InvalidLink message="This invitation has been revoked. Please contact your agent." />
  }

  if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
    return (
      <InvalidLink message="This invitation has expired. Please contact your agent for a new link." />
    )
  }

  if (invitation.status === 'ACCEPTED') {
    // Already accepted — push them to sign-in (or to their portal if signed in).
    redirect('/portal')
  }

  // If already signed in with a different account, they'll see a mismatch
  // error after completion. If signed in with the right account, send them
  // straight to /complete.
  const { userId: clerkId } = await auth()
  if (clerkId) {
    redirect(`/portal/accept-invite/complete?token=${token}`)
  }

  // Pass token through Clerk's signup flow so we can reconcile after auth.
  // We use Clerk's `signUpForceRedirectUrl` to land at /complete.
  const completeUrl = `/portal/accept-invite/complete?token=${encodeURIComponent(token)}`
  const signUpUrl = `/portal/sign-up?email_address=${encodeURIComponent(invitation.email)}&redirect_url=${encodeURIComponent(completeUrl)}`

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-stone-50">
      <div className="w-full max-w-lg bg-white border border-stone-200 p-10 rounded-xs">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
          Casa de Campo
        </p>
        <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-3">
          {invitation.firstName ? `Hi ${invitation.firstName},` : 'Welcome,'}
        </h1>
        <p className="text-stone-600 font-light mb-8 leading-relaxed">
          We've prepared a personal portal for your upcoming stay. Sign in
          with your email — we'll send you a magic link, no password needed.
        </p>

        <div className="border-t border-b border-stone-200 py-5 mb-8 space-y-2">
          <Pair label="Property" value={invitation.propertyTitle} />
          <Pair
            label="Check-in"
            value={format(invitation.checkIn, 'MMM d, yyyy')}
          />
          <Pair
            label="Check-out"
            value={format(invitation.checkOut, 'MMM d, yyyy')}
          />
        </div>

        <Link
          href={signUpUrl}
          className="block w-full text-center px-6 py-3.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
        >
          Continue with email
        </Link>

        <p className="text-xs text-stone-500 font-light text-center mt-6 leading-relaxed">
          This invitation is for {invitation.email}. Make sure you sign up with
          that exact email address.
        </p>
      </div>
    </div>
  )
}

function InvalidLink({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-stone-50">
      <div className="w-full max-w-lg bg-white border border-stone-200 p-10 rounded-xs text-center">
        <h1 className="text-2xl font-light text-stone-900 tracking-tight mb-3">
          We couldn't open this link
        </h1>
        <p className="text-stone-600 font-light leading-relaxed">{message}</p>
      </div>
    </div>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-stone-500 font-light">{label}</span>
      <span className="text-stone-900 font-light text-right">{value}</span>
    </div>
  )
}
