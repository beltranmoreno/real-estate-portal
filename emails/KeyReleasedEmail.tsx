import {
  Body,
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

interface KeyReleasedEmailProps {
  firstName?: string | null
  propertyTitle: string
  keyCode: string
  checkInLabel: string
  locale?: 'en' | 'es'
}

export const KeyReleasedEmail = ({
  firstName,
  propertyTitle,
  keyCode,
  checkInLabel,
  locale = 'en',
}: KeyReleasedEmailProps) => {
  const es = locale === 'es'

  return (
    <Html>
      <Head />
      <Preview>
        {es
          ? `Tu código de entrada para ${propertyTitle}`
          : `Your check-in code for ${propertyTitle}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrow}>Casa de Campo</Text>
          <Heading style={h1}>
            {es ? 'Casi listo' : 'Almost there'}
          </Heading>
          <Text style={paragraph}>
            {firstName
              ? es
                ? `Hola ${firstName},`
                : `Hi ${firstName},`
              : es
                ? 'Hola,'
                : 'Hi,'}
          </Text>
          <Text style={paragraph}>
            {es
              ? `Tu estadía en ${propertyTitle} comienza ${checkInLabel}. Aquí está tu código de entrada:`
              : `Your stay at ${propertyTitle} starts ${checkInLabel}. Here's your check-in code:`}
          </Text>

          <Section style={codeBox}>
            <Text style={codeText}>{keyCode}</Text>
            <Text style={codeLabel}>
              {es ? 'Código de entrada' : 'Check-in code'}
            </Text>
          </Section>

          <Text style={paragraph}>
            {es
              ? 'Lo encontrarás también en tu portal en cualquier momento. Si tienes algún problema al llegar, llámanos directamente — estamos disponibles 24/7 durante tu estadía.'
              : 'You can also find this in your portal anytime. If you have any trouble at arrival, call us directly — we are available 24/7 during your stay.'}
          </Text>

          <Hr style={hr} />
          <Text style={paragraph}>
            {es ? 'Disfruta tu estadía,' : 'Enjoy your stay,'}
          </Text>
          <Text style={signatureText}>Leticia Coudray</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default KeyReleasedEmail

// ---------- styles ----------

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
const codeBox: React.CSSProperties = {
  borderTop: '1px solid #e7e5e4',
  borderBottom: '1px solid #e7e5e4',
  textAlign: 'center',
  padding: '24px 0',
  margin: '24px 0',
}
const codeText: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 36,
  fontWeight: 300,
  letterSpacing: '0.5em',
  margin: '0 0 8px 0',
  fontFamily: 'monospace',
}
const codeLabel: React.CSSProperties = {
  color: '#78716c',
  fontSize: 11,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  margin: 0,
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
