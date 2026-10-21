import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components'
import * as React from 'react'

interface InquirySelectionEmailProps {
  firstName: string
  /** Private collection link, access code included. */
  url: string
  /** Optional personal note from Leticia, shown above the button. */
  note?: string | null
  /** Formatted stay dates, e.g. "Dec 1, 2026 – Dec 10, 2026". */
  dates?: string | null
  houseCount: number
  locale?: 'en' | 'es'
}

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

export const InquirySelectionEmail = ({
  firstName,
  url,
  note,
  dates,
  houseCount,
  locale = 'en',
}: InquirySelectionEmailProps) => {
  const es = locale === 'es'

  const text = {
    preview: es ? 'Tu selección de casas en Casa de Campo' : 'Your selection of houses in Casa de Campo',
    eyebrow: 'Casa de Campo',
    headline: es ? 'Tu selección' : 'Your selection',
    greeting: es ? `Hola ${firstName},` : `Hi ${firstName},`,
    intro: es
      ? `Gracias por escribirnos. Preparé una selección privada de ${houseCount === 1 ? 'una casa' : `${houseCount} casas`} pensando en tu estadía${dates ? ` (${dates})` : ''}.`
      : `Thank you for getting in touch. I've put together a private selection of ${houseCount === 1 ? 'one house' : `${houseCount} houses`} for your stay${dates ? ` (${dates})` : ''}.`,
    cta: es ? 'Ver mi selección' : 'View my selection',
    after: es
      ? 'El enlace es solo para ti — no necesitas crear una cuenta. Responde este correo o escríbeme por WhatsApp con cualquier pregunta.'
      : "The link is just for you — no account needed. Reply to this email or message me on WhatsApp with any questions.",
    signoff: es ? 'Hasta pronto,' : 'Talk soon,',
    signature: 'Leticia Coudray',
    role: 'Casa de Campo Real Estate',
    footer: es
      ? 'Recibiste este correo porque enviaste una consulta a Leticia Coudray Real Estate.'
      : 'You received this email because you sent an inquiry to Leticia Coudray Real Estate.',
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

          {note && (
            <Section style={noteBox}>
              {note.split('\n').map((line, i) => (
                <Text key={i} style={noteText}>
                  {line || ' '}
                </Text>
              ))}
            </Section>
          )}

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={url} style={button}>
              {text.cta}
            </Button>
          </Section>

          <Text style={instructions}>{text.after}</Text>

          <Hr style={hr} />
          <Text style={paragraph}>{text.signoff}</Text>
          <Text style={signatureText}>{text.signature}</Text>
          <Text style={roleText}>{text.role}</Text>

          <Hr style={hr} />
          <Text style={footer}>{text.footer}</Text>
          <Text style={footer}>
            <a href={DOMAIN} style={footerLink}>
              {DOMAIN.replace(/^https?:\/\//, '')}
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default InquirySelectionEmail

// ---------- styles (match InvitationEmail) ----------

const body: React.CSSProperties = {
  backgroundColor: '#f5f5f4',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
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
  fontSize: 32,
  fontWeight: 300,
  lineHeight: 1.2,
  margin: '0 0 32px 0',
}

const paragraph: React.CSSProperties = {
  color: '#44403c',
  fontSize: 16,
  lineHeight: 1.6,
  margin: '0 0 16px 0',
  fontWeight: 300,
}

const noteBox: React.CSSProperties = {
  borderLeft: '2px solid #e7e5e4',
  margin: '24px 0',
  padding: '4px 0 4px 16px',
}

const noteText: React.CSSProperties = {
  color: '#44403c',
  fontSize: 15,
  lineHeight: 1.6,
  fontStyle: 'italic',
  fontWeight: 300,
  margin: 0,
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

const roleText: React.CSSProperties = {
  color: '#78716c',
  fontSize: 13,
  fontWeight: 300,
  margin: 0,
}

const footer: React.CSSProperties = {
  color: '#a8a29e',
  fontSize: 12,
  fontWeight: 300,
  lineHeight: 1.5,
  margin: '0 0 8px 0',
}

const footerLink: React.CSSProperties = {
  color: '#a8a29e',
  textDecoration: 'underline',
}
