'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, X } from 'lucide-react'

type Option = { id: string; name: string; meta?: string | null }

/**
 * Picks the restaurants and activities shown at the bottom of the welcome
 * email. Each list keeps the order they were added (arrows to reorder). With
 * nothing picked, the email falls back to featured restaurants / the first
 * activities.
 */
export function WelcomePicksEditor({
  restaurants,
  activities,
  initialRestaurantIds,
  initialActivityIds,
  max,
  locale,
}: {
  restaurants: Option[]
  activities: Option[]
  initialRestaurantIds: string[]
  initialActivityIds: string[]
  max: number
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const router = useRouter()
  const [r, setR] = useState(initialRestaurantIds)
  const [a, setA] = useState(initialActivityIds)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const dirty =
    r.join() !== initialRestaurantIds.join() || a.join() !== initialActivityIds.join()

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/settings/welcome-picks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantIds: r, activityIds: a }),
      })
      if (!res.ok) throw new Error()
      setMsg({ ok: true, text: t('Saved — the sample above now shows your picks.', 'Guardado — el ejemplo de arriba ya muestra tu selección.') })
      router.refresh()
    } catch {
      setMsg({ ok: false, text: t('Could not save. Try again.', 'No se pudo guardar. Inténtalo de nuevo.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-stone-200 rounded-sm p-5 bg-stone-50/60">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
        {t('Restaurants & activities in this email', 'Restaurantes y actividades en este correo')}
      </p>
      <p className="text-sm text-stone-600 font-light mt-1.5 mb-5 max-w-2xl">
        {t(
          `Up to ${max} of each, in this order. Leave a list empty to show the featured restaurants / the first activities instead. Applies to every invitation sent from now on.`,
          `Hasta ${max} de cada uno, en este orden. Deja una lista vacía para mostrar los restaurantes destacados / las primeras actividades. Se aplica a todas las invitaciones que se envíen desde ahora.`
        )}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PickList
          title={t('Restaurants', 'Restaurantes')}
          options={restaurants}
          selected={r}
          onChange={setR}
          max={max}
          emptyHint={t('Showing the featured restaurants.', 'Se muestran los restaurantes destacados.')}
          t={t}
        />
        <PickList
          title={t('Activities', 'Actividades')}
          options={activities}
          selected={a}
          onChange={setA}
          max={max}
          emptyHint={t('Showing the first activities.', 'Se muestran las primeras actividades.')}
          t={t}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="px-4 py-2 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] rounded-xs disabled:opacity-40"
        >
          {saving ? t('Saving…', 'Guardando…') : t('Save', 'Guardar')}
        </button>
        {dirty && !saving && (
          <button
            type="button"
            onClick={() => {
              setR(initialRestaurantIds)
              setA(initialActivityIds)
              setMsg(null)
            }}
            className="text-sm font-light text-stone-500 hover:text-stone-900"
          >
            {t('Undo changes', 'Deshacer cambios')}
          </button>
        )}
        {msg && <p className={`text-sm font-light ${msg.ok ? 'text-emerald-700' : 'text-red-700'}`}>{msg.text}</p>}
      </div>
    </div>
  )
}

function PickList({
  title,
  options,
  selected,
  onChange,
  max,
  emptyHint,
  t,
}: {
  title: string
  options: Option[]
  selected: string[]
  onChange: (ids: string[]) => void
  max: number
  emptyHint: string
  t: (en: string, es: string) => string
}) {
  const [q, setQ] = useState('')
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options])
  const full = selected.length >= max
  const matches = options.filter(
    (o) => !selected.includes(o.id) && `${o.name} ${o.meta ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())
  )
  const move = (i: number, dir: -1 | 1) => {
    const next = [...selected]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    onChange(next)
  }

  return (
    <div>
      <p className="text-sm text-stone-900 mb-2">
        {title} <span className="text-stone-500 font-light">· {selected.length}/{max}</span>
      </p>

      {selected.length === 0 ? (
        <p className="text-sm text-stone-500 font-light italic mb-3">{emptyHint}</p>
      ) : (
        <ol className="bg-white border border-stone-200 divide-y divide-stone-200 mb-3">
          {selected.map((id, i) => {
            const o = byId.get(id)
            return (
              <li key={id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span className="w-5 text-stone-400 tabular-nums">{i + 1}.</span>
                <span className="flex-1 min-w-0">
                  <span className={o ? 'text-stone-900' : 'text-stone-400 line-through'}>
                    {o?.name ?? t('No longer published', 'Ya no está publicado')}
                  </span>
                  {o?.meta && <span className="block text-xs text-stone-500 font-light truncate">{o.meta}</span>}
                </span>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t('Move up', 'Subir')} className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} aria-label={t('Move down', 'Bajar')} className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => onChange(selected.filter((x) => x !== id))} aria-label={t('Remove', 'Quitar')} className="p-1 text-stone-500 hover:text-red-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            )
          })}
        </ol>
      )}

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={full}
        placeholder={full ? t(`Maximum of ${max} — remove one to add another`, `Máximo ${max} — quita uno para añadir otro`) : t('Search to add…', 'Buscar para añadir…')}
        className="w-full border border-stone-300 rounded-xs px-3 py-2 text-sm font-light bg-white focus:outline-none focus:border-stone-500 disabled:bg-stone-100"
      />
      {!full && (
        <ul className="mt-1 max-h-52 overflow-y-auto bg-white border border-stone-200 divide-y divide-stone-100">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-stone-500 font-light">{t('Nothing found', 'Sin resultados')}</li>
          ) : (
            matches.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange([...selected, o.id])
                    setQ('')
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50"
                >
                  <span className="text-stone-900">{o.name}</span>
                  {o.meta && <span className="text-stone-500 font-light"> · {o.meta}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
