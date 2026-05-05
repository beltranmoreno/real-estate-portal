'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { UserRole } from '@prisma/client'

interface Props {
  userId: string
  initialRole: UserRole
}

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'RENTER', label: 'Renter' },
  { value: 'ADDITIONAL_GUEST', label: 'Additional guest' },
]

/**
 * Inline role changer. Posts the change immediately on select; uses a
 * subtle "saving…" affordance instead of a save button so the table
 * stays scannable.
 */
export function UserRoleSelect({ userId, initialRole }: Props) {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>(initialRole)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = async (next: UserRole) => {
    if (next === role) return
    const prev = role
    setRole(next)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: next }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not update role')
      }
      router.refresh()
    } catch (err: any) {
      setRole(prev)
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block">
        <select
          value={role}
          onChange={(e) => onChange(e.target.value as UserRole)}
          disabled={saving}
          className="appearance-none bg-white rounded-sm border border-stone-300 pl-3 pr-8 py-1.5 text-xs font-light tracking-wide focus:outline-none focus:ring-2 focus:ring-stone-800 disabled:opacity-60"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-500" />
      </div>
      {saving && (
        <span className="text-xs text-stone-400 font-light">saving…</span>
      )}
      {error && <span className="text-xs text-red-600 font-light">{error}</span>}
    </div>
  )
}
