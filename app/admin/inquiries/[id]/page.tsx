import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { toLocale, tFor } from '@/lib/i18n'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPropertyOptions } from '@/lib/portal/properties'
import { urlFor } from '@/sanity/lib/image'
import { dbDateKey, formatDateKey, nightsBetween } from '@/lib/dates'
import { whatsappLink } from '@/lib/inquiry'
import { collectionUrl, getInquiryProperties, propertyTitle, studioEditUrl } from '@/lib/inquiries'
import { inquirySourceLabel } from '../labels'
import { CollectionPanel, HousesEditor, NotesEditor, StatusSelect } from './InquiryPanels'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InquiryDetailPage({ params }: PageProps) {
  const { id } = await params
  const admin = await getCurrentUser()
  const locale = toLocale(admin?.locale)
  const t = tFor(locale)

  const inquiry = await prisma.inquiry.findUnique({ where: { id } })
  if (!inquiry) notFound()

  const [houses, propertyOptions] = await Promise.all([
    getInquiryProperties(inquiry.propertyIds),
    inquiry.collectionId ? Promise.resolve([]) : getPropertyOptions(),
  ])
  // Houses deleted from Sanity since: keep showing the title snapshot.
  const missing = inquiry.propertyIds
    .map((pid, i) => ({ pid, title: inquiry.propertyTitles[i] }))
    .filter(({ pid }) => !houses.some((h) => h._id === pid))

  const checkInKey = inquiry.checkIn ? dbDateKey(inquiry.checkIn) : null
  const checkOutKey = inquiry.checkOut ? dbDateKey(inquiry.checkOut) : null
  const guestLocale = inquiry.locale === 'es' ? 'es' : 'en'
  const url = collectionUrl(inquiry)

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <Link href="/admin/inquiries" className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900">
        ← {t('All inquiries', 'Todas las consultas')}
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mt-6 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
            {t('Inquiry', 'Consulta')} {inquiry.reference}
          </p>
          <h1 className="text-3xl font-light text-stone-900 tracking-tight">{inquiry.name}</h1>
          <p className="text-sm text-stone-500 font-light mt-2">
            {inquirySourceLabel(t, inquiry.source, inquiry.channel)} · {format(inquiry.createdAt, 'MMM d, yyyy HH:mm')}
          </p>
        </div>
        <StatusSelect id={inquiry.id} status={inquiry.status} locale={locale} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-6 items-start">
        <div className="space-y-6">
          <Section title={t('Contact', 'Contacto')}>
            {inquiry.email && (
              <Pair label="Email" value={<a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>} />
            )}
            {inquiry.whatsapp && (
              <Pair
                label="WhatsApp"
                value={
                  <a href={whatsappLink('', inquiry.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {inquiry.whatsapp}
                  </a>
                }
              />
            )}
            <Pair label={t('Language', 'Idioma')} value={guestLocale === 'es' ? 'Español' : 'English'} />
          </Section>

          <Section title={t('Stay', 'Estancia')}>
            <Pair
              label={t('Dates', 'Fechas')}
              value={
                checkInKey && checkOutKey
                  ? `${formatDateKey(checkInKey, locale)} – ${formatDateKey(checkOutKey, locale)} · ${nightsBetween(checkInKey, checkOutKey)} ${t('nights', 'noches')}`
                  : '—'
              }
            />
            <Pair label={t('Guests', 'Huéspedes')} value={inquiry.guests ? String(inquiry.guests) : '—'} />
            {inquiry.estimateTotal && (
              <Pair
                label={t('Estimate they saw', 'Estimado que vieron')}
                value={`${inquiry.estimateCurrency ?? 'USD'} ${Number(inquiry.estimateTotal).toLocaleString('en-US')}`}
              />
            )}
            {inquiry.message && (
              <p className="text-sm text-stone-700 font-light whitespace-pre-wrap leading-relaxed pt-3 border-t border-stone-100 mt-3">
                {inquiry.message}
              </p>
            )}
          </Section>

          <Section title={t(`Houses (${inquiry.propertyIds.length})`, `Casas (${inquiry.propertyIds.length})`)}>
            {houses.length === 0 && missing.length === 0 && (
              <p className="text-sm text-stone-400 font-light italic">{t('No houses yet.', 'Sin casas todavía.')}</p>
            )}
            <ul className="divide-y divide-stone-100">
              {houses.map((h) => {
                const src = h.mainImage ? urlFor(h.mainImage).width(160).height(120).url() : null
                return (
                  <li key={h._id} className="flex items-center gap-4 py-2">
                    <div className="relative w-20 h-[60px] bg-stone-100 shrink-0">
                      {src && <Image src={src} alt="" fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-900 font-light truncate">{propertyTitle(h)}</p>
                      <p className="text-xs text-stone-500 font-light">
                        {[h.propertyCode, h.bedrooms ? `${h.bedrooms} BR` : null, h.areaTitle, h.status !== 'active' ? h.status : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    {h.slug && (
                      <a
                        href={`/property/${h.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900"
                      >
                        {t('View', 'Ver')}
                      </a>
                    )}
                  </li>
                )
              })}
              {missing.map((m) => (
                <li key={m.pid} className="py-2 text-sm text-stone-400 font-light">
                  {m.title} · {t('no longer in Sanity', 'ya no está en Sanity')}
                </li>
              ))}
            </ul>
            {inquiry.collectionId ? (
              <p className="text-xs text-stone-500 font-light pt-2">
                {t(
                  'To add or remove houses now, edit the collection in Sanity.',
                  'Para agregar o quitar casas ahora, edita la colección en Sanity.'
                )}
              </p>
            ) : (
              <HousesEditor id={inquiry.id} properties={propertyOptions} value={inquiry.propertyIds} locale={locale} />
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title={t('Private collection', 'Colección privada')}>
            <CollectionPanel
              id={inquiry.id}
              houseCount={inquiry.propertyIds.length}
              guestName={inquiry.name}
              guestEmail={inquiry.email}
              guestWhatsapp={inquiry.whatsapp}
              guestLocale={guestLocale}
              locale={locale}
              collection={
                url && inquiry.collectionId
                  ? {
                      url,
                      studioUrl: studioEditUrl(inquiry.collectionId, 'collection'),
                      accessCode: inquiry.collectionAccessCode,
                      sentAt: inquiry.collectionSentAt ? format(inquiry.collectionSentAt, 'MMM d, yyyy') : null,
                      sentTo: inquiry.collectionSentTo,
                    }
                  : null
              }
            />
          </Section>

          <Section title={t('Internal notes', 'Notas internas')}>
            <NotesEditor id={inquiry.id} initialValue={inquiry.notes ?? ''} locale={locale} />
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-stone-200 rounded-xs p-6">
      <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light mb-4">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-stone-500 font-light">{label}</span>
      <span className="text-stone-900 font-light text-right">{value}</span>
    </div>
  )
}
