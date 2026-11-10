import { Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

interface ServiceConfirmedEmailProps {
  firstName?: string | null
  propertyTitle: string
  serviceName: string
  venueName?: string | null
  dateLabel?: string | null // preformatted (range-aware)
  timeLabel?: string | null
  partySize?: number | null
  actionUrl: string
  locale?: 'en' | 'es'
}

export const ServiceConfirmedEmail = ({
  firstName,
  propertyTitle,
  serviceName,
  venueName,
  dateLabel,
  timeLabel,
  partySize,
  actionUrl,
  locale = 'en',
}: ServiceConfirmedEmailProps) => {
  const es = locale === 'es'

  const text = {
    preview: es
      ? `Confirmado: ${serviceName}`
      : `Confirmed: ${serviceName}`,
    headline: es ? 'Tu solicitud está confirmada' : 'Your request is confirmed',
    greeting: greeting(firstName, es),
    intro: es
      ? `Hemos confirmado lo siguiente para tu estadía en ${propertyTitle}.`
      : `We've confirmed the following for your stay at ${propertyTitle}.`,
    serviceLabel: es ? 'Servicio' : 'Service',
    venueLabel: es ? 'Lugar' : 'Where',
    dateLabel: es ? 'Fecha' : 'Date',
    timeLabel: es ? 'Hora' : 'Time',
    guestsLabel: es ? 'Personas' : 'Guests',
    cta: es ? 'Ver tu estadía' : 'View your stay',
    secondaryNote: es
      ? 'Puedes ver todos los detalles en tu portal. Si algo cambia, responde a este correo.'
      : 'You can see all the details in your portal. If anything changes, just reply to this email.',
  }

  return (
    <EmailLayout preview={text.preview} locale={es ? 'es' : 'en'} reason={es ? 'Recibiste este correo porque tienes una estadía reservada con Leticia Coudray Real Estate.' : 'You received this email because you have a stay booked with Leticia Coudray Real Estate.'}>
          <Heading style={s.h1}>{text.headline}</Heading>
          <Text style={s.paragraph}>{text.greeting}</Text>
          <Text style={s.paragraph}>{text.intro}</Text>

          <Section style={s.detailsBox}>
            <Text style={s.detailsTitle}>{text.serviceLabel}</Text>
            <Text style={s.itemTitle}>{serviceName}</Text>
            {venueName && (
              <Text style={s.itemText}>
                {text.venueLabel}: {venueName}
              </Text>
            )}
            {dateLabel && (
              <Text style={s.itemText}>
                {text.dateLabel}: {dateLabel}
              </Text>
            )}
            {timeLabel && (
              <Text style={s.itemText}>
                {text.timeLabel}: {timeLabel}
              </Text>
            )}
            {partySize ? (
              <Text style={s.itemText}>
                {text.guestsLabel}: {partySize}
              </Text>
            ) : null}
          </Section>

          <EmailButton href={actionUrl}>{text.cta}</EmailButton>

          <Text style={s.note}>{text.secondaryNote}</Text>

    </EmailLayout>
  )
}

export default ServiceConfirmedEmail

