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
  Quote,
  ArrowRight,
} from 'lucide-react'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
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
    <div className="bg-canvas">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-line">
        <div className="container mx-auto px-4 py-20 sm:py-28 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-6">
            {t({ en: 'About', es: 'Acerca de' })}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink max-w-4xl">
            {t({
              en: 'Caribbean luxury, ',
              es: 'Lujo caribeño, ',
            })}
            <span className="italic text-body-strong">
              {t({ en: 'personally curated.', es: 'personalmente curado.' })}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted font-light mt-8 max-w-2xl leading-relaxed">
            {t({
              en: 'A boutique real estate practice rooted in Casa de Campo. We represent a small, hand-selected portfolio of homes — and the families who own and visit them.',
              es: 'Una práctica inmobiliaria boutique con raíces en Casa de Campo. Representamos una cartera pequeña y cuidadosamente seleccionada de propiedades — y las familias que las habitan y las visitan.',
            })}
          </p>

          <div className="flex flex-wrap gap-3 mt-10">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-sm font-light tracking-wide rounded-sm hover:bg-ink transition-colors"
            >
              {t({ en: 'Browse properties', es: 'Ver propiedades' })}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-line text-ink text-sm font-light tracking-wide rounded-sm hover:bg-sand transition-colors"
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
              <p className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-4">
                {t({ en: "Founder's note", es: 'Nota de la fundadora' })}
              </p>
              <Quote className="w-8 h-8 text-faint mb-4" />
              <p className="text-xl sm:text-2xl text-ink font-light leading-relaxed">
                {locale === 'es'
                  ? founder.bio_es ||
                    founder.bio_en ||
                    'Casa de Campo no es solo donde trabajo — es donde mi familia ha pasado los mejores momentos de nuestras vidas. Trato cada casa que represento como si fuera la mía.'
                  : founder.bio_en ||
                    founder.bio_es ||
                    "Casa de Campo isn't just where I work — it's where my family has spent the best moments of our lives. I treat every home I represent as if it were my own."}
              </p>
              <p className="text-sm text-muted-2 mt-6 font-light tracking-wide">
                — {founder.name}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* BY THE NUMBERS */}
      <section className="border-y border-line bg-white">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 gap-x-6 text-center">
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
          </div>
        </div>
      </section>

      {/* OUR APPROACH / VALUES */}
      <section className="container mx-auto px-4 py-20 sm:py-24 max-w-5xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-4">
          {t({ en: 'Our approach', es: 'Nuestro enfoque' })}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-ink mb-12 max-w-2xl leading-tight">
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
        <section className="bg-white border-y border-line">
          <div className="container mx-auto px-4 py-20 sm:py-24 max-w-6xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-4">
              {t({ en: 'The team', es: 'El equipo' })}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-ink mb-12 max-w-2xl leading-tight">
              {t({
                en: 'Familiar faces, every step.',
                es: 'Caras familiares, en cada paso.',
              })}
            </h2>

            <div className="flex flex-col divide-y divide-stone-200">
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
          <p className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-4">
            {t({ en: 'Where we work', es: 'Dónde trabajamos' })}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink mb-12 max-w-2xl leading-tight">
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
                  className="group flex items-center gap-2 py-2 text-body-strong hover:text-ink font-light"
                >
                  <MapPin className="w-3.5 h-3.5 text-faint group-hover:text-body-strong transition-colors" />
                  <span className="border-b border-transparent group-hover:border-ink transition-colors">
                    {title}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* CONTACT CTA */}
      <section className="bg-ink text-surface">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-4xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl leading-tight mb-6">
            {t({
              en: "Let's find a home worth coming back to.",
              es: 'Encontremos una casa a la que valga la pena volver.',
            })}
          </h2>
          <p className="text-white/70 font-light max-w-xl mx-auto mb-10">
            {t({
              en: 'Tell us what matters to you — a quiet morning view, a kitchen built for entertaining, walking distance to the marina. We will start there.',
              es: 'Cuéntanos qué te importa — una vista tranquila por la mañana, una cocina pensada para recibir, caminata a la marina. Empezamos por ahí.',
            })}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink text-sm font-light tracking-wide rounded-sm hover:bg-sand transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t({ en: 'Send a message', es: 'Enviar un mensaje' })}
            </Link>
            {founder?.whatsapp && (
              <a
                href={`https://wa.me/${founder.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white text-sm font-light tracking-wide rounded-[2px] hover:border-white hover:bg-white/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white/85 text-sm font-light tracking-wide rounded-[2px] hover:border-white hover:bg-white/10 transition-colors"
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
      <div className="text-4xl sm:text-5xl font-light text-ink mb-2 tracking-tight">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-muted-2 font-light uppercase tracking-wider">
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
    <div className="bg-white border border-line rounded-xs p-8">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-sm bg-sand text-body-strong shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-title text-lg text-ink mb-2">
            {title}
          </h3>
          <p className="text-muted font-light leading-relaxed">{body}</p>
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
  const positionTitle = locale === 'es' ? agent.positionTitle_es : agent.positionTitle_en
  const specs = (agent.specializations ?? [])
    .map((s) => SPECIALIZATION_LABELS[s]?.[locale])
    .filter(Boolean)
  const langs = (agent.languages ?? [])
    .map((l) => LANGUAGE_LABELS[l]?.[locale])
    .filter(Boolean)

  return (
    <article className="group flex flex-col sm:flex-row gap-6 sm:gap-10 py-10 first:pt-0 last:pb-0">
      {agent.photo && (
        <div className="relative aspect-[4/5] w-full sm:w-64 md:w-72 shrink-0 overflow-hidden rounded-xs bg-sand">
          <Image
            src={urlFor(agent.photo).width(600).height(750).fit('crop').url()}
            alt={agent.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, 288px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
      <h3 className="font-title text-xl text-ink">
        {agent.name}
      </h3>
      {positionTitle && (
        <p className="text-sm text-muted font-light mt-0.5">
          {positionTitle}
        </p>
      )}
      {agent.yearsExperience !== undefined && (
        <p className="text-xs text-muted-2 font-light uppercase tracking-wider mt-1">
          {agent.yearsExperience}+{' '}
          {locale === 'es' ? 'años de experiencia' : 'years experience'}
        </p>
      )}

      {bio && (
        <p className="text-sm text-muted font-light leading-relaxed mt-4 line-clamp-5">
          {bio}
        </p>
      )}

      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {specs.slice(0, 3).map((s, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 bg-sand text-body-strong font-light rounded-sm"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {langs.length > 0 && (
        <p className="text-xs text-muted-2 font-light mt-3">
          {locale === 'es' ? 'Habla' : 'Speaks'}: {langs.join(', ')}
        </p>
      )}

      <div className="flex items-center gap-3 mt-5">
        {agent.email && (
          <a
            href={`mailto:${agent.email}`}
            aria-label="Email"
            className="text-muted-2 hover:text-ink transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
        {agent.phone && (
          <a
            href={`tel:${agent.phone}`}
            aria-label="Phone"
            className="text-muted-2 hover:text-ink transition-colors"
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
            className="text-muted-2 hover:text-ink transition-colors"
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
            className="text-muted-2 hover:text-ink transition-colors"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        )}
      </div>
      </div>
    </article>
  )
}
