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
} from '@react-email/components'
import * as React from 'react'

interface FeedbackRequestEmailProps {
  firstName?: string | null
  propertyTitle: string
  actionUrl: string
  locale?: 'en' | 'es'
}

export const FeedbackRequestEmail = ({
  firstName,
  propertyTitle,
  actionUrl,
  locale = 'en',
}: FeedbackRequestEmailProps) => {
  const es = locale === 'es'
  return (
    <Html>
      <Head />
      <Preview>
        {es
          ? `¿Cómo estuvo tu estadía en ${propertyTitle}?`
          : `How was your stay at ${propertyTitle}?`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrow}>Casa de Campo</Text>
          <Heading style={h1}>{es ? '¿Cómo estuvo?' : 'How was it?'}</Heading>
          <Text style={paragraph}>
            {firstName ? (es ? `Hola ${firstName},` : `Hi ${firstName},`) : es ? 'Hola,' : 'Hi,'}
          </Text>
          <Text style={paragraph}>
            {es
              ? `Esperamos que hayas disfrutado tu estadía en ${propertyTitle}. Nos encantaría saber cómo te fue — lo que amaste, lo que podemos mejorar, o unas palabras para Leticia y el equipo. Es privado y nos ayuda a cuidarte aún mejor la próxima vez.`
              : `We hope you enjoyed your stay at ${propertyTitle}. We'd love to hear how it went — what you loved, what we could do better, or a word for Leticia and the team. It stays private and helps us look after you even better next time.`}
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={actionUrl} style={button}>
              {es ? 'Compartir comentarios' : 'Share your feedback'}
            </Button>
          </Section>
          <Text style={muted}>
            {es
              ? 'Solo toma un momento — escribe tanto o tan poco como quieras.'
              : 'It only takes a moment — write as much or as little as you like.'}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default FeedbackRequestEmail

const body = { backgroundColor: '#f6f4f1', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }
const container = { backgroundColor: '#ffffff', border: '1px solid #e2ded8', maxWidth: '560px', margin: '0 auto', padding: '40px' }
const eyebrow = { fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#8a817a', fontFamily: 'Helvetica, Arial, sans-serif', margin: '0 0 12px' }
const h1 = { fontSize: '30px', fontWeight: 400 as const, color: '#1c1917', margin: '0 0 20px' }
const paragraph = { fontSize: '15px', lineHeight: '1.7', color: '#57534e', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300 as const, margin: '0 0 14px' }
const muted = { fontSize: '13px', lineHeight: '1.6', color: '#78716c', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300 as const, margin: '8px 0 0' }
const button = { backgroundColor: '#1c1917', color: '#ffffff', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, fontFamily: 'Helvetica, Arial, sans-serif', padding: '14px 28px', borderRadius: '2px', textDecoration: 'none' }
