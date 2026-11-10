import { Heading, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

interface GuestAddedEmailProps {
  firstName?: string | null
  /** Who booked the stay, e.g. "Sarah Miller". */
  bookedBy?: string | null
  propertyTitle: string
  /** Preformatted, e.g. "Dec 20 – Dec 27, 2026". */
  dates: string
  /** The email they must sign in with (matched to give access). */
  email: string
  actionUrl: string
  locale?: 'en' | 'es'
}

/**
 * Sent to an extra guest when they're added to a stay with portal access —
 * by the team or by the guest who booked. Signing in with this email opens a
 * read-only view of the stay (plans, itinerary, house details).
 */
export const GuestAddedEmail = ({
  firstName,
  bookedBy,
  propertyTitle,
  dates,
  email,
  actionUrl,
  locale = 'en',
}: GuestAddedEmailProps) => {
  const es = locale === 'es'
  const t = (en: string, esText: string) => (es ? esText : en)

  return (
    <EmailLayout
      preview={t(`You’ve been added to the stay at ${propertyTitle}`, `Te agregaron a la estadía en ${propertyTitle}`)}
      locale={locale}
      reason={t(
        'You received this email because you were added as a guest to a stay booked with Leticia Coudray Real Estate.',
        'Recibiste este correo porque te agregaron como huésped a una estadía reservada con Leticia Coudray Real Estate.'
      )}
    >
      <Heading style={s.h1}>{t('You’re on the guest list.', 'Estás en la lista de huéspedes.')}</Heading>
      <Text style={s.paragraph}>{greeting(firstName, es)}</Text>
      <Text style={s.paragraph}>
        {bookedBy
          ? t(
              `${bookedBy} has added you to the stay at ${propertyTitle} in Casa de Campo, ${dates}.`,
              `${bookedBy} te agregó a la estadía en ${propertyTitle} en Casa de Campo, ${dates}.`
            )
          : t(
              `You’ve been added to the stay at ${propertyTitle} in Casa de Campo, ${dates}.`,
              `Te agregaron a la estadía en ${propertyTitle} en Casa de Campo, ${dates}.`
            )}
      </Text>
      <Text style={s.paragraph}>
        {t(
          'In the guest portal you can see the plans for the stay, the itinerary and everything about the house — Wi-Fi, directions and more.',
          'En el portal de huéspedes puedes ver los planes de la estadía, el itinerario y todo sobre la casa — Wi-Fi, cómo llegar y más.'
        )}
      </Text>
      <EmailButton href={actionUrl} compact>{t('Open the stay', 'Abrir la estadía')}</EmailButton>
      <Text style={{ ...s.note, textAlign: 'center' }}>
        {t(`Sign in with ${email} — no password needed.`, `Inicia sesión con ${email} — sin contraseña.`)}
      </Text>
    </EmailLayout>
  )
}

export default GuestAddedEmail
