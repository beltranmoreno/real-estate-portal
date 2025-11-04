'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Search,
  MapPin,
  CircleHelp,
} from 'lucide-react'

export default function CollectionNotFound() {
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
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl lg:text-5xl font-light text-slate-900 mb-4">
            {t({ 
              en: 'Collection Not Found', 
              es: 'Colección No Encontrada' 
            })}
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
            {t({ 
              en: "Sorry, we couldn't find the collection you're looking for. It may have been removed, expired, or the link might be incorrect.", 
              es: "Lo sentimos, no pudimos encontrar la colección que buscas. Puede haber sido removida, expirado, o el enlace podría ser incorrecto." 
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
          <div className="bg-white rounded-sm p-6 shadow-none text-left max-w-lg mx-auto">
            <h2 className="font-light text-slate-900 mb-3">
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
                    en: 'The collection may have expired', 
                    es: 'La colección puede haber expirado' 
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t({ 
                    en: 'Contact the collection organizer if you have questions', 
                    es: 'Contacta al organizador de la colección si tienes preguntas' 
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  {t({ 
                    en: 'Browse our available properties instead', 
                    es: 'Explora nuestras propiedades disponibles' 
                  })}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}