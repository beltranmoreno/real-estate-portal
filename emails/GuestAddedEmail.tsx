import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLogo, EmailSignature } from './brand'

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
    <Html>
      <Head />
      <Preview>
        {t(`You’ve been added to the stay at ${propertyTitle}`, `Te agregaron a la estadía en ${propertyTitle}`)}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailLogo />
          <Heading style={h1}>{t('You’re on the guest list.', 'Estás en la lista de huéspedes.')}</Heading>
          <Text style={paragraph}>
            {firstName ? t(`Dear ${firstName},`, `Hola ${firstName},`) : t('Hello,', 'Hola,')}
          </Text>
          <Text style={paragraph}>
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
          <Text style={paragraph}>
            {t(
              'In the guest portal you can see the plans for the stay, the itinerary and everything about the house — Wi-Fi, directions and more.',
              'En el portal de huéspedes puedes ver los planes de la estadía, el itinerario y todo sobre la casa — Wi-Fi, cómo llegar y más.'
            )}
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0 16px' }}>
            <Button href={actionUrl} style={button}>
              {t('Open the stay', 'Abrir la estadía')}
            </Button>
          </Section>
          <Text style={{ ...muted, textAlign: 'center' as const }}>
            {t(`Sign in with ${email} — no password needed.`, `Inicia sesión con ${email} — sin contraseña.`)}
          </Text>
          <EmailSignature locale={locale} />
        </Container>
      </Body>
    </Html>
  )
}

export default GuestAddedEmail

const body = { backgroundColor: '#f6f4f1', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }
const container = { backgroundColor: '#ffffff', border: '1px solid #e2ded8', maxWidth: '560px', margin: '0 auto', padding: '40px' }
const h1 = { fontSize: '30px', fontWeight: 400 as const, color: '#1c1917', margin: '0 0 20px' }
const paragraph = { fontSize: '15px', lineHeight: '1.7', color: '#57534e', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300 as const, margin: '0 0 14px', textAlign: 'justify' as const }
const muted = { fontSize: '13px', lineHeight: '1.6', color: '#78716c', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300 as const, margin: '0 0 8px' }
const button = { backgroundColor: '#1c1917', color: '#ffffff', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, fontFamily: 'Helvetica, Arial, sans-serif', padding: '14px 28px', borderRadius: '2px', textDecoration: 'none' }
