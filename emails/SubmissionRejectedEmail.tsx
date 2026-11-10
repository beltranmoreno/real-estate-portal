import { Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

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
    headline: es ? 'Necesitamos un ajuste' : 'A small adjustment',
    greeting: greeting(firstName, es),
    intro: es
      ? `Revisamos tu envío para "${requestTitle}" en ${propertyTitle} y necesitamos pedirte que lo reenvíes.`
      : `We reviewed your submission for "${requestTitle}" at ${propertyTitle} and need to ask you to re-submit it.`,
    noteLabel: es ? 'Razón' : 'Reason',
    cta: es ? 'Reenviar ahora' : 'Re-submit now',
    closing: es
      ? 'Si tienes preguntas, simplemente responde a este correo.'
      : 'If you have questions, just reply to this email.',
  }

  return (
    <EmailLayout preview={text.preview} locale={es ? 'es' : 'en'} reason={es ? 'Recibiste este correo porque tienes una estadía reservada con Leticia Coudray Real Estate.' : 'You received this email because you have a stay booked with Leticia Coudray Real Estate.'}>
          <Heading style={s.h1}>{text.headline}</Heading>

          <Text style={s.paragraph}>{text.greeting}</Text>
          <Text style={s.paragraph}>{text.intro}</Text>

          {note && (
            <Section style={{ ...s.detailsBox, margin: '24px 0', padding: '16px 0' }}>
              <Text style={s.detailsTitle}>{text.noteLabel}</Text>
              <Text style={noteText}>{note}</Text>
            </Section>
          )}

          <EmailButton href={actionUrl}>{text.cta}</EmailButton>

          <Text style={s.note}>{text.closing}</Text>

    </EmailLayout>
  )
}

export default SubmissionRejectedEmail

// ---------- styles (the rest come from ./layout) ----------

const noteText: React.CSSProperties = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  color: '#44403c',
  fontSize: 15,
  lineHeight: 1.6,
  margin: 0,
  fontWeight: 300,
  whiteSpace: 'pre-wrap',
  textAlign: 'justify',
}
