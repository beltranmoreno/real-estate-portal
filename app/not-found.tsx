'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

export default function NotFound() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-slate-200 select-none">404</h1>
        </div>
        
        {/* Error Message */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {t({ en: 'Page Not Found', es: 'Página No Encontrada' })}
          </h2>
          <p className="text-slate-600 max-w-sm mx-auto">
            {t({ en: 'Looks like this property has already been rented! Let\'s find you another perfect vacation spot.', es: 'Parece que esta propiedad ya ha sido alquilada! Encontremos otro lugar perfecto para tus vacaciones.' })}
          </p>
          
          {/* Spanish translation */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              {t({ en: 'Page Not Found', es: 'Página No Encontrada' })}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {t({ en: 'Looks like this property has already been rented! Let\'s find you another perfect vacation spot.', es: 'Parece que esta propiedad ya ha sido alquilada! Encontremos otro lugar perfecto para tus vacaciones.' })}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" variant="default">
            <Link href="/" className="inline-flex items-center">
              <Home className="w-4 h-4 mr-2" />
              {t({ en: 'Go Home', es: 'Volver al Inicio' })}
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline">
            <Link href="/search" className="inline-flex items-center">
              <Search className="w-4 h-4 mr-2" />
              {t({ en: 'Search Properties', es: 'Buscar Propiedades' })}
            </Link>
          </Button>
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t({ en: 'Go back', es: 'Volver' })}
        </button>
        
        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2 text-2xl opacity-50">
          <span>🏖️</span>
          <span>🏡</span>
          <span>🌴</span>
        </div>
      </div>
    </div>
  )
}