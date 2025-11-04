import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';
import { createClient } from '@sanity/client';

const resend = new Resend(process.env.RESEND_API_KEY);

// Sanity client for fetching featured property
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-06',
  useCdn: true,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add subscriber to audience (if you have Resend Audiences feature)
    // For now, we'll send a notification email to the admin
    const { data, error } = await resend.emails.send({
      from: 'Casa de Campo Rentals <onboarding@resend.dev>', // Update with verified domain
      to: process.env.CONTACT_EMAIL || 'leticiacoudrayrealestate@gmail.com',
      subject: 'New Newsletter Subscription',
      html: `
        <h2>New Newsletter Subscription</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>

        <hr />
        <p style="color: #666; font-size: 12px;">
          Add this email to your newsletter distribution list.
        </p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Fetch a featured property from Sanity
    let featuredProperty: { title: string; image: string; bedrooms: number; price: string; slug: string } | undefined;
    try {
      const property = await sanityClient.fetch(`
        *[_type == "property" && is_featured == true && media.hero_image != null] | order(_createdAt desc) [0] {
          "title": title_en,
          "image": media.hero_image.asset->url,
          bedrooms,
          "price": pricing.nightly_rate,
          "slug": slug.current
        }
      `);

      if (property) {
        featuredProperty = {
          title: property.title,
          image: property.image,
          bedrooms: property.bedrooms,
          price: property.price ? `$${property.price}/night` : 'Contact for pricing',
          slug: property.slug,
        };
      }
    } catch (propertyError) {
      console.error('Failed to fetch featured property:', propertyError);
    }

    // Send welcome email to the subscriber with React Email template
    try {
      const emailHtml = await render(
        WelcomeEmail({
          email,
          locale: 'en', // You can detect locale from email domain or ask during signup
          featuredProperty,
        })
      );

      await resend.emails.send({
        from: 'Casa de Campo Rentals <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to Casa de Campo Newsletter! / ¡Bienvenido al Newsletter de Casa de Campo!',
        html: emailHtml,
        headers: {
          'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'}/unsubscribe>`,
        },
      });
    } catch (welcomeError) {
      // Log but don't fail if welcome email fails
      console.error('Failed to send welcome email:', welcomeError);
    }

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter', id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
