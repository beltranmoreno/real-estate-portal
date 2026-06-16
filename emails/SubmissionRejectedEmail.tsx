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

interface SubmissionRejectedEmailProps {
  firstName?: string | null
  propertyTitle: string
  requestTitle: string
  note?: string | null
  actionUrl: string
  locale?: 'en' | 'es'
}

export const SubmissionRejectedEmail = ({
  firstName,
  propertyTitle,
  requestTitle,
  note,
  actionUrl,
  locale = 'en',
}: SubmissionRejectedEmailProps) => {
  const es = locale === 'es'

  const text = {
    preview: es
      ? `Por favor reenvía: ${requestTitle}`
      : `Please re-submit: ${requestTitle}`,
    eyebrow: 'Casa de Campo',
    headline: es ? 'Necesitamos un ajuste' : 'A small adjustment',
    greeting: firstName
      ? es
        ? `Hola ${firstName},`
        : `Hi ${firstName},`
      : es
        ? 'Hola,'
        : 'Hi,',
    intro: es
      ? `Revisamos tu envío para "${requestTitle}" en ${propertyTitle} y necesitamos pedirte que lo reenvíes.`
      : `We reviewed your submission for "${requestTitle}" at ${propertyTitle} and need to ask you to re-submit it.`,
    noteLabel: es ? 'Razón' : 'Reason',
    cta: es ? 'Reenviar ahora' : 'Re-submit now',
    closing: es
      ? 'Si tienes preguntas, simplemente responde a este correo.'
      : 'If you have questions, just reply to this email.',
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

          {note && (
            <Section style={noteBox}>
              <Text style={noteLabel}>{text.noteLabel}</Text>
              <Text style={noteText}>{note}</Text>
            </Section>
          )}

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={actionUrl} style={button}>
              {text.cta}
            </Button>
          </Section>

          <Text style={instructions}>{text.closing}</Text>

          <Hr style={hr} />
          <Text style={paragraph}>{text.signoff}</Text>
          <Text style={signatureText}>{text.signature}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default SubmissionRejectedEmail

// ---------- shared styles ----------

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
const noteBox: React.CSSProperties = {
  borderTop: '1px solid #e7e5e4',
  borderBottom: '1px solid #e7e5e4',
  margin: '24px 0',
  padding: '16px 0',
}
const noteLabel: React.CSSProperties = {
  color: '#78716c',
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  margin: '0 0 6px 0',
}
const noteText: React.CSSProperties = {
  color: '#44403c',
  fontSize: 15,
  lineHeight: 1.6,
  margin: 0,
  fontWeight: 300,
  whiteSpace: 'pre-wrap',
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
