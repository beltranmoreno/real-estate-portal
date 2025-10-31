'use client'

import React, { useEffect, useRef } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { X, Bed, BedDouble, BedSingle, Baby, Home } from 'lucide-react'

interface RoomBreakdownDialogProps {
  isOpen: boolean
  onClose: () => void
  rooms: Array<{
    roomName_en: string
    roomName_es: string
    bathrooms?: number
    beds: Array<{
      bedType: 'king' | 'queen' | 'full' | 'twin' | 'bunk' | 'sofa' | 'crib'
      quantity: number
    }>
  }>
}

export default function RoomBreakdownDialog({ isOpen, onClose, rooms }: RoomBreakdownDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { locale, t } = useLocale()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      // Disable body scroll when dialog is open
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      // Re-enable body scroll when dialog is closed
      document.body.style.overflow = ''
    }

    // Cleanup function to ensure scroll is re-enabled on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Bed type translations
  const getBedTypeLabel = (bedType: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      king: { en: 'King', es: 'King' },
      queen: { en: 'Queen', es: 'Queen' },
      full: { en: 'Full/Double', es: 'Matrimonial' },
      twin: { en: 'Twin/Single', es: 'Individual' },
      bunk: { en: 'Bunk Bed', es: 'Litera' },
      sofa: { en: 'Sofa Bed', es: 'Sofá Cama' },
      crib: { en: 'Crib', es: 'Cuna' },
    }
    return t(labels[bedType] || { en: bedType, es: bedType })
  }

  // Get icon and style for each bed type
  const getBedIcon = (bedType: string) => {
    const iconConfig: Record<string, { Icon: typeof Bed; color: string; bgColor: string }> = {
      king: { Icon: BedDouble, color: 'text-slate-800', bgColor: 'bg-slate-100' },
      queen: { Icon: BedDouble, color: 'text-slate-700', bgColor: 'bg-slate-50' },
      full: { Icon: BedDouble, color: 'text-slate-600', bgColor: 'bg-stone-50' },
      twin: { Icon: BedSingle, color: 'text-slate-700', bgColor: 'bg-stone-100' },
      bunk: { Icon: BedSingle, color: 'text-slate-600', bgColor: 'bg-stone-50' },
      sofa: { Icon: Home, color: 'text-slate-600', bgColor: 'bg-amber-50' },
      crib: { Icon: Baby, color: 'text-slate-500', bgColor: 'bg-blue-50' },
    }
    return iconConfig[bedType] || { Icon: Bed, color: 'text-slate-700', bgColor: 'bg-stone-50' }
  }

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 rounded-2xl shadow-2xl p-0 max-w-4xl w-full max-h-[90vh] overflow-hidden m-auto inset-0"
      onClose={onClose}
      onClick={(e) => {
        // Close when clicking on backdrop
        if (e.target === dialogRef.current) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-light text-stone-900 tracking-wide">
            {t({ en: 'Room & Bed Breakdown', es: 'Distribución de Habitaciones y Camas' })}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label={t({ en: 'Close', es: 'Cerrar' })}
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room, roomIndex) => (
              <div
                key={roomIndex}
                className="p-5 bg-stone-50/50 border border-stone-200/50 rounded-xl"
              >
                <h3 className="text-base font-medium text-stone-900 mb-4 pb-3 border-b border-stone-200/50">
                  {locale === 'es' ? room.roomName_es : room.roomName_en}
                </h3>

                <div className="space-y-4">
                  {/* Beds */}
                  <div className="space-y-3">
                    {room.beds.map((bed, bedIndex) => {
                      const { Icon, color, bgColor } = getBedIcon(bed.bedType)
                      return (
                        <div key={bedIndex} className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`p-3 rounded-xl ${bgColor} border border-stone-200/50 shadow-sm`}>
                              <Icon className={`w-8 h-8 ${color}`} />
                            </div>
                            {bed.quantity > 1 && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white text-xs font-medium rounded-full flex items-center justify-center shadow-md border-2 border-white">
                                {bed.quantity}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-medium text-stone-900">
                              {getBedTypeLabel(bed.bedType)}
                            </div>
                            {bed.quantity > 1 && (
                              <div className="text-sm text-stone-600 font-light">
                                {bed.quantity} {t({ en: bed.quantity === 1 ? 'bed' : 'beds', es: bed.quantity === 1 ? 'cama' : 'camas' })}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Bathrooms */}
                  {room.bathrooms !== undefined && room.bathrooms > 0 && (
                    <div className="pt-3 border-t border-stone-200/30">
                      <div className="text-sm text-stone-600 font-light">
                        {room.bathrooms} {t({ en: room.bathrooms === 1 ? 'bathroom' : 'bathrooms', es: room.bathrooms === 1 ? 'baño' : 'baños' })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  )
}
