import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import ContactConfirmationEmail from '@/emails/ContactConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, propertyType, budget, locale } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Casa de Campo Rentals <onboarding@resend.dev>', // Update this with your verified domain
      to: process.env.CONTACT_EMAIL || 'contact@example.com', // Update with Leticia's email
      replyTo: email,
      subject: subject || `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${propertyType ? `<p><strong>Property Type:</strong> ${propertyType}</p>` : ''}
        ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ''}
        <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send confirmation email to the user
    try {
      const confirmationHtml = await render(
        ContactConfirmationEmail({
          name,
          locale: (locale as 'en' | 'es') || 'en',
        })
      );

      await resend.emails.send({
        from: 'Casa de Campo Rentals <onboarding@resend.dev>',
        to: email,
        subject: locale === 'es'
          ? '¡Gracias por contactarnos! - Casa de Campo'
          : 'Thank You for Reaching Out! - Casa de Campo',
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
