'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  requestId: string
  expectsDocument: boolean
  documentKind:
    | 'PASSPORT'
    | 'CONTRACT'
    | 'RECEIPT'
    | 'ID'
    | 'INSURANCE'
    | 'PET_DOC'
    | 'OTHER'
  /** Pre-populates the text field when the renter is editing an existing submission. */
  initialText?: string
  /** Renders a "this will reset for re-review" warning when set. */
  isModifying?: boolean
  /** Optional cancel handler — present when used inline as an edit form. */
  onCancel?: () => void
  /** Called after a successful submission — useful for closing edit mode. */
  onSubmitted?: () => void
  /** Renter locale — drives all visible copy. */
  locale?: 'en' | 'es'
}

export function RequestForm({
  bookingId,
  requestId,
  expectsDocument,
  documentKind,
  initialText = '',
  isModifying = false,
  onCancel,
  onSubmitted,
  locale = 'en',
}: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const [textResponse, setTextResponse] = useState(initialText)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  /**
   * Three-step upload flow:
   *   1. POST /api/portal/uploads/sign — get presigned PUT URL + documentId
   *   2. PUT file → R2 directly
   *   3. POST /api/portal/documents — confirm upload + mark request fulfilled
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setProgress(null)

    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError(t('Choose a file to upload.', 'Elige un archivo para subir.'))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t('File too large. Maximum 10 MB.', 'Archivo demasiado grande. Máximo 10 MB.'))
      return
    }

    setSubmitting(true)
    try {
      setProgress(t('Preparing upload…', 'Preparando subida…'))
      const signRes = await fetch('/api/portal/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          requestId,
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          contentLength: file.size,
        }),
      })
      if (!signRes.ok) {
        const err = await signRes.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not start upload', 'No se pudo iniciar la subida'))
      }
      const { uploadUrl, storageKey, documentId } = await signRes.json()

      setProgress(t('Uploading…', 'Subiendo…'))
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })
      if (!putRes.ok) {
        throw new Error(t('Upload failed. Please try again.', 'La subida falló. Inténtalo de nuevo.'))
      }

      setProgress(t('Saving…', 'Guardando…'))
      const commitRes = await fetch('/api/portal/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          documentId,
          storageKey,
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          fileSize: file.size,
          kind: documentKind,
          requestId,
        }),
      })
      if (!commitRes.ok) {
        const err = await commitRes.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not save document', 'No se pudo guardar el documento'))
      }

      setProgress(t('Done.', 'Listo.'))
      onSubmitted?.()
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
      setSubmitting(false)
      setProgress(null)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!textResponse.trim()) {
      setError(t('Please write a response.', 'Por favor escribe una respuesta.'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/portal/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textResponse: textResponse.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not submit response', 'No se pudo enviar la respuesta'))
      }
      onSubmitted?.()
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
      setSubmitting(false)
    }
  }

  if (expectsDocument) {
    return (
      <form onSubmit={handleUpload} className="bg-white border border-stone-200 rounded-xs p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light mb-3">
          {isModifying
            ? t('Upload a replacement', 'Subir un reemplazo')
            : t('Upload document', 'Subir documento')}
        </p>
        <p className="text-sm text-stone-600 font-light mb-5 leading-relaxed">
          {t(
            "PDFs, photos, or scans up to 10 MB. Files are encrypted in transit and only Leticia's team can read them.",
            'PDFs, fotos o escaneos hasta 10 MB. Los archivos se cifran en tránsito y solo el equipo de Leticia puede leerlos.'
          )}
        </p>

        {isModifying && <ModifyResetNotice locale={locale} />}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="block w-full text-sm font-light text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-stone-300 file:bg-white file:text-stone-700 file:text-sm file:font-light hover:file:bg-stone-50"
          required
        />

        {progress && (
          <p className="text-xs text-stone-500 font-light mt-3">{progress}</p>
        )}
        {error && (
          <p className="text-xs text-red-600 font-light mt-3">{error}</p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? t('Uploading…', 'Subiendo…')
              : isModifying
                ? t('Upload replacement', 'Subir reemplazo')
                : t('Upload', 'Subir')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
            >
              {t('Cancel', 'Cancelar')}
            </button>
          )}
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleTextSubmit} className="bg-white border border-stone-200 rounded-xs p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light mb-3">
        {isModifying
          ? t('Edit your response', 'Edita tu respuesta')
          : t('Your response', 'Tu respuesta')}
      </p>

      {isModifying && <ModifyResetNotice locale={locale} />}

      <textarea
        rows={6}
        value={textResponse}
        onChange={(e) => setTextResponse(e.target.value)}
        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
        placeholder={t('Type your response here…', 'Escribe tu respuesta aquí…')}
        required
      />

      {error && (
        <p className="text-xs text-red-600 font-light mt-3">{error}</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? t('Submitting…', 'Enviando…')
            : isModifying
              ? t('Save changes', 'Guardar cambios')
              : t('Submit', 'Enviar')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
          >
            {t('Cancel', 'Cancelar')}
          </button>
        )}
      </div>
    </form>
  )
}

/**
 * Heads-up shown when the renter edits an already-reviewed submission —
 * the server resets status to PENDING_REVIEW so admin sees it again.
 */
function ModifyResetNotice({ locale }: { locale: 'en' | 'es' }) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-sm px-4 py-3 mb-4">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-light mb-1">
        {t('Heads up', 'Aviso')}
      </p>
      <p className="text-sm text-amber-900 font-light leading-relaxed">
        {t(
          'Saving changes will reset this to "awaiting review" so Leticia\'s team can take another look.',
          'Guardar cambios reiniciará esto a "esperando revisión" para que el equipo de Leticia lo vea de nuevo.'
        )}
      </p>
    </div>
  )
}
