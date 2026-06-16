'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
}

export function AdminUploadButton({ bookingId }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [label, setLabel] = useState('')
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Choose a file.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Maximum 20 MB.')
      return
    }

    setUploading(true)
    try {
      setProgress('Preparing…')
      const signRes = await fetch('/api/admin/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
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
      if (!putRes.ok) throw new Error('Upload failed.')

      setProgress('Saving…')
      const commitRes = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          documentId,
          storageKey,
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          fileSize: file.size,
          label: label.trim() || null,
        }),
      })
      if (!commitRes.ok) {
        const err = await commitRes.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not save document')
      }

      // Reset and refresh the page so the new doc appears
      if (fileInputRef.current) fileInputRef.current.value = ''
      setLabel('')
      setProgress(null)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setProgress(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-stone-50 border border-stone-200 rounded-xs p-4 space-y-3"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light">
        Share a document with the guest
      </p>

      <input
        ref={fileInputRef}
        type="file"
        className="block w-full text-sm font-light text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-stone-300 file:bg-white file:text-stone-700 file:text-sm file:font-light hover:file:bg-stone-100"
      />

      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (optional, e.g. 'Rental contract')"
        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
      />

      {progress && (
        <p className="text-xs text-stone-500 font-light">{progress}</p>
      )}
      {error && <p className="text-xs text-red-600 font-light">{error}</p>}

      <button
        type="submit"
        disabled={uploading}
        className="px-5 py-2 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading…' : 'Upload & share'}
      </button>
    </form>
  )
}
