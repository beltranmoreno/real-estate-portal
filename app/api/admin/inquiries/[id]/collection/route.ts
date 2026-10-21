import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { createCollectionForInquiry } from '@/lib/inquiries'

/** POST /api/admin/inquiries/[id]/collection — private Sanity collection from the inquiry's houses. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin({ throwOnFail: true })
  const { id } = await params

  const inquiry = await prisma.inquiry.findUnique({ where: { id } })
  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  if (inquiry.collectionId) return NextResponse.json({ error: 'This inquiry already has a collection' }, { status: 409 })
  if (inquiry.propertyIds.length === 0) {
    return NextResponse.json({ error: 'Add at least one house first' }, { status: 400 })
  }

  try {
    const updated = await createCollectionForInquiry(inquiry)
    return NextResponse.json({ collectionId: updated.collectionId })
  } catch (err) {
    console.error('[inquiries] collection create failed', err)
    return NextResponse.json({ error: 'Could not create the collection in Sanity' }, { status: 500 })
  }
}
