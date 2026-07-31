import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * PATCH /api/portal/me/locale
 *
 * Updates the signed-in user's preferred locale. The portal renders
 * server-side using `user.locale`, so the next page render reflects
 * the change. The client should `router.refresh()` after this call.
 */
const schema = z.object({
  locale: z.enum(['en', 'es']),
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
    data: { locale: payload.locale },
  })

  return NextResponse.json({ locale: payload.locale })
}
