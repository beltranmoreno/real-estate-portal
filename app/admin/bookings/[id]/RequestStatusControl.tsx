'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { RequestStatus } from '@prisma/client'

interface Props {
  requestId: string
  initialStatus: RequestStatus
}

const OPTIONS: Array<{ value: RequestStatus; label: string }> = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PENDING_REVIEW', label: 'Pending review' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'WAIVED', label: 'Waived' },
  { value: 'EXPIRED', label: 'Expired' },
]

/**
 * Inline status changer for a request. Use cases:
 *   - Mark as FULFILLED if guest sent docs out-of-band (WhatsApp, email)
 *   - Re-open a closed request
 *   - WAIVE a request that no longer applies
 *
 * Same auto-save pattern as the role select on /admin/users.
 */
export function RequestStatusControl({ requestId, initialStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<RequestStatus>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = async (next: RequestStatus) => {
    if (next === status) return
    const prev = status
    setStatus(next)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not update')
      }
      router.refresh()
    } catch (err: any) {
      setStatus(prev)
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block">
        <select
          value={status}
          onChange={(e) => onChange(e.target.value as RequestStatus)}
          disabled={saving}
          className="appearance-none bg-white rounded-sm border border-stone-300 pl-3 pr-7 py-1 text-xs font-light tracking-wide focus:outline-none focus:ring-2 focus:ring-stone-800 disabled:opacity-60"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-500" />
      </div>
      {saving && (
        <span className="text-xs text-stone-400 font-light">saving…</span>
      )}
      {error && <span className="text-xs text-red-600 font-light">{error}</span>}
    </div>
  )
}
