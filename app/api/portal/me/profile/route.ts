import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * PATCH /api/portal/me/profile
 *
 * The signed-in guest updates their own name + phone. Magic-link / OTP
 * signups often land without a name, which is why bookings can show
 * "Requested by —". The portal re-renders server-side, so the client
 * should router.refresh() after a successful call.
 */
const schema = z.object({
  firstName: z.string().trim().max(80).optional().nullable(),
  lastName: z.string().trim().max(80).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
})

export async function PATCH(req: Request) {
  const user = await requireCurrentUser()

  let payload
  try {
    payload = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload', details: (err as z.ZodError).issues },
      { status: 400 }
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: payload.firstName || null,
      lastName: payload.lastName || null,
      phone: payload.phone || null,
    },
  })

  return NextResponse.json({ ok: true })
}
