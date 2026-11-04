'use client'

import { tFor } from '@/lib/i18n'

export interface AddressValues {
  addressLine1: string
  addressLine2: string
  city: string
  region: string
  postalCode: string
  country: string
}

export const EMPTY_ADDRESS: AddressValues = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
}

export const hasAddress = (a: Partial<AddressValues>) => Object.values(a).some((v) => v?.trim())

const inputClass =
  'w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800'

/** A guest's postal address as separate fields (admin forms). */
export function AddressFields({
  value,
  onChange,
  locale = 'en',
}: {
  value: AddressValues
  onChange: (v: AddressValues) => void
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const field = (key: keyof AddressValues, label: string, autoComplete: string) => (
    <label className="block space-y-1.5">
      <span className="text-sm font-light text-stone-700">{label}</span>
      <input
        value={value[key]}
        onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        autoComplete={autoComplete}
        className={inputClass}
      />
    </label>
  )
  return (
    <div className="space-y-3">
      {field('addressLine1', t('Street address', 'Dirección'), 'address-line1')}
      {field('addressLine2', t('Apartment, suite… (optional)', 'Apartamento, suite… (opcional)'), 'address-line2')}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('city', t('City', 'Ciudad'), 'address-level2')}
        {field('region', t('State / province', 'Estado / provincia'), 'address-level1')}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('postalCode', t('Postal code', 'Código postal'), 'postal-code')}
        {field('country', t('Country', 'País'), 'country-name')}
      </div>
    </div>
  )
}
