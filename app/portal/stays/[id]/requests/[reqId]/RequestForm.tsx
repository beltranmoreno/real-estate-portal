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
}

export function RequestForm({
  bookingId,
  requestId,
  expectsDocument,
  documentKind,
}: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [textResponse, setTextResponse] = useState('')
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
      setError('Choose a file to upload.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10 MB.')
      return
    }

    setSubmitting(true)
    try {
      setProgress('Preparing upload…')
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
        throw new Error(err?.error || 'Could not start upload')
      }
      const { uploadUrl, storageKey, documentId } = await signRes.json()

      setProgress('Uploading…')
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })
      if (!putRes.ok) {
        throw new Error('Upload failed. Please try again.')
      }

      setProgress('Saving…')
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
        throw new Error(err?.error || 'Could not save document')
      }

      setProgress('Done.')
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
      setProgress(null)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!textResponse.trim()) {
      setError('Please write a response.')
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
        throw new Error(err?.error || 'Could not submit response')
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (expectsDocument) {
    return (
      <form onSubmit={handleUpload} className="bg-white border border-stone-200 rounded-xs p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light mb-3">
          Upload document
        </p>
        <p className="text-sm text-stone-600 font-light mb-5 leading-relaxed">
          PDFs, photos, or scans up to 10 MB. Files are encrypted in transit
          and only Leticia&apos;s team can read them.
        </p>

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

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Uploading…' : 'Upload'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleTextSubmit} className="bg-white border border-stone-200 rounded-xs p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light mb-3">
        Your response
      </p>
      <textarea
        rows={6}
        value={textResponse}
        onChange={(e) => setTextResponse(e.target.value)}
        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
        placeholder="Type your response here…"
        required
      />

      {error && (
        <p className="text-xs text-red-600 font-light mt-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}
