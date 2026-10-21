'use client'

import React, { useEffect, useState } from 'react'
import { Check, MessageCircle } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import { fieldClass, fieldLabelClass, textareaClass } from '@/components/ui/field'
import { inquiryWhatsappMessage, whatsappLink, type InquiryPayload, type InquirySourceKey } from '@/lib/inquiry'

export interface InquiryFormProps {
  source: InquirySourceKey
  /** Houses in the inquiry (title in the visitor's language). */
  properties: { _id: string; title: string }[]
  checkIn?: string
  checkOut?: string
  guests?: number
  estimate?: { total: number; currency?: string }
  /** Hide the house list (e.g. when the page around the form already shows it). */
  hideProperties?: boolean
  /** Ask for dates and guests (off for sale-only listings). */
  askStay?: boolean
  className?: string
}

// Remembered so a returning visitor doesn't retype their details.
const CONTACT_KEY = 'lc-inquiry-contact'

/**
 * The one inquiry form: name + email and/or WhatsApp (at least one), stay
 * details and a note. Saves to /api/inquire, then offers to continue the
 * conversation on WhatsApp with the reference pre-filled. No account needed.
 */
export default function InquiryForm({
  source,
  properties,
  checkIn = '',
  checkOut = '',
  guests,
  estimate,
  hideProperties,
  askStay = true,
  className,
}: InquiryFormProps) {
  const { locale, t } = useLocale()
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    checkIn,
    checkOut,
    guests: guests ? String(guests) : '',
    message: '',
    website: '',
  })
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONTACT_KEY) || 'null')
      if (saved)
        setForm((f) => ({
          ...f,
          name: saved.name || '',
          email: saved.email || '',
          whatsapp: saved.whatsapp || '',
        }))
    } catch {}
  }, [])

  // Keep stay details in step with the page (e.g. dates picked after opening).
  useEffect(() => {
    setForm((f) => ({
      ...f,
      checkIn,
      checkOut,
      guests: guests ? String(guests) : f.guests,
    }))
  }, [checkIn, checkOut, guests])

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const hasContact = !!form.email.trim() || form.whatsapp.replace(/\D/g, '').length >= 7
  const valid = !!form.name.trim() && hasContact

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    setSubmitting(true)
    setError(null)

    const payload: InquiryPayload = {
      source,
      propertyIds: properties.map((p) => p._id),
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      checkIn: (askStay && form.checkIn) || undefined,
      checkOut: (askStay && form.checkOut) || undefined,
      guests: askStay && form.guests ? Number(form.guests) : undefined,
      message: form.message.trim() || undefined,
      estimateTotal: estimate?.total,
      estimateCurrency: estimate?.currency,
      locale,
      website: form.website || undefined,
    }

    try {
      const res = await fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      try {
        localStorage.setItem(
          CONTACT_KEY,
          JSON.stringify({
            name: payload.name,
            email: payload.email,
            whatsapp: payload.whatsapp,
          })
        )
      } catch {}
      setReference(data.reference)
    } catch {
      setError(
        t({
          en: 'Something went wrong sending your inquiry. Please try again, or message Leticia on WhatsApp.',
          es: 'Algo salió mal al enviar tu consulta. Inténtalo de nuevo o escríbele a Leticia por WhatsApp.',
        })
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (reference) {
    const firstName = form.name.trim().split(/\s+/)[0]
    const message = inquiryWhatsappMessage({
      reference,
      name: form.name.trim(),
      titles: properties.map((p) => p.title),
      checkIn: form.checkIn || undefined,
      checkOut: form.checkOut || undefined,
      guests: form.guests ? Number(form.guests) : undefined,
      locale,
    })
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-surface">
            <Check className="h-4 w-4" />
          </span>
          <div className="space-y-2">
            <p className="font-title text-xl text-ink">
              {t({
                en: `Thank you, ${firstName}.`,
                es: `Gracias, ${firstName}.`,
              })}
            </p>
            <p className="text-sm font-light leading-relaxed text-body-strong">
              {t({
                en: 'Leticia has your inquiry and will get back to you personally, usually within a day.',
                es: 'Leticia recibió tu consulta y te responderá personalmente, normalmente en menos de un día.',
              })}
            </p>
            {form.email.trim() && (
              <p className="text-sm font-light leading-relaxed text-body-strong">
                {t({
                  en: `A confirmation is on its way to ${form.email.trim()}.`,
                  es: `Te enviamos una confirmación a ${form.email.trim()}.`,
                })}
              </p>
            )}
            <p className="text-xs text-muted">
              {t({ en: 'Reference', es: 'Referencia' })}:{' '}
              <span className="font-medium tracking-wider text-ink">{reference}</span>
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-6">
          <p className="text-sm font-light text-body-strong">
            {t({
              en: 'Want to talk sooner, or have questions? Continue on WhatsApp.',
              es: '¿Quieres hablar antes o tienes preguntas? Continúa por WhatsApp.',
            })}
          </p>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[2px] bg-brand px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-surface transition-colors hover:bg-brand-deep"
          >
            <MessageCircle className="h-4 w-4" />
            {t({ en: 'Continue on WhatsApp', es: 'Continuar por WhatsApp' })}
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className={cn('space-y-5', className)}>
      {!hideProperties && properties.length > 0 && (
        <div>
          <p className={fieldLabelClass}>
            {properties.length === 1 ? t({ en: 'House', es: 'Casa' }) : t({ en: 'Houses', es: 'Casas' })}
          </p>
          <ul className="space-y-1 text-sm font-light text-body-strong">
            {properties.map((p) => (
              <li key={p._id} className="line-clamp-1">
                {p.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="inq-name" className={fieldLabelClass}>
          {t({ en: 'Your name', es: 'Tu nombre' })}
        </label>
        <input
          id="inq-name"
          value={form.name}
          onChange={set('name')}
          autoComplete="name"
          className={cn(fieldClass, touched && !form.name.trim() && 'border-status-attention')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-email" className={fieldLabelClass}>
            Email
          </label>
          <input
            id="inq-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
            className={cn(fieldClass, touched && !hasContact && 'border-status-attention')}
          />
        </div>
        <div>
          <label htmlFor="inq-whatsapp" className={fieldLabelClass}>
            WhatsApp
          </label>
          <input
            id="inq-whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={set('whatsapp')}
            autoComplete="tel"
            placeholder="+1 …"
            className={cn(fieldClass, touched && !hasContact && 'border-status-attention')}
          />
        </div>
      </div>
      <p className={cn('-mt-2 text-xs font-light', touched && !hasContact ? 'text-status-attention' : 'text-muted')}>
        {t({
          en: 'Your email, your WhatsApp number, or both — however you prefer to hear back.',
          es: 'Tu correo, tu número de WhatsApp, o ambos — como prefieras que te contactemos.',
        })}
      </p>

      {askStay && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="inq-in" className={fieldLabelClass}>
              {t({ en: 'Check-in', es: 'Llegada' })}
            </label>
            <input id="inq-in" type="date" value={form.checkIn} onChange={set('checkIn')} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="inq-out" className={fieldLabelClass}>
              {t({ en: 'Check-out', es: 'Salida' })}
            </label>
            <input
              id="inq-out"
              type="date"
              value={form.checkOut}
              min={form.checkIn || undefined}
              onChange={set('checkOut')}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="inq-guests" className={fieldLabelClass}>
              {t({ en: 'Guests', es: 'Huéspedes' })}
            </label>
            <input
              id="inq-guests"
              type="number"
              min={1}
              value={form.guests}
              onChange={set('guests')}
              className={fieldClass}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="inq-message" className={fieldLabelClass}>
          {t({ en: 'Anything else? (optional)', es: '¿Algo más? (opcional)' })}
        </label>
        <textarea
          id="inq-message"
          value={form.message}
          onChange={set('message')}
          rows={3}
          placeholder={t({
            en: 'The occasion, who is coming, what matters most…',
            es: 'La ocasión, quiénes vienen, qué es lo más importante…',
          })}
          className={cn(textareaClass, 'min-h-[5rem]')}
        />
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={set('website')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {error && <p className="text-sm font-light text-status-attention">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-[2px] bg-ink px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-surface transition-colors hover:bg-brand disabled:opacity-60"
      >
        {submitting ? t({ en: 'Sending…', es: 'Enviando…' }) : t({ en: 'Send to Leticia', es: 'Enviar a Leticia' })}
      </button>
      <p className="text-center text-xs font-light text-muted">
        {t({ en: 'No account needed.', es: 'No necesitas crear una cuenta.' })}
      </p>
    </form>
  )
}
