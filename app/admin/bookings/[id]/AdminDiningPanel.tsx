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
}

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: 'Requested',
  IN_PROGRESS: 'In progress',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
}

function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function label(name_en: string | null, name_es: string | null) {
  return name_en || name_es || 'Untitled'
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
}: Props) {
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
            Requested by the guest ({requests.length})
          </p>
          {datedRequests.length > 0 && (
            <button
              type="button"
              onClick={() => setCalendarOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 text-xs font-light text-stone-600 hover:text-stone-900 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {calendarOpen ? 'Hide calendar' : 'Show calendar'}
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
              locale="en"
              checkIn={checkIn}
              checkOut={checkOut}
              undatedCount={undatedCount}
            />
          </div>
        )}

        {requests.length === 0 ? (
          <p className="text-sm text-stone-500 font-light">
            The guest hasn’t requested any menus or plates yet.
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
                      {r.kind.toLowerCase()}
                    </span>
                  </p>
                  {r.plateNames.length > 0 && (
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                      {r.plateNames.join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    {[
                      r.preferredDate ? `for ${fmtDay(r.preferredDate)}` : 'no day chosen',
                      r.partySize ? `${r.partySize} guests` : null,
                      r.requestedBy ? `by ${r.requestedBy}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 whitespace-nowrap">
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. What's currently available to this guest */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-3">
          Available to this guest
        </p>
        {offeredMenus.length === 0 && offeredPlates.length === 0 ? (
          <p className="text-sm text-stone-500 font-light">
            Nothing is offered yet — pick menus and plates below.
          </p>
        ) : (
          <div className="space-y-3">
            {offeredMenus.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 font-light mb-1.5">Menus</p>
                <div className="flex flex-wrap gap-1.5">
                  {offeredMenus.map(({ menu, isDefault }) => (
                    <span
                      key={menu._id}
                      className="inline-flex items-center gap-1.5 text-xs font-light px-2.5 py-1 rounded-full bg-stone-100 text-stone-800"
                    >
                      {label(menu.name_en, menu.name_es)}
                      {isDefault && (
                        <span className="text-[9px] uppercase tracking-wider text-emerald-600">
                          default
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
                <p className="text-xs text-stone-400 font-light mb-1.5">Plates</p>
                <div className="flex flex-wrap gap-1.5">
                  {offeredPlates.map(({ plate, isDefault }) => (
                    <span
                      key={plate._id}
                      className="inline-flex items-center gap-1.5 text-xs font-light px-2.5 py-1 rounded-full bg-stone-100 text-stone-800"
                    >
                      {label(plate.name_en, plate.name_es)}
                      {isDefault && (
                        <span className="text-[9px] uppercase tracking-wider text-emerald-600">
                          default
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
          Edit offering
        </p>
        <DiningOfferingEditor
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

