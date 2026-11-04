'use client'

import { ChevronDown, FileText } from 'lucide-react'
import type { ServiceDetails, ServiceField, ServiceFormConfig } from '@/lib/portal/serviceForms'

/** Values per scope: 'main' for a plain form, or each leg's key. */
export type ServiceFormValues = Record<string, ServiceDetails>

export interface ServiceFieldClasses {
  input: string
  select: string
  textarea: string
  label: string
}

/**
 * The service-specific part of a concierge request form (see
 * lib/portal/serviceForms.ts). Shared by the guest portal and the admin
 * "log a service" form, which pass their own input styles and, for the
 * admin, a day-first date input.
 */
export function ServiceDetailsFields({
  config,
  values,
  onChange,
  legsOn,
  onToggleLeg,
  menuUrl,
  classes,
  renderDate,
  locale,
}: {
  config: ServiceFormConfig
  values: ServiceFormValues
  onChange: (scope: string, key: string, value: string) => void
  legsOn: string[]
  onToggleLeg: (leg: string) => void
  menuUrl?: string | null
  classes: ServiceFieldClasses
  renderDate?: (value: string, onChange: (v: string) => void) => React.ReactNode
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const fieldGrid = (scope: string, fields: ServiceField[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <label key={f.key} className={`block min-w-0 ${f.half ? '' : 'sm:col-span-2'}`}>
          <span className={classes.label}>
            {f.label[locale]} <span className="opacity-60">{t('(optional)', '(opcional)')}</span>
          </span>
          <FieldInput
            field={f}
            value={values[scope]?.[f.key] ?? ''}
            onChange={(v) => onChange(scope, f.key, v)}
            classes={classes}
            renderDate={renderDate}
            listId={`${scope}-${f.key}-options`}
            locale={locale}
          />
        </label>
      ))}
    </div>
  )

  return (
    <div className="space-y-5">
      {config.showMenu && menuUrl && (
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-fit text-sm font-light underline underline-offset-4"
        >
          <FileText className="w-4 h-4" />
          {t('View the menu (PDF)', 'Ver el menú (PDF)')}
        </a>
      )}

      {config.legs ? (
        <div className="space-y-5">
          <p className={classes.label}>{t('Which transfers do you need?', '¿Qué traslados necesitas?')}</p>
          <div className="flex flex-wrap gap-5 -mt-3">
            {config.legs.map((leg) => (
              <label key={leg.key} className="flex items-center gap-2 text-sm font-light cursor-pointer">
                <input
                  type="checkbox"
                  checked={legsOn.includes(leg.key)}
                  onChange={() => onToggleLeg(leg.key)}
                  className="h-4 w-4 accent-current"
                />
                {leg.label[locale]}
              </label>
            ))}
          </div>
          {config.legs
            .filter((leg) => legsOn.includes(leg.key))
            .map((leg) => (
              <fieldset key={leg.key} className="border-t pt-4 border-current/10">
                <legend className="text-[11px] uppercase tracking-[0.2em] opacity-70 mb-3">{leg.label[locale]}</legend>
                {fieldGrid(leg.key, leg.fields)}
              </fieldset>
            ))}
        </div>
      ) : (
        (config.fields?.length ?? 0) > 0 && fieldGrid('main', config.fields!)
      )}
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
  classes,
  renderDate,
  listId,
  locale,
}: {
  field: ServiceField
  value: string
  onChange: (v: string) => void
  classes: ServiceFieldClasses
  renderDate?: (value: string, onChange: (v: string) => void) => React.ReactNode
  listId: string
  locale: 'en' | 'es'
}) {
  const placeholder = field.placeholder?.[locale]
  switch (field.type) {
    case 'date':
      return renderDate ? (
        <>{renderDate(value, onChange)}</>
      ) : (
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={classes.input} />
      )
    case 'time':
      return <input type="time" value={value} onChange={(e) => onChange(e.target.value)} className={classes.input} />
    case 'number':
      return (
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={classes.input}
        />
      )
    case 'textarea':
      return (
        <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={classes.textarea} />
      )
    case 'select':
      return (
        <div className="relative">
          <select value={value} onChange={(e) => onChange(e.target.value)} className={classes.select}>
            <option value="">{locale === 'es' ? 'Elige…' : 'Choose…'}</option>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label[locale]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
        </div>
      )
    default:
      return (
        <>
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            list={field.suggestions ? listId : undefined}
            onChange={(e) => onChange(e.target.value)}
            className={classes.input}
          />
          {field.suggestions && (
            <datalist id={listId}>
              {field.suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </>
      )
  }
}
