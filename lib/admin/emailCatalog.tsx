import 'server-only'
import { render } from '@react-email/components'
import ContactConfirmationEmail from '@/emails/ContactConfirmationEmail'
import InquiryReceivedEmail from '@/emails/InquiryReceivedEmail'
import InquirySelectionEmail from '@/emails/InquirySelectionEmail'
import InvitationEmail from '@/emails/InvitationEmail'
import RequestCreatedEmail from '@/emails/RequestCreatedEmail'
import RequestReminderEmail from '@/emails/RequestReminderEmail'
import SubmissionRejectedEmail from '@/emails/SubmissionRejectedEmail'
import ServiceConfirmedEmail from '@/emails/ServiceConfirmedEmail'
import KeyReleasedEmail from '@/emails/KeyReleasedEmail'
import StayDayEmail from '@/emails/StayDayEmail'
import FeedbackRequestEmail from '@/emails/FeedbackRequestEmail'
import GuestAddedEmail from '@/emails/GuestAddedEmail'
import { getWelcomePicks } from '@/lib/email/welcomePicks'

/**
 * Every email the site sends, in the order a guest meets them, with when it
 * goes out and a sample render (fake data). Powers /admin/emails. When you add
 * or change an email, update its entry here too.
 */

type L = 'en' | 'es'
type Bi = { en: string; es: string }

export type EmailStage = 'website' | 'inquiry' | 'before' | 'during' | 'after'
export type EmailTrigger = 'automatic' | 'admin' | 'form'

export interface EmailEntry {
  id: string
  stage: EmailStage
  name: Bi
  to: 'guest' | 'team'
  trigger: EmailTrigger
  when: Bi
  /** Extra detail: conditions, how often, what can stop it. */
  notes?: Bi
  /** Internal emails are English only. */
  englishOnly?: boolean
  subject: (l: L) => string
  html: (l: L) => Promise<string>
}

export const STAGES: { key: EmailStage; label: Bi }[] = [
  { key: 'website', label: { en: 'Website forms', es: 'Formularios del sitio' } },
  { key: 'inquiry', label: { en: 'Inquiries', es: 'Consultas' } },
  { key: 'before', label: { en: 'Before the stay', es: 'Antes de la estadía' } },
  { key: 'during', label: { en: 'During the stay', es: 'Durante la estadía' } },
  { key: 'after', label: { en: 'After the stay', es: 'Después de la estadía' } },
]

// ---------- sample data ----------
const HOUSE = 'Casa Famiglia'
const FIRST = 'Sarah'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const STAY = `${SITE}/portal/stays/sample`
const d = (l: L, en: string, es: string) => (l === 'es' ? es : en)
const r = (el: React.ReactElement) => render(el)

/** Plain internal emails (no template) shown as they arrive. */
function plain(body: string, asHtml = false) {
  const content = asHtml ? body : `<pre style="white-space:pre-wrap;font:14px/1.5 -apple-system,Segoe UI,sans-serif;margin:0">${body}</pre>`
  return Promise.resolve(
    `<!doctype html><html><body style="margin:0;padding:24px;background:#fff;color:#1c1917;font-family:-apple-system,Segoe UI,sans-serif">${content}</body></html>`
  )
}

