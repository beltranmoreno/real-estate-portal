import Link from 'next/link'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import type { BookingStatus, Prisma } from '@prisma/client'
import { toLocale, tFor } from '@/lib/i18n'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

interface PageProps {
  searchParams: Promise<{
    status?: string
    sort?: string
    dir?: string
    page?: string
  }>
}

const STATUSES: BookingStatus[] = ['DRAFT', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED']
type SortKey = 'date' | 'property' | 'guest'
const SORT_KEYS: SortKey[] = ['date', 'property', 'guest']
const PAGE_SIZE = 50

export default async function BookingsListPage({ searchParams }: PageProps) {
  const admin = await getCurrentUser()
  const locale = toLocale(admin?.locale)
  const t = tFor(locale)

  const sp = await searchParams
  const filter =
    sp.status && STATUSES.includes(sp.status as BookingStatus)
      ? (sp.status as BookingStatus)
      : null
  const sort: SortKey = SORT_KEYS.includes(sp.sort as SortKey)
    ? (sp.sort as SortKey)
    : 'date'
  const dir: 'asc' | 'desc' = sp.dir === 'desc' ? 'desc' : 'asc'
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  // Build a URL that preserves the current filter + sort, applying overrides.
  const hrefWith = (o: {
    sort?: SortKey
    dir?: 'asc' | 'desc'
    page?: number
  }) => {
    const q = new URLSearchParams()
    if (filter) q.set('status', filter)
    q.set('sort', o.sort ?? sort)
    q.set('dir', o.dir ?? dir)
    const p = o.page ?? page
    if (p > 1) q.set('page', String(p))
    return `/admin/bookings?${q.toString()}`
  }

  const orderBy: Prisma.BookingOrderByWithRelationInput[] =
    sort === 'property'
      ? [{ propertyTitle: dir }]
      : sort === 'guest'
        ? [{ primaryGuest: { firstName: dir } }, { primaryGuest: { lastName: dir } }]
        : [{ checkIn: dir }]

  const where = filter ? { status: filter } : undefined

  const statusLabel = (s: BookingStatus): string => {
    switch (s) {
      case 'DRAFT':
        return t('Draft', 'Borrador')
      case 'PENDING':
        return t('Pending', 'Pendiente')
      case 'CONFIRMED':
        return t('Confirmed', 'Confirmado')
      case 'ACTIVE':
        return t('Active', 'Activo')
      case 'COMPLETED':
        return t('Completed', 'Completado')
      case 'CANCELLED':
        return t('Cancelled', 'Cancelado')
      default:
        return s
    }
  }

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        primaryGuest: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { requests: true, documents: true } },
      },
    }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
            {t('Bookings', 'Reservas')}
          </p>
          <h1 className="text-3xl font-light text-stone-900 tracking-tight">
            {t('All bookings', 'Todas las reservas')}
          </h1>
        </div>
        <Link
          href="/admin/bookings/new"
          className="inline-flex items-center px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
        >
          {t('+ New booking', '+ Nueva reserva')}
        </Link>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill label={t('All', 'Todas')} href="/admin/bookings" active={!filter} />
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            label={statusLabel(s)}
            href={`/admin/bookings?status=${s}`}
            active={filter === s}
          />
        ))}
      </div>

      {/* List */}
      {bookings.length === 0 ? (
        <div className="bg-white border border-stone-200 p-12 text-center">
          <p className="text-stone-500 font-light">{t('No bookings to show.', 'No hay reservas para mostrar.')}</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <SortableTh
                  label={t('Guest', 'Huésped')}
                  colKey="guest"
                  sort={sort}
                  dir={dir}
                  hrefWith={hrefWith}
                />
                <SortableTh
                  label={t('Property', 'Propiedad')}
                  colKey="property"
                  sort={sort}
                  dir={dir}
                  hrefWith={hrefWith}
                />
                <SortableTh
                  label={t('Dates', 'Fechas')}
                  colKey="date"
                  sort={sort}
                  dir={dir}
                  hrefWith={hrefWith}
                />
                <Th>{t('Status', 'Estado')}</Th>
                <Th>{t('Pending', 'Pendiente')}</Th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                >
                  <Td>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-stone-900 hover:underline"
                    >
                      {b.primaryGuest.firstName ?? ''}{' '}
                      {b.primaryGuest.lastName ?? ''}
                      <br />
                      <span className="text-xs text-stone-500 font-light">
                        {b.primaryGuest.email}
                      </span>
                    </Link>
                  </Td>
                  <Td>{b.propertyTitle}</Td>
                  <Td>
                    {format(b.checkIn, 'MMM d')} – {format(b.checkOut, 'MMM d, yyyy')}
                  </Td>
                  <Td>
                    <span className="text-xs uppercase tracking-wider text-stone-500">
                      {statusLabel(b.status)}
                    </span>
                  </Td>
                  <Td>
                    {b._count.requests > 0 ? (
                      <span className="text-stone-700">
                        {b._count.requests}{' '}
                        {b._count.requests === 1
                          ? t('request', 'solicitud')
                          : t('requests', 'solicitudes')}
                      </span>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm font-light text-stone-600">
          <span>
            {t(
              `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`,
              `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} de ${total}`
            )}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={hrefWith({ page: page - 1 })}
                className="px-3 py-1.5 border border-stone-300 rounded-sm hover:bg-stone-100"
              >
                ← {t('Previous', 'Anterior')}
              </Link>
            ) : (
              <span className="px-3 py-1.5 border border-stone-200 rounded-sm text-stone-300">
                ← {t('Previous', 'Anterior')}
              </span>
            )}
            <span className="text-stone-500">
              {t(`Page ${page} of ${totalPages}`, `Página ${page} de ${totalPages}`)}
            </span>
            {page < totalPages ? (
              <Link
                href={hrefWith({ page: page + 1 })}
                className="px-3 py-1.5 border border-stone-300 rounded-sm hover:bg-stone-100"
              >
                {t('Next', 'Siguiente')} →
              </Link>
            ) : (
              <span className="px-3 py-1.5 border border-stone-200 rounded-sm text-stone-300">
                {t('Next', 'Siguiente')} →
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SortableTh({
  label,
  colKey,
  sort,
  dir,
  hrefWith,
}: {
  label: string
  colKey: SortKey
  sort: SortKey
  dir: 'asc' | 'desc'
  hrefWith: (o: { sort?: SortKey; dir?: 'asc' | 'desc'; page?: number }) => string
}) {
  const active = sort === colKey
  const nextDir: 'asc' | 'desc' = active && dir === 'asc' ? 'desc' : 'asc'
  return (
    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone-500 font-light">
      <Link
        href={hrefWith({ sort: colKey, dir: nextDir, page: 1 })}
        className="inline-flex items-center gap-1 hover:text-stone-900"
      >
        {label}
        <span className={active ? 'text-stone-800' : 'text-stone-300'}>
          {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </Link>
    </th>
  )
}

function FilterPill({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs font-light tracking-wide rounded-sm border transition-colors ${
        active
          ? 'bg-stone-800 text-white border-stone-800'
          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
      }`}
    >
      {label}
    </Link>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-stone-500 font-light">
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 font-light text-stone-700">{children}</td>
}
