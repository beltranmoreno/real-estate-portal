'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import {
  Compass,
  Heart,
  Sparkles,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Linkedin,
  Facebook,
  Quote,
  ArrowRight,
} from 'lucide-react'
import type { AboutAgent, AboutAreaSummary } from './page'

interface Props {
  agents: AboutAgent[]
  areas: AboutAreaSummary[]
  propertyCount: number
}

/**
 * Translate a specialization slug into a display label per locale.
 * Mirrors the values in the agent schema's `specializations` field.
 */
const SPECIALIZATION_LABELS: Record<string, { en: string; es: string }> = {
  luxury: { en: 'Luxury Properties', es: 'Propiedades de Lujo' },
  vacation: { en: 'Vacation Rentals', es: 'Alquileres Vacacionales' },
  residential: { en: 'Residential Sales', es: 'Ventas Residenciales' },
  commercial: { en: 'Commercial Properties', es: 'Propiedades Comerciales' },
  investment: { en: 'Investment Properties', es: 'Inversión' },
  beachfront: { en: 'Beachfront', es: 'Frente al Mar' },
  golf: { en: 'Golf Properties', es: 'Propiedades de Golf' },
  developments: { en: 'New Developments', es: 'Nuevos Desarrollos' },
}

const LANGUAGE_LABELS: Record<string, { en: string; es: string }> = {
  en: { en: 'English', es: 'Inglés' },
  es: { en: 'Spanish', es: 'Español' },
  fr: { en: 'French', es: 'Francés' },
  de: { en: 'German', es: 'Alemán' },
  it: { en: 'Italian', es: 'Italiano' },
  pt: { en: 'Portuguese', es: 'Portugués' },
  ru: { en: 'Russian', es: 'Ruso' },
}

