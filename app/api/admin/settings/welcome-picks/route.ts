import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { WELCOME_PICKS_KEY, WELCOME_PICKS_MAX } from '@/lib/email/welcomePicks'

const ids = z.array(z.string().min(1).max(200)).max(WELCOME_PICKS_MAX)
const schema = z.object({ restaurantIds: ids, activityIds: ids })

/** Saves which restaurants and activities the welcome email shows. */
export async function PUT(req: Request) {
  const admin = await requireAdmin({ throwOnFail: true })

  let value
  try {
    value = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', details: (err as z.ZodError).issues }, { status: 400 })
  }

  await prisma.appSetting.upsert({
    where: { key: WELCOME_PICKS_KEY },
    create: { key: WELCOME_PICKS_KEY, value },
    update: { value },
  })
  await prisma.auditLog
    .create({ data: { actorUserId: admin?.id ?? null, action: 'welcome_picks_updated', entity: 'setting', entityId: WELCOME_PICKS_KEY, payload: value } })
    .catch(() => {})

  return NextResponse.json({ ok: true })
}
