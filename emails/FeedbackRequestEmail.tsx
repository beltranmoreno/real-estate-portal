import { Heading, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

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
    <EmailLayout
      preview={es ? `Gracias por hospedarte con nosotros en ${propertyTitle}.` : `Thank you for staying with us at ${propertyTitle}.`}
      locale={es ? 'es' : 'en'}
      reason={es ? 'Recibiste este correo porque te hospedaste con Leticia Coudray Real Estate.' : 'You received this email because you stayed with Leticia Coudray Real Estate.'}
    >
      <Heading style={s.h1}>{es ? 'Hasta la próxima.' : 'Until next time.'}</Heading>
      <Text style={s.paragraph}>{greeting(firstName, es)}</Text>
      <Text style={s.paragraph}>
        {es
          ? 'Gracias por elegir hospedarte con nosotros en Casa de Campo, República Dominicana. Esperamos que te lleves recuerdos maravillosos y que cada detalle haya hecho tu estadía aún más especial.'
          : 'Thank you for choosing to stay with us in Casa de Campo, Dominican Republic. We hope you leave with wonderful memories and that every detail made your time here all the more special.'}
      </Text>
      <Text style={s.paragraph}>
        {es
          ? 'Nos encantaría conocer tu experiencia. Tus comentarios nos ayudan a seguir perfeccionando nuestro servicio y a hacer que cada estadía sea aún más memorable.'
          : 'We would love to hear about your experience. Your feedback helps us continue to refine our service and make each stay even more memorable.'}
      </Text>
      <EmailButton href={actionUrl}>{es ? 'Tu experiencia con nosotros' : 'Your experience with us'}</EmailButton>
      <Text style={s.paragraph}>
        {es
          ? 'Gracias nuevamente por ser nuestro huésped. Será un placer recibirte de nuevo en Casa de Campo.'
          : 'Thank you once again for being our guest. We would be delighted to welcome you back to Casa de Campo.'}
      </Text>
    </EmailLayout>
  )
}

export default FeedbackRequestEmail