export default function AboutPageClient({ agents, areas, propertyCount }: Props) {
  const { locale, t } = useLocale()

  // Derived stats — pulled from real data when available, with sane
  // fallbacks for an early-stage firm that may not have everything wired up.
  const founder = agents[0]
  const yearsExperience = founder?.yearsExperience ?? 15
  const allLanguages = Array.from(
    new Set(agents.flatMap((a) => a.languages ?? ['en', 'es']))
  )

  return (
    <div className="bg-stone-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-20 sm:py-28 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-6">
            {t({ en: 'About', es: 'Acerca de' })}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-stone-900 leading-[1.1] tracking-tight max-w-4xl">
            {t({
              en: 'Caribbean luxury, ',
              es: 'Lujo caribeño, ',
            })}
            <span className="italic text-stone-700">
              {t({ en: 'personally curated.', es: 'personalmente curado.' })}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 font-light mt-8 max-w-2xl leading-relaxed">
            {t({
              en: 'A boutique real estate practice rooted in Casa de Campo. We represent a small, hand-selected portfolio of homes — and the families who own and visit them.',
              es: 'Una práctica inmobiliaria boutique con raíces en Casa de Campo. Representamos una cartera pequeña y cuidadosamente seleccionada de propiedades — y las familias que las habitan y las visitan.',
            })}
          </p>

          <div className="flex flex-wrap gap-3 mt-10">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
            >
              {t({ en: 'Browse properties', es: 'Ver propiedades' })}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
            >
              {t({ en: 'Get in touch', es: 'Contáctanos' })}
            </Link>
          </div>
        </div>
      </section>

      {/* FOUNDER'S NOTE — only renders when an agent is in Sanity */}
      {founder && (
        <section className="container mx-auto px-4 py-20 sm:py-24 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            {founder.photo && (
              <div className="md:col-span-5">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xs">
                  <Image
                    src={urlFor(founder.photo).width(800).height(1000).fit('crop').url()}
                    alt={founder.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
              </div>
            )}

            <div className={founder.photo ? 'md:col-span-7' : 'md:col-span-12'}>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-4">
                {t({ en: "Founder's note", es: 'Nota de la fundadora' })}
              </p>
              <Quote className="w-8 h-8 text-stone-300 mb-4" />
              <p className="text-xl sm:text-2xl text-stone-800 font-light leading-relaxed">
                {locale === 'es'
                  ? founder.bio_es ||
                    founder.bio_en ||
                    'Casa de Campo no es solo donde trabajo — es donde mi familia ha pasado los mejores momentos de nuestras vidas. Trato cada casa que represento como si fuera la mía.'
                  : founder.bio_en ||
                    founder.bio_es ||
                    "Casa de Campo isn't just where I work — it's where my family has spent the best moments of our lives. I treat every home I represent as if it were my own."}
              </p>
              <p className="text-sm text-stone-500 mt-6 font-light tracking-wide">
                — {founder.name}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* BY THE NUMBERS */}
      <section className="border-y border-stone-200 bg-white">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
            <Stat
              value={`${yearsExperience}+`}
              label={t({ en: 'Years in Casa de Campo', es: 'Años en Casa de Campo' })}
            />
            <Stat
              value={propertyCount > 0 ? `${propertyCount}` : '—'}
              label={t({
                en: 'Properties carefully curated',
                es: 'Propiedades cuidadosamente seleccionadas',
              })}
            />
            <Stat
              value={`${allLanguages.length}`}
              label={t({ en: 'Languages spoken', es: 'Idiomas hablados' })}
            />
            <Stat
              value={`${areas.length || 16}`}
              label={t({ en: 'Sectors served', es: 'Sectores servidos' })}
            />
          </div>
        </div>
      </section>

      {/* OUR APPROACH / VALUES */}
      <section className="container mx-auto px-4 py-20 sm:py-24 max-w-5xl">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-4">
          {t({ en: 'Our approach', es: 'Nuestro enfoque' })}
        </p>
        <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-12 max-w-2xl leading-tight">
          {t({
            en: 'Four things we obsess over.',
            es: 'Cuatro cosas que cuidamos con obsesión.',
          })}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValueCard
            icon={Heart}
            title={t({ en: 'Personal service', es: 'Servicio personal' })}
            body={t({
              en: 'You will not be passed between assistants. The same person who shows you a home walks the closing with you, and answers the call when something needs fixing two years later.',
              es: 'No te pasarán entre asistentes. La misma persona que te muestra una casa también está contigo en el cierre y responde la llamada cuando algo necesita arreglarse dos años después.',
            })}
          />
          <ValueCard
            icon={Compass}
            title={t({ en: 'Local expertise', es: 'Conocimiento local' })}
            body={t({
              en: 'We live here. We know which sector catches the morning breeze, which restaurant the locals actually go to, and which builder you can trust with a renovation.',
              es: 'Vivimos aquí. Sabemos qué sector tiene la mejor brisa, a qué restaurante van los locales, y a qué constructor puedes confiarle una renovación.',
            })}
          />
          <ValueCard
            icon={Sparkles}
            title={t({ en: 'Curation over catalog', es: 'Curaduría, no catálogo' })}
            body={t({
              en: 'We turn down listings. A small, well-known portfolio means more time spent on each home — and a higher floor on quality.',
              es: 'Rechazamos listados. Una cartera pequeña y bien conocida significa más tiempo dedicado a cada propiedad — y un piso más alto en calidad.',
            })}
          />
          <ValueCard
            icon={ShieldCheck}
            title={t({ en: 'Discretion', es: 'Discreción' })}
            body={t({
              en: 'Off-market opportunities, private collections, and confidential transactions are part of how we work. Many of our owners only show their homes to people we introduce.',
              es: 'Oportunidades fuera del mercado, colecciones privadas y transacciones confidenciales son parte de cómo trabajamos. Muchos dueños solo muestran sus casas a personas que presentamos.',
            })}
          />
        </div>
      </section>

      {/* MEET THE TEAM */}
      {agents.length > 0 && (
        <section className="bg-white border-y border-stone-200">
          <div className="container mx-auto px-4 py-20 sm:py-24 max-w-6xl">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-4">
              {t({ en: 'The team', es: 'El equipo' })}
            </p>
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-12 max-w-2xl leading-tight">
              {t({
                en: 'Familiar faces, every step.',
                es: 'Caras familiares, en cada paso.',
              })}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent) => (
                <AgentCard key={agent._id} agent={agent} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AREAS WE SERVE */}
      {areas.length > 0 && (
        <section className="container mx-auto px-4 py-20 sm:py-24 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-4">
            {t({ en: 'Where we work', es: 'Dónde trabajamos' })}
          </p>
          <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-12 max-w-2xl leading-tight">
            {t({
              en: 'Casa de Campo, sector by sector.',
              es: 'Casa de Campo, sector a sector.',
            })}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3">
            {areas.map((area) => {
              const title =
                locale === 'es'
                  ? area.title_es || area.title_en
                  : area.title_en || area.title_es
              return (
                <Link
                  key={area._id}
                  href={`/search?area=${encodeURIComponent(area.slug ?? '')}`}
                  className="group flex items-center gap-2 py-2 text-stone-700 hover:text-stone-900 font-light"
                >
                  <MapPin className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                  <span className="border-b border-transparent group-hover:border-stone-700 transition-colors">
                    {title}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* CONTACT CTA */}
      <section className="bg-stone-900 text-stone-50">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-light leading-tight mb-6">
            {t({
              en: "Let's find a home worth coming back to.",
              es: 'Encontremos una casa a la que valga la pena volver.',
            })}
          </h2>
          <p className="text-stone-300 font-light max-w-xl mx-auto mb-10">
            {t({
              en: 'Tell us what matters to you — a quiet morning view, a kitchen built for entertaining, walking distance to the marina. We will start there.',
              es: 'Cuéntanos qué te importa — una vista tranquila por la mañana, una cocina pensada para recibir, caminata a la marina. Empezamos por ahí.',
            })}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t({ en: 'Send a message', es: 'Enviar un mensaje' })}
            </Link>
            {founder?.whatsapp && (
              <a
                href={`https://wa.me/${founder.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-light tracking-wide rounded-sm hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 border border-stone-700 text-stone-200 text-sm font-light tracking-wide rounded-sm hover:bg-stone-800 transition-colors"
            >
              {t({ en: 'Browse properties', es: 'Ver propiedades' })}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------- subcomponents ----------

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl sm:text-5xl font-light text-stone-900 mb-2 tracking-tight">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-stone-500 font-light uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

function ValueCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xs p-8">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-sm bg-stone-100 text-stone-700 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-light text-stone-900 mb-2 tracking-wide">
            {title}
          </h3>
          <p className="text-stone-600 font-light leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  )
}

function AgentCard({
  agent,
  locale,
}: {
  agent: AboutAgent
  locale: 'en' | 'es'
}) {
  const bio = locale === 'es' ? agent.bio_es : agent.bio_en
  const specs = (agent.specializations ?? [])
    .map((s) => SPECIALIZATION_LABELS[s]?.[locale])
    .filter(Boolean)
  const langs = (agent.languages ?? [])
    .map((l) => LANGUAGE_LABELS[l]?.[locale])
    .filter(Boolean)

  return (
    <article className="group">
      {agent.photo && (
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xs mb-5 bg-stone-100">
          <Image
            src={urlFor(agent.photo).width(600).height(750).fit('crop').url()}
            alt={agent.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <h3 className="text-xl font-light text-stone-900 tracking-wide">
        {agent.name}
      </h3>
      {agent.yearsExperience !== undefined && (
        <p className="text-xs text-stone-500 font-light uppercase tracking-wider mt-1">
          {agent.yearsExperience}+{' '}
          {locale === 'es' ? 'años de experiencia' : 'years experience'}
        </p>
      )}

      {bio && (
        <p className="text-sm text-stone-600 font-light leading-relaxed mt-4 line-clamp-5">
          {bio}
        </p>
      )}

      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {specs.slice(0, 3).map((s, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 bg-stone-100 text-stone-700 font-light rounded-sm"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {langs.length > 0 && (
        <p className="text-xs text-stone-500 font-light mt-3">
          {locale === 'es' ? 'Habla' : 'Speaks'}: {langs.join(', ')}
        </p>
      )}

      <div className="flex items-center gap-3 mt-5">
        {agent.email && (
          <a
            href={`mailto:${agent.email}`}
            aria-label="Email"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
        {agent.phone && (
          <a
            href={`tel:${agent.phone}`}
            aria-label="Phone"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
        {agent.whatsapp && (
          <a
            href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
        {agent.instagram && (
          <a
            href={`https://instagram.com/${agent.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
        )}
        {agent.linkedin && (
          <a
            href={agent.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {agent.facebook && (
          <a
            href={agent.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            <Facebook className="w-4 h-4" />
          </a>
        )}
      </div>

      {agent.certifications && agent.certifications.length > 0 && (
        <ul className="mt-5 space-y-1 text-xs text-stone-500 font-light">
          {agent.certifications.slice(0, 3).map((c, i) => (
            <li key={i}>
              · {c.title}
              {c.issuer ? ` — ${c.issuer}` : ''}
              {c.year ? ` (${c.year})` : ''}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
