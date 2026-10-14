'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Mail,
  Phone,
  MessageCircle,
  ArrowRight,
  Send,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import type { AboutAgent } from './page'

interface Props {
  agents: AboutAgent[]
  propertyCount: number
  conciergeCount: number
  sectorCount: number
  heroImageUrl: string | null
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

export default function AboutPageClient({ agents, propertyCount, conciergeCount, sectorCount, heroImageUrl }: Props) {
  const { locale, t } = useLocale()

  const [founder, ...team] = agents

  // Only stats backed by real data — nothing invented when a field is empty.
  const stats = [
    founder?.yearsExperience
      ? { value: `${founder.yearsExperience}+`, label: t({ en: 'Years in practice', es: 'Años de trayectoria' }) }
      : null,
    propertyCount > 0
      ? { value: `${propertyCount}`, label: t({ en: 'Residences represented', es: 'Residencias representadas' }) }
      : null,
    sectorCount > 0
      ? { value: `${sectorCount}`, label: t({ en: 'Casa de Campo sectors', es: 'Sectores de Casa de Campo' }) }
      : null,
    conciergeCount > 0
      ? { value: `${conciergeCount}`, label: t({ en: 'Concierge services', es: 'Servicios de conserjería' }) }
      : null,
  ].filter((s): s is { value: string; label: string } => s !== null)

  const principles = [
    {
      title: t({ en: 'Personal service', es: 'Servicio personal' }),
      body: t({
        en: 'You will not be passed between assistants. The same person who shows you a home walks the closing with you, and answers the call when something needs fixing two years later.',
        es: 'No te pasarán entre asistentes. La misma persona que te muestra una casa también está contigo en el cierre y responde la llamada cuando algo necesita arreglarse dos años después.',
      }),
    },
    {
      title: t({ en: 'Local expertise', es: 'Conocimiento local' }),
      body: t({
        en: 'We live here. We know which sector catches the morning breeze, which restaurant the locals actually go to, and which builder you can trust with a renovation.',
        es: 'Vivimos aquí. Sabemos qué sector tiene la mejor brisa, a qué restaurante van los locales, y a qué constructor puedes confiarle una renovación.',
      }),
    },
    {
      title: t({ en: 'Curation over catalog', es: 'Curaduría, no catálogo' }),
      body: t({
        en: 'We turn down listings. A small, well-known portfolio means more time spent on each home — and a higher floor on quality.',
        es: 'Rechazamos listados. Una cartera pequeña y bien conocida significa más tiempo dedicado a cada propiedad — y un piso más alto en calidad.',
      }),
    },
    {
      title: t({ en: 'Discretion', es: 'Discreción' }),
      body: t({
        en: 'Off-market opportunities, private collections, and confidential transactions are part of how we work. Many of our owners only show their homes to people we introduce.',
        es: 'Oportunidades fuera del mercado, colecciones privadas y transacciones confidenciales son parte de cómo trabajamos. Muchos dueños solo muestran sus casas a personas que presentamos.',
      }),
    },
  ]

  const offerings = [
    {
      eyebrow: t({ en: 'Stays', es: 'Estancias' }),
      title: t({ en: 'Villas for a week or a season', es: 'Villas por una semana o una temporada' }),
      body: t({
        en: 'A short list of houses we know well, matched to who is coming and what the trip is for.',
        es: 'Una lista corta de casas que conocemos bien, elegidas según quién viene y para qué es el viaje.',
      }),
      href: '/search',
      cta: t({ en: 'Browse residences', es: 'Ver residencias' }),
    },
    {
      eyebrow: t({ en: 'Concierge', es: 'Conserjería' }),
      title: t({ en: 'Everything around the stay', es: 'Todo alrededor de la estancia' }),
      body: t({
        en: 'Transfers, golf carts, chefs, boats and tables, arranged by the same team before you land.',
        es: 'Traslados, carritos de golf, chefs, barcos y mesas, organizados por el mismo equipo antes de que aterrices.',
      }),
      href: '/services/concierge',
      cta: t({ en: 'Concierge services', es: 'Servicios de conserjería' }),
    },
    {
      eyebrow: t({ en: 'Buying & selling', es: 'Compra y venta' }),
      title: t({ en: 'Homes that change hands quietly', es: 'Casas que cambian de dueño con discreción' }),
      body: t({
        en: 'Listed and off-market residences, shown privately, with one person beside you through closing.',
        es: 'Residencias publicadas y fuera del mercado, mostradas en privado, con una sola persona a tu lado hasta el cierre.',
      }),
      href: '/search?listingType=sale',
      cta: t({ en: 'Residences for sale', es: 'Residencias en venta' }),
    },
  ]

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

  const founderBio = founder
    ? (locale === 'es' ? founder.bio_es || founder.bio_en : founder.bio_en || founder.bio_es) || ''
    : ''
  const founderTitle = founder
    ? locale === 'es'
      ? founder.positionTitle_es || founder.positionTitle_en
      : founder.positionTitle_en || founder.positionTitle_es
    : undefined

  return (
    <div className="bg-canvas">
      {/* HERO */}
      <section className="border-b border-line">
        <div className="container mx-auto px-4 pt-20 sm:pt-28 pb-14 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
            <div className="lg:col-span-7">
              <span className="eyebrow">{t({ en: 'About', es: 'Acerca de' })}</span>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] measure-display">
                {t({
                  en: 'Caribbean luxury, personally curated.',
                  es: 'Lujo caribeño, personalmente curado.',
                })}
              </h1>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg text-body-strong font-light leading-relaxed">
                {t({
                  en: 'A boutique real estate practice rooted in Casa de Campo. We represent a small, hand-selected portfolio of homes — and the families who own and visit them.',
                  es: 'Una práctica inmobiliaria boutique con raíces en Casa de Campo. Representamos una cartera pequeña y cuidadosamente seleccionada de propiedades — y las familias que las habitan y las visitan.',
                })}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-surface text-xs uppercase tracking-[0.16em] rounded-[2px] hover:bg-brand transition-colors"
                >
                  {t({ en: 'Browse residences', es: 'Ver residencias' })}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-control-border text-ink text-xs uppercase tracking-[0.16em] rounded-[2px] hover:border-ink transition-colors"
                >
                  {t({ en: 'Get in touch', es: 'Contáctanos' })}
                </a>
              </div>
            </div>
          </div>
        </div>

        {heroImageUrl && (
          <div className="relative aspect-[4/3] sm:aspect-[21/9] w-full bg-sand">
            <Image
              src={heroImageUrl}
              alt={t({ en: 'Casa de Campo', es: 'Casa de Campo' })}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
      </section>

      {/* FOUNDER */}
      {founder && (
        <section className="container mx-auto px-4 py-20 sm:py-28">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            {founder.photo && (
              <div className="md:col-span-5 lg:col-span-4">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand">
                  <Image
                    src={urlFor(founder.photo).width(800).height(1000).fit('crop').url()}
                    alt={founder.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 35vw"
                  />
                </div>
              </div>
            )}

            <div className={founder.photo ? 'md:col-span-7 lg:col-span-7 lg:col-start-6' : 'md:col-span-12 max-w-3xl'}>
              <span className="eyebrow">{t({ en: 'Founder', es: 'Fundadora' })}</span>
              <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">{founder.name}</h2>
              {founderTitle && (
                <p className="mt-2 text-sm text-muted font-light">{founderTitle}</p>
              )}

              {founderBio && (
                <div className="mt-8 space-y-5 text-lg text-body-strong font-light leading-relaxed measure-lede">
                  {founderBio.split(/\n\s*\n/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              <AgentMeta agent={founder} locale={locale} className="mt-8" />
            </div>
          </div>
        </section>
      )}

      {/* BY THE NUMBERS */}
      {stats.length > 0 && (
        <section className="border-y border-line">
          <div className="container mx-auto px-4">
            <dl className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-10 sm:py-12 px-0 sm:px-8 first:sm:pl-0 ${i % 2 === 1 ? 'pl-6 border-l border-line' : ''} ${i >= 2 ? 'border-t lg:border-t-0 border-line' : ''} ${i > 0 ? 'lg:border-l lg:pl-8' : ''}`}
                >
                  <dd className="font-display text-4xl sm:text-5xl text-ink leading-none">{s.value}</dd>
                  <dt className="eyebrow mt-3">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* OUR APPROACH */}
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <span className="eyebrow">{t({ en: 'Our approach', es: 'Nuestro enfoque' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t({
                en: 'Four things we obsess over.',
                es: 'Cuatro cosas que cuidamos con obsesión.',
              })}
            </h2>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 border-t border-line">
            {principles.map((p, i) => (
              <li key={p.title} className="py-8 border-b border-line">
                <span className="eyebrow">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-title text-xl text-ink">{p.title}</h3>
                <p className="mt-2 text-muted font-light leading-relaxed">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="bg-sand/40 border-y border-line">
        <div className="container mx-auto px-4 py-20 sm:py-24">
          <span className="eyebrow">{t({ en: 'What we do', es: 'Qué hacemos' })}</span>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {offerings.map((o) => (
              <Link key={o.href} href={o.href} className="group block border-t border-ink pt-6">
                <span className="eyebrow">{o.eyebrow}</span>
                <h3 className="mt-3 font-title text-2xl text-ink leading-tight decoration-1 underline-offset-4 group-hover:underline">
                  {o.title}
                </h3>
                <p className="mt-3 text-muted font-light leading-relaxed">{o.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink">
                  {o.cta}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* THE TEAM — everyone after the founder */}
      {team.length > 0 && (
        <section className="container mx-auto px-4 py-20 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="eyebrow">{t({ en: 'The team', es: 'El equipo' })}</span>
              <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
                {t({
                  en: 'Familiar faces, every step.',
                  es: 'Caras familiares, en cada paso.',
                })}
              </h2>
            </div>
            <div className="lg:col-span-8 border-t border-line">
              {team.map((agent) => (
                <TeamMember key={agent._id} agent={agent} locale={locale} />
              ))}
            </div>
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

/** Languages + direct contact icons for an agent. */
function AgentMeta({
  agent,
  locale,
  className = '',
}: {
  agent: AboutAgent
  locale: 'en' | 'es'
  className?: string
}) {
  const langs = (agent.languages ?? [])
    .map((l) => LANGUAGE_LABELS[l]?.[locale])
    .filter(Boolean)

  const links = [
    agent.email && { href: `mailto:${agent.email}`, label: 'Email', Icon: Mail, external: false },
    agent.phone && { href: `tel:${agent.phone}`, label: locale === 'es' ? 'Teléfono' : 'Phone', Icon: Phone, external: false },
    agent.whatsapp && {
      href: `https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`,
      label: 'WhatsApp',
      Icon: MessageCircle,
      external: true,
    },
    agent.instagram && {
      href: `https://instagram.com/${agent.instagram}`,
      label: 'Instagram',
      Icon: InstagramIcon,
      external: true,
    },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; external: boolean }[]

  if (langs.length === 0 && links.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${className}`}>
      {langs.length > 0 && (
        <p className="text-xs uppercase tracking-[0.14em] text-muted-2 font-light">
          {locale === 'es' ? 'Habla' : 'Speaks'} {langs.join(' · ')}
        </p>
      )}
      {links.length > 0 && (
        <div className="flex items-center gap-2">
          {links.map(({ href, label, Icon, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center border border-line text-body-strong hover:border-ink hover:text-ink transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function TeamMember({
  agent,
  locale,
}: {
  agent: AboutAgent
  locale: 'en' | 'es'
}) {
  const bio = locale === 'es' ? agent.bio_es || agent.bio_en : agent.bio_en || agent.bio_es
  const positionTitle = locale === 'es'
    ? agent.positionTitle_es || agent.positionTitle_en
    : agent.positionTitle_en || agent.positionTitle_es

  return (
    <article className="flex gap-6 py-8 border-b border-line">
      {agent.photo && (
        <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-sand">
          <Image
            src={urlFor(agent.photo).width(240).height(280).fit('crop').url()}
            alt={agent.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-title text-xl text-ink">{agent.name}</h3>
        {positionTitle && (
          <p className="text-sm text-muted font-light mt-0.5">{positionTitle}</p>
        )}
        {bio && (
          <p className="text-sm text-muted font-light leading-relaxed mt-3 max-w-2xl">{bio}</p>
        )}
        <AgentMeta agent={agent} locale={locale} className="mt-4" />
      </div>
    </article>
  )
}
