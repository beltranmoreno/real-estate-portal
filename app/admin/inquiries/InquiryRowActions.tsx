'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { tFor } from '@/lib/i18n'

/** ⋮ menu on an inquiries table row: edit or delete. */
export function InquiryRowActions({ id, name, locale = 'en' }: { id: string; name: string; locale?: 'en' | 'es' }) {
  const t = tFor(locale)
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const remove = async () => {
    setOpen(false)
    if (!confirm(t(`Delete the inquiry from ${name}? This can't be undone.`, `¿Eliminar la consulta de ${name}? No se puede deshacer.`))) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert(t('Could not delete the inquiry.', 'No se pudo eliminar la consulta.'))
    } finally {
      setDeleting(false)
    }
  }

  const item = 'flex w-full items-center gap-2.5 px-3 py-2 text-sm font-light text-left hover:bg-stone-100'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={deleting}
          aria-label={t('Actions', 'Acciones')}
          className="p-1.5 rounded-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-50"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1">
        <Link href={`/admin/inquiries/${id}/edit`} className={`${item} text-stone-800`} onClick={() => setOpen(false)}>
          <Pencil className="w-3.5 h-3.5" />
          {t('Edit', 'Editar')}
        </Link>
        <button type="button" onClick={remove} className={`${item} text-red-700`}>
          <Trash2 className="w-3.5 h-3.5" />
          {t('Delete', 'Eliminar')}
        </button>
      </PopoverContent>
    </Popover>
  )
}
