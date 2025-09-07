'use client'

import React from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'default' | 'minimal'
}

export default function LanguageSwitcher({ className, variant = 'default' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity",
          className
        )}
      >
        <Globe className="w-4 h-4" />
        <span>{locale.toUpperCase()}</span>
      </button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={locale === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLocale('en')}
        className="min-w-[3rem]"
      >
        EN
      </Button>
      <Button
        variant={locale === 'es' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLocale('es')}
        className="min-w-[3rem]"
      >
        ES
      </Button>
    </div>
  )
}