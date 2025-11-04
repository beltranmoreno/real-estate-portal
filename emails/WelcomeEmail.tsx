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
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  email: string;
  locale?: 'en' | 'es';
  featuredProperty?: {
    title: string;
    image: string;
    bedrooms: number;
    price: string;
    slug: string;
  };
}

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com';

export const WelcomeEmail = ({
  email,
  locale = 'en',
  featuredProperty,
}: WelcomeEmailProps) => {
  const isSpanish = locale === 'es';

  const text = {
    preview: isSpanish
      ? '¡Bienvenido al Newsletter de Casa de Campo!'
      : 'Welcome to Casa de Campo Newsletter!',
    title: isSpanish
      ? '¡Bienvenido al Paraíso!'
      : 'Welcome to Paradise!',
    greeting: isSpanish
      ? `Hola,`
      : `Hello,`,
    intro: isSpanish
      ? 'Gracias por suscribirte a nuestro newsletter exclusivo. Ahora tendrás acceso prioritario a:'
      : 'Thank you for subscribing to our exclusive newsletter. You now have priority access to:',
    benefits: isSpanish
      ? [
          '🏝️ Propiedades de lujo recién listadas',
          '🎯 Ofertas exclusivas solo para suscriptores',
          '🏌️ Actualizaciones del resort y eventos',
          '💎 Consejos y guías de estilo de vida',
        ]
      : [
          '🏝️ Newly listed luxury properties',
          '🎯 Exclusive subscriber-only deals',
          '🏌️ Resort updates and events',
          '💎 Lifestyle tips and guides',
        ],
    featuredTitle: isSpanish ? 'Propiedad Destacada' : 'Featured Property',
    featuredSubtitle: isSpanish
      ? 'Disponible ahora para tu próximo escape al paraíso'
      : 'Available now for your next paradise escape',
    ctaText: isSpanish ? 'Ver Propiedad' : 'View Property',
    browseText: isSpanish ? 'Explorar Todas las Propiedades' : 'Browse All Properties',
    footer: isSpanish
      ? 'Estamos aquí para ayudarte a encontrar tu paraíso perfecto.'
      : 'We\'re here to help you find your perfect paradise.',
    contact: isSpanish ? 'Contacto' : 'Contact',
    unsubscribe: isSpanish
      ? 'Ya no deseas recibir estos correos?'
      : 'No longer want to receive these emails?',
    unsubscribeLink: isSpanish ? 'Darse de baja' : 'Unsubscribe',
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

          {/* Hero Section */}
          <Section style={hero}>
            <Img
              src="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&h=600&fit=crop"
              alt="Casa de Campo Paradise"
              width="600"
              height="300"
              style={heroImage}
            />
            <div style={heroOverlay}>
              <Heading style={heroTitle}>{text.title}</Heading>
            </div>
          </Section>

          {/* Welcome Content */}
          <Section style={contentSection}>
            <Text style={greeting}>{text.greeting}</Text>
            <Text style={paragraph}>{text.intro}</Text>

            {text.benefits.map((benefit: string, index: number) => (
              <Text key={index} style={benefitItem}>
                {benefit}
              </Text>
            ))}
          </Section>

          {/* Featured Property */}
          {featuredProperty && (
            <>
              <Hr style={divider} />
              <Section style={contentSection}>
                <Heading as="h2" style={sectionTitle}>
                  {text.featuredTitle}
                </Heading>
                <Text style={sectionSubtitle}>{text.featuredSubtitle}</Text>

                <div style={propertyCard}>
                  <Img
                    src={featuredProperty.image}
                    alt={featuredProperty.title}
                    width="560"
                    height="350"
                    style={propertyImage}
                  />
                  <div style={propertyDetails}>
                    <Heading as="h3" style={propertyTitle}>
                      {featuredProperty.title}
                    </Heading>
                    <Row>
                      <Column>
                        <Text style={propertyMeta}>
                          🛏️ {featuredProperty.bedrooms} {isSpanish ? 'Habitaciones' : 'Bedrooms'}
                        </Text>
                      </Column>
                      <Column align="right">
                        <Text style={propertyPrice}>{featuredProperty.price}</Text>
                      </Column>
                    </Row>
                    <Button
                      href={`${DOMAIN}/property/${featuredProperty.slug}`}
                      style={button}
                    >
                      {text.ctaText}
                    </Button>
                  </div>
                </div>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* Browse All Properties CTA */}
          <Section style={ctaSection}>
            <Button
              href={`${DOMAIN}/search`}
              style={secondaryButton}
            >
              {text.browseText}
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>{text.footer}</Text>
            <Hr style={footerDivider} />
            <Text style={footerTitle}>{text.contact}</Text>
            <Text style={footerContact}>
              📞 +1 (829) 342-2566<br />
              ✉️ leticiacoudrayrealestate@gmail.com<br />
              📍 La Romana, Dominican Republic
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerSmall}>
              {text.unsubscribe}{' '}
              <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={link}>
                {text.unsubscribeLink}
              </a>
            </Text>
            <Text style={footerSmall}>
              © 2025 Leticia Coudray Saladin Real Estate & Services
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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

const hero = {
  position: 'relative' as const,
  width: '100%',
  overflow: 'hidden',
};

const heroImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const heroOverlay = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center' as const,
  width: '100%',
};

const heroTitle = {
  fontSize: '42px',
  fontWeight: '300',
  color: '#ffffff',
  margin: '0',
  textShadow: '0 2px 20px rgba(0,0,0,0.5)',
  letterSpacing: '1px',
};

const contentSection = {
  padding: '40px 30px',
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

const benefitItem = {
  fontSize: '15px',
  lineHeight: '28px',
  color: '#334155',
  marginBottom: '8px',
  paddingLeft: '10px',
};

const sectionTitle = {
  fontSize: '28px',
  fontWeight: '300',
  color: '#1e293b',
  marginBottom: '10px',
  textAlign: 'center' as const,
  letterSpacing: '0.5px',
};

const sectionSubtitle = {
  fontSize: '14px',
  color: '#64748b',
  textAlign: 'center' as const,
  marginBottom: '30px',
  fontWeight: '300',
};

const propertyCard = {
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const propertyImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const propertyDetails = {
  padding: '24px',
};

const propertyTitle = {
  fontSize: '22px',
  fontWeight: '300',
  color: '#1e293b',
  marginBottom: '16px',
  letterSpacing: '0.3px',
};

const propertyMeta = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 16px 0',
};

const propertyPrice = {
  fontSize: '20px',
  fontWeight: '500',
  color: '#0f172a',
  margin: '0 0 16px 0',
  textAlign: 'right' as const,
};

const button = {
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 28px',
  letterSpacing: '0.5px',
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
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '30px 0',
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

const footerTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
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

const link = {
  color: '#0f172a',
  textDecoration: 'underline',
};
