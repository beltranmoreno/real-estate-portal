'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import type { PortalMenu } from '@/lib/portal/presetMenus'

interface Props {
  bookingId: string
  menus: PortalMenu[]
  locale: 'en' | 'es'
}

const MEAL_LABELS: Record<string, { en: string; es: string }> = {
  breakfast: { en: 'Breakfast', es: 'Desayuno' },
  brunch: { en: 'Brunch', es: 'Brunch' },
  lunch: { en: 'Lunch', es: 'Almuerzo' },
  dinner: { en: 'Dinner', es: 'Cena' },
  cocktail: { en: 'Cocktail hour', es: 'Cóctel' },
  bbq: { en: 'BBQ', es: 'BBQ' },
  dessert: { en: 'Dessert', es: 'Postre' },
  late_night: { en: 'Late-night', es: 'Nocturno' },
  kids: { en: "Kids' menu", es: 'Menú infantil' },
}

const DIET_LABELS: Record<string, { en: string; es: string }> = {
  vegetarian: { en: 'Vegetarian', es: 'Vegetariano' },
  vegan: { en: 'Vegan', es: 'Vegano' },
  gluten_free: { en: 'Gluten-free', es: 'Sin gluten' },
  dairy_free: { en: 'Dairy-free', es: 'Sin lácteos' },
  nut_free: { en: 'Nut-free', es: 'Sin frutos secos' },
  shellfish_free: { en: 'Shellfish-free', es: 'Sin mariscos' },
  halal: { en: 'Halal', es: 'Halal' },
  kosher: { en: 'Kosher', es: 'Kosher' },
}

