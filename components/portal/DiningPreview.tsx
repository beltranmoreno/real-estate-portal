'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Eye, ArrowUpRight } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import type { PortalMenu } from '@/lib/portal/presetMenus'
import type { PortalPlate } from '@/lib/portal/presetPlates'

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  brunch: 'Brunch',
  lunch: 'Lunch',
  dinner: 'Dinner',
  cocktail: 'Cocktail hour',
  bbq: 'BBQ',
  dessert: 'Dessert',
  late_night: 'Late-night',
  kids: "Kids' menu",
}

const COURSE_LABELS: Record<string, string> = {
  starter: 'Starter',
  soup: 'Soup',
  salad: 'Salad',
  main: 'Main',
  side: 'Side',
  dessert: 'Dessert',
  drink: 'Drink',
  canape: 'Canapé',
}

const DIET_LABELS: Record<string, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  gluten_free: 'Gluten-free',
  dairy_free: 'Dairy-free',
  nut_free: 'Nut-free',
  shellfish_free: 'Shellfish-free',
  halal: 'Halal',
  kosher: 'Kosher',
}

function priceLabel(
  price?: { amount?: number | null; currency?: string | null } | null,
  suffix = ''
): string | null {
  if (!price?.amount) return null
  return `${price.currency ?? 'USD'} ${price.amount}${suffix}`
}

function DietTags({ options }: { options?: string[] | null }) {
  if (!options || options.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((d) => (
        <span
          key={d}
          className="text-[11px] px-2 py-0.5 bg-status-confirmed-bg text-status-confirmed rounded-full font-light"
        >
          {DIET_LABELS[d] ?? d}
        </span>
      ))}
    </div>
  )
}

/** Small "open" icon button that previews a menu in a modal. */
export function MenuPreviewButton({ menu }: { menu: PortalMenu }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-faint hover:text-ink transition-colors"
        aria-label={`Preview ${menu.name_en ?? 'menu'}`}
        title="Preview"
      >
        <Eye className="w-4 h-4" />
      </button>
      {open && <MenuPreviewModal menu={menu} onClose={() => setOpen(false)} />}
    </>
  )
}

/** Small "open" icon button that previews a plate in a modal. */
export function PlatePreviewButton({ plate }: { plate: PortalPlate }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-faint hover:text-ink transition-colors"
        aria-label={`Preview ${plate.name_en ?? 'plate'}`}
        title="Preview"
      >
        <Eye className="w-4 h-4" />
      </button>
      {open && <PlatePreviewModal plate={plate} onClose={() => setOpen(false)} />}
    </>
  )
}

