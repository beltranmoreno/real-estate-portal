'use client'

import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { DiningCalendar } from '@/components/portal/DiningCalendar'
import {
  MenuPreviewButton,
  PlatePreviewButton,
} from '@/components/portal/DiningPreview'
import { DiningOfferingEditor } from './DiningOfferingEditor'
import type { PortalMenu } from '@/lib/portal/presetMenus'
import type { PortalPlate } from '@/lib/portal/presetPlates'
import { tFor } from '@/lib/i18n'

export interface AdminDiningRequest {
  id: string
  kind: 'MENU' | 'PLATE'
  serviceName: string
  menuName: string | null
  plateNames: string[]
  preferredDate: string | null
  partySize: number | null
  status: string
  createdAt: string
  requestedBy: string | null
}

interface Props {
  bookingId: string
  allMenus: PortalMenu[]
  allPlates: PortalPlate[]
  offeredMenuIds: string[]
  offeredPlateIds: string[]
  defaultMenuIds: string[]
  defaultPlateIds: string[]
  requests: AdminDiningRequest[]
  checkIn: string
  checkOut: string
  locale?: 'en' | 'es'
}

const STATUS_LABEL: Record<string, [string, string]> = {
  REQUESTED: ['Requested', 'Solicitado'],
  IN_PROGRESS: ['In progress', 'En proceso'],
  CONFIRMED: ['Confirmed', 'Confirmado'],
  COMPLETED: ['Completed', 'Completado'],
  DECLINED: ['Declined', 'Rechazado'],
  CANCELLED: ['Cancelled', 'Cancelado'],
}

