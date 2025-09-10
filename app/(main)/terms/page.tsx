'use client'

import React from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { FileText, Users, AlertTriangle, Scale } from 'lucide-react'

export default function TermsOfService() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t({ 
                en: 'Terms of Service', 
                es: 'Términos de Servicio' 
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
              
              {/* Acceptance */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'Acceptance of Terms',
                      es: 'Aceptación de Términos'
                    })}
                  </h2>
                </div>
                <p className="text-slate-700">
                  {t({
                    en: 'By accessing and using DR Properties website and services, you accept and agree to be bound by the terms and provision of this agreement.',
                    es: 'Al acceder y usar el sitio web y servicios de DR Propiedades, aceptas y acuerdas estar sujeto a los términos y disposiciones de este acuerdo.'
                  })}
                </p>
              </section>

              {/* Services */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'Use of Services',
                      es: 'Uso de Servicios'
                    })}
                  </h2>
                </div>
                <p className="text-slate-700 mb-4">
                  {t({
                    en: 'Our platform provides real estate listing and rental services. You agree to use our services only for lawful purposes.',
                    es: 'Nuestra plataforma proporciona servicios de listado y alquiler de bienes raíces. Aceptas usar nuestros servicios solo para propósitos legales.'
                  })}
                </p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>{t({ en: 'You must be at least 18 years old to use our services', es: 'Debes tener al menos 18 años para usar nuestros servicios' })}</li>
                  <li>{t({ en: 'You are responsible for the accuracy of information you provide', es: 'Eres responsable de la precisión de la información que proporcionas' })}</li>
                  <li>{t({ en: 'You may not use our services for illegal activities', es: 'No puedes usar nuestros servicios para actividades ilegales' })}</li>
                </ul>
              </section>

              {/* Limitations */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'Limitations of Liability',
                      es: 'Limitaciones de Responsabilidad'
                    })}
                  </h2>
                </div>
                <p className="text-slate-700">
                  {t({
                    en: 'DR Properties shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.',
                    es: 'DR Propiedades no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo, incluyendo sin limitación, pérdida de ganancias, datos, uso, buena voluntad u otras pérdidas intangibles.'
                  })}
                </p>
              </section>

              {/* Contact */}
              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t({
                    en: 'Questions About Terms',
                    es: 'Preguntas sobre los Términos'
                  })}
                </h2>
                <p className="text-slate-700">
                  {t({
                    en: 'If you have any questions about these Terms of Service, please contact us at:',
                    es: 'Si tienes alguna pregunta sobre estos Términos de Servicio, por favor contáctanos en:'
                  })}
                </p>
                <p className="text-slate-900 font-medium mt-2">legal@drproperties.com</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}