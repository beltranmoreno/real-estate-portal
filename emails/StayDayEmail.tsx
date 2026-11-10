import { Heading, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

interface StayDayEmailProps {
  kind: 'check-in' | 'check-out'
  firstName?: string | null
  propertyTitle: string
  /** Villa check-in / check-out time, already formatted ("4:00 PM"). */
  time?: string | null
  actionUrl: string
  locale?: 'en' | 'es'
}

/**
 * Day-of emails from the daily cron: a welcome on check-in day and a warm
 * goodbye on check-out day. Both link to the guest's stay in the portal.
 */
export const StayDayEmail = ({ kind, firstName, propertyTitle, time, actionUrl, locale = 'en' }: StayDayEmailProps) => {
  const es = locale === 'es'
  const t = (en: string, esText: string) => (es ? esText : en)
  const checkIn = kind === 'check-in'

  const preview = checkIn
    ? t(`Welcome to ${propertyTitle} — today is the day.`, `Bienvenido a ${propertyTitle} — hoy es el día.`)
    : t(`Thank you for staying at ${propertyTitle}.`, `Gracias por hospedarte en ${propertyTitle}.`)
  const headline = checkIn ? t('Welcome.', 'Bienvenido.') : t('Safe travels.', 'Buen viaje.')

  return (
    <EmailLayout preview={preview} locale={locale} reason={t('You received this email because you have a stay booked with Leticia Coudray Real Estate.', 'Recibiste este correo porque tienes una estadía reservada con Leticia Coudray Real Estate.')}>
          <Heading style={s.h1}>{headline}</Heading>
          <Text style={s.paragraph}>{greeting(firstName, es)}</Text>
          {checkIn ? (
            <>
              <Text style={s.paragraph}>
                {t(
                  `Today is the day — we are delighted to welcome you to ${propertyTitle} in Casa de Campo.`,
                  `Hoy es el día — es un placer darte la bienvenida a ${propertyTitle} en Casa de Campo.`
                )}
                {time ? ' ' + t(`Check-in is from ${time}.`, `La entrada es a partir de las ${time}.`) : ''}
              </Text>
              <Text style={s.paragraph}>
                {t(
                  'Everything for your stay is in your portal: the Wi-Fi and house details, your itinerary, dining and concierge. If you need anything at all, just reply to this email.',
                  'Todo para tu estadía está en tu portal: el Wi-Fi y los detalles de la casa, tu itinerario, gastronomía y conserjería. Si necesitas cualquier cosa, solo responde este correo.'
                )}
              </Text>
            </>
          ) : (
            <>
              <Text style={s.paragraph}>
                {t(
                  `Today you say goodbye to ${propertyTitle}. Thank you for staying with us — it was a pleasure to welcome you.`,
                  `Hoy te despides de ${propertyTitle}. Gracias por hospedarte con nosotros — fue un placer recibirte.`
                )}
                {time ? ' ' + t(`Check-out is by ${time}.`, `La salida es antes de las ${time}.`) : ''}
              </Text>
              <Text style={s.paragraph}>
                {t(
                  'We wish you a safe journey home. If anything comes up before you leave, just reply to this email.',
                  'Te deseamos un buen viaje de regreso. Si surge algo antes de irte, solo responde este correo.'
                )}
              </Text>
            </>
          )}
          <EmailButton href={actionUrl}>{t('Open your stay', 'Abrir tu estadía')}</EmailButton>
    </EmailLayout>
  )
}

export default StayDayEmail
