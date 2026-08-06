'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackValues {
  reviewLeticia: string
  reviewAgents: string
  noteHouse: string
  noteServices: string
  general: string
  rating: number | null
}

interface FeedbackFormProps {
  bookingId: string
  locale: 'en' | 'es'
  initial?: Partial<FeedbackValues>
  /** True when feedback already exists — shows a subtle "editing" affordance. */
  alreadySubmitted?: boolean
}

export function FeedbackForm({ bookingId, locale, initial, alreadySubmitted }: FeedbackFormProps) {
  const router = useRouter()
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const [values, setValues] = useState<FeedbackValues>({
    reviewLeticia: initial?.reviewLeticia ?? '',
    reviewAgents: initial?.reviewAgents ?? '',
    noteHouse: initial?.noteHouse ?? '',
    noteServices: initial?.noteServices ?? '',
    general: initial?.general ?? '',
    rating: initial?.rating ?? null,
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof FeedbackValues, v: string | number | null) =>
    setValues((prev) => ({ ...prev, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/portal/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, ...values }),
      })
      if (!res.ok) throw new Error('failed')
      setDone(true)
      router.refresh()
    } catch {
      setError(t('Could not send your feedback. Please try again.', 'No se pudo enviar. Inténtalo de nuevo.'))
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="border border-line bg-brand-wash p-10 text-center">
        <CheckCircle className="w-12 h-12 text-status-confirmed mx-auto mb-4" />
        <h2 className="font-title text-2xl text-ink mb-2">
          {t('Thank you', 'Gracias')}
        </h2>
        <p className="text-muted font-light measure-lede mx-auto">
          {t(
            'Your notes go straight to Leticia and the team — we read every one. It means a great deal.',
            'Tus notas llegan directamente a Leticia y al equipo — leemos cada una. Significa muchísimo.'
          )}
        </p>
      </div>
    )
  }

  const fields: { key: keyof FeedbackValues; label: string; placeholder: string }[] = [
    {
      key: 'reviewLeticia',
      label: t('For Leticia', 'Para Leticia'),
      placeholder: t('How was working with Leticia?', '¿Cómo fue tu experiencia con Leticia?'),
    },
    {
      key: 'reviewAgents',
      label: t('For the team', 'Para el equipo'),
      placeholder: t('Anyone else who looked after you?', '¿Alguien más que te haya atendido?'),
    },
    {
      key: 'noteHouse',
      label: t('About the house', 'Sobre la casa'),
      placeholder: t('What did you love? Anything we should know?', '¿Qué te encantó? ¿Algo que debamos saber?'),
    },
    {
      key: 'noteServices',
      label: t('About the services', 'Sobre los servicios'),
      placeholder: t('Dining, concierge, transport…', 'Gastronomía, conserjería, transporte…'),
    },
    {
      key: 'general',
      label: t('Anything else', 'Cualquier otra cosa'),
      placeholder: t('The floor is yours.', 'El espacio es tuyo.'),
    },
  ]

  return (
    <form onSubmit={submit} className="space-y-8">
      {error && (
        <p className="p-4 bg-status-attention-bg border border-status-attention-border text-status-attention text-sm">
          {error}
        </p>
      )}

      {/* Optional overall rating */}
      <div>
        <span className="eyebrow">{t('Overall', 'En general')}</span>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => set('rating', values.rating === n ? null : n)}
              aria-label={`${n} / 5`}
              className="p-1"
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  values.rating && n <= values.rating ? 'fill-ink text-ink' : 'fill-none text-control-border'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {fields.map((f) => (
        <label key={f.key} className="block">
          <span className="eyebrow">{f.label}</span>
          <textarea
            rows={3}
            value={values[f.key] as string}
            onChange={(e) => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="mt-2 w-full bg-surface border border-line rounded-[2px] p-3 text-[15px] font-light text-ink placeholder:text-faint focus:outline-none focus:border-brand resize-none"
          />
        </label>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 bg-ink text-surface uppercase tracking-[0.14em] text-xs font-medium rounded-[2px] px-8 h-11 hover:bg-brand transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {saving
          ? t('Sending…', 'Enviando…')
          : alreadySubmitted
            ? t('Update feedback', 'Actualizar comentarios')
            : t('Send feedback', 'Enviar comentarios')}
      </button>
    </form>
  )
}
