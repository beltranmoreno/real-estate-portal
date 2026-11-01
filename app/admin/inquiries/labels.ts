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

const CONTACT_PAGE_LABEL: Record<string, [string, string]> = {
  about: ['About page', 'Página Nosotros'],
  contact: ['Contact page', 'Página Contacto'],
  owners: ['Owners page', 'Página Propietarios'],
}

export const inquirySourceLabel = (t: T, s: InquirySource, channel?: string | null): string =>
  s === 'MANUAL'
    ? channel
      ? `${t('Manual', 'Manual')} · ${channel}`
      : t('Manual', 'Manual')
    : s === 'CONTACT'
      ? `${t('Website · contact form', 'Web · formulario')}${channel ? ` · ${CONTACT_PAGE_LABEL[channel] ? t(...CONTACT_PAGE_LABEL[channel]) : channel}` : ''}`
      : s === 'FAVORITES'
      ? t('Website · favorites', 'Web · favoritos')
      : t('Website · property', 'Web · propiedad')

/** Channels offered when logging a manual inquiry. */
export const MANUAL_CHANNELS = ['WhatsApp', 'Phone', 'Email', 'Instagram', 'Referral', 'In person', 'Other']
