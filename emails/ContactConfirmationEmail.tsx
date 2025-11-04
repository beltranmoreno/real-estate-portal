import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface ContactConfirmationEmailProps {
  name: string;
  locale?: 'en' | 'es';
}

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com';

export const ContactConfirmationEmail = ({
  name,
  locale = 'en',
}: ContactConfirmationEmailProps) => {
  const isSpanish = locale === 'es';

  const text = {
    preview: isSpanish
      ? 'Hemos recibido tu mensaje'
      : 'We\'ve received your message',
    title: isSpanish
      ? '¡Gracias por contactarnos!'
      : 'Thank You for Reaching Out!',
    greeting: isSpanish
      ? `Hola ${name},`
      : `Hello ${name},`,
    intro: isSpanish
      ? 'Hemos recibido tu mensaje y un miembro de nuestro equipo te contactará pronto. Nos esforzamos por responder dentro de 24 horas.'
      : 'We\'ve received your message and a member of our team will contact you soon. We strive to respond within 24 hours.',
    whatNext: isSpanish ? '¿Qué Sigue?' : 'What\'s Next?',
    steps: isSpanish
      ? [
          'Revisaremos tu consulta cuidadosamente',
          'Un especialista te contactará dentro de 24 horas',
          'Te ayudaremos a encontrar tu propiedad perfecta',
        ]
      : [
          'We\'ll review your inquiry carefully',
          'A specialist will contact you within 24 hours',
          'We\'ll help you find your perfect property',
        ],
    urgent: isSpanish
      ? '¿Necesitas asistencia inmediata?'
      : 'Need Immediate Assistance?',
    urgentText: isSpanish
      ? 'Si tienes una pregunta urgente, no dudes en llamarnos o enviarnos un mensaje de WhatsApp.'
      : 'If you have an urgent question, feel free to call us or send us a WhatsApp message.',
    callUs: isSpanish ? 'Llámanos' : 'Call Us',
    whatsapp: 'WhatsApp',
    browseText: isSpanish
      ? 'Mientras tanto, explora nuestras propiedades'
      : 'In the meantime, explore our properties',
    footer: isSpanish
      ? 'Esperamos ayudarte a encontrar tu paraíso perfecto.'
      : 'We look forward to helping you find your perfect paradise.',
  };

  return (
    <Html>
      <Head />
      <Preview>{text.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${DOMAIN}/images/Logo_LCS_Real_Estate.png`}
              alt="Leticia Coudray Real Estate"
              width="180"
              height="60"
              style={logo}
            />
          </Section>

          {/* Success Icon */}
          <Section style={iconSection}>
            <div style={checkmarkCircle}>✓</div>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={title}>{text.title}</Heading>
            <Text style={greeting}>{text.greeting}</Text>
            <Text style={paragraph}>{text.intro}</Text>
          </Section>

          <Hr style={divider} />

          {/* What's Next Section */}
          <Section style={contentSection}>
            <Heading as="h2" style={sectionTitle}>
              {text.whatNext}
            </Heading>
            {text.steps.map((step: string, index: number) => (
              <div key={index} style={stepItem}>
                <div style={stepNumber}>{index + 1}</div>
                <Text style={stepText}>{step}</Text>
              </div>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Urgent Assistance */}
          <Section style={urgentSection}>
            <Heading as="h3" style={urgentTitle}>
              {text.urgent}
            </Heading>
            <Text style={urgentText}>{text.urgentText}</Text>
            <div style={buttonGroup}>
              <Button
                href="tel:+18293422566"
                style={button}
              >
                📞 {text.callUs}
              </Button>
              <Button
                href="https://wa.me/18293422566"
                style={whatsappButton}
              >
                💬 {text.whatsapp}
              </Button>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Browse Properties CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>{text.browseText}</Text>
            <Button
              href={`${DOMAIN}/search`}
              style={secondaryButton}
            >
              {isSpanish ? 'Ver Propiedades' : 'Browse Properties'}
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>{text.footer}</Text>
            <Hr style={footerDivider} />
            <Text style={footerContact}>
              📞 +1 (829) 342-2566<br />
              ✉️ leticiacoudrayrealestate@gmail.com<br />
              📍 La Romana, Dominican Republic
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerSmall}>
              © 2025 Leticia Coudray Saladin Real Estate & Services
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
};

const header = {
  padding: '30px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
};

const logo = {
  margin: '0 auto',
};

const iconSection = {
  padding: '20px',
  textAlign: 'center' as const,
};

const checkmarkCircle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '48px',
  lineHeight: '80px',
  textAlign: 'center' as const,
  margin: '0 auto',
  fontWeight: 'bold',
};

const contentSection = {
  padding: '0 40px',
};

const title = {
  fontSize: '32px',
  fontWeight: '300',
  color: '#1e293b',
  textAlign: 'center' as const,
  marginBottom: '20px',
  letterSpacing: '0.5px',
};

const greeting = {
  fontSize: '18px',
  color: '#334155',
  marginBottom: '20px',
  fontWeight: '400',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#475569',
  marginBottom: '20px',
  fontWeight: '300',
};

const sectionTitle = {
  fontSize: '24px',
  fontWeight: '400',
  color: '#1e293b',
  marginBottom: '24px',
  textAlign: 'center' as const,
  letterSpacing: '0.3px',
};

const stepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const stepNumber = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#0f172a',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '32px',
  textAlign: 'center' as const,
  marginRight: '16px',
  flexShrink: 0,
};

const stepText = {
  fontSize: '15px',
  lineHeight: '32px',
  color: '#475569',
  margin: '0',
  fontWeight: '300',
};

const urgentSection = {
  padding: '30px 40px',
  backgroundColor: '#fef3c7',
  textAlign: 'center' as const,
};

const urgentTitle = {
  fontSize: '20px',
  fontWeight: '500',
  color: '#78350f',
  marginBottom: '12px',
};

const urgentText = {
  fontSize: '14px',
  color: '#92400e',
  marginBottom: '20px',
  fontWeight: '300',
};

const buttonGroup = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
};

const button = {
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  letterSpacing: '0.3px',
  margin: '0 6px',
};

const whatsappButton = {
  backgroundColor: '#25D366',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  letterSpacing: '0.3px',
  margin: '0 6px',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  border: '2px solid #0f172a',
  borderRadius: '6px',
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  letterSpacing: '0.5px',
};

const ctaSection = {
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const ctaText = {
  fontSize: '15px',
  color: '#64748b',
  marginBottom: '16px',
  fontWeight: '300',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '30px 40px',
};

const footer = {
  padding: '30px',
  backgroundColor: '#f8fafc',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '15px',
  color: '#475569',
  marginBottom: '20px',
  fontWeight: '300',
};

const footerContact = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#64748b',
  marginBottom: '20px',
};

const footerDivider = {
  borderColor: '#e2e8f0',
  margin: '20px auto',
  width: '80%',
};

const footerSmall = {
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '8px',
  lineHeight: '18px',
};
