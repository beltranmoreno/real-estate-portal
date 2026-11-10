import { Heading, Text } from '@react-email/components'
import * as React from 'react'
import { EmailButton, EmailLayout, emailStyles as s, greeting } from './layout'

interface RequestReminderEmailProps {
  firstName?: string | null
  propertyTitle: string
  pendingCount: number
  daysUntilCheckIn: number
  actionUrl: string
  locale?: 'en' | 'es'
}

export const RequestReminderEmail = ({
  firstName,
  propertyTitle,
  pendingCount,
  daysUntilCheckIn,
  actionUrl,
  locale = 'en',
}: RequestReminderEmailProps) => {
  const es = locale === 'es'
  const itemWord = pendingCount === 1 ? (es ? 'cosa' : 'thing') : es ? 'cosas' : 'things'
  const dayWord = daysUntilCheckIn === 1 ? (es ? 'día' : 'day') : es ? 'días' : 'days'

  return (
    <EmailLayout preview={es
          ? `${pendingCount} ${itemWord} pendiente${pendingCount === 1 ? '' : 's'} para tu estadía`
          : `${pendingCount} ${itemWord} we still need before your stay`} locale={es ? 'es' : 'en'} reason={es ? 'Recibiste este correo porque tienes una estadía reservada con Leticia Coudray Real Estate.' : 'You received this email because you have a stay booked with Leticia Coudray Real Estate.'}>
          <Heading style={s.h1}>
            {es ? 'Un breve recordatorio' : 'A gentle reminder'}
          </Heading>
          <Text style={s.paragraph}>
            {greeting(firstName, es)}
          </Text>
          <Text style={s.paragraph}>
            {es
              ? `Tu llegada a ${propertyTitle} es en ${daysUntilCheckIn} ${dayWord}. Aún tenemos ${pendingCount} ${itemWord} pendiente${pendingCount === 1 ? '' : 's'} de tu lado. Solo toma un momento desde tu portal.`
              : `Your stay at ${propertyTitle} starts in ${daysUntilCheckIn} ${dayWord}. We still have ${pendingCount} ${itemWord} pending from your side — only takes a moment from your portal.`}
          </Text>

          <EmailButton href={actionUrl}>{es ? 'Abrir mi portal' : 'Open my portal'}</EmailButton>

          <Text style={s.note}>
            {es
              ? '¿Tienes alguna pregunta? Solo responde este correo.'
              : 'Any questions? Just reply to this email.'}
          </Text>

    </EmailLayout>
  )
}

export default RequestReminderEmail

