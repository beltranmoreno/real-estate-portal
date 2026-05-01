'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import {
  Plane,
  Car,
  Bike,
  Ship,
  Sailboat,
  ShoppingCart,
  Wine,
  ChefHat,
  Utensils,
  Cake,
  Trophy,
  Map as MapIcon,
  Camera,
  Music,
  Calendar,
  Ticket,
  Home,
  Sparkles,
  Flower,
  Gift,
  Heart,
  Baby,
  Users,
  Dog,
  ConciergeBell,
  ArrowRight,
  MessageCircle,
  Mail,
} from 'lucide-react'
import type { ConciergeService } from './page'

interface Props {
  services: ConciergeService[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  car: Car,
  'car-taxi': Car,
  bike: Bike,
  ship: Ship,
  sailboat: Sailboat,
  'shopping-cart': ShoppingCart,
  wine: Wine,
  'chef-hat': ChefHat,
  utensils: Utensils,
  cake: Cake,
  trophy: Trophy,
  map: MapIcon,
  camera: Camera,
  music: Music,
  calendar: Calendar,
  ticket: Ticket,
  home: Home,
  sparkles: Sparkles,
  flower: Flower,
  gift: Gift,
  heart: Heart,
  baby: Baby,
  users: Users,
  dog: Dog,
  'concierge-bell': ConciergeBell,
}

const CATEGORY_LABELS: Record<
  ConciergeService['category'],
  { en: string; es: string }
> = {
  transport: { en: 'Transport & Transfers', es: 'Transporte y Traslados' },
  food: { en: 'Food & Beverage', es: 'Comida y Bebidas' },
  experiences: { en: 'Experiences & Activities', es: 'Experiencias y Actividades' },
  home: { en: 'Home & Lifestyle', es: 'Hogar y Estilo de Vida' },
  wellness: { en: 'Wellness & Family', es: 'Bienestar y Familia' },
}

const CATEGORY_ORDER: ConciergeService['category'][] = [
  'transport',
  'food',
  'experiences',
  'home',
  'wellness',
]

export default function ConciergePageClient({ services }: Props) {
  const { locale, t } = useLocale()

  // Group by category, preserving the schema's intended display order.
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: services.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="bg-stone-50">
      {/* HERO */}
      <section className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <ConciergeBell className="w-5 h-5 text-stone-500" />
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              {t({ en: 'Concierge', es: 'Conserjería' })}
            </p>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-stone-900 leading-[1.1] tracking-tight max-w-4xl">
            {t({
              en: 'Add anything you need ',
              es: 'Agrega lo que necesites ',
            })}
            <span className="italic text-stone-700">
              {t({ en: 'to your stay.', es: 'a tu estadía.' })}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 font-light mt-8 max-w-2xl leading-relaxed">
            {t({
              en: 'When you rent with Leticia, you can add a personal concierge to your stay. The supermarket run, the airport pickup, the dinner reservation, the Sunday excursion — pick what you need and we will arrange it. Each service is quoted separately, exclusive to our renters.',
              es: 'Cuando alquilas con Leticia, puedes agregar una conserjería personal a tu estadía. La compra del supermercado, el traslado al aeropuerto, la reserva de cena, la excursión del domingo — elige lo que necesitas y lo coordinamos. Cada servicio se cotiza por separado y es exclusivo para nuestros huéspedes.',
            })}
          </p>

          {/* Tag clarifying the model — small but visible right under the
              hero text so visitors don't assume the services are bundled
              into the rental price. */}
          <p className="text-xs text-stone-500 font-light mt-4 tracking-wide uppercase">
            {t({
              en: 'Optional add-ons · Quoted on request · Available to Leticia renters',
              es: 'Servicios opcionales · Cotizados a solicitud · Disponible para huéspedes de Leticia',
            })}
          </p>

          <div className="flex flex-wrap gap-3 mt-10">
            <a
              href="https://wa.me/18293422566"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-light tracking-wide rounded-sm hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t({ en: 'Request a service', es: 'Solicitar un servicio' })}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t({ en: 'Send a message', es: 'Enviar un mensaje' })}
            </Link>
          </div>
        </div>
      </section>

      {/* GRID — grouped by category */}
      <section className="container mx-auto px-4 py-16 sm:py-20 max-w-6xl">
        {grouped.length === 0 ? (
          <EmptyState
            message={t({
              en: 'Service catalog coming soon. In the meantime, message us with what you need.',
              es: 'Catálogo de servicios próximamente. Mientras tanto, escríbenos con lo que necesites.',
            })}
          />
        ) : (
          <div className="space-y-16">
            {grouped.map(({ category, items }) => (
              <div key={category}>
                <h2 className="text-2xl sm:text-3xl font-light text-stone-900 mb-2">
                  {CATEGORY_LABELS[category][locale]}
                </h2>
                <div className="h-px bg-stone-200 mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-stone-900 text-stone-50">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-light leading-tight mb-6">
            {t({
              en: "Don't see what you need?",
              es: '¿No ves lo que necesitas?',
            })}
          </h2>
          <p className="text-stone-300 font-light max-w-xl mx-auto mb-10">
            {t({
              en: 'The list above is just a starting point. If you can think of it, we can probably arrange it. Tell us what you have in mind.',
              es: 'La lista de arriba es solo el punto de partida. Si lo puedes imaginar, probablemente lo podemos organizar. Cuéntanos qué tienes en mente.',
            })}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/18293422566"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-light tracking-wide rounded-sm hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t({ en: 'Send a message', es: 'Enviar un mensaje' })}
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 border border-stone-700 text-stone-200 text-sm font-light tracking-wide rounded-sm hover:bg-stone-800 transition-colors"
            >
              {t({ en: 'Browse properties', es: 'Ver propiedades' })}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ServiceCard({
  service,
  locale,
}: {
  service: ConciergeService
  locale: 'en' | 'es'
}) {
  const Icon = ICON_MAP[service.icon] ?? ConciergeBell
  const name = locale === 'es' ? service.name_es : service.name_en
  const blurb =
    locale === 'es'
      ? service.shortDescription_es || service.description_es
      : service.shortDescription_en || service.description_en

  const price = service.priceFrom?.amount
    ? formatPrice(service.priceFrom, locale)
    : null

  const hasImage = Boolean(service.image?.asset)
  const imageUrl = hasImage
    ? urlFor(service.image).width(800).height(600).fit('crop').url()
    : null

  return (
    <article
      className={`group relative bg-white border rounded-xs overflow-hidden transition-all hover:border-stone-400 hover:shadow-sm ${
        service.isFeatured ? 'border-stone-300' : 'border-stone-200'
      }`}
    >
      {/* Image header — shown when an image is set in Sanity. The icon
          stays as a small badge overlay so the visual language is
          consistent with image-less cards. */}
      {imageUrl && (
        <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={service.image?.alt || name || ''}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 p-2 rounded-sm bg-white/90 backdrop-blur-sm text-stone-800 shadow-sm">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className={`p-6 ${imageUrl ? '' : 'flex items-start gap-4'}`}>
        {!imageUrl && (
          <div className="p-3 rounded-sm bg-stone-100 text-stone-700 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-light text-stone-900 leading-tight">
            {name}
          </h3>
          {blurb && (
            <p className="text-sm text-stone-600 font-light leading-relaxed mt-2">
              {blurb}
            </p>
          )}
          {price && (
            <p className="text-xs text-stone-500 font-light mt-3 tracking-wide">
              {price}
            </p>
          )}
        </div>
      </div>

      {service.isFeatured && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-white/90 font-light">
          ★
        </span>
      )}
    </article>
  )
}

function formatPrice(
  priceFrom: NonNullable<ConciergeService['priceFrom']>,
  locale: 'en' | 'es'
): string {
  const { amount, currency = 'USD', unit = 'request' } = priceFrom
  if (!amount) return ''
  const formatted = new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
  const unitLabels: Record<string, { en: string; es: string }> = {
    request: { en: 'per request', es: 'por solicitud' },
    person: { en: 'per person', es: 'por persona' },
    hour: { en: 'per hour', es: 'por hora' },
    day: { en: 'per day', es: 'por día' },
    trip: { en: 'per trip', es: 'por viaje' },
  }
  const fromLabel = locale === 'es' ? 'desde' : 'from'
  const unitLabel = unitLabels[unit]?.[locale] ?? ''
  return `${fromLabel} ${formatted}${unitLabel ? ` · ${unitLabel}` : ''}`
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xs p-12 text-center">
      <ConciergeBell className="w-10 h-10 text-stone-300 mx-auto mb-4" />
      <p className="text-stone-600 font-light">{message}</p>
    </div>
  )
}
