'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import InquiryForm, { type InquiryFormProps } from './InquiryForm'

interface InquiryDialogProps extends InquiryFormProps {
  open: boolean
  onClose: () => void
}

/** The inquiry form in a modal — used by every "inquire" button on the property page. */
export default function InquiryDialog({ open, onClose, ...formProps }: InquiryDialogProps) {
  const { t } = useLocale()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative max-h-[92svh] w-full overflow-y-auto bg-surface p-6 shadow-xl sm:max-w-lg sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="eyebrow">{t({ en: 'Inquire', es: 'Consultar' })}</p>
            <h2 className="font-title text-2xl text-ink">
              {t({ en: 'Tell Leticia about your stay', es: 'Cuéntale a Leticia sobre tu estadía' })}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t({ en: 'Close', es: 'Cerrar' })}
            className="-mr-2 -mt-1 p-2 text-muted transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <InquiryForm {...formProps} />
      </div>
    </div>
  )
}
