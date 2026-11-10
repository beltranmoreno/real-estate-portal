import { Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

export interface RequestEmailItem {
  title: string
  description?: string | null
  expectsDocument: boolean
  dueAt?: string | null // formatted date
}

interface RequestCreatedEmailProps {
  firstName?: string | null
  propertyTitle: string
  /** One request, or several sent together in one email. */
  requests: RequestEmailItem[]
  actionUrl: string
  locale?: 'en' | 'es'
}

export const RequestCreatedEmail = ({
  firstName,
  propertyTitle,
  requests,
  actionUrl,
  locale = 'en',
}: RequestCreatedEmailProps) => {
  const es = locale === 'es'
  const many = requests.length > 1
  const requestTitle = requests[0]?.title ?? ''
  const expectsDocument = requests.some((r) => r.expectsDocument)

  const text = {
    preview: many
      ? es
        ? `${requests.length} solicitudes para tu estadía en ${propertyTitle}`
        : `${requests.length} requests for your stay at ${propertyTitle}`
      : es
        ? `${requestTitle} para tu estadía en ${propertyTitle}`
        : `${requestTitle} for your stay at ${propertyTitle}`,
    headline: many
      ? es
        ? 'Algunas cosas para tu estadía'
        : 'A few things for your stay'
      : es
        ? 'Necesitamos algo de ti'
        : 'A small request',
    greeting: greeting(firstName, es),
    intro: many
      ? es
        ? `Hemos añadido ${requests.length} solicitudes a tu portal para tu estadía en ${propertyTitle}.`
        : `We've added ${requests.length} requests to your portal for your stay at ${propertyTitle}.`
      : es
        ? `Hemos añadido una solicitud a tu portal para tu estadía en ${propertyTitle}.`
        : `We've added a request to your portal for your stay at ${propertyTitle}.`,
    requestLabel: many ? (es ? 'Solicitudes' : 'Requests') : es ? 'Solicitud' : 'Request',
    dueLabel: es ? 'Para el' : 'Needed by',
    cta: many
      ? es
        ? 'Abrir mi portal'
        : 'Open my portal'
      : expectsDocument
      ? es
        ? 'Subir documento'
        : 'Upload document'
      : es
        ? 'Responder ahora'
        : 'Respond now',
    secondaryNote: es
      ? 'Solo toma un momento desde tu portal. Si tienes dudas, responde este correo.'
      : "It only takes a moment from your portal. If you have questions, just reply to this email.",
  }

  return (
    <EmailLayout preview={text.preview} locale={es ? 'es' : 'en'} reason={es ? 'Recibiste este correo porque tienes una estadía reservada con Leticia Coudray Real Estate.' : 'You received this email because you have a stay booked with Leticia Coudray Real Estate.'}>
          <Heading style={s.h1}>{text.headline}</Heading>
          <Text style={s.paragraph}>{text.greeting}</Text>
          <Text style={s.paragraph}>{text.intro}</Text>

          <Section style={s.detailsBox}>
            <Text style={s.detailsTitle}>{text.requestLabel}</Text>
            {requests.map((r, i) => (
              <Section key={i} style={i > 0 ? { marginTop: 20 } : undefined}>
                <Text style={s.itemTitle}>{r.title}</Text>
                {r.description && <Text style={s.itemText}>{r.description}</Text>}
                {r.dueAt && (
                  <Text style={dueStyle}>
                    {text.dueLabel}: {r.dueAt}
                  </Text>
                )}
              </Section>
            ))}
          </Section>

          <EmailButton href={actionUrl}>{text.cta}</EmailButton>

          <Text style={s.note}>{text.secondaryNote}</Text>

    </EmailLayout>
  )
}

export default RequestCreatedEmail

// ---------- styles (the rest come from ./layout) ----------

const dueStyle: React.CSSProperties = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  color: '#a8a29e',
  fontSize: 12,
  fontWeight: 300,
  margin: '8px 0 0 0',
}