export function MenuSection({ bookingId, menus, locale }: Props) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [open, setOpen] = useState(false)

  // Only offer chef menus when the property actually has some attached.
  if (!menus || menus.length === 0) return null

  return (
    <>
      <p className="text-sm text-stone-500 font-light mb-5">
        {t(
          'Curated menus our kitchen can prepare in your villa. Request one and we’ll confirm the details.',
          'Menús que nuestra cocina puede preparar en tu villa. Solicita uno y confirmaremos los detalles.'
        )}
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
      >
        {t('I want chef menus', 'Quiero menús del chef')} →
      </button>

      {open && (
        <MenuModal
          bookingId={bookingId}
          menus={menus}
          locale={locale}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function MenuModal({
  bookingId,
  menus,
  locale,
  onClose,
}: {
  bookingId: string
  menus: PortalMenu[]
  locale: 'en' | 'es'
  onClose: () => void
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [search, setSearch] = useState('')
  const [meal, setMeal] = useState<string>('all')
  const [diets, setDiets] = useState<string[]>([])

  // Lock body scroll while the modal is open.
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  // Only surface filter chips that actually exist across these menus.
  const mealTypes = useMemo(
    () => Array.from(new Set(menus.map((m) => m.mealType).filter(Boolean) as string[])),
    [menus]
  )
  const dietTypes = useMemo(
    () => Array.from(new Set(menus.flatMap((m) => m.dietaryOptions ?? []))),
    [menus]
  )

  const toggleDiet = (d: string) =>
    setDiets((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return menus.filter((m) => {
      if (meal !== 'all' && m.mealType !== meal) return false
      if (diets.length && !diets.every((d) => (m.dietaryOptions ?? []).includes(d)))
        return false
      if (q) {
        const hay = [m.name_en, m.name_es, m.description_en, m.description_es]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [menus, meal, diets, search])

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-light text-stone-900 tracking-tight">
            {t('Chef menus', 'Menús del chef')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-stone-200 space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search menus…', 'Buscar menús…')}
            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
          />
          {mealTypes.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <Chip active={meal === 'all'} onClick={() => setMeal('all')}>
                {t('All', 'Todos')}
              </Chip>
              {mealTypes.map((mt) => {
                const label = MEAL_LABELS[mt]
                return (
                  <Chip key={mt} active={meal === mt} onClick={() => setMeal(mt)}>
                    {label ? t(label.en, label.es) : mt}
                  </Chip>
                )
              })}
            </div>
          )}
          {dietTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dietTypes.map((d) => {
                const label = DIET_LABELS[d]
                return (
                  <Chip key={d} active={diets.includes(d)} onClick={() => toggleDiet(d)} tone="diet">
                    {label ? t(label.en, label.es) : d}
                  </Chip>
                )
              })}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {filtered.length === 0 ? (
            <p className="py-8 text-sm font-light text-stone-500 text-center">
              {t('No menus match your filters.', 'Ningún menú coincide con los filtros.')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((m) => (
                <MenuCard key={m._id} bookingId={bookingId} menu={m} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  tone = 'meal',
  children,
}: {
  active: boolean
  onClick: () => void
  tone?: 'meal' | 'diet'
  children: React.ReactNode
}) {
  const activeCls =
    tone === 'diet' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-800 text-white border-stone-800'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-xs font-light transition-colors ${
        active ? activeCls : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
      }`}
    >
      {children}
    </button>
  )
}

function MenuCard({
  bookingId,
  menu,
  locale,
}: {
  bookingId: string
  menu: PortalMenu
  locale: 'en' | 'es'
}) {
  const router = useRouter()
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ preferredDate: '', partySize: '', notes: '' })

  const name = (locale === 'es' ? menu.name_es : menu.name_en) || menu.name_en || menu.name_es || 'Menu'
  const description = locale === 'es' ? menu.description_es : menu.description_en
  const image = menu.image?.asset ? urlFor(menu.image).width(640).height(400).fit('crop').url() : null
  const meal = menu.mealType ? MEAL_LABELS[menu.mealType] : null
  const price = menu.pricePerPerson?.amount
    ? `${menu.pricePerPerson.currency ?? 'USD'} ${menu.pricePerPerson.amount} ${t('/ person', '/ persona')}`
    : menu.flatPrice?.amount
      ? `${menu.flatPrice.currency ?? 'USD'} ${menu.flatPrice.amount}`
      : t('Quoted on request', 'Cotizado a solicitud')

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/bookings/${bookingId}/service-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'MENU',
          menuSanityId: menu._id,
          preferredDate: form.preferredDate || null,
          partySize: form.partySize || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p?.error || 'Request failed')
      }
      setDone(true)
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-stone-200 rounded-sm overflow-hidden flex flex-col">
      {image && (
        <div className="relative aspect-[16/10] bg-stone-100">
          <Image src={image} alt={name} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-light text-stone-900">{name}</h3>
          {meal && (
            <span className="text-[10px] uppercase tracking-[0.15em] text-stone-500 whitespace-nowrap mt-1">
              {t(meal.en, meal.es)}
            </span>
          )}
        </div>

        {description && (
          <p className="text-sm text-stone-600 font-light mt-2 leading-relaxed">{description}</p>
        )}

        {menu.dietaryOptions && menu.dietaryOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {menu.dietaryOptions.map((d) => {
              const label = DIET_LABELS[d]
              return (
                <span key={d} className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-light">
                  {label ? t(label.en, label.es) : d}
                </span>
              )
            })}
          </div>
        )}

        {menu.courses && menu.courses.length > 0 && (
          <details className="mt-3 group">
            <summary className="text-xs text-stone-500 font-light cursor-pointer hover:text-stone-800">
              {t('View menu', 'Ver menú')}
            </summary>
            <div className="mt-2 space-y-2">
              {menu.courses.map((c, i) => {
                const cn = (locale === 'es' ? c.courseName_es : c.courseName_en) || c.courseName_en
                const items = (locale === 'es' ? c.items_es : c.items_en) || c.items_en || []
                return (
                  <div key={i}>
                    {cn && <p className="text-xs font-medium text-stone-700">{cn}</p>}
                    <ul className="text-xs text-stone-600 font-light list-disc pl-4">
                      {(items || []).map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </details>
        )}

        <p className="text-xs text-stone-500 font-light mt-3">
          {price}
          {menu.leadTimeHours ? ` · ${t('min. notice', 'aviso mín.')} ${menu.leadTimeHours}h` : ''}
        </p>

        <div className="mt-4 pt-4 border-t border-stone-100">
          {done ? (
            <p className="text-sm text-emerald-700 font-light">
              {t('Requested — we’ll be in touch.', 'Solicitado — te contactaremos.')}
            </p>
          ) : open ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                  className="rounded-sm border border-stone-300 px-2 py-1.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                <input
                  type="number"
                  min={1}
                  placeholder={t('Guests', 'Personas')}
                  value={form.partySize}
                  onChange={(e) => setForm((p) => ({ ...p, partySize: e.target.value }))}
                  className="rounded-sm border border-stone-300 px-2 py-1.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>
              <textarea
                rows={2}
                placeholder={t('Notes, dietary needs…', 'Notas, necesidades dietéticas…')}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full rounded-sm border border-stone-300 px-2 py-1.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
              {error && <p className="text-xs text-red-600 font-light">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
                >
                  {submitting ? t('Sending…', 'Enviando…') : t('Send request', 'Enviar solicitud')}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-stone-500 text-xs font-light hover:text-stone-900"
                >
                  {t('Cancel', 'Cancelar')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-4 py-2 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100"
            >
              {t('Request this menu', 'Solicitar este menú')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
