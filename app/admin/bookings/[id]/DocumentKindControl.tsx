'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { DocumentKind } from '@prisma/client'
import { tFor } from '@/lib/i18n'

interface Props {
  documentId: string
  initialKind: DocumentKind
  locale?: 'en' | 'es'
}

const OPTIONS: Array<{ value: DocumentKind; label_en: string; label_es: string }> = [
  { value: 'PASSPORT', label_en: 'Passport', label_es: 'Pasaporte' },
  { value: 'ID', label_en: 'ID', label_es: 'Identificación' },
  { value: 'CONTRACT', label_en: 'Contract', label_es: 'Contrato' },
  { value: 'RECEIPT', label_en: 'Receipt', label_es: 'Recibo' },
  { value: 'INSURANCE', label_en: 'Insurance', label_es: 'Seguro' },
  { value: 'PET_DOC', label_en: 'Pet doc', label_es: 'Doc. de mascota' },
  { value: 'AGENT_UPLOAD', label_en: 'Agent upload', label_es: 'Subida del agente' },
  { value: 'OTHER', label_en: 'Other', label_es: 'Otro' },
]

/**
 * Reclassify an uploaded document. Changing to PASSPORT/ID/CONTRACT auto-sets
 * the 90-day post-checkout retention expiry; changing out of those clears it.
 */
export function DocumentKindControl({ documentId, initialKind, locale = 'en' }: Props) {
  const t = tFor(locale)
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
        throw new Error(err?.error || t('Could not update', 'No se pudo actualizar'))
      }
      router.refresh()
    } catch (err: any) {
      setKind(prev)
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
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
              {t(o.label_en, o.label_es)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-500" />
      </div>
      {saving && (
        <span className="text-[10px] text-stone-400 font-light">{t('saving…', 'guardando…')}</span>
      )}
      {error && (
        <span className="text-[10px] text-red-600 font-light">{error}</span>
      )}
    </div>
  )
}
