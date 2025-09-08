'use client'

import React from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { Cookie, Settings, Info, Target } from 'lucide-react'

export default function CookiePolicy() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cookie className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t({ 
                en: 'Cookie Policy', 
                es: 'Política de Cookies' 
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
              
              {/* What are cookies */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'What Are Cookies?',
                      es: '¿Qué son las Cookies?'
                    })}
                  </h2>
                </div>
                <p className="text-slate-700">
                  {t({
                    en: 'Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.',
                    es: 'Las cookies son pequeños archivos de texto que se colocan en tu computadora o dispositivo móvil cuando visitas nuestro sitio web. Nos ayudan a proporcionarte una mejor experiencia al recordar tus preferencias y entender cómo usas nuestro sitio.'
                  })}
                </p>
              </section>

              {/* Types of cookies */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'Types of Cookies We Use',
                      es: 'Tipos de Cookies que Usamos'
                    })}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t({ en: 'Essential Cookies', es: 'Cookies Esenciales' })}
                    </h3>
                    <p className="text-slate-700 text-sm">
                      {t({
                        en: 'These cookies are necessary for the website to function and cannot be switched off.',
                        es: 'Estas cookies son necesarias para que el sitio web funcione y no se pueden desactivar.'
                      })}
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t({ en: 'Performance Cookies', es: 'Cookies de Rendimiento' })}
                    </h3>
                    <p className="text-slate-700 text-sm">
                      {t({
                        en: 'These cookies help us understand how visitors interact with our website.',
                        es: 'Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.'
                      })}
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t({ en: 'Functionality Cookies', es: 'Cookies de Funcionalidad' })}
                    </h3>
                    <p className="text-slate-700 text-sm">
                      {t({
                        en: 'These cookies remember your preferences and provide enhanced features.',
                        es: 'Estas cookies recuerdan tus preferencias y proporcionan características mejoradas.'
                      })}
                    </p>
                  </div>
                </div>
              </section>

              {/* Managing cookies */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t({
                      en: 'Managing Your Cookie Preferences',
                      es: 'Gestionar tus Preferencias de Cookies'
                    })}
                  </h2>
                </div>
                <p className="text-slate-700 mb-4">
                  {t({
                    en: 'You can control and manage cookies in various ways. Please note that removing or blocking cookies can impact your user experience.',
                    es: 'Puedes controlar y gestionar las cookies de varias maneras. Ten en cuenta que eliminar o bloquear cookies puede afectar tu experiencia de usuario.'
                  })}
                </p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>{t({ en: 'Browser settings: Most browsers allow you to manage cookies', es: 'Configuración del navegador: La mayoría de navegadores te permiten gestionar cookies' })}</li>
                  <li>{t({ en: 'Cookie consent: You can update your preferences anytime', es: 'Consentimiento de cookies: Puedes actualizar tus preferencias en cualquier momento' })}</li>
                  <li>{t({ en: 'Third-party tools: Use privacy tools to manage tracking', es: 'Herramientas de terceros: Usa herramientas de privacidad para gestionar el seguimiento' })}</li>
                </ul>
              </section>

              {/* Contact */}
              <section className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t({
                    en: 'Questions About Cookies',
                    es: 'Preguntas sobre Cookies'
                  })}
                </h2>
                <p className="text-slate-700">
                  {t({
                    en: 'If you have any questions about our use of cookies, please contact us at:',
                    es: 'Si tienes alguna pregunta sobre nuestro uso de cookies, por favor contáctanos en:'
                  })}
                </p>
                <p className="text-slate-900 font-medium mt-2">cookies@drproperties.com</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}