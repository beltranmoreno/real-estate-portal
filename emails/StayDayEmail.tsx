import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLogo } from './brand'

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
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailLogo />
          <Heading style={h1}>{headline}</Heading>
          <Text style={paragraph}>
            {firstName ? t(`Dear ${firstName},`, `Hola ${firstName},`) : t('Dear guest,', 'Hola,')}
          </Text>
          {checkIn ? (
            <>
              <Text style={paragraph}>
                {t(
                  `Today is the day — we are delighted to welcome you to ${propertyTitle} in Casa de Campo.`,
                  `Hoy es el día — es un placer darte la bienvenida a ${propertyTitle} en Casa de Campo.`
                )}
                {time ? ' ' + t(`Check-in is from ${time}.`, `La entrada es a partir de las ${time}.`) : ''}
              </Text>
              <Text style={paragraph}>
                {t(
                  'Everything for your stay is in your portal: the house details, your itinerary, dining and concierge. If you need anything at all, just reply to this email.',
                  'Todo para tu estadía está en tu portal: los detalles de la casa, tu itinerario, gastronomía y conserjería. Si necesitas cualquier cosa, solo responde este correo.'
                )}
              </Text>
            </>
          ) : (
            <>
              <Text style={paragraph}>
                {t(
                  `Today you say goodbye to ${propertyTitle}. Thank you for staying with us — it was a pleasure to welcome you.`,
                  `Hoy te despides de ${propertyTitle}. Gracias por hospedarte con nosotros — fue un placer recibirte.`
                )}
                {time ? ' ' + t(`Check-out is by ${time}.`, `La salida es antes de las ${time}.`) : ''}
              </Text>
              <Text style={paragraph}>
                {t(
                  'We wish you a safe journey home. If anything comes up before you leave, just reply to this email.',
                  'Te deseamos un buen viaje de regreso. Si surge algo antes de irte, solo responde este correo.'
                )}
              </Text>
            </>
          )}
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={actionUrl} style={button}>
              {t('Open your stay', 'Abrir tu estadía')}
            </Button>
          </Section>
          <Text style={{ ...paragraph, margin: '28px 0 0' }}>{t('Warm regards,', 'Un cordial saludo,')}</Text>
          <Text style={signature}>Leticia Coudray Saladin</Text>
          <Text style={muted}>{t('Real Estate Team', 'Equipo de Real Estate')}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default StayDayEmail

const body = { backgroundColor: '#f6f4f1', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }
const container = { backgroundColor: '#ffffff', border: '1px solid #e2ded8', maxWidth: '560px', margin: '0 auto', padding: '40px' }
const h1 = { fontSize: '30px', fontWeight: 400 as const, color: '#1c1917', margin: '0 0 20px' }
const paragraph = { fontSize: '15px', lineHeight: '1.7', color: '#57534e', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300 as const, margin: '0 0 14px' }
const muted = { fontSize: '13px', lineHeight: '1.6', color: '#78716c', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300 as const, margin: '0' }
const signature = { fontSize: '17px', color: '#1c1917', margin: '6px 0 0' }
const button = { backgroundColor: '#1c1917', color: '#ffffff', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, fontFamily: 'Helvetica, Arial, sans-serif', padding: '14px 28px', borderRadius: '2px', textDecoration: 'none' }
