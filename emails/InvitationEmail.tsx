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
  Row,
  Column,
  Img,
} from '@react-email/components'
import * as React from 'react'
import { EmailLogo, EmailSignature } from './brand'
import type { WelcomePick, WelcomePicks } from '@/lib/email/welcomePicks'

interface InvitationEmailProps {
  firstName?: string | null
  propertyTitle: string
  checkIn: string // formatted date string e.g. "May 12, 2026"
  checkOut: string
  acceptUrl: string
  locale?: 'en' | 'es'
  /** Restaurants and activities for the bottom of the email (picked in /admin/emails). */
  picks?: WelcomePicks | null
}

const DOMAIN =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

export const InvitationEmail = ({
  firstName,
  propertyTitle,
  checkIn,
  checkOut,
  acceptUrl,
  locale = 'en',
  picks,
}: InvitationEmailProps) => {
  const es = locale === 'es'

  const text = {
    preview: es
      ? `Tu portal para tu estadía en ${propertyTitle} está listo`
      : `Your portal for your stay at ${propertyTitle} is ready`,
    headline: es ? '¡Bienvenido!' : 'Welcome!',
    greeting: firstName
      ? es
        ? `Hola ${firstName},`
        : `Hi ${firstName},`
      : es
        ? 'Hola,'
        : 'Hi,',
    intro: es
      ? 'Hemos preparado un portal personal donde podrás ver los detalles de tu estadía, subir documentos cuando los pidamos, y comunicarte con nosotros antes y durante tu visita.'
      : 'We\'ve prepared a personal portal where you can see your stay details, upload documents when we ask for them, and stay in touch with us before and during your visit.',
    detailsLabel: es ? 'Tu estadía' : 'Your stay',
    propertyLabel: es ? 'Propiedad' : 'Property',
    checkInLabel: es ? 'Llegada' : 'Check-in',
    checkOutLabel: es ? 'Salida' : 'Check-out',
    cta: es ? 'Acceder a mi portal' : 'Access my portal',
    instructions: es
      ? 'Al hacer clic, te pediremos que ingreses tu correo electrónico. Te enviaremos un enlace mágico para acceder — no necesitas crear una contraseña.'
      : 'When you click, we\'ll ask you to enter your email. We\'ll send you a magic link to log in — no password required.',
    expiresNote: es
      ? 'Este enlace expira en 30 días. Si tienes preguntas, simplemente responde este correo.'
      : 'This link expires in 30 days. If you have any questions, just reply to this email.',
    planEyebrow: es ? 'Mientras planeas tu viaje' : 'While you plan',
    eatTitle: es ? 'Dónde comer' : 'Where to eat',
    eatIntro: es
      ? '¿Quieres una mesa? Responde este correo o pídela desde tu portal y nosotros hacemos la reserva por ti.'
      : 'Would you like a table? Reply to this email or ask in your portal, and we’ll make the reservation for you.',
    eatCta: es ? 'Ver todos los restaurantes' : 'See all restaurants',
    doTitle: es ? 'Qué hacer' : 'Things to do',
    doIntro: es
      ? 'Desde golf y tiro hasta paseos en barco y excursiones: dinos qué te apetece y lo organizamos.'
      : 'From golf and shooting to boat trips and excursions — tell us what you’d enjoy and we’ll arrange it.',
    doCta: es ? 'Ver todas las actividades' : 'See all activities',
    footer: es
      ? `Recibiste este correo porque Leticia Coudray Real Estate ha confirmado una reserva a tu nombre. Si crees que esto es un error, responde este correo.`
      : `You received this email because Leticia Coudray Real Estate confirmed a booking under your name. If you believe this is a mistake, reply to this email.`,
  }

  return (
    <Html>
      <Head />
      <Preview>{text.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Eyebrow */}
          <EmailLogo />

          {/* Headline */}
          <Heading style={h1}>{text.headline}</Heading>

          {/* Greeting */}
          <Text style={paragraph}>{text.greeting}</Text>
          <Text style={paragraph}>{text.intro}</Text>

          {/* Stay details */}
          <Section style={detailsBox}>
            <Text style={detailsTitle}>{text.detailsLabel}</Text>
            <DetailRow label={text.propertyLabel} value={propertyTitle} />
            <DetailRow label={text.checkInLabel} value={checkIn} />
            <DetailRow label={text.checkOutLabel} value={checkOut} />
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={acceptUrl} style={button}>
              {text.cta}
            </Button>
          </Section>

          <Text style={instructions}>{text.instructions}</Text>
          <Text style={instructions}>{text.expiresNote}</Text>

          {/* Sign-off */}
          <Hr style={hr} />
          <EmailSignature locale={es ? 'es' : 'en'} />

          {/* Restaurants & activities — picked in /admin/emails */}
          {picks && (picks.restaurants.length > 0 || picks.activities.length > 0) && (
            <>
              <Hr style={hr} />
              <Text style={detailsTitle}>{text.planEyebrow}</Text>
              {picks.restaurants.length > 0 && (
                <Section style={{ margin: '0 0 28px 0' }}>
                  <Heading as="h2" style={h2}>{text.eatTitle}</Heading>
                  <Text style={paragraph}>{text.eatIntro}</Text>
                  {picks.restaurants.map((p) => (
                    <PickRow key={p.id} pick={p} es={es} />
                  ))}
                  <Text style={moreLink}>
                    <a href={`${DOMAIN}/restaurants`} style={moreLinkA}>{text.eatCta} →</a>
                  </Text>
                </Section>
              )}
              {picks.activities.length > 0 && (
                <Section>
                  <Heading as="h2" style={h2}>{text.doTitle}</Heading>
                  <Text style={paragraph}>{text.doIntro}</Text>
                  {picks.activities.map((p) => (
                    <PickRow key={p.id} pick={p} es={es} />
                  ))}
                  <Text style={moreLink}>
                    <a href={`${DOMAIN}/info/activities`} style={moreLinkA}>{text.doCta} →</a>
                  </Text>
                </Section>
              )}
            </>
          )}

          {/* Footer */}
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

// A table row, not flex: Gmail and Outlook ignore flex, which ran the label
// and value together ("PropertyCasa Famiglia").
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={detailRow}>
      <Column style={{ ...detailLabel, width: '40%', paddingRight: 16, verticalAlign: 'top' }}>{label}</Column>
      <Column style={{ ...detailValue, verticalAlign: 'top' }}>{value}</Column>
    </Row>
  )
}

