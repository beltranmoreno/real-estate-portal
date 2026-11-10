import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailLogo, EmailSignature } from './brand'

/**
 * The frame every guest-facing email uses, so they all look the same: the
 * logo, the content, the signature, optional extras (e.g. restaurant picks)
 * and one common footer. The look is the portal invitation's. No emojis:
 * they render differently in every mail app and read as informal.
 *
 *   <EmailLayout preview="…" locale={locale} reason={t('You received…')}>
 *     <Heading style={emailStyles.h1}>…</Heading>
 *     <Text style={emailStyles.paragraph}>…</Text>
 *     <EmailButton href={url}>…</EmailButton>
 *   </EmailLayout>
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const PHONE_DISPLAY = '+1 (829) 342-2566'
const PHONE = '+18293422566'

export function EmailLayout({
  preview,
  locale = 'en',
  reason,
  after,
  children,
}: {
  preview: string
  locale?: 'en' | 'es'
  /** Why they got this email — first line of the footer. */
  reason?: string
  /** Shown after the signature, above the footer (e.g. "While you plan"). */
  after?: React.ReactNode
  children: React.ReactNode
}) {
  const es = locale === 'es'
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailLogo />
          {children}

          <Hr style={emailStyles.hr} />
          <EmailSignature locale={locale} />

          {after && (
            <>
              <Hr style={emailStyles.hr} />
              {after}
            </>
          )}

          <Hr style={emailStyles.hr} />
          <EmailFooter es={es} reason={reason} />
        </Container>
      </Body>
    </Html>
  )
}

/** The same small print at the bottom of every email. */
function EmailFooter({ es, reason }: { es: boolean; reason?: string }) {
  return (
    <>
      {reason && <Text style={footer}>{reason}</Text>}
      <Text style={footer}>
        Leticia Coudray Saladin Real Estate & Services
        <br />
        {es ? 'Casa de Campo, La Romana, República Dominicana' : 'Casa de Campo, La Romana, Dominican Republic'}
      </Text>
      <Text style={footer}>
        <a href={`tel:${PHONE}`} style={footerLink}>{PHONE_DISPLAY}</a>
        {'  ·  '}
        <a href={`https://wa.me/${PHONE.replace(/\D/g, '')}`} style={footerLink}>WhatsApp</a>
        {'  ·  '}
        <a href={SITE} style={footerLink}>{SITE.replace(/^https?:\/\/(www\.)?/, '')}</a>
      </Text>
      <Text style={{ ...footer, margin: 0 }}>
        © {new Date().getFullYear()} Leticia Coudray Saladin Real Estate & Services
      </Text>
    </>
  )
}

/** The one button style, centred. */
export function EmailButton({ href, children, compact }: { href: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <Section style={{ textAlign: 'center', margin: compact ? '28px 0 12px' : '32px 0' }}>
      <Button href={href} style={emailStyles.button}>
        {children}
      </Button>
    </Section>
  )
}

/** A bordered block of label / value rows (stay details, a recap). */
export function DetailsBox({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Section style={emailStyles.detailsBox}>
      {title && <Text style={emailStyles.detailsTitle}>{title}</Text>}
      {children}
    </Section>
  )
}

// A table row, not flex: Gmail and Outlook ignore flex, which ran the label
// and value together ("PropertyCasa Famiglia").
export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Row style={{ width: '100%' }}>
      <Column style={{ ...detailLabel, width: '40%', paddingRight: 16, verticalAlign: 'top' }}>{label}</Column>
      <Column style={{ ...detailValue, verticalAlign: 'top' }}>{value}</Column>
    </Row>
  )
}

/** "Dear Sarah," / "Hola Sarah," — or a neutral greeting without a name. */
export function greeting(firstName: string | null | undefined, es: boolean) {
  return firstName ? (es ? `Hola ${firstName},` : `Dear ${firstName},`) : es ? 'Hola,' : 'Hello,'
}

// ---------- styles ----------

// Headings (and the signature) in a serif, everything else in a sans-serif:
// set the serif on the body and the sans on each text style.
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = 'Helvetica, Arial, sans-serif'

const body: React.CSSProperties = {
  backgroundColor: '#f5f5f4', // stone-100
  fontFamily: SERIF,
  margin: 0,
  padding: '24px 0',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: 560,
  padding: '40px 32px',
}

const detailLabel: React.CSSProperties = {
  fontFamily: SANS,
  color: '#78716c',
  fontSize: 14,
  fontWeight: 300,
  margin: 0,
  padding: '8px 0',
}

const detailValue: React.CSSProperties = {
  fontFamily: SANS,
  color: '#1c1917',
  fontSize: 14,
  fontWeight: 400,
  margin: 0,
  padding: '8px 0',
  textAlign: 'right',
}

const footer: React.CSSProperties = {
  fontFamily: SANS,
  color: '#a8a29e', // stone-400
  fontSize: 12,
  fontWeight: 300,
  lineHeight: 1.6,
  margin: '0 0 10px 0',
}

const footerLink: React.CSSProperties = {
  color: '#a8a29e',
  textDecoration: 'underline',
}

export const emailStyles = {
  h1: {
    color: '#1c1917', // stone-900
    fontFamily: SERIF,
    fontSize: 30,
    fontWeight: 400,
    lineHeight: 1.2,
    margin: '0 0 32px 0',
  } as React.CSSProperties,
  h2: {
    color: '#1c1917',
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: 400,
    lineHeight: 1.3,
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  paragraph: {
    fontFamily: SANS,
    color: '#44403c', // stone-700
    fontSize: 16,
    lineHeight: 1.6,
    margin: '0 0 16px 0',
    fontWeight: 300,
    textAlign: 'justify',
  } as React.CSSProperties,
  /** Smaller grey text under a button or a box. */
  note: {
    fontFamily: SANS,
    color: '#78716c',
    fontSize: 13,
    fontWeight: 300,
    lineHeight: 1.6,
    margin: '0 0 12px 0',
    textAlign: 'justify',
  } as React.CSSProperties,
  detailsBox: {
    borderTop: '1px solid #e7e5e4', // stone-200
    borderBottom: '1px solid #e7e5e4',
    margin: '32px 0',
    padding: '20px 0',
  } as React.CSSProperties,
  detailsTitle: {
    fontFamily: SANS,
    color: '#78716c',
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    margin: '0 0 12px 0',
  } as React.CSSProperties,
  /** The main line inside a box (a request, a service). */
  itemTitle: {
    color: '#1c1917',
    fontFamily: SERIF,
    fontSize: 18,
    fontWeight: 400,
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  itemText: {
    fontFamily: SANS,
    color: '#57534e',
    fontSize: 14,
    fontWeight: 300,
    lineHeight: 1.5,
    margin: '0 0 6px 0',
  } as React.CSSProperties,
  button: {
    fontFamily: SANS,
    backgroundColor: '#292524', // stone-800
    borderRadius: 2,
    color: '#ffffff',
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    padding: '14px 28px',
    textDecoration: 'none',
  } as React.CSSProperties,
  link: {
    color: '#44403c',
    textDecoration: 'underline',
  } as React.CSSProperties,
  hr: {
    borderColor: '#e7e5e4',
    margin: '32px 0',
  } as React.CSSProperties,
}
