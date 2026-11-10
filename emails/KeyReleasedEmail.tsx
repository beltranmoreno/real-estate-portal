import { Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

interface KeyReleasedEmailProps {
  firstName?: string | null
  propertyTitle: string
  /** Door code — omitted when the booking has none. */
  keyCode?: string | null
  checkInLabel: string
  /** Link to the guest's stay in the portal (house info section). */
  stayUrl?: string
  locale?: 'en' | 'es'
}

export const KeyReleasedEmail = ({
  firstName,
  propertyTitle,
  keyCode,
  checkInLabel,
  stayUrl,
  locale = 'en',
}: KeyReleasedEmailProps) => {
  const es = locale === 'es'

  return (
    <EmailLayout preview={keyCode
          ? es
            ? `Tu código de entrada para ${propertyTitle}`
            : `Your check-in code for ${propertyTitle}`
          : es
            ? `Tu estadía en ${propertyTitle} comienza mañana`
            : `Your stay at ${propertyTitle} starts tomorrow`} locale={es ? 'es' : 'en'} reason={es ? 'Recibiste este correo porque tienes una estadía reservada con Leticia Coudray Real Estate.' : 'You received this email because you have a stay booked with Leticia Coudray Real Estate.'}>
          <Heading style={s.h1}>
            {es ? 'Casi listo' : 'Almost there'}
          </Heading>
          <Text style={s.paragraph}>
            {greeting(firstName, es)}
          </Text>
          <Text style={s.paragraph}>
            {keyCode
              ? es
                ? `Tu estadía en ${propertyTitle} comienza ${checkInLabel}. Aquí está tu código de entrada:`
                : `Your stay at ${propertyTitle} starts ${checkInLabel}. Here's your check-in code:`
              : es
                ? `Tu estadía en ${propertyTitle} comienza ${checkInLabel}. Estamos deseando recibirte.`
                : `Your stay at ${propertyTitle} starts ${checkInLabel}. We look forward to welcoming you.`}
          </Text>

          {keyCode && (
            <Section style={codeBox}>
              <Text style={codeText}>{keyCode}</Text>
              <Text style={codeLabel}>
                {es ? 'Código de entrada' : 'Check-in code'}
              </Text>
            </Section>
          )}

          <Text style={s.paragraph}>
            {keyCode
              ? es
                ? 'Lo encontrarás también en tu portal en cualquier momento. Si tienes algún problema al llegar, llámanos directamente — estamos disponibles 24/7 durante tu estadía.'
                : 'You can also find this in your portal anytime. If you have any trouble at arrival, call us directly — we are available 24/7 during your stay.'
              : es
                ? 'Si tienes algún problema al llegar, llámanos directamente — estamos disponibles 24/7 durante tu estadía.'
                : 'If you have any trouble at arrival, call us directly — we are available 24/7 during your stay.'}
          </Text>

          {stayUrl && (
            <>
              <Text style={s.paragraph}>
                {es
                  ? 'El Wi-Fi, la dirección, las indicaciones de llegada y los detalles de la casa están en tu portal.'
                  : 'The Wi-Fi, address, arrival directions and house details are in your portal.'}
              </Text>
              <EmailButton href={stayUrl}>{es ? 'Ver los detalles de la casa' : 'View house details'}</EmailButton>
            </>
          )}

    </EmailLayout>
  )
}

export default KeyReleasedEmail

// ---------- styles (the rest come from ./layout) ----------

const codeBox: React.CSSProperties = {
  borderTop: '1px solid #e7e5e4',
  borderBottom: '1px solid #e7e5e4',
  textAlign: 'center',
  padding: '24px 0',
  margin: '24px 0',
}
const codeText: React.CSSProperties = {
  color: '#1c1917',
  fontSize: 36,
  fontWeight: 300,
  letterSpacing: '0.5em',
  margin: '0 0 8px 0',
  fontFamily: 'monospace',
}
const codeLabel: React.CSSProperties = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  color: '#78716c',
  fontSize: 11,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  margin: 0,
}
