'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { ServiceRequestStatus } from '@prisma/client'

interface Props {
  serviceRequestId: string
  initialStatus: ServiceRequestStatus
}

const OPTIONS: Array<{ value: ServiceRequestStatus; label: string }> = [
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function ServiceRequestStatusControl({
  serviceRequestId,
  initialStatus,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<ServiceRequestStatus>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = async (next: ServiceRequestStatus) => {
    if (next === status) return
    const prev = status
    setStatus(next)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/service-requests/${serviceRequestId}`, {
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
          onChange={(e) => onChange(e.target.value as ServiceRequestStatus)}
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
