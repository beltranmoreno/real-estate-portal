import type { InquirySource, InquiryStatus } from '@prisma/client'

type T = (en: string, es: string) => string

export const INQUIRY_STATUSES: InquiryStatus[] = ['NEW', 'CONTACTED', 'SELECTION_SENT', 'BOOKED', 'CLOSED']

export const inquiryStatusLabel = (t: T, s: InquiryStatus): string =>
  ({
    NEW: t('New', 'Nueva'),
    CONTACTED: t('Contacted', 'Contactada'),
    SELECTION_SENT: t('Selection sent', 'Selección enviada'),
    BOOKED: t('Booked', 'Reservada'),
    CLOSED: t('Closed', 'Cerrada'),
  })[s]

export const inquirySourceLabel = (t: T, s: InquirySource, channel?: string | null): string =>
  s === 'MANUAL'
    ? channel
      ? `${t('Manual', 'Manual')} · ${channel}`
      : t('Manual', 'Manual')
    : s === 'FAVORITES'
      ? t('Website · favorites', 'Web · favoritos')
      : t('Website · property', 'Web · propiedad')

/** Channels offered when logging a manual inquiry. */
export const MANUAL_CHANNELS = ['WhatsApp', 'Phone', 'Email', 'Instagram', 'Referral', 'In person', 'Other']
