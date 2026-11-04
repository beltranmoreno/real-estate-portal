'use client'

import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { fromDateKey, keyToDayMonthYear, parseDayMonthYear, toDateKey } from '@/lib/dates'

interface Props {
  /** "YYYY-MM-DD", or '' for no date. */
  value: string
  onChange: (key: string) => void
  /** Earliest pickable day ("YYYY-MM-DD"), e.g. check-in for a check-out field. */
  min?: string
  id?: string
  required?: boolean
  className?: string
}

/**
 * Admin date field, day first (DD/MM/YYYY). Type the date, or open the
 * calendar with the button. Works in "YYYY-MM-DD" keys like the rest of the
 * portal (see lib/dates.ts), so nothing shifts across time zones.
 */
export function DateInput({ value, onChange, min, id, required, className }: Props) {
  const [text, setText] = useState(value ? keyToDayMonthYear(value) : '')
  const [open, setOpen] = useState(false)
  const invalid = text.trim() !== '' && !parseDayMonthYear(text)

  // Follow changes made outside the text box (the calendar, a form reset).
  useEffect(() => {
    if ((parseDayMonthYear(text) ?? '') !== value) setText(value ? keyToDayMonthYear(value) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className={cn('relative', className)}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="DD/MM/YYYY"
        value={text}
        required={required}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setText(e.target.value)
          const key = parseDayMonthYear(e.target.value)
          if (key) onChange(key)
          else if (!e.target.value.trim()) onChange('')
        }}
        // Tidy a valid entry ("3/12/26" → "03/12/2026") once they leave the field.
        onBlur={() => {
          const key = parseDayMonthYear(text)
          if (key) setText(keyToDayMonthYear(key))
        }}
        className={cn(
          'w-full rounded-sm border px-3 py-2.5 pr-10 text-sm font-light tabular-nums focus:outline-none focus:ring-2',
          invalid ? 'border-red-400 focus:ring-red-500' : 'border-stone-300 focus:ring-stone-800'
        )}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open calendar"
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-stone-900"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            weekStartsOn={1}
            selected={value ? fromDateKey(value) : undefined}
            defaultMonth={value ? fromDateKey(value) : min ? fromDateKey(min) : undefined}
            disabled={min ? (d) => toDateKey(d) < min : undefined}
            onSelect={(d) => {
              if (!d) return
              onChange(toDateKey(d))
              setText(keyToDayMonthYear(toDateKey(d)))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {invalid && <p className="mt-1 text-xs text-red-600 font-light">DD/MM/YYYY</p>}
    </div>
  )
}
