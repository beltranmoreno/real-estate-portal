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
          <h2 className="text-2xl font-normal text-slate-900">
            {t({ en: 'Page Not Found', es: 'Página No Encontrada' })}
          </h2>
          <p className="text-slate-600 max-w-sm mx-auto">
            {t({
              en: 'This page seems to have taken a permanent vacation. But don\'t worry—your perfect paradise is just a click away!',
              es: 'Esta página parece haberse ido de vacaciones permanentes. ¡Pero no te preocupes—tu paraíso perfecto está a solo un clic de distancia!'
            })}
          </p>  
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center pb-8">
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
        <Button size="lg" variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t({ en: 'Go back', es: 'Volver' })}
        </Button>
        
      </div>
    </div>
  )
}