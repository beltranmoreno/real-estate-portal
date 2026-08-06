'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Send,
  CheckCircle,
  ChevronDown,
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

  // ── Contact form (merged in from the old /contact page) ──────────────────
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const onFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      setSent(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSent(false), 4000)
    } catch {
      setSendError(
        t({
          en: 'Could not send. Please try again or reach us directly below.',
          es: 'No se pudo enviar. Inténtalo de nuevo o contáctanos directamente abajo.',
        })
      )
    } finally {
      setSending(false)
    }
  }

  const PHONE = '+1 (829) 342-2566'
  const WHATSAPP_DIGITS = founder?.whatsapp?.replace(/[^0-9]/g, '') || '18293422566'
  const EMAIL = 'leticiacoudrayrealestate@gmail.com'
  const contactChannels = [
    { icon: Phone, label: t({ en: 'Call', es: 'Llamar' }), value: PHONE, href: `tel:${PHONE}` },
    { icon: MessageCircle, label: 'WhatsApp', value: PHONE, href: `https://wa.me/${WHATSAPP_DIGITS}` },
    { icon: Mail, label: t({ en: 'Email', es: 'Correo' }), value: EMAIL, href: `mailto:${EMAIL}` },
    { icon: InstagramIcon, label: 'Instagram', value: '@leticiacoudrayrealestate', href: 'https://instagram.com/leticiacoudrayrealestate' },
  ]

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
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-line text-ink text-sm font-light tracking-wide rounded-sm hover:bg-sand transition-colors"
            >
              {t({ en: 'Get in touch', es: 'Contáctanos' })}
            </a>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-line border border-line">
            <Stat
              value={`${yearsExperience}+`}
              label={t({ en: 'Years in Casa de Campo', es: 'Años en Casa de Campo' })}
            />
            <Stat
              value={propertyCount > 0 ? `${propertyCount}` : '—'}
              label={t({
                en: 'Properties curated',
                es: 'Propiedades seleccionadas',
              })}
            />
            <Stat
              value={`${allLanguages.length}`}
              label={t({ en: 'Languages spoken', es: 'Idiomas hablados' })}
            />
            <Stat
              value="12"
              label={t({ en: 'Concierge services offered', es: 'Servicios de conserjería ofrecidos' })}
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

      {/* CONTACT — merged in from the old /contact page */}
      <section id="contact" className="bg-white border-t border-line scroll-mt-24">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left — invitation + direct channels */}
            <div>
              <span className="eyebrow !text-brand">{t({ en: 'Contact', es: 'Contacto' })}</span>
              <h2 className="font-display text-3xl sm:text-4xl text-ink mt-3 mb-5 leading-tight">
                {t({
                  en: "Let's find a home worth coming back to.",
                  es: 'Encontremos una casa a la que valga la pena volver.',
                })}
              </h2>
              <p className="text-muted font-light leading-relaxed measure-lede">
                {t({
                  en: 'Tell us the week and what matters most — a quiet morning view, a kitchen built for entertaining, walking distance to the marina. We reply personally, usually within the day.',
                  es: 'Cuéntanos la semana y lo que más te importa — una vista tranquila, una cocina para recibir, caminata a la marina. Respondemos personalmente, normalmente el mismo día.',
                })}
              </p>

              <ul className="mt-10 border-t border-line">
                {contactChannels.map((c) => {
                  const Icon = c.icon
                  const external = c.href.startsWith('http')
                  return (
                    <li key={c.label} className="border-b border-line-soft">
                      <a
                        href={c.href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-4 py-4 group"
                      >
                        <Icon className="w-5 h-5 text-brand shrink-0" />
                        <span className="flex-1 flex items-baseline justify-between gap-3">
                          <span className="eyebrow">{c.label}</span>
                          <span className="text-[15px] font-light text-body-strong group-hover:text-ink transition-colors">
                            {c.value}
                          </span>
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Right — message form */}
            <div>
              {sent ? (
                <div className="flex flex-col items-center justify-center text-center border border-line p-12 h-full">
                  <CheckCircle className="w-12 h-12 text-status-confirmed mb-4" />
                  <h3 className="font-title text-2xl text-ink mb-2">
                    {t({ en: 'Message sent', es: 'Mensaje enviado' })}
                  </h3>
                  <p className="text-muted font-light">
                    {t({ en: "Thank you — we'll be in touch shortly.", es: 'Gracias — te contactaremos pronto.' })}
                  </p>
                </div>
              ) : (
                <form onSubmit={submitContact} className="space-y-6">
                  {sendError && (
                    <p className="p-4 bg-status-attention-bg border border-status-attention-border text-status-attention text-sm">
                      {sendError}
                    </p>
                  )}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <label className="block">
                      <span className="eyebrow">{t({ en: 'Name', es: 'Nombre' })}</span>
                      <Input variant="underline" name="name" required value={form.name} onChange={onFormChange} className="mt-2" />
                    </label>
                    <label className="block">
                      <span className="eyebrow">{t({ en: 'Email', es: 'Correo' })}</span>
                      <Input variant="underline" type="email" name="email" required value={form.email} onChange={onFormChange} className="mt-2" />
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <label className="block">
                      <span className="eyebrow">{t({ en: 'Phone', es: 'Teléfono' })}</span>
                      <Input variant="underline" type="tel" name="phone" value={form.phone} onChange={onFormChange} className="mt-2" />
                    </label>
                    <label className="block">
                      <span className="eyebrow">{t({ en: 'I am interested in', es: 'Me interesa' })}</span>
                      <div className="relative mt-2">
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={onFormChange}
                          className="w-full h-10 bg-transparent border-0 border-b border-control-border pr-8 text-[15px] font-light text-ink focus:outline-none focus:border-brand appearance-none"
                        >
                          <option value="">{t({ en: 'Select…', es: 'Seleccionar…' })}</option>
                          <option value="renting">{t({ en: 'Renting a villa', es: 'Alquilar una villa' })}</option>
                          <option value="buying">{t({ en: 'Buying a property', es: 'Comprar una propiedad' })}</option>
                          <option value="selling">{t({ en: 'Selling a property', es: 'Vender una propiedad' })}</option>
                          <option value="other">{t({ en: 'Something else', es: 'Otra cosa' })}</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                      </div>
                    </label>
                  </div>
                  <label className="block">
                    <span className="eyebrow">{t({ en: 'Message', es: 'Mensaje' })}</span>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={onFormChange}
                      placeholder={t({ en: 'Tell us what you have in mind…', es: 'Cuéntanos qué tienes en mente…' })}
                      className="mt-2 w-full bg-surface border border-line rounded-[2px] p-3 text-[15px] font-light text-ink placeholder:text-faint focus:outline-none focus:border-brand resize-none"
                    />
                  </label>
                  <Button type="submit" disabled={sending} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? t({ en: 'Sending…', es: 'Enviando…' }) : t({ en: 'Send message', es: 'Enviar mensaje' })}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------- subcomponents ----------

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-6 sm:p-8">
      <div className="font-display text-4xl sm:text-5xl text-ink mb-3 leading-none">
        {value}
      </div>
      <div className="eyebrow">
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
