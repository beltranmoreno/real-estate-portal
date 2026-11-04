'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { REQUEST_PRESETS } from '@/lib/portal/requestPresets'
import type { RequestKind } from '@prisma/client'
import { tFor } from '@/lib/i18n'
import { keyToDayMonthYear } from '@/lib/dates'
import { DateInput } from '@/components/admin/DateInput'

interface Props {
  bookingId: string
  locale?: 'en' | 'es'
}

const PRESET_KEYS = Object.keys(REQUEST_PRESETS) as Array<
  Exclude<RequestKind, 'CUSTOM'>
>

export function CreateRequestButton({ bookingId, locale = 'en' }: Props) {
  const [open, setOpen] = useState(false)
  const t = tFor(locale)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-light text-stone-700 hover:text-stone-900 underline underline-offset-4"
      >
        {t('+ Request something', '+ Solicitar algo')}
      </button>
      {open && (
        <CreateRequestModal
          bookingId={bookingId}
          locale={locale}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

interface Draft {
  kind: RequestKind
  title: string
  titleEs: string
  description: string
  descriptionEs: string
  expectsDocument: boolean
  dueAt: string
}

function draftFor(kind: RequestKind): Draft {
  if (kind === 'CUSTOM') {
    return { kind, title: '', titleEs: '', description: '', descriptionEs: '', expectsDocument: true, dueAt: '' }
  }
  const preset = REQUEST_PRESETS[kind as Exclude<RequestKind, 'CUSTOM'>]
  return {
    kind,
    title: preset.label.en,
    titleEs: preset.label.es,
    description: preset.description.en,
    descriptionEs: preset.description.es,
    expectsDocument: preset.expectsDocument,
    dueAt: '',
  }
}

const toPayload = (d: Draft) => ({
  kind: d.kind,
  title: d.title,
  title_es: d.titleEs || null,
  description: d.description || undefined,
  description_es: d.descriptionEs || null,
  expectsDocument: d.expectsDocument,
  dueAt: d.dueAt || null,
})

/**
 * Ask the guest for one thing, or several: "+ Add another request" puts the
 * current one on a list and opens a fresh form, and everything on the list
 * goes out together in a single email.
 */
function CreateRequestModal({
  bookingId,
  onClose,
  locale = 'en',
}: {
  bookingId: string
  onClose: () => void
  locale?: 'en' | 'es'
}) {
  const router = useRouter()
  const t = tFor(locale)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queued, setQueued] = useState<Draft[]>([])
  const [draft, setDraft] = useState<Draft>(() => draftFor('PASSPORT'))
  const [activeLang, setActiveLang] = useState<'en' | 'es'>('en')
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const total = queued.length + 1

  // Next suggestion: the first preset not asked for yet in this batch.
  const nextKind = (taken: RequestKind[]): RequestKind => PRESET_KEYS.find((k) => !taken.includes(k)) ?? 'CUSTOM'

  const addAnother = () => {
    if (!draft.title.trim()) {
      setError(t('Give this request a title first.', 'Primero ponle un título a esta solicitud.'))
      return
    }
    setError(null)
    const next = [...queued, draft]
    setQueued(next)
    setDraft(draftFor(nextKind([...next.map((q) => q.kind)])))
    setActiveLang('en')
  }

  // Drop the open form and bring the last listed request back to edit.
  const removeCurrent = () => {
    setDraft(queued[queued.length - 1])
    setQueued(queued.slice(0, -1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const all = [...queued, draft]
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          all.length === 1 ? { bookingId, ...toPayload(draft) } : { bookingId, requests: all.map(toPayload) }
        ),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not create request', 'No se pudo crear la solicitud'))
      }
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-10 sm:pt-20 bg-stone-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-xs w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light">
              {t('New request', 'Nueva solicitud')}
            </p>
            <h2 className="text-xl font-light text-stone-900 mt-1">
              {t('Ask the guest for something', 'Pedir algo al huésped')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900 text-sm"
          >
            ✕
          </button>
        </div>

        {queued.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">
              {t('Sending together', 'Se envían juntas')}
            </p>
            <ul className="border-t border-stone-200">
              {queued.map((q, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 text-sm font-light">
                  <span className="min-w-0 truncate text-stone-800">
                    {i + 1}. {q.title}
                    {q.dueAt && <span className="text-stone-400"> · {keyToDayMonthYear(q.dueAt)}</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQueued(queued.filter((_, j) => j !== i))}
                    aria-label={t('Remove', 'Quitar')}
                    className="text-stone-400 hover:text-stone-900 text-xs"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {queued.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-stone-500">
                {t(`Request ${total}`, `Solicitud ${total}`)}
              </span>
              <button
                type="button"
                onClick={removeCurrent}
                className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-2"
              >
                {t('Remove this one', 'Quitar esta')}
              </button>
            </div>
          )}

          <Field label={t('Type', 'Tipo')}>
            <SelectShell>
              <select
                value={draft.kind}
                onChange={(e) => setDraft({ ...draftFor(e.target.value as RequestKind), dueAt: draft.dueAt })}
                className="w-full appearance-none bg-white rounded-sm border border-stone-300 px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
              >
                {PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {REQUEST_PRESETS[k].label.en}
                  </option>
                ))}
                <option value="CUSTOM">{t('Custom…', 'Personalizado…')}</option>
              </select>
            </SelectShell>
          </Field>

          {/* Bilingual title + description. Tabs let admin tweak EN or ES
              copy without doubling the form's vertical real estate. The
              renter portal renders whichever matches their locale, with
              EN as the fallback. */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-light text-stone-700">
                {t('Title & description', 'Título y descripción')}
              </span>
              <div className="inline-flex border border-stone-300 rounded-sm bg-white">
                <LangTab active={activeLang === 'en'} onClick={() => setActiveLang('en')}>
                  EN
                </LangTab>
                <LangTab active={activeLang === 'es'} onClick={() => setActiveLang('es')}>
                  ES
                </LangTab>
              </div>
            </div>
            <p className="text-xs text-stone-500 font-light mb-2">
              {t(
                'The renter sees the language that matches their portal. Leave ES blank to fall back to EN.',
                'El huésped ve el idioma que coincide con su portal. Deja el ES en blanco para usar el EN.'
              )}
            </p>
            {activeLang === 'en' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder={t('Title (English)', 'Título (Inglés)')}
                  required
                  className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder={t('Description (English) — optional', 'Descripción (Inglés) — opcional')}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={draft.titleEs}
                  onChange={(e) => set({ titleEs: e.target.value })}
                  placeholder={t('Título (Español) — optional, falls back to EN', 'Título (Español) — opcional, usa el EN si se deja vacío')}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                <textarea
                  rows={3}
                  value={draft.descriptionEs}
                  onChange={(e) => set({ descriptionEs: e.target.value })}
                  placeholder={t('Descripción (Español) — opcional', 'Descripción (Español) — opcional')}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="block text-sm font-light text-stone-700">{t('Due by (optional)', 'Fecha límite (opcional)')}</span>
            <DateInput value={draft.dueAt} onChange={(v) => set({ dueAt: v })} />
          </div>

          <label className="flex items-center gap-2 text-sm font-light text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.expectsDocument}
              onChange={(e) => set({ expectsDocument: e.target.checked })}
              className="h-4 w-4 rounded border-stone-300 accent-stone-800"
            />
            <span>{t('Expects a document upload', 'Requiere subir un documento')}</span>
          </label>

          <button
            type="button"
            onClick={addAnother}
            className="text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 underline underline-offset-4"
          >
            + {t('Add another request', 'Agregar otra solicitud')}
          </button>

          {error && <p className="text-xs text-red-600 font-light">{error}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting
                ? t('Sending…', 'Enviando…')
                : total > 1
                  ? t(`Send ${total} requests in one email`, `Enviar ${total} solicitudes en un correo`)
                  : t('Send request', 'Enviar solicitud')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
            >
              {t('Cancel', 'Cancelar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-light text-stone-700">{label}</span>
      {children}
    </label>
  )
}

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
    </div>
  )
}

function LangTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-[11px] uppercase tracking-wider font-light transition-colors ${
        active
          ? 'bg-stone-800 text-white'
          : 'text-stone-600 hover:text-stone-900'
      }`}
    >
      {children}
    </button>
  )
}
