'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Receipt } from 'lucide-react'

interface Props {
  bookingId: string
  serviceRequestId: string
}

/**
 * Slimmed-down upload widget for attaching a receipt to a single
 * service request (typically a kind=GROCERY one). Same two-step
 * presigned-PUT → commit flow as AdminUploadButton, but tags the
 * doc with kind=RECEIPT and links it to the service request.
 */
export function ReceiptUploadButton({ bookingId, serviceRequestId }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large (max 20 MB)')
      return
    }
    setUploading(true)
    try {
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

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })
      if (!putRes.ok) throw new Error('Upload failed')

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
          kind: 'RECEIPT',
          serviceRequestId,
          label: `Receipt — ${file.name}`,
        }),
      })
      if (!commitRes.ok) {
        const err = await commitRes.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not save receipt')
      }

      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 underline underline-offset-4 disabled:opacity-60"
      >
        <Receipt className="w-3 h-3" />
        {uploading ? 'Uploading…' : 'Upload receipt'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
      {error && <span className="text-xs text-red-600 font-light">{error}</span>}
    </div>
  )
}