function Shell({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-lg max-h-[88vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Deep link into the embedded Studio. Mirrors structureTool's default URL
 * (/studio/structure/<schemaType>;<docId>); strip the drafts. prefix since
 * Studio resolves draft/published from the id itself.
 */
function StudioFooter({ type, id }: { type: string; id: string }) {
  const href = `/studio/structure/${type};${id.replace(/^drafts\./, '')}`
  return (
    <div className="px-5 py-3 border-t border-line shrink-0">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-2 hover:text-ink transition-colors"
      >
        Open in Sanity Studio
        <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
      <h3 className="text-base font-light text-ink tracking-tight pr-4">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        className="text-muted-2 hover:text-ink shrink-0"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export function MenuPreviewModal({
  menu,
  onClose,
}: {
  menu: PortalMenu
  onClose: () => void
}) {
  const image = menu.image?.asset
    ? urlFor(menu.image).width(800).height(450).fit('crop').url()
    : null
  const tags = [
    menu.mealType ? MEAL_LABELS[menu.mealType] ?? menu.mealType : null,
    menu.cuisine,
  ].filter(Boolean)
  const price =
    priceLabel(menu.pricePerPerson, ' / person') ||
    priceLabel(menu.flatPrice) ||
    'Quoted on request'
  const plates = menu.plates ?? []

  return (
    <Shell onClose={onClose}>
      <Header title={menu.name_en || menu.name_es || 'Menu'} onClose={onClose} />
      <div className="overflow-y-auto flex-1">
        {image && (
          <div className="relative aspect-[16/9] bg-sand">
            <Image src={image} alt={menu.name_en ?? ''} fill className="object-cover" sizes="512px" />
          </div>
        )}
        <div className="p-5 space-y-4">
          {tags.length > 0 && (
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-2">
              {tags.join(' · ')}
            </p>
          )}
          {(menu.description_en || menu.description_es) && (
            <p className="text-sm text-body-strong font-light leading-relaxed">
              {menu.description_en || menu.description_es}
            </p>
          )}

          <DietTags options={menu.dietaryOptions} />

          {/* Free-form courses */}
          {menu.courses && menu.courses.length > 0 && (
            <div className="space-y-3">
              {menu.courses.map((c, i) => (
                <div key={i}>
                  {c.courseName_en && (
                    <p className="text-xs font-medium text-body-strong">{c.courseName_en}</p>
                  )}
                  <ul className="text-sm text-muted font-light list-disc pl-4">
                    {(c.items_en || []).map((it, j) => (
                      <li key={j}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Referenced plates */}
          {plates.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-2 mb-2">
                Plates ({plates.length})
              </p>
              <ul className="divide-y divide-stone-100 border-t border-line-soft">
                {plates.map((p) => (
                  <li key={p._id} className="py-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-light text-ink">
                        {p.name_en || p.name_es}
                      </p>
                      {(p.dietaryOptions?.length || p.allergenInfo_en) && (
                        <p className="text-[11px] text-muted-2 font-light mt-0.5">
                          {[
                            (p.dietaryOptions ?? [])
                              .map((d) => DIET_LABELS[d] ?? d)
                              .join(', '),
                            p.allergenInfo_en,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    {p.courseType && (
                      <span className="text-[10px] uppercase tracking-wider text-faint whitespace-nowrap mt-0.5">
                        {COURSE_LABELS[p.courseType] ?? p.courseType}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(menu.allergenInfo_en || menu.allergenInfo_es) && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-2 mb-1">
                Allergens / notes
              </p>
              <p className="text-sm text-muted font-light">
                {menu.allergenInfo_en || menu.allergenInfo_es}
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-line-soft text-sm text-muted font-light space-y-1">
            <p>{price}</p>
            <p className="text-xs text-muted-2">
              {[
                menu.minGuests ? `min ${menu.minGuests} guests` : null,
                menu.maxGuests ? `max ${menu.maxGuests} guests` : null,
                menu.leadTimeHours ? `${menu.leadTimeHours}h notice` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>
      </div>
      <StudioFooter type="presetMenu" id={menu._id} />
    </Shell>
  )
}

export function PlatePreviewModal({
  plate,
  onClose,
}: {
  plate: PortalPlate
  onClose: () => void
}) {
  const image = plate.image?.asset
    ? urlFor(plate.image).width(800).height(534).fit('crop').url()
    : null
  const tags = [
    plate.courseType ? COURSE_LABELS[plate.courseType] ?? plate.courseType : null,
    plate.mealType ? MEAL_LABELS[plate.mealType] ?? plate.mealType : null,
    plate.cuisine,
  ].filter(Boolean)
  const price = priceLabel(plate.pricePerPerson, ' / person')

  return (
    <Shell onClose={onClose}>
      <Header title={plate.name_en || plate.name_es || 'Dish'} onClose={onClose} />
      <div className="overflow-y-auto flex-1">
        {image && (
          <div className="relative aspect-[3/2] bg-sand">
            <Image src={image} alt={plate.name_en ?? ''} fill className="object-cover" sizes="512px" />
          </div>
        )}
        <div className="p-5 space-y-4">
          {tags.length > 0 && (
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-2">
              {tags.join(' · ')}
            </p>
          )}
          {(plate.description_en || plate.description_es) && (
            <p className="text-sm text-body-strong font-light leading-relaxed">
              {plate.description_en || plate.description_es}
            </p>
          )}

          <DietTags options={plate.dietaryOptions} />

          {(plate.allergenInfo_en || plate.allergenInfo_es) && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-2 mb-1">
                Allergens / notes
              </p>
              <p className="text-sm text-muted font-light">
                {plate.allergenInfo_en || plate.allergenInfo_es}
              </p>
            </div>
          )}

          {price && (
            <p className="pt-2 border-t border-line-soft text-sm text-muted font-light">
              {price}
            </p>
          )}
        </div>
      </div>
      <StudioFooter type="presetPlate" id={plate._id} />
    </Shell>
  )
}