/** A restaurant / activity: square photo on the left, name and a line on the right. */
function PickRow({ pick, es }: { pick: WelcomePick; es: boolean }) {
  const meta = es ? pick.meta.es : pick.meta.en
  return (
    <Row style={{ width: '100%', borderTop: '1px solid #e7e5e4' }}>
      {pick.imageUrl && (
        <Column style={{ width: 88, padding: '14px 16px 14px 0', verticalAlign: 'top' }}>
          <a href={pick.url}>
            <Img src={pick.imageUrl} width={72} height={72} alt="" style={{ display: 'block', borderRadius: 2, objectFit: 'cover' }} />
          </a>
        </Column>
      )}
      <Column style={{ padding: '14px 0', verticalAlign: 'middle' }}>
        <a href={pick.url} style={pickName}>{es ? pick.name.es : pick.name.en}</a>
        {meta && <Text style={pickMeta}>{meta}</Text>}
      </Column>
    </Row>
  )
}

export default InvitationEmail

// ---------- styles ----------

const body: React.CSSProperties = {
  backgroundColor: '#f5f5f4', // stone-100
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
  color: '#1c1917', // stone-900
  fontSize: 32,
  fontWeight: 300,
  lineHeight: 1.2,
  margin: '0 0 32px 0',
}

const paragraph: React.CSSProperties = {
  color: '#44403c', // stone-700
  fontSize: 16,
  lineHeight: 1.6,
  margin: '0 0 16px 0',
  fontWeight: 300,
  textAlign: 'justify',
}

const detailsBox: React.CSSProperties = {
  borderTop: '1px solid #e7e5e4', // stone-200
  borderBottom: '1px solid #e7e5e4',
  margin: '32px 0',
  padding: '20px 0',
}

const detailsTitle: React.CSSProperties = {
  color: '#78716c',
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  margin: '0 0 12px 0',
}

const detailRow: React.CSSProperties = {
  width: '100%',
}

const detailLabel: React.CSSProperties = {
  color: '#78716c',
  fontSize: 14,
  fontWeight: 300,
  margin: 0,
  padding: '8px 0',
}

const detailValue: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 14,
  fontWeight: 400,
  margin: 0,
  padding: '8px 0',
  textAlign: 'right',
}

const button: React.CSSProperties = {
  backgroundColor: '#292524', // stone-800
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
  textAlign: 'justify',
}

const hr: React.CSSProperties = {
  borderColor: '#e7e5e4',
  margin: '32px 0',
}



const h2: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 22,
  fontWeight: 300,
  lineHeight: 1.3,
  margin: '0 0 8px 0',
}

const pickName: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 16,
  fontWeight: 400,
  textDecoration: 'none',
}

const pickMeta: React.CSSProperties = {
  color: '#78716c',
  fontSize: 13,
  fontWeight: 300,
  lineHeight: 1.5,
  margin: '4px 0 0 0',
}

const moreLink: React.CSSProperties = {
  borderTop: '1px solid #e7e5e4',
  fontSize: 13,
  margin: 0,
  padding: '14px 0 0 0',
}

const moreLinkA: React.CSSProperties = {
  color: '#44403c',
  textDecoration: 'underline',
}

const footer: React.CSSProperties = {
  color: '#a8a29e', // stone-400
  fontSize: 12,
  fontWeight: 300,
  lineHeight: 1.5,
  margin: '0 0 8px 0',
}

const footerLink: React.CSSProperties = {
  color: '#a8a29e',
  textDecoration: 'underline',
}
