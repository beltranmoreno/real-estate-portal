'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fieldLabelClass, Textarea } from '@/components/ui/field'
import { Mail, Phone, MessageCircle, ArrowRight, Send, CheckCircle } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import type { PageHeroDoc } from '@/lib/pageHero'
import { OWNERS_PAGE_DEFAULTS } from '@/sanity/lib/ownersPageDefaults'

interface Props {
  heroImageUrl: string | null
  hero: PageHeroDoc | null
  /** The Studio "Owners page" doc; empty fields use the shipped copy. */
  page: any
}

type Bi = { en: string; es: string }
const NONE: Bi = { en: '', es: '' }

const PHONE = '+1 (829) 342-2566'
const WHATSAPP_DIGITS = '18293422566'
const EMAIL = 'leticiacoudrayrealestate@gmail.com'

const EMPTY_FORM = { name: '', email: '', phone: '', property: '', message: '' }

export default function OwnersPageClient({ heroImageUrl, hero, page }: Props) {
  const { locale, t } = useLocale()

  const D = OWNERS_PAGE_DEFAULTS
  // Studio value first (other language if only one is filled), then the default.
  const pick = (d: any, key: string, fallback: Bi = NONE) =>
    t({
      en: d?.[`${key}_en`]?.trim() || d?.[`${key}_es`]?.trim() || fallback.en,
      es: d?.[`${key}_es`]?.trim() || d?.[`${key}_en`]?.trim() || fallback.es,
    })
  // A Studio list, or the defaults shaped like Studio data.
  const points = (list: any[] | undefined, defaults: { title: Bi; body: Bi }[]) =>
    (list?.length ? list : defaults.map((p) => ({ title_en: p.title.en, title_es: p.title.es, body_en: p.body.en, body_es: p.body.es }))).map(
      (p: any) => ({ title: pick(p, 'title'), body: pick(p, 'body') })
    )

  const reasons = points(page?.reasons, D.why.items)
  const steps = points(page?.steps, D.how.items)

  const services: { eyebrow: string; title: string; items: string[]; href: string; cta: string }[] = (
    page?.services?.length
      ? page.services
      : D.services.items.map((s) => ({
          eyebrow_en: s.eyebrow.en, eyebrow_es: s.eyebrow.es,
          title_en: s.title.en, title_es: s.title.es,
          list_en: s.list.map((l) => l.en), list_es: s.list.map((l) => l.es),
          buttonLabel_en: s.buttonLabel.en, buttonLabel_es: s.buttonLabel.es,
          href: s.href,
        }))
  )
    .filter((s: any) => s.href)
    .map((s: any) => {
      const en: string[] = (s.list_en ?? []).filter(Boolean)
      const es: string[] = (s.list_es ?? []).filter(Boolean)
      return {
        eyebrow: pick(s, 'eyebrow'),
        title: pick(s, 'title'),
        items: locale === 'es' && es.length ? es : en.length ? en : es,
        href: s.href,
        cta: pick(s, 'buttonLabel'),
      }
    })

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
          page: 'owners',
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
      {/* HERO — editable in Studio (Page Heroes → For owners) */}
      <PageHero page="owners" doc={hero} fallbackImageUrl={heroImageUrl} />

      {/* WHY OWNERS WORK WITH US — editable in Studio (Page Heroes → Owners page) */}
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <span className="eyebrow">{pick(page, 'whyEyebrow', D.why.eyebrow)}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">
              {pick(page, 'whyTitle', D.why.title)}
            </h2>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 border-t border-line">
            {reasons.map((r, i) => (
              <li key={i} className="py-8 border-b border-line">
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
          <span className="eyebrow">{pick(page, 'servicesEyebrow', D.services.eyebrow)}</span>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {services.map((s, i) => (
              <div key={i} className="border-t border-line pt-6 flex flex-col">
                <span className="eyebrow">{s.eyebrow}</span>
                <h3 className="mt-3 font-title text-2xl text-ink leading-tight">{s.title}</h3>
                <ul className="mt-4 space-y-2 flex-1">
                  {s.items.map((item, j) => (
                    <li key={j} className="text-muted font-light leading-relaxed border-b border-line pb-2">
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
            <span className="eyebrow">{pick(page, 'howEyebrow', D.how.eyebrow)}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">
              {pick(page, 'howTitle', D.how.title)}
            </h2>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 border-t border-line">
            {steps.map((s, i) => (
              <li key={i} className="py-8 border-b border-line">
                <span className="font-display text-3xl text-ink leading-none">{i + 1}</span>
                <h3 className="mt-4 font-title text-lg text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-muted font-light leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CONTACT — intro editable in Studio (Page Heroes → Owners page → Contact) */}
      <section id="contact" className="bg-canvas border-t border-line scroll-mt-24">
        <div className="container mx-auto px-4 py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
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
