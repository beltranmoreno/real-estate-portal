'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fieldLabelClass, Textarea } from '@/components/ui/field'
import { Mail, Phone, MessageCircle, ArrowRight, Send, CheckCircle } from 'lucide-react'

interface Props {
  heroImageUrl: string | null
}

const PHONE = '+1 (829) 342-2566'
const WHATSAPP_DIGITS = '18293422566'
const EMAIL = 'leticiacoudrayrealestate@gmail.com'

const EMPTY_FORM = { name: '', email: '', phone: '', property: '', message: '' }

export default function OwnersPageClient({ heroImageUrl }: Props) {
  const { locale, t } = useLocale()

  const reasons = [
    {
      title: t({ en: 'A selective portfolio', es: 'Una cartera selectiva' }),
      body: t({
        en: 'We represent a short list of houses, so yours is never lost in a catalog. Homes are presented in curated collections and among Leticia’s picks — chosen, not merely listed.',
        es: 'Representamos una lista corta de casas, así que la tuya nunca se pierde en un catálogo. Las propiedades se presentan en colecciones curadas y entre las selecciones de Leticia — elegidas, no simplemente publicadas.',
      }),
    },
    {
      title: t({ en: 'Guests we have spoken to', es: 'Huéspedes con quienes hemos hablado' }),
      body: t({
        en: 'There is no instant booking. Every stay begins with a personal enquiry, so we know who is coming, how many, and what the trip is for before your house is offered.',
        es: 'No hay reserva instantánea. Cada estancia comienza con una consulta personal, así sabemos quién viene, cuántos son y para qué es el viaje antes de ofrecer tu casa.',
      }),
    },
    {
      title: t({ en: 'Looked after during the stay', es: 'Atendidos durante la estancia' }),
      body: t({
        en: 'Our concierge arranges transfers, golf carts, chefs, boats and tables for your guests — and is the number they call when something comes up, not you.',
        es: 'Nuestra conserjería organiza traslados, carritos de golf, chefs, barcos y mesas para tus huéspedes — y es a quien llaman cuando surge algo, no a ti.',
      }),
    },
    {
      title: t({ en: 'Discretion', es: 'Discreción' }),
      body: t({
        en: 'Your house is shown only as widely as you wish. When selling, we can present it privately, off-market, to buyers we introduce personally.',
        es: 'Tu casa se muestra solo tanto como tú quieras. Si decides vender, podemos presentarla en privado, fuera del mercado, a compradores que presentamos personalmente.',
      }),
    },
  ]

  const services = [
    {
      eyebrow: t({ en: 'Rentals', es: 'Alquileres' }),
      title: t({ en: 'Your villa, rented with care', es: 'Tu villa, alquilada con cuidado' }),
      items: [
        t({ en: 'Photography and presentation on the site', es: 'Fotografía y presentación en el sitio' }),
        t({ en: 'Personal vetting of every enquiry', es: 'Revisión personal de cada consulta' }),
        t({ en: 'Check-in and welcome', es: 'Check-in y bienvenida' }),
        t({ en: 'Concierge for guests during the stay', es: 'Conserjería para los huéspedes durante la estancia' }),
        t({ en: 'A guest portal for each booking', es: 'Un portal de huésped para cada reserva' }),
      ],
      href: '/services/concierge',
      cta: t({ en: 'See the concierge', es: 'Ver la conserjería' }),
    },
    {
      eyebrow: t({ en: 'Sales', es: 'Ventas' }),
      title: t({ en: 'Selling, listed or private', es: 'Vender, publicado o en privado' }),
      items: [
        t({ en: 'A considered asking price and presentation', es: 'Un precio y una presentación bien pensados' }),
        t({ en: 'Public listing among our residences for sale', es: 'Publicación entre nuestras residencias en venta' }),
        t({ en: 'Or a private, off-market sale', es: 'O una venta privada, fuera del mercado' }),
        t({ en: 'Private viewings with qualified buyers', es: 'Visitas privadas con compradores calificados' }),
        t({ en: 'One person beside you through closing', es: 'Una sola persona a tu lado hasta el cierre' }),
      ],
      href: '/search?listingType=sale',
      cta: t({ en: 'Residences for sale', es: 'Residencias en venta' }),
    },
    {
      eyebrow: t({ en: 'Owner portal', es: 'Portal de propietarios' }),
      title: t({ en: 'Your houses, in one place', es: 'Tus casas, en un solo lugar' }),
      items: [
        t({ en: 'Private sign-in, by invitation', es: 'Acceso privado, por invitación' }),
        t({ en: 'The properties we represent for you', es: 'Las propiedades que representamos para ti' }),
        t({ en: 'Notes from us on each house', es: 'Notas nuestras sobre cada casa' }),
      ],
      href: '/portal/sign-in',
      cta: t({ en: 'Owner sign-in', es: 'Acceso de propietarios' }),
    },
  ]

  const steps = [
    {
      title: t({ en: 'A conversation', es: 'Una conversación' }),
      body: t({
        en: 'Tell us about the house and what you want from it — rental income, a sale, or both.',
        es: 'Cuéntanos sobre la casa y qué esperas de ella — ingresos por alquiler, una venta, o ambos.',
      }),
    },
    {
      title: t({ en: 'A visit and photographs', es: 'Una visita y fotografías' }),
      body: t({
        en: 'We walk the house with you, agree on how it should be presented, and arrange photography.',
        es: 'Recorremos la casa contigo, acordamos cómo presentarla y organizamos las fotografías.',
      }),
    },
    {
      title: t({ en: 'The listing', es: 'La publicación' }),
      body: t({
        en: 'Your house goes on the site — or stays private — on terms we agree together.',
        es: 'Tu casa se publica en el sitio — o se mantiene en privado — en los términos que acordemos juntos.',
      }),
    },
    {
      title: t({ en: 'Ongoing', es: 'Seguimiento continuo' }),
      body: t({
        en: 'We handle enquiries, guests and viewings, and keep you informed along the way.',
        es: 'Nos encargamos de consultas, huéspedes y visitas, y te mantenemos informado en todo momento.',
      }),
    },
  ]

  // ── Contact form ────────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const onFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

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
          subject: 'Owner enquiry',
          // /api/contact renders this as "Property Type" in the notification email.
          propertyType: form.property,
          message: form.message,
          locale,
        }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      setSent(true)
      setForm(EMPTY_FORM)
      setTimeout(() => setSent(false), 4000)
    } catch {
      setSendError(
        t({
          en: 'Could not send. Please try again or reach us directly.',
          es: 'No se pudo enviar. Inténtalo de nuevo o contáctanos directamente.',
        })
      )
    } finally {
      setSending(false)
    }
  }

  const contactChannels = [
    { icon: Phone, label: t({ en: 'Call', es: 'Llamar' }), value: PHONE, href: `tel:${PHONE}` },
    { icon: MessageCircle, label: 'WhatsApp', value: PHONE, href: `https://wa.me/${WHATSAPP_DIGITS}` },
    { icon: Mail, label: t({ en: 'Email', es: 'Correo' }), value: EMAIL, href: `mailto:${EMAIL}` },
  ]

  return (
    <div className="bg-canvas">
      {/* HERO */}
      <section className="border-b border-line">
        <div className="container mx-auto px-4 pt-24 sm:pt-36 pb-16 sm:pb-28">
          {/* Top-aligned: the intro starts level with the title (lg:pt-9 clears
              the eyebrow) and grows downward, so it never rises above it. */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <span className="eyebrow">{t({ en: 'For owners', es: 'Para propietarios' })}</span>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] measure-display">
                {t({
                  en: 'Your house, represented properly.',
                  es: 'Tu casa, bien representada.',
                })}
              </h1>
            </div>
            <div className="lg:col-span-5 lg:pt-9">
              <p className="text-lg text-body-strong font-light leading-relaxed">
                {t({
                  en: 'We look after a small, hand-picked portfolio of villas in Casa de Campo — for rent, for sale, or both. One person is accountable for your house, from the first conversation onward.',
                  es: 'Cuidamos una cartera pequeña y seleccionada de villas en Casa de Campo — en alquiler, en venta, o ambas. Una sola persona responde por tu casa, desde la primera conversación.',
                })}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-surface text-xs uppercase tracking-[0.16em] rounded-[2px] hover:bg-brand transition-colors"
                >
                  {t({ en: 'Start a conversation', es: 'Iniciar una conversación' })}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-control-border text-ink text-xs uppercase tracking-[0.16em] rounded-[2px] hover:border-ink transition-colors"
                >
                  {t({ en: 'How it works', es: 'Cómo funciona' })}
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

      {/* WHY OWNERS WORK WITH US */}
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <span className="eyebrow">{t({ en: 'Why owners work with us', es: 'Por qué nos eligen' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t({
                en: 'Fewer houses, more attention.',
                es: 'Menos casas, más atención.',
              })}
            </h2>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 border-t border-line">
            {reasons.map((r, i) => (
              <li key={r.title} className="py-8 border-b border-line">
                <span className="eyebrow">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-title text-xl text-ink">{r.title}</h3>
                <p className="mt-2 text-muted font-light leading-relaxed">{r.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHAT WE DO FOR OWNERS */}
      <section className="bg-sand/40 border-y border-line">
        <div className="container mx-auto px-4 py-20 sm:py-24">
          <span className="eyebrow">{t({ en: 'What we do for owners', es: 'Qué hacemos por los propietarios' })}</span>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {services.map((s) => (
              <div key={s.href} className="border-t border-line pt-6 flex flex-col">
                <span className="eyebrow">{s.eyebrow}</span>
                <h3 className="mt-3 font-title text-2xl text-ink leading-tight">{s.title}</h3>
                <ul className="mt-4 space-y-2 flex-1">
                  {s.items.map((item) => (
                    <li key={item} className="text-muted font-light leading-relaxed border-b border-line pb-2">
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={s.href}
                  className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink decoration-1 underline-offset-4 hover:underline"
                >
                  {s.cta}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 sm:py-28 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <span className="eyebrow">{t({ en: 'How it works', es: 'Cómo funciona' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t({
                en: 'Four steps, no rush.',
                es: 'Cuatro pasos, sin prisa.',
              })}
            </h2>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 border-t border-line">
            {steps.map((s, i) => (
              <li key={s.title} className="py-8 border-b border-line">
                <span className="font-display text-3xl text-ink leading-none">{i + 1}</span>
                <h3 className="mt-4 font-title text-lg text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-muted font-light leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-canvas border-t border-line scroll-mt-24">
        <div className="container mx-auto px-4 py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <span className="eyebrow !text-brand">{t({ en: 'Contact', es: 'Contacto' })}</span>
              <h2 className="font-display text-3xl sm:text-4xl text-ink mt-3 mb-5 leading-tight">
                {t({
                  en: 'Tell us about your house.',
                  es: 'Cuéntanos sobre tu casa.',
                })}
              </h2>
              <p className="text-muted font-light leading-relaxed measure-lede">
                {t({
                  en: 'Where it is, how you use it, and whether you are thinking of renting, selling, or both. Leticia replies personally — no obligation.',
                  es: 'Dónde está, cómo la usas, y si piensas alquilarla, venderla, o ambas. Leticia responde personalmente — sin compromiso.',
                })}
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
                      <span className={fieldLabelClass}>{t({ en: 'Property or sector', es: 'Propiedad o sector' })}</span>
                      <Input
                        name="property"
                        value={form.property}
                        onChange={onFormChange}
                        placeholder={t({ en: 'e.g. Villa in Los Lagos', es: 'p. ej. Villa en Los Lagos' })}
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className={fieldLabelClass}>{t({ en: 'Message', es: 'Mensaje' })}</span>
                    <Textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={onFormChange}
                      placeholder={t({
                        en: 'Renting, selling, or both? Anything we should know about the house…',
                        es: '¿Alquilar, vender, o ambos? Cualquier cosa que debamos saber sobre la casa…',
                      })}
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
