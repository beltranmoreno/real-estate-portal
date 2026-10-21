import { Body, Button, Column, Container, Head, Heading, Hr, Html, Img, Link, Preview, Row, Section, Text } from '@react-email/components'
import * as React from 'react'

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

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

/**
 * Sent to a visitor right after they inquire (when they left an email):
 * confirmation, a recap, one way to reach Leticia, and a light "while you
 * wait" section. Replies go to Leticia.
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
    preview: es ? 'Recibí tu consulta — te respondo pronto.' : "I have your inquiry — I'll be in touch soon.",
    eyebrow: 'Casa de Campo',
    headline: es ? `Gracias, ${firstName}.` : `Thank you, ${firstName}.`,
    intro: es
      ? 'Recibí tu consulta. Te responderé personalmente, normalmente en menos de un día, por correo o WhatsApp.'
      : "I have your inquiry. I'll get back to you personally, usually within a day, by email or WhatsApp.",
    recap: es ? 'Tu consulta' : 'Your inquiry',
    datesLabel: es ? 'Fechas' : 'Dates',
    guestsLabel: es ? 'Huéspedes' : 'Guests',
    referenceLabel: es ? 'Referencia' : 'Reference',
    cta: es ? 'Escribirle a Leticia por WhatsApp' : 'Message Leticia on WhatsApp',
    replyNote: es
      ? 'También puedes simplemente responder este correo.'
      : 'Or simply reply to this email.',
    whileYouWait: es ? 'Mientras tanto' : 'While you wait',
    similarIntro: es ? 'Otras casas que podrían gustarte:' : 'A few other houses you might like:',
    thingsToDo: es ? 'Qué hacer en Casa de Campo →' : 'Things to do in Casa de Campo →',
    signoff: es ? 'Hasta pronto,' : 'Talk soon,',
    signature: 'Leticia Coudray',
    role: 'Casa de Campo Real Estate',
    footer: es
      ? 'Recibiste este correo porque enviaste una consulta en nuestro sitio.'
      : 'You received this email because you sent an inquiry on our website.',
  }

  return (
    <Html>
      <Head />
      <Preview>{text.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrow}>{text.eyebrow}</Text>
          <Heading style={h1}>{text.headline}</Heading>
          <Text style={paragraph}>{text.intro}</Text>

          {/* Recap */}
          <Section style={detailsBox}>
            <Text style={detailsTitle}>{text.recap}</Text>
            {houses.map((h) => (
              <HouseRow key={h.url} house={h} />
            ))}
            {dates && <DetailRow label={text.datesLabel} value={dates} />}
            {guests ? <DetailRow label={text.guestsLabel} value={String(guests)} /> : null}
            <DetailRow label={text.referenceLabel} value={reference} />
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0 12px' }}>
            <Button href={whatsappUrl} style={button}>
              {text.cta}
            </Button>
          </Section>
          <Text style={{ ...instructions, textAlign: 'center' }}>{text.replyNote}</Text>

          <Hr style={hr} />
          <Text style={paragraph}>{text.signoff}</Text>
          <Text style={signatureText}>{text.signature}</Text>
          <Text style={roleText}>{text.role}</Text>

          {/* While you wait — deliberately small */}
          {(similar.length > 0 || thingsToDoUrl) && (
            <>
              <Hr style={hr} />
              <Text style={detailsTitle}>{text.whileYouWait}</Text>
              {similar.length > 0 && (
                <>
                  <Text style={instructions}>{text.similarIntro}</Text>
                  {similar.map((h) => (
                    <HouseRow key={h.url} house={h} />
                  ))}
                </>
              )}
              <Text style={{ ...instructions, marginTop: 16 }}>
                <Link href={thingsToDoUrl} style={textLink}>
                  {text.thingsToDo}
                </Link>
              </Text>
            </>
          )}

          <Hr style={hr} />
          <Text style={footer}>{text.footer}</Text>
          <Text style={footer}>
            <a href={DOMAIN} style={footerLink}>
              {DOMAIN.replace(/^https?:\/\//, '')}
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ padding: '6px 0' }}>
      <Column>
        <Text style={detailLabel}>{label}</Text>
      </Column>
      <Column>
        <Text style={detailValue}>{value}</Text>
      </Column>
    </Row>
  )
}

export default InquiryReceivedEmail

// ---------- styles (match InvitationEmail) ----------

const body: React.CSSProperties = {
  backgroundColor: '#f5f5f4',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
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
  fontSize: 32,
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

const detailsBox: React.CSSProperties = {
  borderTop: '1px solid #e7e5e4',
  borderBottom: '1px solid #e7e5e4',
  margin: '32px 0 0',
  padding: '20px 0',
}

const detailsTitle: React.CSSProperties = {
  color: '#78716c',
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  margin: '0 0 12px 0',
}

const detailLabel: React.CSSProperties = {
  color: '#78716c',
  fontSize: 14,
  fontWeight: 300,
  margin: 0,
}

const detailValue: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 14,
  fontWeight: 400,
  margin: 0,
  textAlign: 'right',
}

const houseTitle: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 15,
  fontWeight: 400,
  textDecoration: 'none',
}

const houseMeta: React.CSSProperties = {
  color: '#78716c',
  fontSize: 13,
  fontWeight: 300,
  margin: '2px 0 0',
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

const textLink: React.CSSProperties = {
  color: '#1c1917',
  textDecoration: 'underline',
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

const roleText: React.CSSProperties = {
  color: '#78716c',
  fontSize: 13,
  fontWeight: 300,
  margin: 0,
}

const footer: React.CSSProperties = {
  color: '#a8a29e',
  fontSize: 12,
  fontWeight: 300,
  lineHeight: 1.5,
  margin: '0 0 8px 0',
}

const footerLink: React.CSSProperties = {
  color: '#a8a29e',
  textDecoration: 'underline',
}
