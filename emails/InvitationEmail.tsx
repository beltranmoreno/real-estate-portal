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

interface InvitationEmailProps {
  firstName?: string | null
  propertyTitle: string
  checkIn: string // formatted date string e.g. "May 12, 2026"
  checkOut: string
  acceptUrl: string
  locale?: 'en' | 'es'
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
}: InvitationEmailProps) => {
  const es = locale === 'es'

  const text = {
    preview: es
      ? `Tu portal para ${propertyTitle} está listo`
      : `Your portal for ${propertyTitle} is ready`,
    eyebrow: es ? 'Casa de Campo' : 'Casa de Campo',
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
    signoff: es ? 'Hasta pronto,' : 'Talk soon,',
    signature: 'Leticia Coudray',
    role: es ? 'Casa de Campo Real Estate' : 'Casa de Campo Real Estate',
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
          <Text style={eyebrow}>{text.eyebrow}</Text>

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
          <Text style={paragraph}>{text.signoff}</Text>
          <Text style={signatureText}>{text.signature}</Text>
          <Text style={roleText}>{text.role}</Text>

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={detailRow}>
      <Text style={detailLabel}>{label}</Text>
      <Text style={detailValue}>{value}</Text>
    </div>
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

const eyebrow: React.CSSProperties = {
  color: '#78716c', // stone-500
  fontSize: 11,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  margin: '0 0 24px 0',
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
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: '6px 0',
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
