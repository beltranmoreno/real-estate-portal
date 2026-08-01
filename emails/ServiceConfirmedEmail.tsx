import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

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
    eyebrow: 'Casa de Campo',
    headline: es ? 'Tu solicitud está confirmada' : 'Your request is confirmed',
    greeting: firstName ? (es ? `Hola ${firstName},` : `Hi ${firstName},`) : es ? 'Hola,' : 'Hi,',
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
    signoff: es ? 'Nos vemos pronto,' : 'See you soon,',
    signature: 'Leticia Coudray',
  }

  return (
    <Html>
      <Head />
      <Preview>{text.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrow}>{text.eyebrow}</Text>
          <Heading style={h1}>{text.headline}</Heading>
          <Text style={paragraph}>{text.greeting}</Text>
          <Text style={paragraph}>{text.intro}</Text>

          <Section style={detailsBox}>
            <Text style={detailsTitle}>{text.serviceLabel}</Text>
            <Text style={serviceTitleStyle}>{serviceName}</Text>
            {venueName && (
              <Text style={rowStyle}>
                {text.venueLabel}: {venueName}
              </Text>
            )}
            {dateLabel && (
              <Text style={rowStyle}>
                {text.dateLabel}: {dateLabel}
              </Text>
            )}
            {timeLabel && (
              <Text style={rowStyle}>
                {text.timeLabel}: {timeLabel}
              </Text>
            )}
            {partySize ? (
              <Text style={rowStyle}>
                {text.guestsLabel}: {partySize}
              </Text>
            ) : null}
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={actionUrl} style={button}>
              {text.cta}
            </Button>
          </Section>

          <Text style={instructions}>{text.secondaryNote}</Text>

          <Hr style={hr} />
          <Text style={paragraph}>{text.signoff}</Text>
          <Text style={signatureText}>{text.signature}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ServiceConfirmedEmail

// ---------- styles (mirrors RequestCreatedEmail) ----------

const body: React.CSSProperties = {
  backgroundColor: '#f5f5f4',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: 560,
  padding: '40px 32px',
}
const eyebrow: React.CSSProperties = {
  color: '#78716c',
  fontSize: 11,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  margin: '0 0 24px 0',
}
const h1: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 28,
  fontWeight: 300,
  lineHeight: 1.2,
  margin: '0 0 24px 0',
}
const paragraph: React.CSSProperties = {
  color: '#44403c',
  fontSize: 16,
  lineHeight: 1.6,
  margin: '0 0 16px 0',
  fontWeight: 300,
}
const detailsBox: React.CSSProperties = {
  borderTop: '1px solid #e7e5e4',
  borderBottom: '1px solid #e7e5e4',
  margin: '32px 0',
  padding: '20px 0',
}
const detailsTitle: React.CSSProperties = {
  color: '#78716c',
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  margin: '0 0 8px 0',
}
const serviceTitleStyle: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 18,
  fontWeight: 400,
  margin: '0 0 8px 0',
}
const rowStyle: React.CSSProperties = {
  color: '#57534e',
  fontSize: 14,
  fontWeight: 300,
  lineHeight: 1.5,
  margin: '0 0 4px 0',
}
const button: React.CSSProperties = {
  backgroundColor: '#292524',
  borderRadius: 2,
  color: '#ffffff',
  display: 'inline-block',
  fontSize: 14,
  fontWeight: 300,
  letterSpacing: '0.05em',
  padding: '14px 28px',
  textDecoration: 'none',
}
const instructions: React.CSSProperties = {
  color: '#78716c',
  fontSize: 13,
  fontWeight: 300,
  lineHeight: 1.6,
  margin: '0 0 12px 0',
}
const hr: React.CSSProperties = {
  borderColor: '#e7e5e4',
  margin: '32px 0',
}
const signatureText: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 16,
  fontWeight: 400,
  margin: '0 0 4px 0',
}
