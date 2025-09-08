'use client'

import React from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { Shield, Eye, Database, Lock } from 'lucide-react'

export default function PrivacyPolicy() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t({ 
                en: 'Privacy Policy', 
                es: 'Política de Privacidad' 
              })}
            </h1>
            <p className="text-slate-600 text-lg">
              {t({
                en: 'Last updated: January 2025',
                es: 'Última actualización: Enero 2025'
              })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <div className="space-y-8">
              
              {/* Information We Collect */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'Information We Collect',
                      es: 'Información que Recopilamos'
                    })}
                  </h2>
                </div>
                <p className="text-slate-700 mb-4">
                  {t({
                    en: 'We collect information you provide directly to us, such as when you create an account, make an inquiry, or contact us.',
                    es: 'Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta, haces una consulta o nos contactas.'
                  })}
                </p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>{t({ en: 'Contact information (name, email, phone)', es: 'Información de contacto (nombre, correo, teléfono)' })}</li>
                  <li>{t({ en: 'Property preferences and search history', es: 'Preferencias de propiedades e historial de búsqueda' })}</li>
                  <li>{t({ en: 'Communication records', es: 'Registros de comunicación' })}</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'How We Use Your Information',
                      es: 'Cómo Usamos tu Información'
                    })}
                  </h2>
                </div>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>{t({ en: 'Provide and improve our services', es: 'Proporcionar y mejorar nuestros servicios' })}</li>
                  <li>{t({ en: 'Send you property recommendations', es: 'Enviarte recomendaciones de propiedades' })}</li>
                  <li>{t({ en: 'Respond to your inquiries', es: 'Responder a tus consultas' })}</li>
                  <li>{t({ en: 'Send important updates about our services', es: 'Enviar actualizaciones importantes sobre nuestros servicios' })}</li>
                </ul>
              </section>

              {/* Data Protection */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'Data Protection',
                      es: 'Protección de Datos'
                    })}
                  </h2>
                </div>
                <p className="text-slate-700 mb-4">
                  {t({
                    en: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
                    es: 'Implementamos medidas técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.'
                  })}
                </p>
              </section>

              {/* Contact */}
              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t({
                    en: 'Contact Us',
                    es: 'Contáctanos'
                  })}
                </h2>
                <p className="text-slate-700">
                  {t({
                    en: 'If you have any questions about this Privacy Policy, please contact us at:',
                    es: 'Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en:'
                  })}
                </p>
                <p className="text-slate-900 font-medium mt-2">privacy@drproperties.com</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}