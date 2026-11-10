import { Column, Heading, Img, Row, Section, Text } from '@react-email/components'
import * as React from 'react'
import { DetailRow, DetailsBox, EmailButton, EmailLayout, emailStyles, greeting } from './layout'
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
    greeting: greeting(firstName, es),
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

  const hasPicks = Boolean(picks && (picks.restaurants.length > 0 || picks.activities.length > 0))

  return (
    <EmailLayout
      preview={text.preview}
      locale={es ? 'es' : 'en'}
      reason={text.footer}
      after={
        hasPicks && picks ? (
          <>
            <Text style={emailStyles.detailsTitle}>{text.planEyebrow}</Text>
            {picks.restaurants.length > 0 && (
              <Section style={{ margin: '0 0 28px 0' }}>
                <Heading as="h2" style={emailStyles.h2}>{text.eatTitle}</Heading>
                <Text style={emailStyles.paragraph}>{text.eatIntro}</Text>
                {picks.restaurants.map((p) => (
                  <PickRow key={p.id} pick={p} es={es} />
                ))}
                <Text style={moreLink}>
                  <a href={`${DOMAIN}/restaurants`} style={emailStyles.link}>{text.eatCta} →</a>
                </Text>
              </Section>
            )}
            {picks.activities.length > 0 && (
              <Section>
                <Heading as="h2" style={emailStyles.h2}>{text.doTitle}</Heading>
                <Text style={emailStyles.paragraph}>{text.doIntro}</Text>
                {picks.activities.map((p) => (
                  <PickRow key={p.id} pick={p} es={es} />
                ))}
                <Text style={moreLink}>
                  <a href={`${DOMAIN}/info/activities`} style={emailStyles.link}>{text.doCta} →</a>
                </Text>
              </Section>
            )}
          </>
        ) : undefined
      }
    >
      <Heading style={emailStyles.h1}>{text.headline}</Heading>
      <Text style={emailStyles.paragraph}>{text.greeting}</Text>
      <Text style={emailStyles.paragraph}>{text.intro}</Text>

      <DetailsBox title={text.detailsLabel}>
        <DetailRow label={text.propertyLabel} value={propertyTitle} />
        <DetailRow label={text.checkInLabel} value={checkIn} />
        <DetailRow label={text.checkOutLabel} value={checkOut} />
      </DetailsBox>

      <EmailButton href={acceptUrl}>{text.cta}</EmailButton>

      <Text style={emailStyles.note}>{text.instructions}</Text>
      <Text style={emailStyles.note}>{text.expiresNote}</Text>
    </EmailLayout>
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

// ---------- styles (the rest come from ./layout) ----------

const pickName: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 16,
  fontWeight: 400,
  textDecoration: 'none',
}

const pickMeta: React.CSSProperties = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  color: '#78716c',
  fontSize: 13,
  fontWeight: 300,
  lineHeight: 1.5,
  margin: '4px 0 0 0',
}

const moreLink: React.CSSProperties = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  borderTop: '1px solid #e7e5e4',
  fontSize: 13,
  margin: 0,
  padding: '14px 0 0 0',
}
