import { Heading, Link, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s } from './layout'

interface ContactConfirmationEmailProps {
  /** Plain first name (see greetingName) — empty for a neutral greeting. */
  name: string
  locale?: 'en' | 'es'
}

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const WHATSAPP = 'https://wa.me/18293422566'

/** Sent to someone who used the contact form (About or Owners page). */
export const ContactConfirmationEmail = ({ name, locale = 'en' }: ContactConfirmationEmailProps) => {
  const es = locale === 'es'

  const text = {
    preview: es ? 'Recibimos tu mensaje — te escribiremos pronto.' : "We've received your message — we'll be in touch soon.",
    headline: name
      ? es ? `Gracias, ${name}.` : `Thank you, ${name}.`
      : es ? 'Gracias.' : 'Thank you.',
    intro: es
      ? 'Recibimos tu mensaje y te responderemos personalmente, normalmente en menos de un día, por correo o WhatsApp.'
      : "We've received your message and will get back to you personally, usually within a day, by email or WhatsApp.",
    sooner: es
      ? '¿Necesitas una respuesta antes? Escríbenos por WhatsApp o simplemente responde este correo.'
      : 'Need an answer sooner? Message us on WhatsApp, or simply reply to this email.',
    cta: es ? 'Escríbenos por WhatsApp' : 'Message us on WhatsApp',
    browse: es ? 'Mientras tanto, mira nuestras casas →' : 'In the meantime, browse our houses →',
    footer: es
      ? 'Recibiste este correo porque nos escribiste desde nuestro sitio.'
      : 'You received this email because you sent us a message on our website.',
  }

  return (
    <EmailLayout preview={text.preview} locale={locale} reason={text.footer}>
      <Heading style={s.h1}>{text.headline}</Heading>
      <Text style={s.paragraph}>{text.intro}</Text>
      <Text style={s.paragraph}>{text.sooner}</Text>

      <EmailButton href={WHATSAPP}>{text.cta}</EmailButton>

      <Text style={{ ...s.note, textAlign: 'center' }}>
        <Link href={`${DOMAIN}/search`} style={s.link}>
          {text.browse}
        </Link>
      </Text>
    </EmailLayout>
  )
}

export default ContactConfirmationEmail