export const EMAILS: EmailEntry[] = [
  // ---- Website forms ----
  {
    id: 'contact-team',
    stage: 'website',
    name: { en: 'Contact form → team alert', es: 'Formulario de contacto → aviso al equipo' },
    to: 'team',
    trigger: 'form',
    englishOnly: true,
    when: {
      en: 'Right away, when someone sends the contact form (About, Contact or Owners page).',
      es: 'Al instante, cuando alguien envía el formulario de contacto (páginas Nosotros, Contacto o Propietarios).',
    },
    notes: { en: 'The message is also saved in Inquiries. Reply goes to the sender.', es: 'El mensaje también se guarda en Consultas. Responder le llega a quien lo envió.' },
    subject: () => 'Website contact: Rent a house (LC-2041)',
    html: () =>
      plain(
        `<h2>New Contact Form Submission</h2><p><strong>Name:</strong> ${FIRST} Miller</p><p><strong>Email:</strong> sarah@example.com</p><p><strong>Subject:</strong> Rent a house</p><p><strong>Dates:</strong> 2026-12-20 → 2026-12-27</p><p><strong>Guests:</strong> 8</p><p><strong>Message:</strong></p><p>Hi! We're looking for a villa near the beach for Christmas week.</p><p><a href="#">Open it in the inquiries inbox</a></p>`,
        true
      ),
  },
  {
    id: 'contact-confirmation',
    stage: 'website',
    name: { en: 'Contact form → confirmation', es: 'Formulario de contacto → confirmación' },
    to: 'guest',
    trigger: 'form',
    when: { en: 'Right away, to the person who sent the contact form.', es: 'Al instante, a la persona que envió el formulario de contacto.' },
    subject: (l) => d(l, 'We received your message — Leticia Coudray Real Estate', 'Recibimos tu mensaje — Leticia Coudray Real Estate'),
    html: (l) => r(ContactConfirmationEmail({ name: `${FIRST} Miller`, locale: l })),
  },

  // ---- Inquiries ----
  {
    id: 'inquiry-team',
    stage: 'inquiry',
    name: { en: 'House inquiry → team alert', es: 'Consulta de casa → aviso al equipo' },
    to: 'team',
    trigger: 'form',
    englishOnly: true,
    when: { en: 'Right away, when a guest inquires about one or more houses.', es: 'Al instante, cuando un huésped consulta por una o más casas.' },
    subject: () => `New inquiry from ${FIRST} Miller (LC-2042)`,
    html: () =>
      plain(
        `${FIRST} Miller sent an inquiry (LC-2042).\n\nEmail: sarah@example.com\nWhatsApp: +1 305 555 0101\nDates: 2026-12-20 → 2026-12-27\nGuests: 8\nBudget: $1,500 – $3,000 / night\n\nHouses:\n• ${HOUSE}\n• Casa Equilibra\n\nMessage:\nWe're celebrating a 50th birthday.\n\nOpen it: ${SITE}/admin/inquiries/…`
      ),
  },
  {
    id: 'inquiry-received',
    stage: 'inquiry',
    name: { en: 'Inquiry received', es: 'Consulta recibida' },
    to: 'guest',
    trigger: 'form',
    when: { en: 'Right away, after a house inquiry — only if they left an email.', es: 'Al instante, tras una consulta de casa — solo si dejaron un correo.' },
    notes: { en: 'Recap, WhatsApp button, a few similar houses and things to do.', es: 'Resumen, botón de WhatsApp, algunas casas similares y cosas que hacer.' },
    subject: (l) => d(l, "We've received your inquiry (LC-2042)", 'Recibimos tu consulta (LC-2042)'),
    html: (l) =>
      r(
        InquiryReceivedEmail({
          firstName: FIRST,
          reference: 'LC-2042',
          houses: [
            { title: HOUSE, url: `${SITE}/property/casa-famiglia`, meta: d(l, '6 bedrooms · Golf Villas', '6 habitaciones · Golf Villas') },
            { title: 'Casa Equilibra', url: `${SITE}/property/casa-equilibra`, meta: d(l, '5 bedrooms · Las Lomas', '5 habitaciones · Las Lomas') },
          ],
          dates: d(l, 'Dec 20 – Dec 27, 2026', '20 dic – 27 dic 2026'),
          guests: 8,
          whatsappUrl: 'https://wa.me/',
          similar: [
            { title: 'Casa Mar', url: `${SITE}/property/casa-mar`, meta: d(l, '5 bedrooms · Barranca', '5 habitaciones · Barranca') },
            { title: 'Villa Serena', url: `${SITE}/property/villa-serena`, meta: d(l, '7 bedrooms · Golf Villas', '7 habitaciones · Golf Villas') },
          ],
          thingsToDoUrl: `${SITE}/guide`,
          locale: l,
        })
      ),
  },
  {
    id: 'inquiry-selection',
    stage: 'inquiry',
    name: { en: 'Private selection of houses', es: 'Selección privada de casas' },
    to: 'guest',
    trigger: 'admin',
    when: { en: 'When you send a private collection from an inquiry.', es: 'Cuando envías una colección privada desde una consulta.' },
    notes: { en: 'Your optional personal note appears above the button.', es: 'Tu nota personal opcional aparece sobre el botón.' },
    subject: (l) => d(l, 'Your selection of houses in Casa de Campo', 'Tu selección de casas en Casa de Campo'),
    html: (l) =>
      r(
        InquirySelectionEmail({
          firstName: FIRST,
          url: `${SITE}/selection/sample`,
          note: d(l, 'These three are my favourites for a big family Christmas.', 'Estas tres son mis favoritas para una Navidad en familia.'),
          dates: d(l, 'Dec 20, 2026 – Dec 27, 2026', '20 dic 2026 – 27 dic 2026'),
          houseCount: 3,
          locale: l,
        })
      ),
  },

  // ---- Before the stay ----
  {
    id: 'invitation',
    stage: 'before',
    name: { en: 'Portal invitation', es: 'Invitación al portal' },
    to: 'guest',
    trigger: 'admin',
    when: {
      en: 'When you create a booking with “Create & send invitation”, or press Send / Resend invitation on a booking.',
      es: 'Cuando creas una reserva con “Crear y enviar invitación”, o pulsas Enviar / Reenviar invitación en una reserva.',
    },
    notes: {
      en: 'Ends with restaurants (offering to book a table) and activities — choose which ones below the sample.',
      es: 'Termina con restaurantes (ofreciendo reservar mesa) y actividades — elige cuáles debajo del ejemplo.',
    },
    subject: (l) => d(l, `Your portal for your stay at ${HOUSE} is ready`, `Tu portal para tu estadía en ${HOUSE} está listo`),
    html: async (l) =>
      r(
        InvitationEmail({
          picks: await getWelcomePicks(),
          firstName: FIRST,
          propertyTitle: HOUSE,
          checkIn: d(l, 'Dec 20, 2026', '20 dic 2026'),
          checkOut: d(l, 'Dec 27, 2026', '27 dic 2026'),
          acceptUrl: `${SITE}/portal/accept/sample`,
          locale: l,
        })
      ),
  },
  {
    id: 'guest-added',
    stage: 'before',
    name: { en: 'Extra guest invite', es: 'Invitación a huésped adicional' },
    to: 'guest',
    trigger: 'admin',
    when: {
      en: 'When an extra guest with an email is added to a booking — by you (with Portal ticked) or by the guest who booked, from “Your party”. Also when you switch Portal on for someone.',
      es: 'Cuando se agrega un huésped adicional con correo a una reserva — por ti (con Portal marcado) o por quien reservó, desde “Tu grupo”. También al activar Portal para alguien.',
    },
    notes: {
      en: 'In the booking guest’s language. Gives a read-only view of the stay: plans, itinerary, house details — no prices or documents.',
      es: 'En el idioma de quien reservó. Da una vista de solo lectura: planes, itinerario, información de la casa — sin precios ni documentos.',
    },
    subject: (l) => d(l, `You’ve been added to the stay at ${HOUSE}`, `Te agregaron a la estadía en ${HOUSE}`),
    html: (l) =>
      r(
        GuestAddedEmail({
          firstName: 'Daniel',
          bookedBy: `${FIRST} Miller`,
          propertyTitle: HOUSE,
          dates: d(l, 'Dec 20 – Dec 27, 2026', '20 dic – 27 dic, 2026'),
          email: 'daniel@example.com',
          actionUrl: STAY,
          locale: l,
        })
      ),
  },
  {
    id: 'request-created',
    stage: 'before',
    name: { en: 'New request (documents / info)', es: 'Nueva solicitud (documentos / info)' },
    to: 'guest',
    trigger: 'admin',
    when: {
      en: 'When you add a request on a booking (e.g. arrival details, deposit receipt). Several requests added together go in one email.',
      es: 'Cuando agregas una solicitud en una reserva (p. ej. datos de llegada, comprobante de depósito). Varias solicitudes juntas van en un solo correo.',
    },
    subject: (l) => d(l, `2 requests — ${HOUSE}`, `2 solicitudes — ${HOUSE}`),
    html: (l) =>
      r(
        RequestCreatedEmail({
          firstName: FIRST,
          propertyTitle: HOUSE,
          requests: [
            {
              title: d(l, 'Arrival details', 'Datos de llegada'),
              description: d(l, 'Flight number and landing time.', 'Número de vuelo y hora de llegada.'),
              expectsDocument: false,
              dueAt: d(l, '13 Dec 2026', '13 dic 2026'),
            },
            { title: d(l, 'Deposit transfer receipt', 'Comprobante de transferencia del depósito'), expectsDocument: true, dueAt: null },
          ],
          actionUrl: `${STAY}#to-do`,
          locale: l,
        })
      ),
  },
  {
    id: 'request-reminder',
    stage: 'before',
    name: { en: 'Reminder: pending requests', es: 'Recordatorio: solicitudes pendientes' },
    to: 'guest',
    trigger: 'automatic',
    when: {
      en: 'Daily at 9am (DR) — 7, 3 and 1 days before check-in, only if requests are still pending.',
      es: 'Diario a las 9am (RD) — 7, 3 y 1 día antes de la llegada, solo si quedan solicitudes pendientes.',
    },
    notes: { en: 'At most one per booking per day. Only for confirmed bookings.', es: 'Como máximo uno por reserva al día. Solo reservas confirmadas.' },
    subject: (l) => d(l, `Reminder: 2 pending items for ${HOUSE}`, `Recordatorio: 2 pendientes para ${HOUSE}`),
    html: (l) =>
      r(RequestReminderEmail({ firstName: FIRST, propertyTitle: HOUSE, pendingCount: 2, daysUntilCheckIn: 3, actionUrl: `${STAY}#to-do`, locale: l })),
  },
  {
    id: 'submission-rejected',
    stage: 'before',
    name: { en: 'Please re-submit', es: 'Por favor reenvía' },
    to: 'guest',
    trigger: 'admin',
    when: { en: 'When you reject something a guest sent for a request, with your note.', es: 'Cuando rechazas algo que el huésped envió para una solicitud, con tu nota.' },
    subject: (l) => d(l, 'Please re-submit: Deposit transfer receipt', 'Por favor reenvía: Comprobante de transferencia del depósito'),
    html: (l) =>
      r(
        SubmissionRejectedEmail({
          firstName: FIRST,
          propertyTitle: HOUSE,
          requestTitle: d(l, 'Deposit transfer receipt', 'Comprobante de transferencia del depósito'),
          note: d(l, 'The image is cut off — could you send the full receipt?', 'La imagen está cortada — ¿podrías enviar el comprobante completo?'),
          actionUrl: `${STAY}#to-do`,
          locale: l,
        })
      ),
  },
  {
    id: 'service-confirmed',
    stage: 'before',
    name: { en: 'Concierge service confirmed', es: 'Servicio de conserjería confirmado' },
    to: 'guest',
    trigger: 'admin',
    when: {
      en: 'When you press “Notify guest” on a confirmed concierge request (also used during the stay).',
      es: 'Cuando pulsas “Avisar al huésped” en una solicitud de conserjería confirmada (también durante la estadía).',
    },
    subject: (l) => d(l, `Confirmed: Boat experiences — ${HOUSE}`, `Confirmado: Experiencias en bote — ${HOUSE}`),
    html: (l) =>
      r(
        ServiceConfirmedEmail({
          firstName: FIRST,
          propertyTitle: HOUSE,
          serviceName: d(l, 'Boat experiences', 'Experiencias en bote'),
          venueName: 'Isla Catalina',
          dateLabel: d(l, 'Tuesday, Dec 22', 'martes, 22 dic'),
          timeLabel: '10:00 AM',
          partySize: 8,
          actionUrl: `${STAY}#concierge`,
          locale: l,
        })
      ),
  },
  {
    id: 'pre-arrival',
    stage: 'before',
    name: { en: 'Your stay starts tomorrow', es: 'Tu estadía comienza mañana' },
    to: 'guest',
    trigger: 'automatic',
    when: {
      en: 'Daily at 9am (DR), the day before check-in. Includes the door code when one is set.',
      es: 'Diario a las 9am (RD), el día antes de la llegada. Incluye el código de la puerta si hay uno.',
    },
    notes: {
      en: 'Once per booking (not drafts or cancelled). If a door code is added later, the code is sent on its own — up to check-in morning.',
      es: 'Una vez por reserva (no borradores ni canceladas). Si el código se agrega después, se envía solo — hasta la mañana de llegada.',
    },
    subject: (l) => d(l, `Your check-in code for ${HOUSE}`, `Tu código para ${HOUSE}`),
    html: (l) =>
      r(
        KeyReleasedEmail({
          firstName: FIRST,
          propertyTitle: HOUSE,
          keyCode: '4821',
          checkInLabel: d(l, 'Sunday, Dec 20', 'domingo, 20 dic'),
          stayUrl: `${STAY}#house`,
          locale: l,
        })
      ),
  },

  // ---- During the stay ----
  {
    id: 'check-in-day',
    stage: 'during',
    name: { en: 'Check-in day welcome', es: 'Bienvenida el día de llegada' },
    to: 'guest',
    trigger: 'automatic',
    when: { en: 'Daily at 9am (DR), on the check-in day.', es: 'Diario a las 9am (RD), el día de llegada.' },
    notes: { en: 'Button opens the house info (Wi-Fi, directions).', es: 'El botón abre la información de la casa (Wi-Fi, cómo llegar).' },
    subject: (l) => d(l, `Welcome to ${HOUSE}`, `Bienvenido a ${HOUSE}`),
    html: (l) => r(StayDayEmail({ kind: 'check-in', firstName: FIRST, propertyTitle: HOUSE, time: '3:00 PM', actionUrl: `${STAY}#house`, locale: l })),
  },
  {
    id: 'check-out-day',
    stage: 'during',
    name: { en: 'Check-out day goodbye', es: 'Despedida el día de salida' },
    to: 'guest',
    trigger: 'automatic',
    when: { en: 'Daily at 9am (DR), on the check-out day.', es: 'Diario a las 9am (RD), el día de salida.' },
    subject: (l) => d(l, `Thank you for staying at ${HOUSE}`, `Gracias por tu estadía en ${HOUSE}`),
    html: (l) => r(StayDayEmail({ kind: 'check-out', firstName: FIRST, propertyTitle: HOUSE, time: '11:00 AM', actionUrl: STAY, locale: l })),
  },

  // ---- After the stay ----
  {
    id: 'feedback',
    stage: 'after',
    name: { en: 'Feedback invitation', es: 'Invitación a opinar' },
    to: 'guest',
    trigger: 'automatic',
    when: {
      en: 'Daily at 9am (DR), the day after check-out, once the booking is completed. You can also send it from the booking.',
      es: 'Diario a las 9am (RD), el día después de la salida, cuando la reserva está completada. También puedes enviarlo desde la reserva.',
    },
    notes: { en: 'Sent once per booking.', es: 'Se envía una vez por reserva.' },
    subject: (l) => d(l, 'Thank you for staying with us', 'Gracias por hospedarte con nosotros'),
    html: (l) => r(FeedbackRequestEmail({ firstName: FIRST, propertyTitle: HOUSE, actionUrl: `${STAY}/feedback`, locale: l })),
  },
]
