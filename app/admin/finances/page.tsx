import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireRoleOneOf } from '@/lib/auth/requireRole'
import { tFor, toLocale } from '@/lib/i18n'
import { todayInDR } from '@/lib/dates'
import {
  MOVEMENT_TYPES,
  RANGES,
  buildMovements,
  guestName,
  rangeBounds,
  totalsByCurrency,
  type CurrencyTotals,
  type Movement,
  type MovementType,
  type RangeKey,
} from '@/lib/admin/moneyLedger'
import { MoneyFilters } from './MoneyFilters'
import { movementLabel } from './labels'

interface PageProps {
  searchParams: Promise<{
    range?: string
    from?: string
    to?: string
    guest?: string
    booking?: string
    type?: string
  }>
}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const MAX_ROWS = 500
const DEFAULT_RANGE: RangeKey = '1m'

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

/**
 * Every money movement across bookings — stays booked, payments, extras,
 * services, commission paid, deposits returned — with totals. ADMIN only
 * (not agents or staff): it shows Leticia's earnings across all stays.
 */
export default async function FinancesPage({ searchParams }: PageProps) {
  // Own check, not just the layout's: a client-side navigation can render
  // this page without re-running the layout.
  const admin = await requireRoleOneOf(['ADMIN'])
  const locale = toLocale(admin.locale)
  const t = tFor(locale)
  const sp = await searchParams

  // Dates: a custom from/to wins over the quick range.
  const customFrom = sp.from && DATE.test(sp.from) ? sp.from : null
  const customTo = sp.to && DATE.test(sp.to) ? sp.to : null
  const custom = Boolean(customFrom || customTo)
  const range: RangeKey | null = custom
    ? null
    : RANGES.includes(sp.range as RangeKey)
      ? (sp.range as RangeKey)
      : DEFAULT_RANGE
  const bounds = range ? rangeBounds(range, todayInDR()) : { from: customFrom, to: customTo }
  const type = MOVEMENT_TYPES.includes(sp.type as MovementType) ? (sp.type as MovementType) : null

  // Options for the guest and booking pickers: every booking.
  const allBookings = await prisma.booking.findMany({
    select: {
      id: true,
      propertyTitle: true,
      checkIn: true,
      checkOut: true,
      status: true,
      primaryGuest: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { checkIn: 'desc' },
  })
  const guestId = sp.guest && allBookings.some((b) => b.primaryGuest.id === sp.guest) ? sp.guest : null
  const bookingId =
    sp.booking && allBookings.some((b) => b.id === sp.booking && (!guestId || b.primaryGuest.id === guestId))
      ? sp.booking
      : null

  const bookings = await prisma.booking.findMany({
    where: {
      ...(guestId ? { primaryGuestUserId: guestId } : {}),
      ...(bookingId ? { id: bookingId } : {}),
    },
    select: {
      id: true,
      propertyTitle: true,
      status: true,
      checkIn: true,
      checkOut: true,
      createdAt: true,
      totalAmount: true,
      currency: true,
      commissionPercent: true,
      commissionAmount: true,
      commissionPaid: true,
      commissionPaidOn: true,
      securityDeposit: true,
      depositReturned: true,
      depositReturnedOn: true,
      primaryGuest: { select: { id: true, firstName: true, lastName: true, email: true } },
      charges: {
        select: { id: true, category: true, description: true, amount: true, cost: true, currency: true, incurredOn: true, createdAt: true },
      },
      payments: {
        select: { id: true, kind: true, amount: true, currency: true, receivedOn: true, received: true, method: true, note: true, createdAt: true },
      },
      serviceRequests: {
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] }, quotedAmount: { not: null } },
        select: { id: true, serviceName: true, status: true, quotedAmount: true, vendorCost: true, currency: true, confirmedAt: true, createdAt: true },
      },
    },
  })

  const inPeriod = buildMovements(bookings).filter(
    (m) => (!bounds.from || m.date >= bounds.from) && (!bounds.to || m.date <= bounds.to)
  )
  const totals = totalsByCurrency(inPeriod)
  const counts = Object.fromEntries(MOVEMENT_TYPES.map((k) => [k, inPeriod.filter((m) => m.type === k).length])) as Record<MovementType, number>
  const shown = type ? inPeriod.filter((m) => m.type === type) : inPeriod
  const rows = shown.slice(0, MAX_ROWS)

  // Guests for the picker, once each, by name.
  const guests = [...new Map(allBookings.map((b) => [b.primaryGuest.id, b.primaryGuest])).values()]
    .map((g) => ({ id: g.id, name: guestName(g) }))
    .sort((a, b) => a.name.localeCompare(b.name))
  const bookingOptions = allBookings
    .filter((b) => !guestId || b.primaryGuest.id === guestId)
    .map((b) => ({
      id: b.id,
      guestId: b.primaryGuest.id,
      label: `${b.propertyTitle} · ${guestName(b.primaryGuest)} · ${b.checkIn.toISOString().slice(0, 10)}${b.status === 'CANCELLED' ? ` (${t('cancelled', 'cancelada')})` : ''}`,
    }))

  const params = {
    range: range ?? '',
    from: customFrom ?? '',
    to: customTo ?? '',
    guest: guestId ?? '',
    booking: bookingId ?? '',
    type: type ?? '',
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2">{t('Finances', 'Finanzas')}</p>
        <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
          {t('Every movement', 'Todos los movimientos')}
        </h1>
        <p className="text-sm text-stone-600 font-light mt-1 max-w-2xl">
          {t(
            'Stays booked, payments, extras, services, commission paid and deposits returned, across every booking. USD and DOP are kept apart, never converted.',
            'Estadías reservadas, pagos, extras, servicios, comisiones cobradas y depósitos devueltos, de todas las reservas. USD y DOP se muestran por separado, sin convertir.'
          )}
        </p>
      </div>

      <MoneyFilters
        locale={locale}
        params={params}
        guests={guests}
        bookings={bookingOptions}
        counts={counts}
        total={inPeriod.length}
        defaultRange={DEFAULT_RANGE}
      />

      <SummaryCards totals={totals} t={t} />

      {rows.length === 0 ? (
        <p className="mt-8 border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500 font-light">
          {t('No money movements in this period.', 'No hay movimientos en este período.')}
        </p>
      ) : (
        <>
          {/* Phones: one card per movement */}
          <ul className="mt-8 md:hidden divide-y divide-stone-200 border-y border-stone-200 bg-white">
            {rows.map((m) => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <TypeBadge m={m} locale={locale} />
                    <p className="text-sm text-stone-900 mt-1 truncate">
                      <Link href={`/admin/bookings/${m.bookingId}`} className="hover:underline">{m.propertyTitle}</Link>
                    </p>
                    <p className="text-xs text-stone-500 font-light truncate">
                      {m.guestName} · {formatDay(m.date, locale)}
                    </p>
                    {m.description && <p className="text-xs text-stone-500 font-light mt-0.5 line-clamp-2">{m.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <Amount m={m} />
                    <Earning m={m} t={t} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Tablet and up: a table */}
          <div className="mt-8 hidden md:block bg-white border border-stone-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-stone-500 border-b border-stone-200">
                  <th className="px-4 py-3 font-normal">{t('Date', 'Fecha')}</th>
                  <th className="px-4 py-3 font-normal">{t('Movement', 'Movimiento')}</th>
                  <th className="px-4 py-3 font-normal">{t('Booking', 'Reserva')}</th>
                  <th className="px-4 py-3 font-normal text-right">{t('Amount', 'Monto')}</th>
                  <th className="px-4 py-3 font-normal text-right">{t('Earnings', 'Ganancia')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((m) => (
                  <tr key={m.id} className="align-top hover:bg-stone-50/60">
                    <td className="px-4 py-3 whitespace-nowrap font-light text-stone-700">{formatDay(m.date, locale)}</td>
                    <td className="px-4 py-3 min-w-0">
                      <TypeBadge m={m} locale={locale} />
                      {m.description && <p className="text-xs text-stone-500 font-light mt-1 max-w-xs">{m.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/bookings/${m.bookingId}`} className="text-stone-900 hover:underline">{m.propertyTitle}</Link>
                      <p className="text-xs text-stone-500 font-light">{m.guestName}</p>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap"><Amount m={m} /></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap"><Earning m={m} t={t} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {shown.length > rows.length && (
            <p className="mt-3 text-xs text-stone-500 font-light">
              {t(
                `Showing the newest ${rows.length} of ${shown.length}. Narrow the dates, guest or booking to see the rest. The totals above include everything.`,
                `Se muestran los ${rows.length} más recientes de ${shown.length}. Acota las fechas, el huésped o la reserva para ver el resto. Los totales de arriba lo incluyen todo.`
              )}
            </p>
          )}
        </>
      )}
    </div>
  )
}

function formatDay(key: string, locale: 'en' | 'es') {
  const [y, m, d] = key.split('-').map(Number)
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

const TONE: Record<MovementType, string> = {
  stay: 'bg-stone-900 text-white',
  payment: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  expected: 'bg-amber-50 text-amber-800 border border-amber-200',
  settled: 'bg-stone-100 text-stone-700 border border-stone-200',
  extra: 'bg-white text-stone-700 border border-stone-300',
  service: 'bg-white text-stone-700 border border-stone-300',
  commission: 'bg-sky-50 text-sky-800 border border-sky-200',
  deposit: 'bg-rose-50 text-rose-800 border border-rose-200',
}

function TypeBadge({ m, locale }: { m: Movement; locale: 'en' | 'es' }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] rounded-xs ${TONE[m.type]}`}>
        {movementLabel(m.type, locale)}
      </span>
      {m.cancelled && (
        <span className="text-[10px] uppercase tracking-[0.12em] text-red-700">
          {locale === 'es' ? 'Cancelada' : 'Cancelled'}
        </span>
      )}
    </span>
  )
}

function Amount({ m }: { m: Movement }) {
  const c = m.currency
  if (m.type === 'payment') return <span className="text-emerald-700">+ {money(m.received, c)}</span>
  if (m.type === 'expected') return <span className="text-amber-700">{money(m.expected, c)}</span>
  if (m.type === 'settled') return <span className="text-stone-700">{money(m.settled, c)}</span>
  if (m.type === 'deposit') return <span className="text-rose-700">− {money(m.out, c)}</span>
  if (m.type === 'commission') return <span className="text-sky-800">{money(m.commissionPaid, c)}</span>
  return <span className={m.cancelled ? 'text-stone-400 line-through' : 'text-stone-900'}>{money(m.billed, c)}</span>
}

function Earning({ m, t }: { m: Movement; t: (en: string, es: string) => string }) {
  if (m.type !== 'stay' && m.type !== 'extra' && m.type !== 'service') return <span className="text-stone-300">—</span>
  if (m.earning === null) {
    return (
      <span className="block text-xs text-stone-400 font-light italic">
        {m.type === 'stay' ? t('no commission set', 'sin comisión') : t('no cost entered', 'sin costo')}
      </span>
    )
  }
  return <span className="block text-xs sm:text-sm text-stone-600">{money(m.earning, m.currency)}</span>
}

function SummaryCards({ totals, t }: { totals: CurrencyTotals[]; t: (en: string, es: string) => string }) {
  const list = totals.length ? totals : [{ currency: 'USD', billed: 0, received: 0, expected: 0, settled: 0, out: 0, earnings: 0, commissionPaid: 0, missingCosts: 0 }]
  const cards: { label: string; value: (c: CurrencyTotals) => number; note?: (c: CurrencyTotals) => string | null; strong?: boolean }[] = [
    {
      label: t('Received', 'Recibido'),
      value: (c) => c.received,
      note: (c) => (c.settled ? `${t('+ settled outside', '+ saldado por fuera')} ${money(c.settled, c.currency)}` : null),
    },
    {
      label: t('Billed to guests', 'Facturado a huéspedes'),
      value: (c) => c.billed,
      note: () => t('Stays, extras and services', 'Estadías, extras y servicios'),
    },
    {
      label: t('Your earnings', 'Tus ganancias'),
      value: (c) => c.earnings,
      strong: true,
      note: (c) =>
        c.missingCosts
          ? t(`${c.missingCosts} line(s) without a cost not counted`, `${c.missingCosts} línea(s) sin costo no contadas`)
          : c.commissionPaid
            ? `${t('Commission paid', 'Comisión cobrada')} ${money(c.commissionPaid, c.currency)}`
            : null,
    },
    {
      label: t('Expected', 'Esperado'),
      value: (c) => c.expected,
      note: (c) => (c.out ? `${t('Deposits returned', 'Depósitos devueltos')} ${money(c.out, c.currency)}` : t('Logged, not received yet', 'Registrado, aún no recibido')),
    },
  ]

  return (
    <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`border p-4 ${card.strong ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200'}`}>
          <p className={`text-[10px] sm:text-[11px] uppercase tracking-[0.18em] ${card.strong ? 'text-stone-300' : 'text-stone-500'}`}>{card.label}</p>
          {list.map((c, i) => (
            <div key={c.currency} className={i > 0 ? 'mt-2 pt-2 border-t border-current/10' : 'mt-2'}>
              <p className={`${i === 0 ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'} font-light tabular-nums break-words`}>
                {money(card.value(c), c.currency)}
              </p>
              {card.note?.(c) && (
                <p className={`text-[11px] font-light mt-0.5 ${card.strong ? 'text-stone-300' : 'text-stone-500'}`}>{card.note(c)}</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
