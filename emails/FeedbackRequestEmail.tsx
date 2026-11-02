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
} from '@react-email/components'
import * as React from 'react'
import { EmailLogo } from './brand'

interface FeedbackRequestEmailProps {
  firstName?: string | null
  propertyTitle: string
  actionUrl: string
  locale?: 'en' | 'es'
}

/** The post-stay thank-you, with a button to the guest's private review form. */
export const FeedbackRequestEmail = ({
  firstName,
  propertyTitle,
  actionUrl,
  locale = 'en',
}: FeedbackRequestEmailProps) => {
  const es = locale === 'es'
  return (
    <Html>
      <Head />
      <Preview>
        {es
          ? `Gracias por hospedarte con nosotros en ${propertyTitle}.`
          : `Thank you for staying with us at ${propertyTitle}.`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailLogo />
          <Heading style={h1}>{es ? 'Hasta la próxima.' : 'Until next time.'}</Heading>
          <Text style={paragraph}>
            {firstName ? (es ? `Hola ${firstName},` : `Dear ${firstName},`) : es ? 'Hola,' : 'Dear guest,'}
          </Text>
          <Text style={paragraph}>
            {es
              ? 'Gracias por elegir hospedarte con nosotros en Casa de Campo, República Dominicana. Esperamos que te lleves recuerdos maravillosos y que cada detalle haya hecho tu estadía aún más especial.'
              : 'Thank you for choosing to stay with us in Casa de Campo, Dominican Republic. We hope you leave with wonderful memories and that every detail made your time here all the more special.'}
          </Text>
          <Text style={paragraph}>
            {es
              ? 'Nos encantaría conocer tu experiencia. Tus comentarios nos ayudan a seguir perfeccionando nuestro servicio y a hacer que cada estadía sea aún más memorable.'
              : 'We would love to hear about your experience. Your feedback helps us continue to refine our service and make each stay even more memorable.'}
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={actionUrl} style={button}>
              {es ? 'Tu experiencia con nosotros' : 'Your experience with us'}
            </Button>
          </Section>
          <Text style={paragraph}>
            {es
              ? 'Gracias nuevamente por ser nuestro huésped. Será un placer recibirte de nuevo en Casa de Campo.'
              : 'Thank you once again for being our guest. We would be delighted to welcome you back to Casa de Campo.'}
          </Text>
          <Text style={{ ...paragraph, margin: '28px 0 0' }}>{es ? 'Un cordial saludo,' : 'Warm regards,'}</Text>
          <Text style={signature}>Leticia Coudray Saladin</Text>
          <Text style={muted}>{es ? 'Equipo de Real Estate' : 'Real Estate Team'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default FeedbackRequestEmail

const body = { backgroundColor: '#f6f4f1', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }
const container = { backgroundColor: '#ffffff', border: '1px solid #e2ded8', maxWidth: '560px', margin: '0 auto', padding: '40px' }
const h1 = { fontSize: '30px', fontWeight: 400 as const, color: '#1c1917', margin: '0 0 20px' }
const paragraph = { fontSize: '15px', lineHeight: '1.7', color: '#57534e', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300 as const, margin: '0 0 14px' }
const muted = { fontSize: '13px', lineHeight: '1.6', color: '#78716c', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300 as const, margin: '0' }
const signature = { fontSize: '17px', color: '#1c1917', margin: '6px 0 0' }
const button = { backgroundColor: '#1c1917', color: '#ffffff', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, fontFamily: 'Helvetica, Arial, sans-serif', padding: '14px 28px', borderRadius: '2px', textDecoration: 'none' }
