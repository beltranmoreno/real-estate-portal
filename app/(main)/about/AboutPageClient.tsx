'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { dateField, fieldLabelClass, selectClass, Textarea } from '@/components/ui/field'
import {
  Mail,
  Phone,
  MessageCircle,
  ArrowRight,
  ArrowUpRight,
  Send,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import type { AboutAgent } from './page'
import { PageHero } from '@/components/PageHero'
import type { PageHeroDoc } from '@/lib/pageHero'
import { Paragraphs } from '@/components/resort/Paragraphs'
import { ABOUT_PAGE_DEFAULTS } from '@/sanity/lib/aboutPageDefaults'
import { BUDGET_RANGES, PURCHASE_BUDGET_RANGES, type BudgetKey } from '@/lib/inquiry'
import { cn } from '@/lib/utils'

interface Props {
  agents: AboutAgent[]
  conciergeCount: number
  heroImageUrl: string | null
  hero: PageHeroDoc | null
  /** The Studio "About page" doc; empty fields use the shipped copy. */
  page: any
}

type Bi = { en: string; es: string }

const LANGUAGE_LABELS: Record<string, { en: string; es: string }> = {
  en: { en: 'English', es: 'Inglés' },
  es: { en: 'Spanish', es: 'Español' },
  fr: { en: 'French', es: 'Francés' },
  de: { en: 'German', es: 'Alemán' },
  it: { en: 'Italian', es: 'Italiano' },
  pt: { en: 'Portuguese', es: 'Portugués' },
  ru: { en: 'Russian', es: 'Ruso' },
}

export default function AboutPageClient({ agents, conciergeCount, heroImageUrl, hero, page }: Props) {
  const { locale, t } = useLocale()
  const D = ABOUT_PAGE_DEFAULTS
  // Studio value first (other language if only one is filled), then the default.
  const pick = (d: any, key: string, fallback: Bi) =>
    t({
      en: d?.[`${key}_en`]?.trim() || d?.[`${key}_es`]?.trim() || fallback.en,
      es: d?.[`${key}_es`]?.trim() || d?.[`${key}_en`]?.trim() || fallback.es,
    })
  const philosophy: { title: string; body: string }[] = (
    page?.philosophy?.length ? page.philosophy : D.philosophy.items.map((p) => ({ title_en: p.title.en, title_es: p.title.es, body_en: p.body.en, body_es: p.body.es }))
  ).map((p: any) => ({ title: pick(p, 'title', { en: '', es: '' }), body: pick(p, 'body', { en: '', es: '' }) }))

  const [founder, ...team] = agents

  // Only stats backed by real data — nothing invented when a field is empty.
  const stats = [
    founder?.yearsExperience
      ? { value: `${founder.yearsExperience}+`, label: t({ en: 'Years in practice', es: 'Años de trayectoria' }) }
      : null,
    // Figures supplied by Leticia, edited in Studio (About page → Founder).
    { value: page?.propertiesStat?.trim() || D.stats.properties, label: t({ en: 'Properties represented', es: 'Propiedades representadas' }) },
    { value: page?.bookingsStat?.trim() || D.stats.bookings, label: t({ en: 'Bookings', es: 'Reservas' }) },
    conciergeCount > 0
      ? { value: `${conciergeCount}`, label: t({ en: 'Concierge services', es: 'Servicios de conserjería' }) }
      : null,
  ].filter((s): s is { value: string; label: string } => s !== null)

  const offerings: { eyebrow: string; title: string; body: string; cta: string; href: string }[] = (
    page?.offerings?.length
      ? page.offerings
      : D.whatWeDo.items.map((o) => ({
          eyebrow_en: o.eyebrow.en, eyebrow_es: o.eyebrow.es,
          title_en: o.title.en, title_es: o.title.es,
          body_en: o.body.en, body_es: o.body.es,
          buttonLabel_en: o.buttonLabel.en, buttonLabel_es: o.buttonLabel.es,
          href: o.href,
        }))
  )
    .filter((o: any) => o.href)
    .map((o: any) => {
      const none = { en: '', es: '' }
      return { eyebrow: pick(o, 'eyebrow', none), title: pick(o, 'title', none), body: pick(o, 'body', none), cta: pick(o, 'buttonLabel', none), href: o.href }
    })

  // ── Contact form (the site's contact page; /contact redirects here) ──────
  // Renting is the default. Renting asks for dates, guests and a nightly
  // budget; buying for a purchase budget; selling for the property.
  const EMPTY_FORM = {
    name: '', email: '', phone: '', subject: 'renting', message: '',
    checkIn: '', checkOut: '', guests: '', propertyType: '',
  }
  const [form, setForm] = useState(EMPTY_FORM)
  const [budget, setBudget] = useState<BudgetKey | null>(null)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const renting = form.subject === 'renting'
  const buying = form.subject === 'buying'
  const selling = form.subject === 'selling'

  const onFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    // Nightly and purchase budgets don't carry over between subjects.
    if (name === 'subject') setBudget(null)
  }

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
          checkIn: (renting && form.checkIn) || undefined,
          checkOut: (renting && form.checkOut) || undefined,
          guests: (renting && form.guests) || undefined,
          propertyType: (selling && form.propertyType.trim()) || undefined,
          budget: ((renting || buying) && budget) || undefined,
          locale,
          page: 'about',
        }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      setSent(true)
      setForm(EMPTY_FORM)
      setBudget(null)
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
      {/* HERO — editable in Studio (Page Heroes → About) */}
      <PageHero page="about" doc={hero} fallbackImageUrl={heroImageUrl} />

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
              <span className="eyebrow">{pick(page, 'founderEyebrow', D.founder.eyebrow)}</span>
              <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">
                {pick(page, 'founderTitle', D.founder.title)}
              </h2>
              <p className="mt-3 text-sm text-muted font-light">
                {founder.name}
                {founderTitle && ` · ${founderTitle}`}
              </p>

              {founderBio && (
                <div className="mt-8 space-y-5 text-lg text-body-strong font-light leading-relaxed measure-lede">
                  {/* Blank line = new paragraph; single line break = new line. */}
                  {founderBio.trim().split(/\n\s*\n/).map((para, i) => (
                    <p key={i} className="whitespace-pre-line">{para.trim()}</p>
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

      {/* OUR BRAND — editable in Studio (Page Heroes → About page → Brand) */}
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="eyebrow">{pick(page, 'brandEyebrow', D.brand.eyebrow)}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">
              {pick(page, 'brandTitle', D.brand.title)}
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-9 space-y-5 text-lg text-body-strong font-light leading-relaxed measure-body">
            <Paragraphs text={pick(page, 'brandBody', D.brand.body)} />
          </div>
        </div>
      </section>

      {/* OUR PHILOSOPHY — editable in Studio (Page Heroes → About page → Philosophy) */}
      {philosophy.length > 0 && (
        <section className="border-t border-line">
          <div className="container mx-auto px-4 py-20 sm:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-4">
                <h2 className="font-title text-3xl sm:text-4xl text-ink leading-tight">
                  {pick(page, 'philosophyTitle', D.philosophy.title)}
                </h2>
              </div>
              <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 border-t border-line">
                {philosophy.map((p, i) => (
                  <li key={i} className="py-8 border-b border-line">
                    <span className="eyebrow">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-3 font-title text-xl text-ink">{p.title}</h3>
                    <p className="mt-2 text-muted font-light leading-relaxed">{p.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* WHAT WE DO — editable in Studio (Page Heroes → About page → What we do) */}
      <section className="bg-sand/40 border-y border-line">
        <div className="container mx-auto px-4 py-20 sm:py-24">
          <span className="eyebrow">{pick(page, 'whatWeDoEyebrow', D.whatWeDo.eyebrow)}</span>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {offerings.map((o) => (
              <Link key={o.href} href={o.href} className="group block border-t border-line pt-6">
                <span className="eyebrow">{o.eyebrow}</span>
                <h3 className="mt-3 font-title text-2xl text-ink leading-tight decoration-1 underline-offset-4 group-hover:underline">
                  {o.title}
                </h3>
                <p className="mt-3 text-muted font-light leading-relaxed">{o.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink">
                  {o.cta}
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
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

      {/* CONTACT — editable in Studio (Page Heroes → About page → Contact) */}
      <section id="contact" className="bg-canvas border-t border-line scroll-mt-24">
        <div className="container mx-auto px-4 py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left — invitation + direct channels */}
            <div>
              <span className="eyebrow !text-brand">{pick(page, 'contactEyebrow', D.contact.eyebrow)}</span>
              <h2 className="font-display text-3xl sm:text-4xl text-ink mt-3 mb-5 leading-tight whitespace-pre-line">
                {pick(page, 'contactTitle', D.contact.title)}
              </h2>
              <p className="text-muted font-light leading-relaxed measure-lede whitespace-pre-line">
                {pick(page, 'contactBody', D.contact.body)}
              </p>

              <ul className="mt-10 border-t border-line">
                {contactChannels.map((c) => {
                  const Icon = c.icon
                  const external = c.href.startsWith('http')
                  return (
                    <li key={c.label} className="border-b border-line">
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
                      <span className={fieldLabelClass}>{t({ en: 'Name', es: 'Nombre' })}</span>
                      <Input name="name" required value={form.name} onChange={onFormChange} />
                    </label>
                    <label className="block">
                      <span className={fieldLabelClass}>{t({ en: 'Email', es: 'Correo' })}</span>
                      <Input type="email" name="email" required value={form.email} onChange={onFormChange} />
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <label className="block">
                      <span className={fieldLabelClass}>{t({ en: 'Phone', es: 'Teléfono' })}</span>
                      <Input type="tel" name="phone" value={form.phone} onChange={onFormChange} />
                    </label>
                    <label className="block">
                      <span className={fieldLabelClass}>{t({ en: 'I am interested in', es: 'Me interesa' })}</span>
                      <div className="relative">
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={onFormChange}
                          className={selectClass}
                        >
                          <option value="renting">{t({ en: 'Renting a villa', es: 'Alquilar una villa' })}</option>
                          <option value="buying">{t({ en: 'Buying a property', es: 'Comprar una propiedad' })}</option>
                          <option value="selling">{t({ en: 'Selling a property', es: 'Vender una propiedad' })}</option>
                          <option value="other">{t({ en: 'Something else', es: 'Otra cosa' })}</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                      </div>
                    </label>
                  </div>

                  {renting && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <label className="block min-w-0">
                        <span className={fieldLabelClass}>{t({ en: 'Check-in', es: 'Llegada' })}</span>
                        <Input type="date" name="checkIn" value={form.checkIn} onChange={onFormChange} className={dateField} />
                      </label>
                      <label className="block min-w-0">
                        <span className={fieldLabelClass}>{t({ en: 'Check-out', es: 'Salida' })}</span>
                        <Input
                          type="date"
                          className={dateField}
                          name="checkOut"
                          min={form.checkIn || undefined}
                          value={form.checkOut}
                          onChange={onFormChange}
                        />
                      </label>
                      <label className="block">
                        <span className={fieldLabelClass}>{t({ en: 'Guests', es: 'Huéspedes' })}</span>
                        <Input
                          type="number"
                          name="guests"
                          min={1}
                          placeholder={t({ en: 'Number of guests', es: 'Número de huéspedes' })}
                          value={form.guests}
                          onChange={onFormChange}
                        />
                      </label>
                    </div>
                  )}

                  {selling && (
                    <label className="block">
                      <span className={fieldLabelClass}>{t({ en: 'Property or sector', es: 'Propiedad o sector' })}</span>
                      <Input
                        name="propertyType"
                        value={form.propertyType}
                        onChange={onFormChange}
                        placeholder={t({ en: 'e.g. Villa in Los Lagos', es: 'p. ej. Villa en Los Lagos' })}
                      />
                    </label>
                  )}

                  {(renting || buying) && (
                    <div role="group" aria-labelledby="contact-budget-label">
                      <p id="contact-budget-label" className={fieldLabelClass}>
                        {renting
                          ? t({ en: 'Budget per night (optional)', es: 'Presupuesto por noche (opcional)' })
                          : t({ en: 'Purchase budget (optional)', es: 'Presupuesto de compra (opcional)' })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(renting ? BUDGET_RANGES : PURCHASE_BUDGET_RANGES).map((range) => {
                          const active = budget === range.key
                          return (
                            <button
                              key={range.key}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setBudget(active ? null : range.key)}
                              className={cn(
                                'rounded-[2px] border px-3 py-2 text-xs transition-colors',
                                active
                                  ? 'border-ink bg-ink text-surface'
                                  : 'border-control-border text-body-strong hover:border-ink'
                              )}
                            >
                              {range[locale]}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <label className="block">
                    <span className={fieldLabelClass}>{t({ en: 'Message', es: 'Mensaje' })}</span>
                    <Textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={onFormChange}
                      placeholder={t({ en: 'Tell us what you have in mind…', es: 'Cuéntanos qué tienes en mente…' })}
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

      {/* For owners — editable in Studio (Page Heroes → About page → For owners) */}
      <section className="border-t border-line bg-sand/40">
        <div className="container mx-auto px-4 py-12 sm:py-14 flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-12">
          <div className="max-w-2xl">
            <span className="eyebrow">{pick(page, 'ownersEyebrow', D.owners.eyebrow)}</span>
            <p className="mt-2 font-title text-2xl sm:text-3xl text-ink leading-tight whitespace-pre-line">
              {pick(page, 'ownersTitle', D.owners.title)}
            </p>
            {pick(page, 'ownersBody', D.owners.body) && (
              <p className="mt-3 text-muted font-light leading-relaxed whitespace-pre-line">
                {pick(page, 'ownersBody', D.owners.body)}
              </p>
            )}
          </div>
          <Link
            href="/owners"
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-surface text-xs uppercase tracking-[0.16em] rounded-[2px] hover:bg-brand transition-colors"
          >
            {t({ en: 'Let’s work together', es: 'Trabajemos juntos' })}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
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
          <div className="mt-3 max-w-2xl space-y-3 text-sm text-muted font-light leading-relaxed">
            {bio.trim().split(/\n\s*\n/).map((para: string, i: number) => (
              <p key={i} className="whitespace-pre-line">{para.trim()}</p>
            ))}
          </div>
        )}
        <AgentMeta agent={agent} locale={locale} className="mt-4" />
      </div>
    </article>
  )
}
