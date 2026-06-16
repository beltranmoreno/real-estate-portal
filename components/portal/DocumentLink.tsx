'use client'

import { useState } from 'react'

interface Props {
  documentId: string
  /** Which side is requesting — drives which API endpoint we hit. */
  scope: 'admin' | 'renter'
  filename: string
  className?: string
  children?: React.ReactNode
}

/**
 * Click-to-download document link. Hits the signed-URL endpoint, then
 * opens the URL in a new tab. Every successful download is server-side
 * audited (see /api/{admin,portal}/documents/[id]/url).
 */
export function DocumentLink({
  documentId,
  scope,
  filename,
  className,
  children,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const endpoint =
        scope === 'admin'
          ? `/api/admin/documents/${documentId}/url`
          : `/api/portal/documents/${documentId}/url`
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Could not open document')
      const { url } = await res.json()
      // Open in a new tab. The signed URL TTL is 5 minutes, so the
      // tab user has plenty of time even on slow connections.
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <a
        href="#"
        onClick={onClick}
        className={
          className ??
          'text-stone-900 hover:text-stone-700 underline underline-offset-4 cursor-pointer'
        }
      >
        {children ?? filename}
        {loading && ' …'}
      </a>
      {error && (
        <span className="text-xs text-red-600 font-light ml-2">{error}</span>
      )}
    </>
  )
}
