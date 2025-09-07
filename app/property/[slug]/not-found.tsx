'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Search,
  ArrowLeft,
  MapPin
} from 'lucide-react'

export default function PropertyNotFound() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-[150px] font-bold text-slate-200 leading-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Home className="w-20 h-20 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {t({ 
              en: 'Property Not Found', 
              es: 'Propiedad No Encontrada' 
            })}
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
            {t({ 
              en: "Sorry, we couldn't find the property you're looking for. It may have been moved, sold, or the link might be incorrect.", 
              es: "Lo sentimos, no pudimos encontrar la propiedad que buscas. Puede haber sido movida, vendida, o el enlace podría ser incorrecto." 
            })}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/search">
                <Search className="w-5 h-5 mr-2" />
                {t({ 
                  en: 'Browse All Properties', 
                  es: 'Ver Todas las Propiedades' 
                })}
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                {t({ 
                  en: 'Back to Home', 
                  es: 'Volver al Inicio' 
                })}
              </Link>
            </Button>
          </div>

          {/* Helpful Suggestions */}
          <div className="bg-white rounded-lg p-6 shadow-sm text-left max-w-lg mx-auto">
            <h2 className="font-semibold text-slate-900 mb-3">
              {t({ 
                en: 'What you can do:', 
                es: 'Lo que puedes hacer:' 
              })}
            </h2>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t({ 
                    en: 'Check the URL for any typos', 
                    es: 'Verifica la URL por errores tipográficos' 
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t({ 
                    en: 'Use the search to find similar properties', 
                    es: 'Usa la búsqueda para encontrar propiedades similares' 
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t({ 
                    en: 'Browse our featured properties on the homepage', 
                    es: 'Explora nuestras propiedades destacadas en la página principal' 
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t({ 
                    en: 'Contact us if you believe this is an error', 
                    es: 'Contáctanos si crees que esto es un error' 
                  })}
                </span>
              </li>
            </ul>
          </div>

          {/* Popular Areas */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              {t({ 
                en: 'Popular Areas', 
                es: 'Áreas Populares' 
              })}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Casa de Campo', count: '50+' },
                { name: 'Punta Cana', count: '30+' },
                { name: 'La Romana', count: '25+' },
              ].map((area) => (
                <Link
                  key={area.name}
                  href={`/search?area=${area.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{area.name}</div>
                    <div className="text-sm text-slate-500">
                      {area.count} {t({ en: 'properties', es: 'propiedades' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}