import { NextRequest, NextResponse } from 'next/server'

interface InquiryRequest {
  propertyId: string
  propertyTitle: string
  checkIn?: string
  checkOut?: string
  guests?: number
  name: string
  email: string
  phone?: string
  message?: string
  language?: 'en' | 'es'
}

export async function POST(request: NextRequest) {
  try {
    const body: InquiryRequest = await request.json()
    const {
      propertyId,
      propertyTitle,
      checkIn,
      checkOut,
      guests,
      name,
      email,
      phone,
      message,
      language = 'en'
    } = body

    // Validate required fields
    if (!propertyId || !propertyTitle || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Format inquiry details
    const inquiryDetails = {
      propertyId,
      propertyTitle,
      checkIn,
      checkOut,
      guests,
      contactInfo: {
        name,
        email,
        phone,
        language
      },
      message,
      timestamp: new Date().toISOString(),
      source: 'website',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }

    // Here you would typically:
    // 1. Save to database (Sanity or other)
    // 2. Send email notifications
    // 3. Integrate with CRM
    // 4. Send WhatsApp notification if configured

    // For now, we'll simulate success
    // In production, you'd integrate with email service (SendGrid, AWS SES, etc.)
    
    console.log('New inquiry received:', inquiryDetails)

    // Simulate sending email notification
    const emailSent = await sendEmailNotification(inquiryDetails)
    
    if (!emailSent) {
      console.error('Failed to send email notification')
      // Don't fail the request if email fails - inquiry is still saved
    }

    return NextResponse.json({
      ok: true,
      message: language === 'es' 
        ? 'Su consulta ha sido enviada exitosamente. Le responderemos pronto.'
        : 'Your inquiry has been sent successfully. We will respond soon.',
      inquiryId: generateInquiryId()
    })

  } catch (error) {
    console.error('Inquiry API error:', error)
    return NextResponse.json(
      { 
        ok: false,
        error: 'Failed to submit inquiry' 
      },
      { status: 500 }
    )
  }
}

// Helper function to generate unique inquiry ID
function generateInquiryId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 9)
  return `INQ-${timestamp}-${randomStr}`.toUpperCase()
}

// Placeholder for email notification
async function sendEmailNotification(inquiry: any): Promise<boolean> {
  // In production, integrate with email service
  // Example with SendGrid, AWS SES, Resend, etc.
  
  try {
    // Email to property owner/manager
    const ownerEmail = {
      to: process.env.NOTIFICATION_EMAIL || 'admin@example.com',
      subject: `New Inquiry: ${inquiry.propertyTitle}`,
      html: `
        <h2>New Property Inquiry</h2>
        <p><strong>Property:</strong> ${inquiry.propertyTitle}</p>
        <p><strong>Guest Name:</strong> ${inquiry.contactInfo.name}</p>
        <p><strong>Email:</strong> ${inquiry.contactInfo.email}</p>
        ${inquiry.contactInfo.phone ? `<p><strong>Phone:</strong> ${inquiry.contactInfo.phone}</p>` : ''}
        ${inquiry.checkIn ? `<p><strong>Check-in:</strong> ${inquiry.checkIn}</p>` : ''}
        ${inquiry.checkOut ? `<p><strong>Check-out:</strong> ${inquiry.checkOut}</p>` : ''}
        ${inquiry.guests ? `<p><strong>Guests:</strong> ${inquiry.guests}</p>` : ''}
        ${inquiry.message ? `<p><strong>Message:</strong><br>${inquiry.message}</p>` : ''}
        <p><strong>Timestamp:</strong> ${new Date(inquiry.timestamp).toLocaleString()}</p>
      `
    }

    // Auto-reply to guest
    const guestEmail = {
      to: inquiry.contactInfo.email,
      subject: inquiry.contactInfo.language === 'es'
        ? `Confirmación de consulta: ${inquiry.propertyTitle}`
        : `Inquiry Confirmation: ${inquiry.propertyTitle}`,
      html: inquiry.contactInfo.language === 'es' ? `
        <h2>Gracias por su consulta</h2>
        <p>Hemos recibido su consulta sobre la propiedad <strong>${inquiry.propertyTitle}</strong>.</p>
        <p>Nuestro equipo le responderá pronto, generalmente dentro de 24 horas.</p>
        <p>Si tiene alguna pregunta urgente, no dude en contactarnos por WhatsApp.</p>
        <br>
        <p>Saludos cordiales,<br>El equipo de Real Estate Portal</p>
      ` : `
        <h2>Thank you for your inquiry</h2>
        <p>We have received your inquiry about <strong>${inquiry.propertyTitle}</strong>.</p>
        <p>Our team will respond to you soon, typically within 24 hours.</p>
        <p>If you have any urgent questions, feel free to contact us via WhatsApp.</p>
        <br>
        <p>Best regards,<br>The Real Estate Portal Team</p>
      `
    }

    // Here you would send the actual emails
    console.log('Would send owner email:', ownerEmail)
    console.log('Would send guest email:', guestEmail)
    
    return true
  } catch (error) {
    console.error('Email notification error:', error)
    return false
  }
}