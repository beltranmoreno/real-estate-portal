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

interface RequestReminderEmailProps {
  firstName?: string | null
  propertyTitle: string
  pendingCount: number
  daysUntilCheckIn: number
  actionUrl: string
  locale?: 'en' | 'es'
}

export const RequestReminderEmail = ({
  firstName,
  propertyTitle,
  pendingCount,
  daysUntilCheckIn,
  actionUrl,
  locale = 'en',
}: RequestReminderEmailProps) => {
  const es = locale === 'es'
  const itemWord = pendingCount === 1 ? (es ? 'cosa' : 'thing') : es ? 'cosas' : 'things'
  const dayWord = daysUntilCheckIn === 1 ? (es ? 'día' : 'day') : es ? 'días' : 'days'

  return (
    <Html>
      <Head />
      <Preview>
        {es
          ? `${pendingCount} ${itemWord} pendiente${pendingCount === 1 ? '' : 's'} para tu estadía`
          : `${pendingCount} ${itemWord} we still need before your stay`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrow}>Casa de Campo</Text>
          <Heading style={h1}>
            {es ? 'Recordatorio amistoso' : 'A gentle reminder'}
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
              ? `Tu llegada a ${propertyTitle} es en ${daysUntilCheckIn} ${dayWord}. Aún tenemos ${pendingCount} ${itemWord} pendiente${pendingCount === 1 ? '' : 's'} de tu lado. Solo toma un momento desde tu portal.`
              : `Your stay at ${propertyTitle} starts in ${daysUntilCheckIn} ${dayWord}. We still have ${pendingCount} ${itemWord} pending from your side — only takes a moment from your portal.`}
          </Text>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={actionUrl} style={button}>
              {es ? 'Abrir mi portal' : 'Open my portal'}
            </Button>
          </Section>

          <Text style={instructions}>
            {es
              ? '¿Tienes alguna pregunta? Solo responde este correo.'
              : 'Any questions? Just reply to this email.'}
          </Text>

          <Hr style={hr} />
          <Text style={paragraph}>{es ? 'Gracias,' : 'Thanks,'}</Text>
          <Text style={signatureText}>Leticia Coudray</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default RequestReminderEmail

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
