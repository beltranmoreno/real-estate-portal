'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CATEGORY_LABELS,
  type ConciergeServiceOption,
} from '@/lib/portal/conciergeServices.types'

interface Props {
  bookingId: string
  allServices: ConciergeServiceOption[]
  initialServiceIds: string[]
  initialOfferGroceries: boolean
}

/**
 * Admin allow-list for concierge services. The guest can only request a
 * service that's ticked here — nothing is available by default. Grouped by
 * category with a search box; saves independently of the dining picker.
 */
export function ServiceOfferingEditor({
  bookingId,
  allServices,
  initialServiceIds,
  initialOfferGroceries,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [ids, setIds] = useState<Set<string>>(
    new Set(Array.isArray(initialServiceIds) ? initialServiceIds : [])
  )
  const [groceries, setGroceries] = useState(!!initialOfferGroceries)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = (s: ConciergeServiceOption) =>
    s.name_en || s.name_es || s.slug || 'Untitled'

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? allServices.filter((s) =>
          [s.name_en, s.name_es, s.shortDescription_en, s.shortDescription_es]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(q)
        )
      : allServices
    const groups = new Map<string, ConciergeServiceOption[]>()
    for (const s of filtered) {
      const key = s.category || 'other'
      const arr = groups.get(key) ?? []
      arr.push(s)
      groups.set(key, arr)
    }
    return groups
  }, [allServices, search])

  const toggle = (id: string) =>
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setSaved(false)
      return next
    })

  const setAll = (on: boolean) => {
    setIds(on ? new Set(allServices.map((s) => s._id)) : new Set())
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
          offeredServiceSanityIds: Array.from(ids),
          offerGroceries: groceries,
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

  return (
    <div className="space-y-3 mb-6 pb-6 border-b border-stone-200">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light">
          Available to the guest ({ids.size})
        </p>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setAll(true)}
            className="text-stone-500 hover:text-stone-900 underline underline-offset-2"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setAll(false)}
            className="text-stone-500 hover:text-stone-900 underline underline-offset-2"
          >
            None
          </button>
        </div>
      </div>

      <p className="text-sm text-stone-600 font-light">
        Turn on the concierge services this guest can request. If nothing is on,
        the guest sees no services to request.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search services…"
        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
      />

      {allServices.length === 0 ? (
        <p className="text-sm text-stone-400 font-light">
          No active concierge services in the catalog.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto border border-stone-200 rounded-sm divide-y divide-stone-100">
          {Array.from(visible.entries()).map(([category, list]) => (
            <div key={category}>
              <p className="px-3 py-1.5 bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500 font-light sticky top-0">
                {CATEGORY_LABELS[category]?.en || category}
              </p>
              {list.map((s) => (
                <label
                  key={s._id}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-light cursor-pointer hover:bg-stone-50"
                >
                  <input
                    type="checkbox"
                    checked={ids.has(s._id)}
                    onChange={() => toggle(s._id)}
                    className="accent-stone-800"
                  />
                  <span className="min-w-0 flex-1 truncate text-stone-800">
                    {label(s)}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-light text-stone-800 cursor-pointer">
        <input
          type="checkbox"
          checked={groceries}
          onChange={(e) => {
            setGroceries(e.target.checked)
            setSaved(false)
          }}
          className="accent-stone-800"
        />
        Offer grocery &amp; drinks ordering
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save services'}
        </button>
        {saved && <span className="text-xs text-emerald-700 font-light">Saved ✓</span>}
        {error && <span className="text-xs text-red-600 font-light">{error}</span>}
      </div>
    </div>
  )
}
