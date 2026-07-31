'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { REQUEST_PRESETS } from '@/lib/portal/requestPresets'
import type { RequestKind } from '@prisma/client'

interface Props {
  bookingId: string
}

const PRESET_KEYS = Object.keys(REQUEST_PRESETS) as Array<
  Exclude<RequestKind, 'CUSTOM'>
>

export function CreateRequestButton({ bookingId }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-light text-stone-700 hover:text-stone-900 underline underline-offset-4"
      >
        + Request something
      </button>
      {open && (
        <CreateRequestModal
          bookingId={bookingId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function CreateRequestModal({
  bookingId,
  onClose,
}: {
  bookingId: string
  onClose: () => void
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [kind, setKind] = useState<RequestKind>('PASSPORT')
  const [title, setTitle] = useState(REQUEST_PRESETS.PASSPORT.label.en)
  const [titleEs, setTitleEs] = useState(REQUEST_PRESETS.PASSPORT.label.es)
  const [description, setDescription] = useState(
    REQUEST_PRESETS.PASSPORT.description.en
  )
  const [descriptionEs, setDescriptionEs] = useState(
    REQUEST_PRESETS.PASSPORT.description.es
  )
  const [expectsDocument, setExpectsDocument] = useState(
    REQUEST_PRESETS.PASSPORT.expectsDocument
  )
  const [dueAt, setDueAt] = useState('')
  const [activeLang, setActiveLang] = useState<'en' | 'es'>('en')

  const onKindChange = (next: RequestKind) => {
    setKind(next)
    if (next === 'CUSTOM') {
      setTitle('')
      setTitleEs('')
      setDescription('')
      setDescriptionEs('')
      setExpectsDocument(true)
    } else {
      const preset = REQUEST_PRESETS[next as Exclude<RequestKind, 'CUSTOM'>]
      setTitle(preset.label.en)
      setTitleEs(preset.label.es)
      setDescription(preset.description.en)
      setDescriptionEs(preset.description.es)
      setExpectsDocument(preset.expectsDocument)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          kind,
          title,
          title_es: titleEs || null,
          description: description || undefined,
          description_es: descriptionEs || null,
          expectsDocument,
          dueAt: dueAt || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not create request')
      }
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white border border-stone-200 rounded-xs w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light">
              New request
            </p>
            <h2 className="text-xl font-light text-stone-900 mt-1">
              Ask the guest for something
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Type">
            <SelectShell>
              <select
                value={kind}
                onChange={(e) => onKindChange(e.target.value as RequestKind)}
                className="w-full appearance-none bg-white rounded-sm border border-stone-300 px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
              >
                {PRESET_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {REQUEST_PRESETS[k].label.en}
                  </option>
                ))}
                <option value="CUSTOM">Custom…</option>
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
                Title & description
              </span>
              <div className="inline-flex border border-stone-300 rounded-sm bg-white">
                <LangTab
                  active={activeLang === 'en'}
                  onClick={() => setActiveLang('en')}
                >
                  EN
                </LangTab>
                <LangTab
                  active={activeLang === 'es'}
                  onClick={() => setActiveLang('es')}
                >
                  ES
                </LangTab>
              </div>
            </div>
            <p className="text-xs text-stone-500 font-light mb-2">
              The renter sees the language that matches their portal.
              Leave ES blank to fall back to EN.
            </p>
            {activeLang === 'en' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (English)"
                  required
                  className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (English) — optional"
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={titleEs}
                  onChange={(e) => setTitleEs(e.target.value)}
                  placeholder="Título (Español) — optional, falls back to EN"
                  className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                <textarea
                  rows={3}
                  value={descriptionEs}
                  onChange={(e) => setDescriptionEs(e.target.value)}
                  placeholder="Descripción (Español) — opcional"
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>
            )}
          </div>

          <Field label="Due by (optional)">
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm font-light text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={expectsDocument}
              onChange={(e) => setExpectsDocument(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 accent-stone-800"
            />
            <span>Expects a document upload</span>
          </label>

          {error && (
            <p className="text-xs text-red-600 font-light">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Sending…' : 'Send request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
            >
              Cancel
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
