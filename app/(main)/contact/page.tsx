'use client'

import React, { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  User,
  Building2,
  Globe,
  Users,
  Star,
  Award
} from 'lucide-react'
import Image from 'next/image'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setTimeout(() => {
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
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: Phone,
      title: t({ en: 'Call Us', es: 'Llámanos' }),
      details: [
        '+1 (829) 342-2566',
      ],
      subtitle: t({ en: 'Or leave a message and we\'ll call you back', es: 'O deja un mensaje y te devolveremos la llamada' })
    },
    {
      icon: Mail,
      title: t({ en: 'Email Us', es: 'Escríbenos' }),
      details: [
        'leticiacoudrayrealestate@gmail.com',
      ],
      subtitle: t({ en: 'We\'ll try to respond within 24 hours', es: 'Intentaremos responder en 24 horas' })
    },
  ]

  const leticiaInfo = {
    name: 'Leticia Coudray Saladin',
    role: t({ en: 'Vacation Property Specialist', es: 'Especialista en Propiedades Vacacionales' }),
    phone: '+1 (829) 342-2566',
    whatsapp: '+1 (829) 342-2566',
    email: 'leticiacoudrayrealestate@gmail.com',
    about: t({
      en: 'With over 10 years of experience in luxury real estate in Casa de Campo, Leticia brings unparalleled expertise and dedication to every client. Her deep knowledge of the area, combined with a passion for matching clients with their perfect property, has made her one of the most trusted names in Dominican Republic real estate.',
      es: 'Con más de 10 años de experiencia en bienes raíces de lujo en Casa de Campo, Leticia aporta experiencia y dedicación incomparables a cada cliente. Su profundo conocimiento del área, combinado con una pasión por conectar clientes con su propiedad perfecta, la ha convertido en uno de los nombres más confiables en bienes raíces de República Dominicana.'
    }),
    specialties: [
      t({ en: 'Luxury Villa Rentals', es: 'Alquiler de Villas de Lujo' }),
      t({ en: 'Vacation Home Rentals', es: 'Alquiler de Casas Vacacionales' }),
      t({ en: 'Investment Properties', es: 'Propiedades de Inversión' }),
      t({ en: 'Property Management', es: 'Gestión de Propiedades' })
    ]
  }

  const stats = [
    {
      icon: Building2,
      number: '100+',
      label: t({ en: 'Properties Listed', es: 'Propiedades Listadas' })
    },
    {
      icon: Users,
      number: '1,200+',
      label: t({ en: 'Happy Clients', es: 'Clientes Satisfechos' })
    },
    {
      icon: Star,
      number: '4.9/5',
      label: t({ en: 'Client Rating', es: 'Calificación Cliente' })
    },
    {
      icon: Award,
      number: '15+',
      label: t({ en: 'Years Experience', es: 'Años de Experiencia' })
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-light mb-6">
              {t({ 
                en: 'Get in Touch', 
                es: 'Ponte en Contacto' 
              })}
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              {t({
                en: 'Ready to find your dream property in Casa de Campo? Our expert team is here to help you every step of the way.',
                es: '¿Listo para encontrar la propiedad de tus sueños en Casa de Campo? Nuestro equipo experto está aquí para ayudarte en cada paso.'
              })}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                  <div className="text-2xl font-normal">{stat.number}</div>
                  <div className="text-slate-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form - Sticky */}
          <div className="">
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

            <Card className="border-slate-200 rounded-sm shadow-none md:sticky md:top-8 md:self-start">
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
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{t({ en: 'Select type', es: 'Seleccionar tipo' })}</option>
                          <option value="villa">{t({ en: 'Villa', es: 'Villa' })}</option>
                          <option value="apartment">{t({ en: 'Apartment', es: 'Apartamento' })}</option>
                          <option value="condo">{t({ en: 'Condo', es: 'Condominio' })}</option>
                          <option value="house">{t({ en: 'House', es: 'Casa' })}</option>
                          <option value="commercial">{t({ en: 'Commercial', es: 'Comercial' })}</option>
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
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          {t({ en: 'Budget Range', es: 'Rango de Presupuesto' })}
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{t({ en: 'Select budget', es: 'Seleccionar presupuesto' })}</option>
                          <option value="under-200k">{'< $200,000'}</option>
                          <option value="200k-500k">$200,000 - $500,000</option>
                          <option value="500k-1m">$500,000 - $1,000,000</option>
                          <option value="1m-2m">$1,000,000 - $2,000,000</option>
                          <option value="over-2m">{'> $2,000,000'}</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg">
                      <Send className="w-5 h-5 mr-2" />
                      {t({ en: 'Send Message', es: 'Enviar Mensaje' })}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-light text-slate-900 mb-8">
                {t({ en: 'Contact Information', es: 'Información de Contacto' })}
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6  text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-light text-slate-900 mb-1">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-slate-700">{detail}</p>
                      ))}
                      <p className="text-sm text-slate-500 mt-1">{info.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About Leticia */}
            <div>
              <h3 className="text-2xl font-light text-slate-900 mb-6">
                {t({ en: 'Meet Leticia', es: 'Conoce a Leticia' })}
              </h3>

              <Card className="border-slate-200 rounded-sm shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Image src="/images/leticia-avatar.jpg" alt={leticiaInfo.name} width={96} height={96} className="rounded-sm object-cover" />
                    <div>
                      <h4 className="text-xl font-light text-slate-900">{leticiaInfo.name}</h4>
                      <p className="text-blue-600 text-sm font-medium">{leticiaInfo.role}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-6">
                    {leticiaInfo.about}
                  </p>

                  {/* Specialties */}
                  <div className="mb-6">
                    <h5 className="text-sm font-light text-slate-900 mb-3">
                      {t({ en: 'Specialties', es: 'Especialidades' })}
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {leticiaInfo.specialties.map((specialty, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {specialty}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="border-t border-slate-200 pt-6">
                    <h5 className="text-sm font-light text-slate-900 mb-3">
                      {t({ en: 'Contact Leticia', es: 'Contactar a Leticia' })}
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <a href={`tel:${leticiaInfo.phone}`} target="_blank" className="text-slate-700 hover:text-blue-600 transition-colors">
                          {leticiaInfo.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        </div>
                        <a href={`https://wa.me/${leticiaInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-slate-700 hover:text-green-600 transition-colors">
                          {leticiaInfo.whatsapp} {t({ en: '(WhatsApp)', es: '(WhatsApp)' })}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <a href={`mailto:${leticiaInfo.email}`} target="_blank" className="text-slate-700 hover:text-blue-600 transition-colors">
                          {leticiaInfo.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Contact */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-sm shadow-none">
              <CardContent className="p-6">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-light text-slate-900 mb-2">
                    {t({ en: 'Need Immediate Help?', es: '¿Necesitas Ayuda Inmediata?' })}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {t({
                      en: 'Call us now for urgent property inquiries',
                      es: 'Llámanos ahora para consultas urgentes de propiedades'
                    })}
                  </p>
                  <a href="tel:+18293422566" className="inline-block">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Phone className="w-4 h-4 mr-2" />
                      +1 (829) 342-2566
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