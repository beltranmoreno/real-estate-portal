import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import ContactConfirmationEmail from '@/emails/ContactConfirmationEmail';
import { prisma } from '@/lib/db';
import { newInquiryReference } from '@/lib/inquiries';
import { BUDGET_KEYS, budgetLabel } from '@/lib/inquiry';
import { greetingName, ipLimited, mayEmailVisitor, siteFlooded } from '@/lib/formGuard';

const resend = new Resend(process.env.RESEND_API_KEY);

// Same verified sender as the inquiry and portal emails. Resend's
// onboarding@resend.dev sandbox address can only mail the account owner,
// so it rejected every real submission.
const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM || 'Leticia Coudray Real Estate <hello@updates.leticiacoudrayrealestate.com>';
const TEAM_EMAIL = process.env.PORTAL_EMAIL_REPLY_TO || 'leticiacoudrayrealestate@gmail.com';
const NOTIFY_TO = process.env.CONTACT_EMAIL || process.env.INQUIRY_NOTIFY_EMAIL || TEAM_EMAIL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com';
const PAGES = ['about', 'contact', 'owners'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const SUBJECTS: Record<string, string> = {
  renting: 'Renting a villa',
  buying: 'Buying a property',
  selling: 'Selling a property',
  other: 'Something else',
  'Owner enquiry': 'Owner enquiry',
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, propertyType, locale, page } = body;
    // Stay details and budget (renting / buying on the About form); anything
    // malformed is dropped rather than rejected.
    const checkIn = typeof body.checkIn === 'string' && DATE.test(body.checkIn) ? body.checkIn : null;
    const checkOut = typeof body.checkOut === 'string' && DATE.test(body.checkOut) ? body.checkOut : null;
    const guests = Number.isInteger(Number(body.guests)) && Number(body.guests) > 0 ? Math.min(Number(body.guests), 99) : null;
    const budget = (BUDGET_KEYS as readonly string[]).includes(body.budget) ? (body.budget as string) : null;
    // Only the known subjects; anything else is shown as "Something else".
    const subjectLabel = subject ? SUBJECTS[subject] ?? SUBJECTS.other : '';

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    if (
      typeof name !== 'string' || name.trim().length > 120 ||
      typeof email !== 'string' || email.length > 200 || !EMAIL.test(email.trim()) ||
      typeof message !== 'string' || message.length > 4000 ||
      (phone != null && (typeof phone !== 'string' || phone.length > 40)) ||
      (subject != null && typeof subject !== 'string') ||
      (propertyType != null && (typeof propertyType !== 'string' || propertyType.length > 120))
    ) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    if (ipLimited(request, 'contact') || (await siteFlooded())) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again later, or message us on WhatsApp.' },
        { status: 429 }
      );
    }

    // Checked before saving, so this message isn't counted against itself.
    const confirm = await mayEmailVisitor(email.trim());

    // Record it in the admin inquiries inbox. Best-effort: the email below
    // still goes out if the database is unavailable.
    let inquiry: { id: string; reference: string } | null = null;
    try {
      const extras = [
        subjectLabel ? `Subject: ${subjectLabel}` : null,
        propertyType ? `Property: ${propertyType}` : null,
      ].filter(Boolean);
      inquiry = await prisma.inquiry.create({
        data: {
          reference: await newInquiryReference(),
          source: 'CONTACT',
          channel: PAGES.includes(page) ? page : null,
          name: String(name).trim().slice(0, 120),
          email: String(email).trim().slice(0, 200),
          whatsapp: phone ? String(phone).trim().slice(0, 40) : null,
          locale: locale === 'es' ? 'es' : 'en',
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          guests,
          budget,
          message: [...extras, extras.length ? '' : null, String(message).trim()]
            .filter((l) => l !== null)
            .join('\n')
            .slice(0, 4000),
          propertyIds: [],
          propertyTitles: [],
        },
        select: { id: true, reference: true },
      });
    } catch (err) {
      console.error('[contact] could not save inquiry', err);
    }

    const field = (label: string, value?: string) =>
      value ? `<p><strong>${label}:</strong> ${escapeHtml(String(value))}</p>` : '';

    // Notify the team
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: NOTIFY_TO,
      replyTo: email.trim(),
      subject: `${subjectLabel ? `Website contact: ${subjectLabel}` : `New message from ${String(name).trim().slice(0, 60)}`}${inquiry ? ` (${inquiry.reference})` : ''}`,
      html: `
        <h2>New Contact Form Submission</h2>
        ${field('Name', name)}
        ${field('Email', email)}
        ${field('Phone', phone)}
        ${field('Subject', subjectLabel || 'No subject')}
        ${field('Property', propertyType)}
        ${field('Dates', checkIn && checkOut ? `${checkIn} → ${checkOut}` : checkIn || undefined)}
        ${field('Guests', guests ? String(guests) : undefined)}
        ${field('Budget', budgetLabel(budget) ?? undefined)}
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(String(message)).replace(/\n/g, '<br>')}</p>
        ${inquiry ? `<p><a href="${SITE_URL}/admin/inquiries/${inquiry.id}">Open it in the inquiries inbox</a></p>` : ''}
      `,
    });

    // Saved in the inbox counts as received, even if the alert email failed.
    if (error && !inquiry) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    if (error) console.error('Resend error (inquiry saved):', error);

    // Send confirmation email to the user (not past the per-address limits,
    // so the form can't be used to mail strangers).
    if (confirm) try {
      const confirmationHtml = await render(
        ContactConfirmationEmail({
          name: greetingName(name),
          locale: locale === 'es' ? 'es' : 'en',
        })
      );

      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email.trim(),
        replyTo: TEAM_EMAIL,
        subject: locale === 'es'
          ? 'Recibimos tu mensaje — Leticia Coudray Real Estate'
          : 'We received your message — Leticia Coudray Real Estate',
        html: confirmationHtml,
      });
    } catch (confirmationError) {
      // Log but don't fail if confirmation email fails
      console.error('Failed to send confirmation email:', confirmationError);
    }

    return NextResponse.json(
      { message: 'Email sent successfully', id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
