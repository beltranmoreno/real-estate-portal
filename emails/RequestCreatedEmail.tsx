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

interface RequestCreatedEmailProps {
  firstName?: string | null
  propertyTitle: string
  requestTitle: string
  requestDescription?: string | null
  expectsDocument: boolean
  dueAt?: string | null // formatted date
  actionUrl: string
  locale?: 'en' | 'es'
}

export const RequestCreatedEmail = ({
  firstName,
  propertyTitle,
  requestTitle,
  requestDescription,
  expectsDocument,
  dueAt,
  actionUrl,
  locale = 'en',
}: RequestCreatedEmailProps) => {
  const es = locale === 'es'

  const text = {
    preview: es
      ? `${requestTitle} para tu estadía en ${propertyTitle}`
      : `${requestTitle} for your stay at ${propertyTitle}`,
    eyebrow: 'Casa de Campo',
    headline: es ? 'Necesitamos algo de ti' : 'A small request',
    greeting: firstName
      ? es
        ? `Hola ${firstName},`
        : `Hi ${firstName},`
      : es
        ? 'Hola,'
        : 'Hi,',
    intro: es
      ? `Hemos añadido una solicitud a tu portal para tu estadía en ${propertyTitle}.`
      : `We've added a request to your portal for your stay at ${propertyTitle}.`,
    requestLabel: es ? 'Solicitud' : 'Request',
    dueLabel: es ? 'Para el' : 'Needed by',
    cta: expectsDocument
      ? es
        ? 'Subir documento'
        : 'Upload document'
      : es
        ? 'Responder ahora'
        : 'Respond now',
    secondaryNote: es
      ? 'Solo toma un momento desde tu portal. Si tienes dudas, responde este correo.'
      : "It only takes a moment from your portal. If you have questions, just reply to this email.",
    signoff: es ? 'Gracias,' : 'Thanks,',
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
            <Text style={detailsTitle}>{text.requestLabel}</Text>
            <Text style={requestTitleStyle}>{requestTitle}</Text>
            {requestDescription && (
              <Text style={requestDescStyle}>{requestDescription}</Text>
            )}
            {dueAt && (
              <Text style={dueStyle}>
                {text.dueLabel}: {dueAt}
              </Text>
            )}
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

export default RequestCreatedEmail

// ---------- styles (mirrors InvitationEmail) ----------

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

const requestTitleStyle: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 18,
  fontWeight: 400,
  margin: '0 0 8px 0',
}

const requestDescStyle: React.CSSProperties = {
  color: '#57534e',
  fontSize: 14,
  fontWeight: 300,
  lineHeight: 1.5,
  margin: '0 0 8px 0',
}

const dueStyle: React.CSSProperties = {
  color: '#a8a29e',
  fontSize: 12,
  fontWeight: 300,
  margin: '8px 0 0 0',
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
