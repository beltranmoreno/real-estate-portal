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
  Button,
} from '@react-email/components'
import * as React from 'react'
import { EmailLogo, EmailSignature } from './brand'

interface KeyReleasedEmailProps {
  firstName?: string | null
  propertyTitle: string
  /** Door code — omitted when the booking has none. */
  keyCode?: string | null
  checkInLabel: string
  /** Link to the guest's stay in the portal (house info section). */
  stayUrl?: string
  locale?: 'en' | 'es'
}

export const KeyReleasedEmail = ({
  firstName,
  propertyTitle,
  keyCode,
  checkInLabel,
  stayUrl,
  locale = 'en',
}: KeyReleasedEmailProps) => {
  const es = locale === 'es'

  return (
    <Html>
      <Head />
      <Preview>
        {keyCode
          ? es
            ? `Tu código de entrada para ${propertyTitle}`
            : `Your check-in code for ${propertyTitle}`
          : es
            ? `Tu estadía en ${propertyTitle} comienza mañana`
            : `Your stay at ${propertyTitle} starts tomorrow`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailLogo />
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
            {keyCode
              ? es
                ? `Tu estadía en ${propertyTitle} comienza ${checkInLabel}. Aquí está tu código de entrada:`
                : `Your stay at ${propertyTitle} starts ${checkInLabel}. Here's your check-in code:`
              : es
                ? `Tu estadía en ${propertyTitle} comienza ${checkInLabel}. Estamos deseando recibirte.`
                : `Your stay at ${propertyTitle} starts ${checkInLabel}. We look forward to welcoming you.`}
          </Text>

          {keyCode && (
            <Section style={codeBox}>
              <Text style={codeText}>{keyCode}</Text>
              <Text style={codeLabel}>
                {es ? 'Código de entrada' : 'Check-in code'}
              </Text>
            </Section>
          )}

          <Text style={paragraph}>
            {keyCode
              ? es
                ? 'Lo encontrarás también en tu portal en cualquier momento. Si tienes algún problema al llegar, llámanos directamente — estamos disponibles 24/7 durante tu estadía.'
                : 'You can also find this in your portal anytime. If you have any trouble at arrival, call us directly — we are available 24/7 during your stay.'
              : es
                ? 'Si tienes algún problema al llegar, llámanos directamente — estamos disponibles 24/7 durante tu estadía.'
                : 'If you have any trouble at arrival, call us directly — we are available 24/7 during your stay.'}
          </Text>

          {stayUrl && (
            <>
              <Text style={paragraph}>
                {es
                  ? 'El Wi-Fi, la dirección, las indicaciones de llegada y los detalles de la casa están en tu portal.'
                  : 'The Wi-Fi, address, arrival directions and house details are in your portal.'}
              </Text>
              <Section style={{ textAlign: 'center', margin: '28px 0' }}>
                <Button href={stayUrl} style={button}>
                  {es ? 'Ver los detalles de la casa' : 'View house details'}
                </Button>
              </Section>
            </>
          )}

          <Hr style={hr} />
          <EmailSignature locale={es ? 'es' : 'en'} />
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
  textAlign: 'justify',
}
const button: React.CSSProperties = {
  backgroundColor: '#1c1917',
  color: '#ffffff',
  fontSize: 14,
  letterSpacing: '0.05em',
  padding: '14px 28px',
  borderRadius: 2,
  textDecoration: 'none',
  display: 'inline-block',
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
