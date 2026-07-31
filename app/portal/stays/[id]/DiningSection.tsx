'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, Plus, Check, CalendarDays } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import { DiningCalendar } from '@/components/portal/DiningCalendar'
import { RequestStatusBadge } from '@/components/portal/RequestStatusBadge'
import type { PortalMenu } from '@/lib/portal/presetMenus'
import type { PortalPlate, PlateLineItem } from '@/lib/portal/presetPlates'
import type { SerializedServiceRequest } from './ConciergeSection'

interface Props {
  bookingId: string
  menus: PortalMenu[]
  plates: PortalPlate[]
  locale: 'en' | 'es'
  /** The guest's existing MENU- and PLATE-kind requests for this booking. */
  requests?: SerializedServiceRequest[]
  /** Stay bounds (ISO), used to anchor + mark the dining calendar. */
  checkIn?: string
  checkOut?: string
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

const COURSE_LABELS: Record<string, { en: string; es: string }> = {
  starter: { en: 'Starter', es: 'Entrada' },
  soup: { en: 'Soup', es: 'Sopa' },
  salad: { en: 'Salad', es: 'Ensalada' },
  main: { en: 'Main', es: 'Principal' },
  side: { en: 'Side', es: 'Acompañante' },
  dessert: { en: 'Dessert', es: 'Postre' },
  drink: { en: 'Drink', es: 'Bebida' },
  canape: { en: 'Canapé', es: 'Canapé' },
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

export function DiningSection({
  bookingId,
  menus,
  plates,
  locale,
  requests = [],
  checkIn,
  checkOut,
}: Props) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [menuOpen, setMenuOpen] = useState(false)
  const [plateOpen, setPlateOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const hasOfferings =
    (menus && menus.length > 0) || (plates && plates.length > 0)
  // The calendar is only meaningful when at least one request is pinned to a day.
  const hasDatedRequests = requests.some((r) => r.preferredDate)
  if (!hasOfferings && requests.length === 0) {
    return null
  }

  return (
    <>
      {requests.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-light">
              {t('Your dining selections', 'Tus selecciones gastronómicas')}
            </p>
            {hasDatedRequests && (
              <button
                type="button"
                onClick={() => setCalendarOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 text-xs font-light text-stone-600 hover:text-stone-900 transition-colors"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {calendarOpen
                  ? t('Hide dining calendar', 'Ocultar calendario')
                  : t('Show dining calendar', 'Ver calendario')}
              </button>
            )}
          </div>

          {calendarOpen && hasDatedRequests && (
            <div className="mb-6">
              <DiningCalendar
                events={requests
                  .filter((r) => r.preferredDate)
                  .map((r) => ({
                    id: r.id,
                    label: requestLabel(r, locale),
                    dateISO: r.preferredDate as string,
                  }))}
                locale={locale}
                checkIn={checkIn}
                checkOut={checkOut}
                undatedCount={requests.filter((r) => !r.preferredDate).length}
              />
            </div>
          )}

          <ul className="border-t border-stone-200">
            {requests.map((r) => (
              <RequestRow key={r.id} r={r} locale={locale} />
            ))}
          </ul>
        </div>
      )}

      {!hasOfferings && (
        <p className="text-sm text-stone-500 font-light">
          {t(
            'No dining menus are currently available to add. Your existing requests are shown above.',
            'No hay menús disponibles para agregar por ahora. Tus solicitudes se muestran arriba.'
          )}
        </p>
      )}

      {hasOfferings && (
        <>
          <p className="text-sm text-stone-500 font-light mb-5">
            {t(
              'Curated menus our kitchen can prepare in your villa — or build your own from individual dishes. Pick a day and we’ll confirm the details.',
              'Menús que nuestra cocina puede preparar en tu villa — o crea el tuyo con platos individuales. Elige un día y confirmaremos los detalles.'
            )}
          </p>

          <div className="flex flex-wrap gap-3">
            {menus.length > 0 && (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
              >
                {t('Browse chef menus', 'Ver menús del chef')} →
              </button>
            )}
            {plates.length > 0 && (
              <button
                type="button"
                onClick={() => setPlateOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
              >
                {t('Build your own menu', 'Crea tu propio menú')} →
              </button>
            )}
          </div>
        </>
      )}

      {menuOpen && (
        <MenuModal
          bookingId={bookingId}
          menus={menus}
          locale={locale}
          onClose={() => setMenuOpen(false)}
        />
      )}
      {plateOpen && (
        <PlateModal
          bookingId={bookingId}
          plates={plates}
          locale={locale}
          onClose={() => setPlateOpen(false)}
        />
      )}
    </>
  )
}

function RequestRow({
  r,
  locale,
}: {
  r: SerializedServiceRequest
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const plateItems =
    r.kind === 'PLATE' && Array.isArray(r.plateItems)
      ? (r.plateItems as unknown as PlateLineItem[])
      : []
  const detail = [
    r.preferredDate &&
      new Date(r.preferredDate).toLocaleDateString(
        locale === 'es' ? 'es-ES' : 'en-US',
        { month: 'short', day: 'numeric', timeZone: 'UTC' }
      ),
    r.partySize ? t(`${r.partySize} guests`, `${r.partySize} personas`) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className="py-3 border-b border-stone-200 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-light text-stone-900">
          {r.kind === 'PLATE' ? r.serviceName : r.menuName || r.serviceName}
        </p>
        {plateItems.length > 0 && (
          <p className="text-xs text-stone-500 font-light mt-0.5">
            {plateItems
              .map((p) => (locale === 'es' ? p.name_es : p.name_en) || p.name_en)
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
        {detail && (
          <p className="text-xs text-stone-500 font-light mt-0.5">{detail}</p>
        )}
      </div>
      <RequestStatusBadge status={r.status} locale={locale} />
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

function requestLabel(r: SerializedServiceRequest, locale: 'en' | 'es'): string {
  if (r.kind === 'PLATE') return r.serviceName
  return r.menuName || r.serviceName || (locale === 'es' ? 'Menú' : 'Menu')
}

/* ------------------------------------------------------------------ */
/* Chef menus                                                          */
/* ------------------------------------------------------------------ */

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
  const router = useRouter()
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [step, setStep] = useState<'select' | 'schedule'>('select')
  const [search, setSearch] = useState('')
  const [meal, setMeal] = useState<string>('all')
  const [diets, setDiets] = useState<string[]>([])
  const [selectedMenu, setSelectedMenu] = useState<PortalMenu | null>(null)
  const [form, setForm] = useState({ preferredDate: '', partySize: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useModalScrollLock()

  const startAnother = () => {
    setDone(false)
    setStep('select')
    setSelectedMenu(null)
    setForm({ preferredDate: '', partySize: '', notes: '' })
    setSearch('')
    setMeal('all')
    setDiets([])
    setError(null)
  }

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

  const pick = (m: PortalMenu) => {
    setSelectedMenu(m)
    setStep('schedule')
  }

  const submit = async () => {
    if (!selectedMenu) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/bookings/${bookingId}/service-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'MENU',
          menuSanityId: selectedMenu._id,
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
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell title={t('Chef menus', 'Menús del chef')} onClose={onClose}>
      {done ? (
        <div className="px-6 py-12 flex flex-col items-center text-center gap-5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-light text-stone-900">
              {t('Your menu was requested', 'Tu menú fue solicitado')}
            </p>
            <p className="text-sm text-stone-500 font-light mt-1">
              {t('We’ll be in touch to confirm the details.', 'Te contactaremos para confirmar los detalles.')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={startAnother}
              className="px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900"
            >
              {t('Request another menu', 'Solicitar otro menú')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
            >
              {t('Done', 'Listo')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <StepIndicator
            step={step}
            labels={[
              t('1 · Choose a menu', '1 · Elige un menú'),
              t('2 · Pick a day', '2 · Elige un día'),
            ]}
          />

          {step === 'select' ? (
            <>
              <div className="px-6 py-3 border-b border-stone-200 space-y-3">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={t('Search menus…', 'Buscar menús…')}
                />
                {(mealTypes.length > 1 || dietTypes.length > 0) && (
                  <div className="flex flex-wrap gap-1.5">
                    {mealTypes.length > 1 && (
                      <>
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
                      </>
                    )}
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

              <div className="overflow-y-auto flex-1 px-6 py-5">
                {filtered.length === 0 ? (
                  <p className="py-8 text-sm font-light text-stone-500 text-center">
                    {t('No menus match your filters.', 'Ningún menú coincide con los filtros.')}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filtered.map((m) => (
                      <MenuSelectCard
                        key={m._id}
                        menu={m}
                        locale={locale}
                        onSelect={() => pick(m)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            selectedMenu && (
              <>
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                  <MenuSummary menu={selectedMenu} locale={locale} />

                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-light">
                      {t('Day', 'Día')}
                      <input
                        type="date"
                        value={form.preferredDate}
                        onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                        className="mt-1 w-full rounded-sm border border-stone-300 px-2 py-2 text-sm font-light text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-800"
                      />
                    </label>
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-light">
                      {t('Guests', 'Personas')}
                      <input
                        type="number"
                        min={1}
                        value={form.partySize}
                        onChange={(e) => setForm((p) => ({ ...p, partySize: e.target.value }))}
                        className="mt-1 w-full rounded-sm border border-stone-300 px-2 py-2 text-sm font-light text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-800"
                      />
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    placeholder={t('Notes, dietary needs…', 'Notas, necesidades dietéticas…')}
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                  {error && <p className="text-xs text-red-600 font-light">{error}</p>}
                </div>

                <div className="border-t border-stone-200 px-6 py-4 bg-stone-50 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-4 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
                  >
                    ← {t('Back', 'Atrás')}
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="flex-1 px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? t('Sending…', 'Enviando…')
                      : t('Request this menu', 'Solicitar este menú')}
                  </button>
                </div>
              </>
            )
          )}
        </>
      )}
    </ModalShell>
  )
}

function menuPrice(menu: PortalMenu, t: (en: string, es: string) => string) {
  return menu.pricePerPerson?.amount
    ? `${menu.pricePerPerson.currency ?? 'USD'} ${menu.pricePerPerson.amount} ${t('/ person', '/ persona')}`
    : menu.flatPrice?.amount
      ? `${menu.flatPrice.currency ?? 'USD'} ${menu.flatPrice.amount}`
      : t('Quoted on request', 'Cotizado a solicitud')
}

/** Selectable menu card for step 1 — clicking "Select" advances to step 2. */
function MenuSelectCard({
  menu,
  locale,
  onSelect,
}: {
  menu: PortalMenu
  locale: 'en' | 'es'
  onSelect: () => void
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const name =
    (locale === 'es' ? menu.name_es : menu.name_en) || menu.name_en || menu.name_es || 'Menu'
  const description = locale === 'es' ? menu.description_es : menu.description_en
  const image = menu.image?.asset ? urlFor(menu.image).width(640).height(400).fit('crop').url() : null
  const meal = menu.mealType ? MEAL_LABELS[menu.mealType] : null
  const platesInMenu = menu.plates ?? []

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

        {(menu.courses?.length || platesInMenu.length) ? (
          <details className="mt-3 group">
            <summary className="text-xs text-stone-500 font-light cursor-pointer hover:text-stone-800">
              {t('View menu', 'Ver menú')}
            </summary>
            <div className="mt-2 space-y-2">
              {menu.courses?.map((c, i) => {
                const cn = (locale === 'es' ? c.courseName_es : c.courseName_en) || c.courseName_en
                const items = (locale === 'es' ? c.items_es : c.items_en) || c.items_en || []
                return (
                  <div key={`c-${i}`}>
                    {cn && <p className="text-xs font-medium text-stone-700">{cn}</p>}
                    <ul className="text-xs text-stone-600 font-light list-disc pl-4">
                      {(items || []).map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
              {platesInMenu.length > 0 && (
                <ul className="text-xs text-stone-600 font-light list-disc pl-4">
                  {platesInMenu.map((p) => {
                    const pn = (locale === 'es' ? p.name_es : p.name_en) || p.name_en
                    return <li key={p._id}>{pn}</li>
                  })}
                </ul>
              )}
            </div>
          </details>
        ) : null}

        <p className="text-xs text-stone-500 font-light mt-3">
          {menuPrice(menu, t)}
          {menu.leadTimeHours ? ` · ${t('min. notice', 'aviso mín.')} ${menu.leadTimeHours}h` : ''}
        </p>

        <div className="mt-4 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onSelect}
            className="w-full px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900"
          >
            {t('Select this menu', 'Elegir este menú')} →
          </button>
        </div>
      </div>
    </div>
  )
}

/** Compact summary of the chosen menu, shown at the top of step 2. */
function MenuSummary({ menu, locale }: { menu: PortalMenu; locale: 'en' | 'es' }) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const name =
    (locale === 'es' ? menu.name_es : menu.name_en) || menu.name_en || menu.name_es || 'Menu'
  const description = locale === 'es' ? menu.description_es : menu.description_en
  const image = menu.image?.asset ? urlFor(menu.image).width(240).height(160).fit('crop').url() : null
  const platesInMenu = menu.plates ?? []

  return (
    <div className="border border-stone-200 rounded-sm overflow-hidden">
      <div className="flex gap-4 p-4">
        {image && (
          <div className="relative w-24 h-20 shrink-0 rounded-sm overflow-hidden bg-stone-100">
            <Image src={image} alt={name} fill className="object-cover" sizes="96px" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-light text-stone-900">{name}</p>
          {description && (
            <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed">{description}</p>
          )}
          <p className="text-xs text-stone-500 font-light mt-1">
            {menuPrice(menu, t)}
            {menu.leadTimeHours ? ` · ${t('min. notice', 'aviso mín.')} ${menu.leadTimeHours}h` : ''}
          </p>
        </div>
      </div>

      {(menu.courses?.length || platesInMenu.length) ? (
        <div className="border-t border-stone-100 px-4 py-3 space-y-2">
          {menu.courses?.map((c, i) => {
            const cn = (locale === 'es' ? c.courseName_es : c.courseName_en) || c.courseName_en
            const items = (locale === 'es' ? c.items_es : c.items_en) || c.items_en || []
            return (
              <div key={`c-${i}`}>
                {cn && <p className="text-xs font-medium text-stone-700">{cn}</p>}
                <ul className="text-xs text-stone-600 font-light list-disc pl-4">
                  {(items || []).map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              </div>
            )
          })}
          {platesInMenu.length > 0 && (
            <ul className="text-xs text-stone-600 font-light list-disc pl-4">
              {platesInMenu.map((p) => {
                const pn = (locale === 'es' ? p.name_es : p.name_en) || p.name_en
                return <li key={p._id}>{pn}</li>
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Build your own — à-la-carte plates                                  */
/* ------------------------------------------------------------------ */

function PlateModal({
  bookingId,
  plates,
  locale,
  onClose,
}: {
  bookingId: string
  plates: PortalPlate[]
  locale: 'en' | 'es'
  onClose: () => void
}) {
  const router = useRouter()
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [step, setStep] = useState<'select' | 'schedule'>('select')
  const [search, setSearch] = useState('')
  const [course, setCourse] = useState<string>('all')
  const [diets, setDiets] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({ preferredDate: '', partySize: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useModalScrollLock()

  // Reset to a blank first step so the guest can request another menu
  // without closing the modal.
  const startAnother = () => {
    setDone(false)
    setStep('select')
    setSelected(new Set())
    setForm({ preferredDate: '', partySize: '', notes: '' })
    setSearch('')
    setCourse('all')
    setDiets([])
    setError(null)
  }

  const courseTypes = useMemo(
    () => Array.from(new Set(plates.map((p) => p.courseType).filter(Boolean) as string[])),
    [plates]
  )
  const dietTypes = useMemo(
    () => Array.from(new Set(plates.flatMap((p) => p.dietaryOptions ?? []))),
    [plates]
  )

  const toggleDiet = (d: string) =>
    setDiets((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return plates.filter((p) => {
      if (course !== 'all' && p.courseType !== course) return false
      if (diets.length && !diets.every((d) => (p.dietaryOptions ?? []).includes(d)))
        return false
      if (q) {
        const hay = [p.name_en, p.name_es, p.description_en, p.description_es]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [plates, course, diets, search])

  const submit = async () => {
    if (selected.size === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/bookings/${bookingId}/service-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'PLATE',
          plateSanityIds: Array.from(selected),
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
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPlates = plates.filter((p) => selected.has(p._id))

  return (
    <ModalShell title={t('Build your own menu', 'Crea tu propio menú')} onClose={onClose}>
      {done ? (
        <div className="px-6 py-12 flex flex-col items-center text-center gap-5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-light text-stone-900">
              {t('Your custom menu was requested', 'Tu menú personalizado fue solicitado')}
            </p>
            <p className="text-sm text-stone-500 font-light mt-1">
              {t('We’ll be in touch to confirm the details.', 'Te contactaremos para confirmar los detalles.')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={startAnother}
              className="px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900"
            >
              {t('Request another menu', 'Solicitar otro menú')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
            >
              {t('Done', 'Listo')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <StepIndicator
            step={step}
            labels={[
              t('1 · Choose your dishes', '1 · Elige tus platos'),
              t('2 · Pick a day', '2 · Elige un día'),
            ]}
          />

          {step === 'select' ? (
            <>
              <div className="px-6 py-3 border-b border-stone-200 space-y-3">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={t('Search dishes…', 'Buscar platos…')}
                />
                {(courseTypes.length > 1 || dietTypes.length > 0) && (
                  <div className="flex flex-wrap gap-1.5">
                    {courseTypes.length > 1 && (
                      <>
                        <Chip active={course === 'all'} onClick={() => setCourse('all')}>
                          {t('All', 'Todos')}
                        </Chip>
                        {courseTypes.map((ct) => {
                          const label = COURSE_LABELS[ct]
                          return (
                            <Chip key={ct} active={course === ct} onClick={() => setCourse(ct)}>
                              {label ? t(label.en, label.es) : ct}
                            </Chip>
                          )
                        })}
                      </>
                    )}
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

              <div className="overflow-y-auto flex-1 px-6 py-5">
                {filtered.length === 0 ? (
                  <p className="py-8 text-sm font-light text-stone-500 text-center">
                    {t('No dishes match your filters.', 'Ningún plato coincide con los filtros.')}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filtered.map((p) => (
                      <PlateCard
                        key={p._id}
                        plate={p}
                        locale={locale}
                        selected={selected.has(p._id)}
                        onToggle={() => toggleSelect(p._id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-stone-200 px-6 py-4 bg-stone-50 flex items-center justify-between gap-4">
                <p className="text-sm font-light text-stone-700">
                  {selected.size === 0
                    ? t('Select dishes to build your menu.', 'Selecciona platos para crear tu menú.')
                    : t(
                        `${selected.size} dish${selected.size === 1 ? '' : 'es'} selected`,
                        `${selected.size} plato${selected.size === 1 ? '' : 's'} seleccionado${selected.size === 1 ? '' : 's'}`
                      )}
                </p>
                <button
                  type="button"
                  onClick={() => setStep('schedule')}
                  disabled={selected.size === 0}
                  className="px-6 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('Continue', 'Continuar')} →
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-2">
                    {t('Your dishes', 'Tus platos')} ({selectedPlates.length})
                  </p>
                  <ul className="border border-stone-200 rounded-sm divide-y divide-stone-100">
                    {selectedPlates.map((p) => {
                      const name = (locale === 'es' ? p.name_es : p.name_en) || p.name_en
                      const course = p.courseType ? COURSE_LABELS[p.courseType] : null
                      return (
                        <li
                          key={p._id}
                          className="flex items-center justify-between gap-3 px-3 py-2"
                        >
                          <span className="text-sm font-light text-stone-800 min-w-0 truncate">
                            {name}
                          </span>
                          <div className="flex items-center gap-3 shrink-0">
                            {course && (
                              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                                {t(course.en, course.es)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleSelect(p._id)}
                              className="text-stone-400 hover:text-red-600"
                              aria-label={t('Remove', 'Quitar')}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-light">
                    {t('Day', 'Día')}
                    <input
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                      className="mt-1 w-full rounded-sm border border-stone-300 px-2 py-2 text-sm font-light text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-800"
                    />
                  </label>
                  <label className="text-[11px] uppercase tracking-wider text-stone-500 font-light">
                    {t('Guests', 'Personas')}
                    <input
                      type="number"
                      min={1}
                      value={form.partySize}
                      onChange={(e) => setForm((p) => ({ ...p, partySize: e.target.value }))}
                      className="mt-1 w-full rounded-sm border border-stone-300 px-2 py-2 text-sm font-light text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-800"
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder={t('Notes, dietary needs…', 'Notas, necesidades dietéticas…')}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                {error && <p className="text-xs text-red-600 font-light">{error}</p>}
              </div>

              <div className="border-t border-stone-200 px-6 py-4 bg-stone-50 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-4 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
                >
                  ← {t('Back', 'Atrás')}
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting || selected.size === 0}
                  className="flex-1 px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? t('Sending…', 'Enviando…')
                    : t('Request this menu', 'Solicitar este menú')}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </ModalShell>
  )
}

function StepIndicator({
  step,
  labels,
}: {
  step: 'select' | 'schedule'
  labels: [string, string]
}) {
  const idx = step === 'select' ? 0 : 1
  return (
    <div className="flex border-b border-stone-200">
      {labels.map((label, i) => (
        <div
          key={i}
          className={`flex-1 px-6 py-2.5 text-xs font-light tracking-wide text-center border-b-2 transition-colors ${
            i === idx
              ? 'border-stone-800 text-stone-900'
              : 'border-transparent text-stone-400'
          }`}
        >
          {label}
        </div>
      ))}
    </div>
  )
}

function PlateCard({
  plate,
  locale,
  selected,
  onToggle,
}: {
  plate: PortalPlate
  locale: 'en' | 'es'
  selected: boolean
  onToggle: () => void
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const name =
    (locale === 'es' ? plate.name_es : plate.name_en) || plate.name_en || plate.name_es || 'Dish'
  const description = locale === 'es' ? plate.description_es : plate.description_en
  const image = plate.image?.asset ? urlFor(plate.image).width(480).height(320).fit('crop').url() : null
  const course = plate.courseType ? COURSE_LABELS[plate.courseType] : null

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left bg-white border rounded-sm overflow-hidden flex flex-col transition-colors ${
        selected ? 'border-stone-800 ring-1 ring-stone-800' : 'border-stone-200 hover:border-stone-400'
      }`}
    >
      {image && (
        <div className="relative aspect-[3/2] bg-stone-100">
          <Image src={image} alt={name} fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
          <span
            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
              selected ? 'bg-stone-800 text-white' : 'bg-white/90 text-stone-600 border border-stone-300'
            }`}
          >
            {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </span>
        </div>
      )}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-light text-stone-900 leading-snug">{name}</p>
          {!image && (
            <span
              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                selected ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border border-stone-300'
              }`}
            >
              {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>
        {course && (
          <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 mt-1">
            {t(course.en, course.es)}
          </span>
        )}
        {description && (
          <p className="text-xs text-stone-600 font-light mt-1.5 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
        {plate.dietaryOptions && plate.dietaryOptions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {plate.dietaryOptions.map((d) => {
              const label = DIET_LABELS[d]
              return (
                <span key={d} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-light">
                  {label ? t(label.en, label.es) : d}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
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
          <h3 className="text-lg font-light text-stone-900 tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
    />
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

function useModalScrollLock() {
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
}
