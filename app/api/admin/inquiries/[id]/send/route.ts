import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { sendCollectionEmail } from '@/lib/inquiries'

/** POST /api/admin/inquiries/[id]/send — email the guest their private collection. */
const schema = z.object({
  to: z.string().trim().email(),
  note: z.string().max(4000).optional(),
  locale: z.enum(['en', 'es']).default('en'),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin({ throwOnFail: true })
  const { id } = await params

  let data: z.infer<typeof schema>
  try {
    data = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', details: (err as z.ZodError).issues }, { status: 400 })
  }

  const inquiry = await prisma.inquiry.findUnique({ where: { id } })
  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

  try {
    await sendCollectionEmail(inquiry, { to: data.to, note: data.note?.trim() || null, locale: data.locale })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[inquiries] send failed', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
