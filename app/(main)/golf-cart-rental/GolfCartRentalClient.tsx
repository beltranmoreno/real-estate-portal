'use client'

import { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { 
  CalendarDaysIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const golfCartOptions = [
  {
    id: 'standard-2',
    name: { en: 'Standard 2-Seater', es: 'Estándar 2 Plazas' },
    description: { 
      en: 'Perfect for couples or small groups. Electric powered with comfortable seating and storage space.',
      es: 'Perfecto para parejas o grupos pequeños. Eléctrico con asientos cómodos y espacio de almacenamiento.'
    },
    features: {
      en: ['2 passengers', 'Electric powered', 'Storage compartment', 'Windshield', 'LED lights'],
      es: ['2 pasajeros', 'Eléctrico', 'Compartimento de almacenamiento', 'Parabrisas', 'Luces LED']
    },
    image: '/images/golf-cart-standard-2.jpg',
    priceRange: '$40-60/day'
  },
  {
    id: 'deluxe-4',
    name: { en: 'Deluxe 4-Seater', es: 'Deluxe 4 Plazas' },
    description: { 
      en: 'Spacious cart for families or friend groups. Enhanced comfort with premium features.',
      es: 'Carrito espacioso para familias o grupos de amigos. Mayor comodidad con características premium.'
    },
    features: {
      en: ['4 passengers', 'Electric powered', 'Extended roof', 'Cup holders', 'USB charging port', 'Bluetooth speakers'],
      es: ['4 pasajeros', 'Eléctrico', 'Techo extendido', 'Portavasos', 'Puerto de carga USB', 'Altavoces Bluetooth']
    },
    image: '/images/golf-cart-deluxe-4.jpg',
    priceRange: '$70-90/day'
  },
  {
    id: 'luxury-6',
    name: { en: 'Luxury 6-Seater', es: 'Lujo 6 Plazas' },
    description: { 
      en: 'Our premium option for larger groups. Top-of-the-line features and maximum comfort.',
      es: 'Nuestra opción premium para grupos más grandes. Características de primera línea y máxima comodidad.'
    },
    features: {
      en: ['6 passengers', 'Electric powered', 'Premium leather seats', 'Air conditioning', 'GPS navigation', 'Cooler storage', 'Premium sound system'],
      es: ['6 pasajeros', 'Eléctrico', 'Asientos de cuero premium', 'Aire acondicionado', 'Navegación GPS', 'Almacenamiento refrigerado', 'Sistema de sonido premium']
    },
    image: '/images/golf-cart-luxury-6.jpg',
    priceRange: '$120-150/day'
  }
]

export default function GolfCartRentalClient() {
  const { locale, t } = useLocale()
  const [selectedCart, setSelectedCart] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    cartType: '',
    specialRequests: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - could integrate with an API or email service
    console.log('Golf cart rental request:', formData)
    alert(t({ 
      en: 'Thank you for your request! We will contact you soon.',
      es: '¡Gracias por su solicitud! Nos pondremos en contacto pronto.'
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/luxury-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-medium tracking-wide uppercase">
                {t({ en: 'Premium Transportation', es: 'Transporte Premium' })}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-light text-slate-900 mb-8 tracking-tight">
              {t({
                en: 'Golf Cart Rental',
                es: 'Alquiler de Carritos de Golf'
              })}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto font-light">
              {t({
                en: 'Experience the convenience and luxury of getting around Casa de Campo with our premium golf cart rental service. Choose from our fleet of well-maintained, comfortable carts.',
                es: 'Experimente la comodidad y el lujo de moverse por Casa de Campo con nuestro servicio premium de alquiler de carritos de golf. Elija de nuestra flota de carritos cómodos y bien mantenidos.'
              })}
            </p>
            <div className="mt-12 flex items-center justify-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
              <div className="mx-4 w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Golf Cart Options */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-medium tracking-wide uppercase mb-6">
              {t({ en: 'Our Fleet', es: 'Nuestra Flota' })}
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              {t({
                en: 'Choose Your Perfect Cart',
                es: 'Elija Su Carrito Perfecto'
              })}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              {t({
                en: 'From intimate rides for two to spacious luxury carts for the whole family, we have the perfect vehicle for your Casa de Campo adventure.',
                es: 'Desde paseos íntimos para dos hasta carritos de lujo espaciosos para toda la familia, tenemos el vehículo perfecto para su aventura en Casa de Campo.'
              })}
            </p>
          </div>

          <div className="space-y-16 max-w-7xl mx-auto">
            {golfCartOptions.map((cart, index) => (
              <div key={cart.id} className="group relative">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-slate-100">
                  <div className={`grid grid-cols-1 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                    {/* Image Section */}
                    <div className={`relative aspect-[5/4] lg:aspect-auto ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                      <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className="w-24 h-24 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 7h-3V6a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                            </svg>
                          </div>
                          <p className="text-green-700 font-medium">
                            {t({ en: 'Photo Coming Soon', es: 'Foto Próximamente' })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Price Badge */}
                      <div className="absolute top-6 right-6">
                        <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-800 rounded-full text-sm font-semibold shadow-lg">
                          {cart.priceRange}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <h3 className="text-3xl lg:text-4xl font-light text-slate-900 mb-4 tracking-tight">
                          {locale === 'en' ? cart.name.en : cart.name.es}
                        </h3>
                        <p className="text-lg text-slate-600 leading-relaxed font-light">
                          {locale === 'en' ? cart.description.en : cart.description.es}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="mb-8">
                        <h4 className="text-lg font-medium text-slate-800 mb-4">
                          {t({ en: 'Features', es: 'Características' })}
                        </h4>
                        <ul className="space-y-3">
                          {(locale === 'en' ? cart.features.en : cart.features.es).map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center">
                              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-slate-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Select Button */}
                      <div>
                        <button
                          onClick={() => {
                            setSelectedCart(cart.id)
                            setFormData(prev => ({ ...prev, cartType: cart.id }))
                            document.getElementById('rental-form')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className={`inline-flex items-center px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                            selectedCart === cart.id
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                              : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-green-600 hover:to-emerald-600 text-white'
                          }`}
                        >
                          {selectedCart === cart.id 
                            ? t({ en: 'Selected', es: 'Seleccionado' })
                            : t({ en: 'Select This Cart', es: 'Seleccionar Este Carrito' })
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Request Form */}
      <section id="rental-form" className="py-20 bg-gradient-to-br from-slate-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-medium tracking-wide uppercase mb-6">
              {t({ en: 'Book Your Cart', es: 'Reserve Su Carrito' })}
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
              {t({
                en: 'Rental Request Form',
                es: 'Formulario de Solicitud de Alquiler'
              })}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              {t({
                en: 'Complete the form below and we will contact you to confirm your golf cart rental and provide pickup details.',
                es: 'Complete el formulario a continuación y nos pondremos en contacto para confirmar su alquiler de carrito de golf y proporcionar detalles de recogida.'
              })}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-2xl font-light text-slate-900 mb-6">
                    {t({ en: 'Personal Information', es: 'Información Personal' })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'Full Name *', es: 'Nombre Completo *' })}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'Email Address *', es: 'Correo Electrónico *' })}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'Phone Number', es: 'Número de Teléfono' })}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="guests" className="block text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'Number of Passengers', es: 'Número de Pasajeros' })}
                      </label>
                      <select
                        id="guests"
                        name="guests"
                        value={formData.guests}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{t({ en: 'Select...', es: 'Seleccionar...' })}</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rental Details */}
                <div>
                  <h3 className="text-2xl font-light text-slate-900 mb-6">
                    {t({ en: 'Rental Details', es: 'Detalles del Alquiler' })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="checkIn" className="block text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'Start Date *', es: 'Fecha de Inicio *' })}
                      </label>
                      <input
                        type="date"
                        id="checkIn"
                        name="checkIn"
                        required
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="checkOut" className="block text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'End Date *', es: 'Fecha de Fin *' })}
                      </label>
                      <input
                        type="date"
                        id="checkOut"
                        name="checkOut"
                        required
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="cartType" className="block text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'Preferred Cart Type *', es: 'Tipo de Carrito Preferido *' })}
                      </label>
                      <select
                        id="cartType"
                        name="cartType"
                        required
                        value={formData.cartType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{t({ en: 'Select cart type...', es: 'Seleccionar tipo de carrito...' })}</option>
                        {golfCartOptions.map(cart => (
                          <option key={cart.id} value={cart.id}>
                            {locale === 'en' ? cart.name.en : cart.name.es} - {cart.priceRange}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-slate-700 mb-2">
                    {t({ en: 'Special Requests or Comments', es: 'Solicitudes Especiales o Comentarios' })}
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows={4}
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder={t({ 
                      en: 'Any special requirements, pickup location preferences, or additional requests...',
                      es: 'Cualquier requisito especial, preferencias de ubicación de recogida o solicitudes adicionales...'
                    })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="inline-flex items-center px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <CalendarDaysIcon className="w-5 h-5 mr-3" />
                    {t({ en: 'Submit Rental Request', es: 'Enviar Solicitud de Alquiler' })}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-slate-900 mb-4 tracking-tight">
              {t({ en: 'Need Help?', es: '¿Necesita Ayuda?' })}
            </h2>
            <p className="text-lg text-slate-600 font-light">
              {t({ 
                en: 'Contact us directly for immediate assistance or special arrangements.',
                es: 'Contáctenos directamente para asistencia inmediata o arreglos especiales.'
              })}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <a
              href="tel:+1809555000"
              className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <PhoneIcon className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-slate-700 font-medium">+1 (809) 555-0000</span>
            </a>
            
            <a
              href="mailto:golfcarts@casadecampo.com.do"
              className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <EnvelopeIcon className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-slate-700 font-medium">golfcarts@casadecampo.com.do</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}