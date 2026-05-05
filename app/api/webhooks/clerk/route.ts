import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

/**
 * Clerk → Postgres user sync. Configured in Clerk dashboard:
 *   Webhooks → New endpoint → URL: https://<your-site>/api/webhooks/clerk
 *   Subscribe to: user.created, user.updated, user.deleted
 *
 * Security: every request carries svix-{id,timestamp,signature} headers.
 * `Webhook.verify()` checks the HMAC signature against CLERK_WEBHOOK_SECRET
 * AND enforces a 5-minute timestamp window (replay protection). If anything
 * looks off, it throws — we return 400 and Clerk retries with backoff.
 */
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    console.error('[clerk webhook] missing CLERK_WEBHOOK_SECRET')
    return new NextResponse('Server misconfigured', { status: 500 })
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse('Missing Svix headers', { status: 400 })
  }

  const body = await req.text()

  let event: WebhookEvent
  try {
    event = new Webhook(secret).verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error('[clerk webhook] signature verification failed', err)
    return new NextResponse('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const data = event.data
        const primaryEmail =
          data.email_addresses.find((e) => e.id === data.primary_email_address_id)
            ?.email_address ?? data.email_addresses[0]?.email_address
        if (!primaryEmail) break

        await prisma.user.upsert({
          where: { clerkId: data.id },
          create: {
            clerkId: data.id,
            email: primaryEmail,
            firstName: data.first_name,
            lastName: data.last_name,
          },
          update: {
            email: primaryEmail,
            firstName: data.first_name,
            lastName: data.last_name,
          },
        })
        break
      }
      case 'user.deleted': {
        const id = event.data.id
        if (!id) break
        // We delete the User row. Bookings reference primaryGuestUserId
        // with `onDelete: NoAction` (default) so this throws on attempt
        // to delete a user with active bookings — that's intentional.
        // Admins must reassign or cancel bookings before deleting users.
        await prisma.user.delete({ where: { clerkId: id } }).catch((err) => {
          console.warn('[clerk webhook] could not delete user', id, err)
        })
        break
      }
      default:
        // Ignore other events; we only care about user lifecycle.
        break
    }
  } catch (err) {
    console.error('[clerk webhook] handler error', err)
    return new NextResponse('Processing error', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
