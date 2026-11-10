import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { toLocale, tFor } from '@/lib/i18n'
import { dbDateKey } from '@/lib/dates'
import { getPropertyOptions } from '@/lib/portal/properties'
import { getCollectionPropertyIds } from '@/lib/inquiries'
import { budgetLabel } from '@/lib/inquiry'
import { InquiryForm } from '../../InquiryForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditInquiryPage({ params }: PageProps) {
  const { id } = await params
  // ADMIN/AGENT only — STAFF get bookings and the calendar.
  const admin = await requireAdmin()
  const locale = toLocale(admin?.locale)
  const t = tFor(locale)

  const inquiry = await prisma.inquiry.findUnique({ where: { id } })
  if (!inquiry) notFound()

  const [properties, collectionIds] = await Promise.all([
    getPropertyOptions(),
    inquiry.collectionId ? getCollectionPropertyIds(inquiry.collectionId) : Promise.resolve(null),
  ])

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
      <Link href={`/admin/inquiries/${id}`} className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900">
        ← {t('Back to inquiry', 'Volver a la consulta')}
      </Link>
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mt-6 mb-3">
        {t('Edit inquiry', 'Editar consulta')} {inquiry.reference}
      </p>
      <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-10">{inquiry.name}</h1>
      <InquiryForm
        properties={properties}
        inquiryId={inquiry.id}
        locale={locale}
        initial={{
          name: inquiry.name,
          email: inquiry.email ?? '',
          whatsapp: inquiry.whatsapp ?? '',
          nationality: inquiry.nationality ?? '',
          channel: inquiry.channel ?? '',
          locale: inquiry.locale === 'es' ? 'es' : 'en',
          checkIn: inquiry.checkIn ? dbDateKey(inquiry.checkIn) : '',
          checkOut: inquiry.checkOut ? dbDateKey(inquiry.checkOut) : '',
          guests: inquiry.guests ? String(inquiry.guests) : '',
          bedrooms: inquiry.bedrooms ? String(inquiry.bedrooms) : '',
          // A range picked on the site shows as its label; the admin can rewrite it.
          budget: inquiry.budget ? (budgetLabel(inquiry.budget, locale) ?? inquiry.budget) : '',
          message: inquiry.message ?? '',
          notes: inquiry.notes ?? '',
          // With a private collection, its houses (which Studio can also edit) are the list.
          propertyIds: collectionIds ?? inquiry.propertyIds,
          propertyNotes: (inquiry.propertyNotes ?? {}) as Record<string, string>,
        }}
      />
    </div>
  )
}
