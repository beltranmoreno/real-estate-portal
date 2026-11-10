import { Column, Heading, Img, Link, Row, Text } from '@react-email/components'
import * as React from 'react'
import { DetailRow, DetailsBox, EmailButton, EmailLayout, emailStyles as s } from './layout'

export interface EmailHouse {
  title: string
  url: string
  imageUrl?: string | null
  /** e.g. "5 bedrooms · Golf Villas" */
  meta?: string | null
}

interface InquiryReceivedEmailProps {
  firstName: string
  reference: string
  houses: EmailHouse[]
  /** Formatted stay dates, e.g. "Dec 15 – Dec 20, 2026". */
  dates?: string | null
  guests?: number | null
  whatsappUrl: string
  /** Up to three houses they didn't ask about. */
  similar: EmailHouse[]
  thingsToDoUrl: string
  locale?: 'en' | 'es'
}

/**
 * Sent to a visitor right after they inquire (when they left an email):
 * confirmation, a recap, one way to reach Leticia, and a light "while you
 * wait" section, written as Leticia's team. Replies go to Leticia.
 */
export const InquiryReceivedEmail = ({
  firstName,
  reference,
  houses,
  dates,
  guests,
  whatsappUrl,
  similar,
  thingsToDoUrl,
  locale = 'en',
}: InquiryReceivedEmailProps) => {
  const es = locale === 'es'

  const text = {
    preview: es ? 'Recibimos tu consulta — te escribiremos pronto.' : "We've received your inquiry — we'll be in touch soon.",
    headline: firstName
      ? es ? `Gracias, ${firstName}.` : `Thank you, ${firstName}.`
      : es ? 'Gracias.' : 'Thank you.',
    intro: es
      ? 'Recibimos tu consulta y te responderemos personalmente, normalmente en menos de un día, por correo o WhatsApp.'
      : "We've received your inquiry and will get back to you personally, usually within a day, by email or WhatsApp.",
    recap: es ? 'Tu consulta' : 'Your inquiry',
    datesLabel: es ? 'Fechas' : 'Dates',
    guestsLabel: es ? 'Huéspedes' : 'Guests',
    referenceLabel: es ? 'Referencia' : 'Reference',
    cta: es ? 'Escríbenos por WhatsApp' : 'Message us on WhatsApp',
    replyNote: es
      ? 'También puedes simplemente responder este correo.'
      : 'Or simply reply to this email.',
    whileYouWait: es ? 'Mientras tanto' : 'While you wait',
    similarIntro: es ? 'Otras casas que podrían gustarte:' : 'A few other houses you might like:',
    thingsToDo: es ? 'Qué hacer en Casa de Campo →' : 'Things to do in Casa de Campo →',
    footer: es
      ? 'Recibiste este correo porque enviaste una consulta en nuestro sitio.'
      : 'You received this email because you sent an inquiry on our website.',
  }

  return (
    <EmailLayout
      preview={text.preview}
      locale={es ? 'es' : 'en'}
      reason={text.footer}
      after={
        similar.length > 0 || thingsToDoUrl ? (
          <>
            <Text style={s.detailsTitle}>{text.whileYouWait}</Text>
            {similar.length > 0 && (
              <>
                <Text style={s.note}>{text.similarIntro}</Text>
                {similar.map((h) => (
                  <HouseRow key={h.url} house={h} />
                ))}
              </>
            )}
            <Text style={{ ...s.note, marginTop: 16 }}>
              <Link href={thingsToDoUrl} style={s.link}>
                {text.thingsToDo}
              </Link>
            </Text>
          </>
        ) : undefined
      }
    >
      <Heading style={s.h1}>{text.headline}</Heading>
      <Text style={s.paragraph}>{text.intro}</Text>

      <DetailsBox title={text.recap}>
        {houses.map((h) => (
          <HouseRow key={h.url} house={h} />
        ))}
        {dates && <DetailRow label={text.datesLabel} value={dates} />}
        {guests ? <DetailRow label={text.guestsLabel} value={String(guests)} /> : null}
        <DetailRow label={text.referenceLabel} value={reference} />
      </DetailsBox>

      <EmailButton href={whatsappUrl} compact>{text.cta}</EmailButton>
      <Text style={{ ...s.note, textAlign: 'center' }}>{text.replyNote}</Text>
    </EmailLayout>
  )
}

function HouseRow({ house }: { house: EmailHouse }) {
  return (
    <Row style={{ padding: '8px 0' }}>
      {house.imageUrl && (
        <Column style={{ width: 96, verticalAlign: 'top' }}>
          <Link href={house.url}>
            <Img src={house.imageUrl} width="88" height="66" alt="" style={{ objectFit: 'cover', display: 'block' }} />
          </Link>
        </Column>
      )}
      <Column style={{ verticalAlign: 'top' }}>
        <Link href={house.url} style={houseTitle}>
          {house.title}
        </Link>
        {house.meta && <Text style={houseMeta}>{house.meta}</Text>}
      </Column>
    </Row>
  )
}

export default InquiryReceivedEmail

// ---------- styles (the rest come from ./layout) ----------

const houseTitle: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 15,
  fontWeight: 400,
  textDecoration: 'none',
}

const houseMeta: React.CSSProperties = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  color: '#78716c',
  fontSize: 13,
  fontWeight: 300,
  margin: '2px 0 0',
}
