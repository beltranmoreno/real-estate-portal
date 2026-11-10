import { Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

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
    headline: es ? 'Tu selección' : 'Your selection',
    greeting: greeting(firstName, es),
    intro: es
      ? `Gracias por escribirnos. Preparamos una selección privada de ${houseCount === 1 ? 'una casa' : `${houseCount} casas`} pensando en tu estadía${dates ? ` (${dates})` : ''}.`
      : `Thank you for getting in touch. We've put together a private selection of ${houseCount === 1 ? 'one house' : `${houseCount} houses`} for your stay${dates ? ` (${dates})` : ''}.`,
    cta: es ? 'Ver mi selección' : 'View my selection',
    after: es
      ? 'El enlace es solo para ti — no necesitas crear una cuenta. Responde este correo o escríbenos por WhatsApp con cualquier pregunta.'
      : "The link is just for you — no account needed. Reply to this email or message us on WhatsApp with any questions.",
    footer: es
      ? 'Recibiste este correo porque enviaste una consulta a Leticia Coudray Real Estate.'
      : 'You received this email because you sent an inquiry to Leticia Coudray Real Estate.',
  }

  return (
    <EmailLayout preview={text.preview} locale={es ? 'es' : 'en'} reason={text.footer}>
      <Heading style={s.h1}>{text.headline}</Heading>

      <Text style={s.paragraph}>{text.greeting}</Text>
      <Text style={s.paragraph}>{text.intro}</Text>

      {note && (
        <Section style={noteBox}>
          {note.split('\n').map((line, i) => (
            <Text key={i} style={noteText}>
              {line || ' '}
            </Text>
          ))}
        </Section>
      )}

      <EmailButton href={url}>{text.cta}</EmailButton>

      <Text style={s.note}>{text.after}</Text>
    </EmailLayout>
  )
}

export default InquirySelectionEmail

// ---------- styles (the rest come from ./layout) ----------

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
  textAlign: 'justify',
}
