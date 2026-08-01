'use client'

import { useState } from 'react'
import { tFor } from '@/lib/i18n'

interface Props {
  userId: string
  initialValue: string
  locale?: 'en' | 'es'
}

/**
 * Inline notes editor. Shows the current notes; click "Edit" to enter
 * an autosizing textarea, "Save" persists. Auto-saves on blur if there
 * are unsaved changes.
 */
export function UserNotesEditor({ userId, initialValue, locale = 'en' }: Props) {
  const t = tFor(locale)
  const [value, setValue] = useState(initialValue)
  const [savedValue, setSavedValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = value !== savedValue

  const save = async () => {
    if (!dirty) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value || null }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not save notes', 'No se pudieron guardar las notas'))
      }
      setSavedValue(value)
      setEditing(false)
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div>
        {savedValue ? (
          <p className="text-sm text-stone-700 font-light whitespace-pre-wrap leading-relaxed mb-3">
            {savedValue}
          </p>
        ) : (
          <p className="text-sm text-stone-400 font-light italic mb-3">
            {t(
              'No notes yet. Add things you want to remember about this guest.',
              'Aún no hay notas. Agrega cosas que quieras recordar sobre este huésped.'
            )}
          </p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 underline underline-offset-4"
        >
          {savedValue ? t('Edit notes', 'Editar notas') : t('+ Add notes', '+ Agregar notas')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
        autoFocus
        placeholder={t(
          'e.g. Returning guest. Prefers villas with private pools. Allergic to shellfish.',
          'p. ej. Huésped recurrente. Prefiere villas con piscina privada. Alérgico a los mariscos.'
        )}
        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-1.5 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? t('Saving…', 'Guardando…') : t('Save', 'Guardar')}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(savedValue)
            setEditing(false)
            setError(null)
          }}
          className="px-4 py-1.5 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100"
        >
          {t('Cancel', 'Cancelar')}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 font-light">{error}</p>}
    </div>
  )
}