function fmtDay(iso: string, locale: 'en' | 'es'): string {
  return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function label(
  name_en: string | null,
  name_es: string | null,
  locale: 'en' | 'es'
) {
  return name_en || name_es || (locale === 'es' ? 'Sin título' : 'Untitled')
}

export function AdminDiningPanel({
  bookingId,
  allMenus,
  allPlates,
  offeredMenuIds,
  offeredPlateIds,
  defaultMenuIds,
  defaultPlateIds,
  requests,
  checkIn,
  checkOut,
  locale = 'en',
}: Props) {
  const t = tFor(locale)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Coerce — legacy bookings can carry null array columns.
  const menuAdds = Array.isArray(offeredMenuIds) ? offeredMenuIds : []
  const plateAdds = Array.isArray(offeredPlateIds) ? offeredPlateIds : []
  const menuDefaults = Array.isArray(defaultMenuIds) ? defaultMenuIds : []
  const plateDefaults = Array.isArray(defaultPlateIds) ? defaultPlateIds : []

  // What the guest actually sees = the booking's allow-list only.
  const offeredMenus = useMemo(() => {
    const ids = new Set(menuAdds)
    return allMenus
      .filter((m) => ids.has(m._id))
      .map((m) => ({ menu: m, isDefault: menuDefaults.includes(m._id) }))
  }, [allMenus, menuDefaults, menuAdds])

  const offeredPlates = useMemo(() => {
    const ids = new Set(plateAdds)
    return allPlates
      .filter((p) => ids.has(p._id))
      .map((p) => ({ plate: p, isDefault: plateDefaults.includes(p._id) }))
  }, [allPlates, plateDefaults, plateAdds])

  const datedRequests = requests.filter((r) => r.preferredDate)
  const undatedCount = requests.length - datedRequests.length

  return (
    <div className="space-y-8">
      {/* 1. What the guest has requested */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light">
            {t('Requested by the guest', 'Solicitado por el huésped')} ({requests.length})
          </p>
          {datedRequests.length > 0 && (
            <button
              type="button"
              onClick={() => setCalendarOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 text-xs font-light text-stone-600 hover:text-stone-900 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {calendarOpen ? t('Hide calendar', 'Ocultar calendario') : t('Show calendar', 'Mostrar calendario')}
            </button>
          )}
        </div>

        {calendarOpen && datedRequests.length > 0 && (
          <div className="mb-4">
            <DiningCalendar
              events={datedRequests.map((r) => ({
                id: r.id,
                label: r.kind === 'PLATE' ? r.serviceName : r.menuName || r.serviceName,
                dateISO: r.preferredDate as string,
              }))}
              locale={locale}
              checkIn={checkIn}
              checkOut={checkOut}
              undatedCount={undatedCount}
            />
          </div>
        )}

        {requests.length === 0 ? (
          <p className="text-sm text-stone-500 font-light">
            {t('The guest hasn’t requested any menus or plates yet.', 'El huésped aún no ha solicitado ningún menú o plato.')}
          </p>
        ) : (
          <ul className="border-t border-stone-200">
            {requests.map((r) => (
              <li
                key={r.id}
                className="py-3 border-b border-stone-200 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-light text-stone-900">
                    {r.kind === 'PLATE' ? r.serviceName : r.menuName || r.serviceName}
                    <span className="ml-2 text-[10px] uppercase tracking-wider bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-sm">
                      {r.kind === 'PLATE' ? t('plate', 'plato') : t('menu', 'menú')}
                    </span>
                  </p>
                  {r.plateNames.length > 0 && (
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                      {r.plateNames.join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    {[
                      r.preferredDate
                        ? t(`for ${fmtDay(r.preferredDate, locale)}`, `para el ${fmtDay(r.preferredDate, locale)}`)
                        : t('no day chosen', 'sin día elegido'),
                      r.partySize ? t(`${r.partySize} guests`, `${r.partySize} huéspedes`) : null,
                      r.requestedBy ? t(`by ${r.requestedBy}`, `por ${r.requestedBy}`) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 whitespace-nowrap">
                  {STATUS_LABEL[r.status]
                    ? t(STATUS_LABEL[r.status][0], STATUS_LABEL[r.status][1])
                    : r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. What's currently available to this guest */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-3">
          {t('Available to this guest', 'Disponible para este huésped')}
        </p>
        {offeredMenus.length === 0 && offeredPlates.length === 0 ? (
          <p className="text-sm text-stone-500 font-light">
            {t('Nothing is offered yet — pick menus and plates below.', 'Aún no se ofrece nada; elige menús y platos a continuación.')}
          </p>
        ) : (
          <div className="space-y-3">
            {offeredMenus.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 font-light mb-1.5">{t('Menus', 'Menús')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {offeredMenus.map(({ menu, isDefault }) => (
                    <span
                      key={menu._id}
                      className="inline-flex items-center gap-1.5 text-xs font-light px-2.5 py-1 rounded-full bg-stone-100 text-stone-800"
                    >
                      {label(menu.name_en, menu.name_es, locale)}
                      {isDefault && (
                        <span className="text-[9px] uppercase tracking-wider text-emerald-600">
                          {t('default', 'predeterminado')}
                        </span>
                      )}
                      <MenuPreviewButton menu={menu} />
                    </span>
                  ))}
                </div>
              </div>
            )}
            {offeredPlates.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 font-light mb-1.5">{t('Plates', 'Platos')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {offeredPlates.map(({ plate, isDefault }) => (
                    <span
                      key={plate._id}
                      className="inline-flex items-center gap-1.5 text-xs font-light px-2.5 py-1 rounded-full bg-stone-100 text-stone-800"
                    >
                      {label(plate.name_en, plate.name_es, locale)}
                      {isDefault && (
                        <span className="text-[9px] uppercase tracking-wider text-emerald-600">
                          {t('default', 'predeterminado')}
                        </span>
                      )}
                      <PlatePreviewButton plate={plate} />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Change the offering */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-3">
          {t('Edit offering', 'Editar oferta')}
        </p>
        <DiningOfferingEditor
          locale={locale}
          bookingId={bookingId}
          allMenus={allMenus}
          allPlates={allPlates}
          initialMenuIds={menuAdds}
          initialPlateIds={plateAdds}
          defaultMenuIds={menuDefaults}
          defaultPlateIds={plateDefaults}
        />
      </div>
    </div>
  )
}

