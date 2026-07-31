'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MenuPreviewButton,
  PlatePreviewButton,
} from '@/components/portal/DiningPreview'
import type { PortalMenu } from '@/lib/portal/presetMenus'
import type { PortalPlate } from '@/lib/portal/presetPlates'

interface Props {
  bookingId: string
  allMenus: PortalMenu[]
  allPlates: PortalPlate[]
  /** Ids the admin has already added for this booking. */
  initialMenuIds: string[]
  initialPlateIds: string[]
  /** Property defaults — always available, shown checked + locked. */
  defaultMenuIds: string[]
  defaultPlateIds: string[]
}

/**
 * Admin picker for a booking's dining offering. Property defaults are shown
 * locked-on (they're always available); everything else the admin toggles is
 * saved as an *addition* for this booking only.
 */
export function DiningOfferingEditor({
  bookingId,
  allMenus,
  allPlates,
  initialMenuIds,
  initialPlateIds,
  defaultMenuIds,
  defaultPlateIds,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [menuIds, setMenuIds] = useState<Set<string>>(
    new Set(Array.isArray(initialMenuIds) ? initialMenuIds : [])
  )
  const [plateIds, setPlateIds] = useState<Set<string>>(
    new Set(Array.isArray(initialPlateIds) ? initialPlateIds : [])
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultMenus = useMemo(
    () => new Set(Array.isArray(defaultMenuIds) ? defaultMenuIds : []),
    [defaultMenuIds]
  )
  const defaultPlates = useMemo(
    () => new Set(Array.isArray(defaultPlateIds) ? defaultPlateIds : []),
    [defaultPlateIds]
  )

  const label = (name_en: string | null, name_es: string | null) =>
    name_en || name_es || 'Untitled'

  const match = (name_en: string | null, name_es: string | null) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [name_en, name_es].filter(Boolean).join(' ').toLowerCase().includes(q)
  }

  const visibleMenus = allMenus.filter((m) => match(m.name_en, m.name_es))
  const visiblePlates = allPlates.filter((p) => match(p.name_en, p.name_es))

  const toggle = (
    id: string,
    set: Set<string>,
    setter: (s: Set<string>) => void
  ) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setter(next)
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/bookings/${bookingId}/dining-offering`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offeredMenuSanityIds: Array.from(menuIds),
            offeredPlateSanityIds: Array.from(plateIds),
          }),
        }
      )
      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p?.error || 'Save failed')
      }
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const menuCount = menuIds.size
  const plateCount = plateIds.size

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600 font-light">
        Choose which chef menus and à-la-carte plates this guest can request.
        Only what you turn on here is available to them. Items tagged
        “default” come from the property and were pre-selected — untick any you
        don’t want offered for this booking.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search menus & plates…"
        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <PickerColumn
          title="Chef menus"
          empty="No menus in the catalog yet."
          items={visibleMenus.map((m) => ({
            id: m._id,
            label: label(m.name_en, m.name_es),
            group: m.mealType ?? null,
            isDefault: defaultMenus.has(m._id),
            checked: menuIds.has(m._id),
            preview: <MenuPreviewButton menu={m} />,
          }))}
          onToggle={(id) => toggle(id, menuIds, setMenuIds)}
        />
        <PickerColumn
          title="À-la-carte plates"
          empty="No plates in the catalog yet."
          items={visiblePlates.map((p) => ({
            id: p._id,
            label: label(p.name_en, p.name_es),
            group: p.courseType || p.mealType || null,
            isDefault: defaultPlates.has(p._id),
            checked: plateIds.has(p._id),
            preview: <PlatePreviewButton plate={p} />,
          }))}
          onToggle={(id) => toggle(id, plateIds, setPlateIds)}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save offering'}
        </button>
        <span className="text-xs text-stone-500 font-light">
          {menuCount} menu{menuCount === 1 ? '' : 's'} · {plateCount}{' '}
          plate{plateCount === 1 ? '' : 's'} offered
        </span>
        {saved && <span className="text-xs text-emerald-700 font-light">Saved ✓</span>}
        {error && <span className="text-xs text-red-600 font-light">{error}</span>}
      </div>
    </div>
  )
}

function PickerColumn({
  title,
  empty,
  items,
  onToggle,
}: {
  title: string
  empty: string
  items: {
    id: string
    label: string
    group: string | null
    isDefault: boolean
    checked: boolean
    preview?: React.ReactNode
  }[]
  onToggle: (id: string) => void
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-2">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-stone-400 font-light">{empty}</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto border border-stone-200 rounded-sm divide-y divide-stone-100">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-2 px-3 py-2 text-sm font-light hover:bg-stone-50"
            >
              {/* label wraps only the toggle target so the preview button
                  doesn't flip the checkbox */}
              <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={it.checked}
                  onChange={() => onToggle(it.id)}
                  className="accent-stone-800"
                />
                <span className="min-w-0 flex-1 truncate text-stone-800">
                  {it.label}
                </span>
                {it.group && (
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 whitespace-nowrap">
                    {it.group}
                  </span>
                )}
                {it.isDefault && (
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 whitespace-nowrap">
                    default
                  </span>
                )}
              </label>
              {it.preview && <span className="shrink-0">{it.preview}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
