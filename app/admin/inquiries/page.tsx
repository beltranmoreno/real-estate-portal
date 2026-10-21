import Link from 'next/link'
import { format } from 'date-fns'
import type { InquiryStatus } from '@prisma/client'
import { prisma } from '@/lib/db'
import { toLocale, tFor } from '@/lib/i18n'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { formatDateKey, dbDateKey } from '@/lib/dates'
import { INQUIRY_STATUSES, inquirySourceLabel, inquiryStatusLabel } from './labels'

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

const PAGE_SIZE = 50

export default async function InquiriesListPage({ searchParams }: PageProps) {
  const admin = await getCurrentUser()
  const locale = toLocale(admin?.locale)
  const t = tFor(locale)

  const sp = await searchParams
  const filter = INQUIRY_STATUSES.includes(sp.status as InquiryStatus) ? (sp.status as InquiryStatus) : null
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const where = filter ? { status: filter } : undefined

  const [total, inquiries, newCount] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.inquiry.count({ where: { status: 'NEW' } }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageHref = (p: number) => `/admin/inquiries?${new URLSearchParams({ ...(filter ? { status: filter } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">{t('Inquiries', 'Consultas')}</p>
          <h1 className="text-3xl font-light text-stone-900 tracking-tight">
            {newCount > 0
              ? t(`${newCount} new ${newCount === 1 ? 'inquiry' : 'inquiries'}`, `${newCount} ${newCount === 1 ? 'consulta nueva' : 'consultas nuevas'}`)
              : t('All inquiries', 'Todas las consultas')}
          </h1>
        </div>
        <Link
          href="/admin/inquiries/new"
          className="inline-flex items-center px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
        >
          {t('+ New inquiry', '+ Nueva consulta')}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill label={t('All', 'Todas')} href="/admin/inquiries" active={!filter} />
        {INQUIRY_STATUSES.map((s) => (
          <FilterPill key={s} label={inquiryStatusLabel(t, s)} href={`/admin/inquiries?status=${s}`} active={filter === s} />
        ))}
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white border border-stone-200 p-12 text-center">
          <p className="text-stone-500 font-light">{t('No inquiries to show.', 'No hay consultas para mostrar.')}</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <Th>{t('Guest', 'Huésped')}</Th>
                <Th>{t('Houses', 'Casas')}</Th>
                <Th>{t('Stay', 'Estancia')}</Th>
                <Th>{t('Source', 'Origen')}</Th>
                <Th>{t('Status', 'Estado')}</Th>
                <Th>{t('Received', 'Recibida')}</Th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((q) => (
                <tr key={q.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                  <Td>
                    <Link href={`/admin/inquiries/${q.id}`} className="text-stone-900 hover:underline">
                      {q.status === 'NEW' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 align-middle" />}
                      {q.name}
                      <br />
                      <span className="text-xs text-stone-500 font-light">{[q.email, q.whatsapp].filter(Boolean).join(' · ')}</span>
                    </Link>
                  </Td>
                  <Td>
                    {q.propertyTitles.length === 0 ? (
                      <span className="text-stone-300">—</span>
                    ) : (
                      <>
                        {q.propertyTitles[0]}
                        {q.propertyTitles.length > 1 && (
                          <span className="text-stone-500"> {t(`+${q.propertyTitles.length - 1} more`, `+${q.propertyTitles.length - 1} más`)}</span>
                        )}
                      </>
                    )}
                  </Td>
                  <Td>
                    {q.checkIn && q.checkOut ? (
                      <>
                        {formatDateKey(dbDateKey(q.checkIn), locale, { month: 'short', day: 'numeric' })} –{' '}
                        {formatDateKey(dbDateKey(q.checkOut), locale)}
                        {q.guests ? <span className="text-stone-500"> · {q.guests}</span> : null}
                      </>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </Td>
                  <Td>
                    <span className="text-stone-600">{inquirySourceLabel(t, q.source, q.channel)}</span>
                  </Td>
                  <Td>
                    <span className="text-xs uppercase tracking-wider text-stone-500">{inquiryStatusLabel(t, q.status)}</span>
                  </Td>
                  <Td>
                    <span className="text-stone-600">{format(q.createdAt, 'MMM d, HH:mm')}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-sm font-light text-stone-600">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="px-3 py-1.5 border border-stone-300 rounded-sm hover:bg-stone-100">
              ← {t('Previous', 'Anterior')}
            </Link>
          )}
          <span className="text-stone-500">{t(`Page ${page} of ${totalPages}`, `Página ${page} de ${totalPages}`)}</span>
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="px-3 py-1.5 border border-stone-300 rounded-sm hover:bg-stone-100">
              {t('Next', 'Siguiente')} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs font-light tracking-wide rounded-sm border transition-colors ${
        active ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
      }`}
    >
      {label}
    </Link>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.15em] text-stone-500 font-light">{children}</th>
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 font-light text-stone-700 align-top">{children}</td>
}
