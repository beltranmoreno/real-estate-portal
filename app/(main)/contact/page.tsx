'use client'

import React, { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle,
  Instagram,
} from 'lucide-react'

export default function ContactPage() {
  const { locale, t } = useLocale()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    propertyType: '',
    budget: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, locale }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setIsSubmitted(true)

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          propertyType: '',
          budget: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError(t({
        en: 'Failed to send message. Please try again or contact us directly.',
        es: 'Error al enviar el mensaje. Por favor intenta de nuevo o contáctanos directamente.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Reset budget when subject changes to prevent mismatched data
    if (name === 'subject') {
      setFormData({
        ...formData,
        [name]: value,
        budget: ''
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  // Determine if this is a rental inquiry
  const isRentalInquiry = formData.subject === 'renting'

  // All contact methods in a single list — phone, WhatsApp, email,
  // Instagram. Each row pairs an icon with the actionable contact.
  const PHONE = '+1 (829) 342-2566'
  const WHATSAPP_DIGITS = '18293422566'
  const EMAIL = 'leticiacoudrayrealestate@gmail.com'
  const INSTAGRAM = 'leticiacoudrayrealestate'

  const contactRows: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    href: string
    iconBg: string
    iconColor: string
  }> = [
    {
      icon: Phone,
      label: t({ en: 'Call', es: 'Llamar' }),
      value: PHONE,
      href: `tel:${PHONE}`,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp',
      value: PHONE,
      href: `https://wa.me/${WHATSAPP_DIGITS}`,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Mail,
      label: t({ en: 'Email', es: 'Correo' }),
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: `@${INSTAGRAM}`,
      href: `https://instagram.com/${INSTAGRAM}`,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-light mb-6">
              {t({
                en: 'Get in Touch',
                es: 'Ponte en Contacto'
              })}
            </h1>
            <p className="text-xl text-slate-600">
              {t({
                en: 'Ready to find your dream property in Casa de Campo? Send us a message and we will get back to you within 24 hours.',
                es: '¿Listo para encontrar la propiedad de tus sueños en Casa de Campo? Envíanos un mensaje y te responderemos en 24 horas.'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Contact Form */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-light text-slate-900 mb-4">
                {t({ en: 'Send us a Message', es: 'Envíanos un Mensaje' })}
              </h2>
              <p className="text-slate-600">
                {t({
                  en: 'Fill out the form below and our team will get back to you within 24 hours.',
                  es: 'Completa el formulario a continuación y nuestro equipo te contactará en 24 horas.'
                })}
              </p>
            </div>

            <Card className="border-slate-200 rounded-sm shadow-none">
              <CardContent className="p-6">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-light text-slate-900 mb-2">
                      {t({ en: 'Message Sent!', es: '¡Mensaje Enviado!' })}
                    </h3>
                    <p className="text-slate-600">
                      {t({
                        en: 'Thank you for contacting us. We\'ll get back to you soon!',
                        es: 'Gracias por contactarnos. ¡Te responderemos pronto!'
                      })}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {submitError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t({ en: 'Full Name', es: 'Nombre Completo' })} *
                        </label>
                        <Input
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder={t({ en: 'Your full name', es: 'Tu nombre completo' })}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t({ en: 'Email Address', es: 'Correo Electrónico' })} *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t({ en: 'your@email.com', es: 'tu@correo.com' })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t({ en: 'Phone Number', es: 'Número de Teléfono' })}
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (809) 555-0123"
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t({ en: 'Property Type', es: 'Tipo de Propiedad' })}
                        </label>
                        <select
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleInputChange}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        >
                          <option value="">{t({ en: 'Select type', es: 'Seleccionar tipo' })}</option>
                          <option value="villa">{t({ en: 'Villa', es: 'Villa' })}</option>
                          <option value="apartment">{t({ en: 'Apartment', es: 'Apartamento' })}</option>
                          <option value="condo">{t({ en: 'Condo', es: 'Condominio' })}</option>
                          <option value="house">{t({ en: 'House', es: 'Casa' })}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t({ en: 'Subject', es: 'Asunto' })} *
                        </label>
                        <select
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        >
                          <option value="">{t({ en: 'Select subject', es: 'Seleccionar asunto' })}</option>
                          <option value="buying">{t({ en: 'Buying Property', es: 'Comprar Propiedad' })}</option>
                          <option value="selling">{t({ en: 'Selling Property', es: 'Vender Propiedad' })}</option>
                          <option value="renting">{t({ en: 'Renting Property', es: 'Alquilar Propiedad' })}</option>
                          <option value="investment">{t({ en: 'Investment Inquiry', es: 'Consulta de Inversión' })}</option>
                          <option value="other">{t({ en: 'Other', es: 'Otro' })}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {isRentalInquiry
                            ? t({ en: 'Nightly Rate Range', es: 'Rango de Tarifa por Noche' })
                            : t({ en: 'Budget Range', es: 'Rango de Presupuesto' })
                          }
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        >
                          {isRentalInquiry ? (
                            <>
                              <option value="">{t({ en: 'Select nightly rate', es: 'Seleccionar tarifa' })}</option>
                              <option value="under-100">{'< $100/night'}</option>
                              <option value="100-250">$100 - $250/night</option>
                              <option value="250-500">$250 - $500/night</option>
                              <option value="500-1000">$500 - $1,000/night</option>
                              <option value="over-1000">{'> $1,000/night'}</option>
                            </>
                          ) : (
                            <>
                              <option value="">{t({ en: 'Select budget', es: 'Seleccionar presupuesto' })}</option>
                              <option value="under-200k">{'< $200,000'}</option>
                              <option value="200k-500k">$200,000 - $500,000</option>
                              <option value="500k-1m">$500,000 - $1,000,000</option>
                              <option value="1m-2m">$1,000,000 - $2,000,000</option>
                              <option value="over-2m">{'> $2,000,000'}</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'Message', es: 'Mensaje' })} *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={t({
                          en: 'Tell us about your property needs, preferred locations, timeline, or any specific requirements...',
                          es: 'Cuéntanos sobre tus necesidades de propiedad, ubicaciones preferidas, cronograma o requisitos específicos...'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 resize-none"
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
                      <Send className="w-5 h-5 mr-2" />
                      {isSubmitting
                        ? t({ en: 'Sending...', es: 'Enviando...' })
                        : t({ en: 'Send Message', es: 'Enviar Mensaje' })
                      }
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-light text-slate-900 mb-4">
                {t({ en: 'Contact Information', es: 'Información de Contacto' })}
              </h2>
              <p className="text-slate-600 mb-8">
                {t({
                  en: 'Prefer to reach out directly? Pick the channel you like best.',
                  es: '¿Prefieres contactarnos directamente? Elige el canal que prefieras.'
                })}
              </p>

              <Card className="border-slate-200 rounded-sm shadow-none">
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {contactRows.map((row, index) => {
                      const Icon = row.icon
                      const isExternal = row.href.startsWith('http')
                      return (
                        <li key={index}>
                          <a
                            href={row.href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className="flex items-center gap-3 group"
                          >
                            <div className={`w-10 h-10 ${row.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                              <Icon className={`w-4 h-4 ${row.iconColor}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-wider text-slate-500 font-light">
                                {row.label}
                              </p>
                              <p className="text-slate-800 group-hover:text-slate-900 truncate">
                                {row.value}
                              </p>
                            </div>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Quick Contact CTA */}
            <Card className="bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200 rounded-sm shadow-none">
              <CardContent className="p-6">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-xl font-light text-slate-900 mb-2">
                    {t({ en: 'Need Immediate Help?', es: '¿Necesitas Ayuda Inmediata?' })}
                  </h3>
                  <p className="text-slate-600 mb-4 text-sm">
                    {t({
                      en: 'Call us now for urgent property inquiries.',
                      es: 'Llámanos ahora para consultas urgentes.'
                    })}
                  </p>
                  <a href={`tel:${PHONE}`}>
                    <Button>
                      <Phone className="w-4 h-4 mr-2" />
                      {PHONE}
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
