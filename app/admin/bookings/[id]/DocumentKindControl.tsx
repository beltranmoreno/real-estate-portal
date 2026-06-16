'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { DocumentKind } from '@prisma/client'

interface Props {
  documentId: string
  initialKind: DocumentKind
}

const OPTIONS: Array<{ value: DocumentKind; label: string }> = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'ID', label: 'ID' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'PET_DOC', label: 'Pet doc' },
  { value: 'AGENT_UPLOAD', label: 'Agent upload' },
  { value: 'OTHER', label: 'Other' },
]

/**
 * Reclassify an uploaded document. Changing to PASSPORT/ID/CONTRACT auto-sets
 * the 90-day post-checkout retention expiry; changing out of those clears it.
 */
export function DocumentKindControl({ documentId, initialKind }: Props) {
  const router = useRouter()
  const [kind, setKind] = useState<DocumentKind>(initialKind)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = async (next: DocumentKind) => {
    if (next === kind) return
    const prev = kind
    setKind(next)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: next }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not update')
      }
      router.refresh()
    } catch (err: any) {
      setKind(prev)
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block">
        <select
          value={kind}
          onChange={(e) => onChange(e.target.value as DocumentKind)}
          disabled={saving}
          className="appearance-none bg-white rounded-sm border border-stone-300 pl-2 pr-6 py-0.5 text-[11px] uppercase tracking-wider font-light text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-800 disabled:opacity-60"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-500" />
      </div>
      {saving && (
        <span className="text-[10px] text-stone-400 font-light">saving…</span>
      )}
      {error && (
        <span className="text-[10px] text-red-600 font-light">{error}</span>
      )}
    </div>
  )
}
